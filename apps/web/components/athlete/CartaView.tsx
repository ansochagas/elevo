"use client";

import { useState } from "react";

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

export function CartaView({ d }: { d: CartaData }) {
  const [skin, setSkin] = useState<Skin>("nucleo");
  const at = d.attrs;
  const v = (x: number | null) => x ?? 0;

  return (
    <>
      <div className="cardbox">
        <div className={"skin k-nucleo" + (skin === "nucleo" ? " on" : "")}>
          <div className="lab">Runner Score</div>
          <div className="rw">
            <div className="rg" style={{ background: `conic-gradient(var(--ac) 0 ${d.geral}%, rgba(255,255,255,.07) 0)` }} />
            <div className="rc"><span className="n tnum">{d.geral}</span><span className="l">Geral</span></div>
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
                <div className="n tnum">{d.geral}</div>
                <div className="l">GERAL{d.level ? ` · ${d.level.toUpperCase()}` : ""}</div>
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
            <div className="num tnum">{d.geral}</div>
            <div className="gl">Score geral</div>
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

      <p className="uplmsg" style={{ textAlign: "center" }}>
        O compartilhamento com um toque (Stories, WhatsApp) chega em breve — por enquanto, mostre a carta direto do
        seu celular. 😉
      </p>
    </>
  );
}
