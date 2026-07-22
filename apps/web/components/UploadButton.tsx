"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { unzipSync, gzipSync } from "fflate";
import { uploadBatch } from "@/lib/actions";

export interface Piece {
  name: string;
  data: Uint8Array;
}

/** Teto por arquivo COMPRIMIDO (o limite de request na Vercel é ~4,5 MB). */
const MAX_PIECE = 3_500_000;
const MAX_BATCH_BYTES = 2_500_000;
const MAX_BATCH_FILES = 15;

/** Explode ZIPs no navegador e devolve só as corridas (.gpx/.fit, com ou sem .gz). */
export function explodeSelection(files: File[], bytesList: Uint8Array[]): Piece[] {
  const pieces: Piece[] = [];
  files.forEach((f, i) => {
    const bytes = bytesList[i]!;
    if (f.name.toLowerCase().endsWith(".zip")) {
      const entries = unzipSync(bytes, {
        filter: (e) => /\.(gpx|fit)(\.gz)?$/i.test(e.name),
      });
      for (const [name, data] of Object.entries(entries)) pieces.push({ name, data });
    } else {
      pieces.push({ name: f.name, data: bytes });
    }
  });
  return pieces;
}

/**
 * Comprime cada corrida (o servidor entende .gz) — o payload cai ~10x — e
 * envia em lotes pequenos pela server action. Compartilhado com a página dev.
 */
export async function uploadPieces(
  rawPieces: Piece[],
  targetUserId: string | undefined,
  setMsg: (s: string) => void,
): Promise<boolean> {
  const pieces: Piece[] = [];
  let tooBig = 0;
  for (const p of rawPieces) {
    let name = p.name;
    let data = p.data;
    if (!name.toLowerCase().endsWith(".gz")) {
      data = gzipSync(data);
      name = `${name}.gz`;
    }
    if (data.length > MAX_PIECE) {
      tooBig++;
      continue;
    }
    pieces.push({ name, data });
  }
  if (pieces.length === 0) {
    setMsg("Nenhuma corrida (.gpx/.fit) encontrada nos arquivos.");
    return false;
  }

  const batches: Piece[][] = [];
  let cur: Piece[] = [];
  let size = 0;
  for (const p of pieces) {
    if (cur.length > 0 && (cur.length >= MAX_BATCH_FILES || size + p.data.length > MAX_BATCH_BYTES)) {
      batches.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(p);
    size += p.data.length;
  }
  if (cur.length) batches.push(cur);

  const tot = { inserted: 0, dup: 0, skip: 0 };
  let score: number | null = null;
  let calibrating = false;
  for (let i = 0; i < batches.length; i++) {
    setMsg(`Analisando corridas… (${i + 1}/${batches.length})`);
    const fd = new FormData();
    if (targetUserId) fd.set("targetUserId", targetUserId);
    for (const p of batches[i]!) {
      fd.append("files", new File([p.data as BlobPart], p.name));
    }
    const r = await uploadBatch(fd);
    if (!r.ok) {
      setMsg(r.error ?? "Erro no envio.");
      return false;
    }
    tot.inserted += r.inserted ?? 0;
    tot.dup += r.duplicates ?? 0;
    tot.skip += r.skipped ?? 0;
    if (r.score != null) score = r.score;
    calibrating = r.calibrating ?? calibrating;
  }
  setMsg(
    `✓ ${tot.inserted} corridas novas` +
      (tot.dup ? ` · ${tot.dup} já existiam` : "") +
      (tot.skip ? ` · ${tot.skip} ignoradas` : "") +
      (tooBig ? ` · ${tooBig} grandes demais` : "") +
      (score !== null ? ` · Runner Score: ${score}${calibrating ? " (calibrando)" : ""}` : ""),
  );
  return true;
}

export function UploadButton({
  targetUserId,
  label = "Enviar corridas",
}: {
  targetUserId?: string;
  label?: string;
}) {
  const inp = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    setMsg("Lendo arquivos…");
    try {
      const files = Array.from(list);
      const bytesList: Uint8Array[] = [];
      for (const f of files) bytesList.push(new Uint8Array(await f.arrayBuffer()));
      const pieces = explodeSelection(files, bytesList);
      const ok = await uploadPieces(pieces, targetUserId, setMsg);
      if (ok) router.refresh();
    } catch (e) {
      setMsg(`Falha ao processar: ${e instanceof Error ? e.message : "erro inesperado"}. Tente de novo.`);
    }
    setBusy(false);
  }

  return (
    <div>
      <input
        ref={inp}
        type="file"
        multiple
        accept=".zip,.gpx,.fit,.gz"
        style={{ display: "none" }}
        onChange={(e) => handle(e.target.files)}
      />
      <button className="btnp" type="button" disabled={busy} onClick={() => inp.current?.click()}>
        {busy ? "Processando…" : label}
      </button>
      {msg ? <div className="uplmsg">{msg}</div> : null}
    </div>
  );
}
