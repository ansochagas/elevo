"use client";

import { useState } from "react";
import { unzipSync } from "fflate";
import { uploadPieces, type Piece } from "@/components/UploadButton";

/** DEV: baixa o ZIP local e roda o MESMO pipeline do botão de upload (transporte real). */
export function DevUploadTest({ targetUserId }: { targetUserId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg("Baixando ZIP local…");
    try {
      const res = await fetch("/api/dev-zip");
      if (!res.ok) throw new Error(`dev-zip HTTP ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      setMsg(`ZIP com ${(bytes.length / 1e6).toFixed(1)} MB — explodindo no navegador…`);
      const entries = unzipSync(bytes, { filter: (e) => /\.(gpx|fit)(\.gz)?$/i.test(e.name) });
      const pieces: Piece[] = Object.entries(entries).map(([name, data]) => ({ name, data }));
      setMsg(`${pieces.length} corridas — enviando pelo pipeline real…`);
      await uploadPieces(pieces, targetUserId, setMsg);
    } catch (e) {
      setMsg(`Falha: ${e instanceof Error ? e.message : "erro"}`);
    }
    setBusy(false);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button className="btns" type="button" disabled={busy} onClick={run}>
        {busy ? "Rodando…" : "Testar upload REAL com o ZIP local"}
      </button>
      {msg ? <div className="uplmsg">{msg}</div> : null}
    </div>
  );
}
