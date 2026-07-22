"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { unzipSync } from "fflate";
import { uploadBatch } from "@/lib/actions";

interface Piece {
  name: string;
  data: Uint8Array;
}

/**
 * Upload de corridas: aceita o ZIP cru do export do Strava (explodido AQUI no
 * navegador — na Vercel a requisição tem limite), .gpx e .fit avulsos.
 * Envia em lotes pequenos para o servidor parsear e calcular.
 */
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
      const pieces: Piece[] = [];
      for (const f of Array.from(list)) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        if (f.name.toLowerCase().endsWith(".zip")) {
          const entries = unzipSync(bytes, {
            filter: (e) => /\.(gpx|fit)(\.gz)?$/i.test(e.name),
          });
          for (const [name, data] of Object.entries(entries)) pieces.push({ name, data });
        } else {
          pieces.push({ name: f.name, data: bytes });
        }
      }
      if (pieces.length === 0) {
        setMsg("Nenhuma corrida (.gpx/.fit) encontrada nos arquivos.");
        setBusy(false);
        return;
      }

      const batches: Piece[][] = [];
      let cur: Piece[] = [];
      let size = 0;
      for (const p of pieces) {
        if (cur.length >= 12 || size + p.data.length > 2_500_000) {
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
          setBusy(false);
          return;
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
          (score !== null ? ` · Runner Score: ${score}${calibrating ? " (calibrando)" : ""}` : ""),
      );
      router.refresh();
    } catch {
      setMsg("Falha ao processar os arquivos. Tente de novo.");
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
