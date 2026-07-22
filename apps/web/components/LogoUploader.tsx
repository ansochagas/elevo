"use client";

import { useRef, useState } from "react";
import { updateAssessoriaLogo } from "@/lib/actions";

/** Reduz a imagem para no máx. `maxH` px de altura e devolve um PNG data URI. */
function downscale(file: File, maxH = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("leitura"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("imagem"));
      img.onload = () => {
        const scale = Math.min(1, maxH / img.height);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function LogoUploader({ current, assessoriaName }: { current: string | null; assessoriaName: string }) {
  const [preview, setPreview] = useState<string | null>(current);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Selecione um arquivo de imagem (PNG, JPG…).");
      return;
    }
    setErr(null);
    try {
      const dataUri = await downscale(file, 200);
      setPreview(dataUri);
      setDirty(true);
    } catch {
      setErr("Não consegui processar essa imagem. Tente outra.");
    }
  }

  return (
    <div className="logoup">
      <div className="logoprev" aria-hidden={!preview}>
        {preview ? (
          <img src={preview} alt={`Logo ${assessoriaName}`} />
        ) : (
          <span className="ph">Sem logo</span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        style={{ display: "none" }}
      />

      <div className="logobtns">
        <button type="button" className="btns" onClick={() => fileRef.current?.click()}>
          {preview ? "Trocar imagem" : "Escolher imagem"}
        </button>

        {dirty ? (
          <form
            action={updateAssessoriaLogo}
            onSubmit={() => setBusy(true)}
          >
            <input type="hidden" name="logo" value={preview ?? ""} />
            <button type="submit" className="btnp" disabled={busy}>
              {busy ? "Salvando…" : "Salvar logo"}
            </button>
          </form>
        ) : current ? (
          <form action={updateAssessoriaLogo} onSubmit={() => setBusy(true)}>
            <input type="hidden" name="remove" value="1" />
            <button type="submit" className="btnd" disabled={busy}>Remover</button>
          </form>
        ) : null}
      </div>

      {err ? <p className="uplmsg" style={{ color: "var(--sum)" }}>{err}</p> : (
        <p className="uplmsg">PNG ou JPG. A imagem é reduzida automaticamente e aparece no cabeçalho do painel.</p>
      )}
    </div>
  );
}
