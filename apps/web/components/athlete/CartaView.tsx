"use client";

import { useState } from "react";

type ShareState = "idle" | "working" | "done" | "error";

async function shareCarta(setState: (s: ShareState) => void, firstName: string, skin: Skin) {
  setState("working");
  try {
    const res = await fetch(`/atleta/carta/og?skin=${skin}`, { cache: "no-store" });
    if (!res.ok) throw new Error("falha ao gerar imagem");
    const blob = await res.blob();
    const file = new File([blob], `carta-elevo-${firstName.toLowerCase()}.png`, { type: "image/png" });

    const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({
        files: [file],
        title: "Minha carta Elevo",
        text: "Meu Runner Score na Elevo 🏃",
      });
      setState("done");
    } else {
      // fallback: baixa a imagem para o usuário postar manualmente
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setState("done");
    }
  } catch (e) {
    // usuário cancelar o share nativo não é erro
    if (e instanceof DOMException && e.name === "AbortError") {
      setState("idle");
      return;
    }
    setState("error");
  }
}

type Skin = "nucleo" | "arena" | "movimento";

const SKINS: { id: Skin; label: string }[] = [
  { id: "nucleo", label: "Núcleo" },
  { id: "arena", label: "Arena" },
  { id: "movimento", label: "Movimento" },
];

export interface CartaData {
  name: string;
  firstName: string;
  initials: string;
  city: string | null;
  level: string | null;
  archetype: string | null;
  brand: string;
  /** Runner Score de identidade (topo do app, ex.: 520) — número principal da carta */
  score: number;
  /** overall 0-100, usado só para o anel decorativo do skin Núcleo */
  geral: number;
  attrs: {
    ritmo: number | null;
    resistencia: number | null;
    regularidade: number | null;
    finalizacao: number | null;
    subida: number | null;
    evolucao: number | null;
  };
}

export function CartaView({ d, userId }: { d: CartaData; userId: string }) {
  const [skin, setSkin] = useState<Skin>("nucleo");
  const [share, setShare] = useState<ShareState>("idle");
  const [copied, setCopied] = useState(false);
  const at = d.attrs;
  const v = (x: number | null) => x ?? 0;

  async function copyLink() {
    const url = `${window.location.origin}/r/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback: seleção manual via prompt
      window.prompt("Copie o link da sua carta:", url);
    }
  }

  return (
    <>
      <div className="cardbox">
        <div className={"skin k-nucleo" + (skin === "nucleo" ? " on" : "")}>
          <div className="lab">Runner Score</div>
          <div className="rw">
            <div className="rg" style={{ background: `conic-gradient(var(--ac) 0 ${d.geral}%, rgba(255,255,255,.07) 0)` }} />
            <div className="rc"><span className="n tnum">{d.score}</span><span className="l">Score</span></div>
          </div>
          <div className="who">
            <div className="nm">{d.name}</div>
            <div className="sub">{d.brand}{d.archetype ? ` · ${d.archetype}` : ""}</div>
          </div>
          <div className="bars tnum">
            <div className="b"><span className="bl">RES</span><span className="bt"><span className="bf" style={{ width: `${v(at.resistencia)}%` }} /></span><span className="bv">{v(at.resistencia)}</span></div>
            <div className="b"><span className="bl">REG</span><span className="bt"><span className="bf" style={{ width: `${v(at.regularidade)}%` }} /></span><span className="bv">{v(at.regularidade)}</span></div>
            <div className="b"><span className="bl">EVO</span><span className="bt"><span className="bf" style={{ width: `${v(at.evolucao)}%` }} /></span><span className="bv">{v(at.evolucao)}</span></div>
          </div>
        </div>

        <div className={"skin k-arena" + (skin === "arena" ? " on" : "")}>
          <div className="in">
            <div className="top">
              <div className="ov">
                <div className="n tnum">{d.score}</div>
                <div className="l">SCORE{d.level ? ` · ${d.level.toUpperCase()}` : ""}</div>
                {d.archetype ? <div className="a">{d.archetype}</div> : null}
              </div>
              <div className="emb">{d.initials}</div>
            </div>
            <div className="name">{d.firstName.toUpperCase()}</div>
            <div className="attrs tnum">
              <div><span className="v">{v(at.ritmo)}</span><span className="c">RIT</span></div>
              <div><span className="v">{v(at.resistencia)}</span><span className="c">RES</span></div>
              <div><span className="v">{v(at.regularidade)}</span><span className="c">REG</span></div>
              <div><span className="v">{v(at.subida)}</span><span className="c">SUB</span></div>
              <div><span className="v">{v(at.finalizacao)}</span><span className="c">FIN</span></div>
              <div><span className="v">{v(at.evolucao)}</span><span className="c">EVO</span></div>
            </div>
          </div>
        </div>

        <div className={"skin k-mov" + (skin === "movimento" ? " on" : "")}>
          <div className="in">
            <div className="tag">{d.brand}</div>
            <div className="num tnum">{d.score}</div>
            <div className="gl">Runner Score</div>
            <div className="nm">{d.firstName}</div>
            {d.city ? <div className="loc">{d.city}</div> : null}
            <div className="pills tnum">
              <span className="pill">RES<b>{v(at.resistencia)}</b></span>
              <span className="pill">EVO<b>{v(at.evolucao)}</b></span>
              <span className="pill">SUB<b>{v(at.subida)}</b></span>
            </div>
          </div>
        </div>
      </div>

      <div className="skinsel" role="group" aria-label="Escolher skin da carta">
        {SKINS.map((s) => (
          <button key={s.id} type="button" className={"skinbtn" + (skin === s.id ? " on" : "")} onClick={() => setSkin(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="sharerow">
        <button
          type="button"
          className="btnp sharebtn"
          onClick={() => shareCarta(setShare, d.firstName, skin)}
          disabled={share === "working"}
        >
          {share === "working" ? "Gerando imagem…" : "Compartilhar imagem"}
        </button>
        <button type="button" className="btns sharebtn" onClick={copyLink}>
          {copied ? "Link copiado ✓" : "Copiar link da carta"}
        </button>
      </div>
      {share === "error" ? (
        <p className="uplmsg" style={{ textAlign: "center", color: "var(--sum)" }}>
          Não consegui gerar a imagem agora. Tente de novo em instantes.
        </p>
      ) : (
        <p className="uplmsg" style={{ textAlign: "center" }}>
          A imagem sai na skin que você escolheu acima. Poste no Stories/WhatsApp, ou compartilhe o link —
          quem abrir vê sua carta e conhece a Elevo.
        </p>
      )}
    </>
  );
}
