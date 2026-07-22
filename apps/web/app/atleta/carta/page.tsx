"use client";

import { useState } from "react";
import { athlete } from "@/lib/athlete";
import { leagueName } from "@/lib/social";
import { BottomNav } from "@/components/athlete/BottomNav";

type Skin = "nucleo" | "arena" | "movimento";

const SKINS: { id: Skin; label: string }[] = [
  { id: "nucleo", label: "Núcleo" },
  { id: "arena", label: "Arena" },
  { id: "movimento", label: "Movimento" },
];

export default function CartaPage() {
  const a = athlete;
  const geral = Math.round(a.identityScore / 10);
  const [skin, setSkin] = useState<Skin>("nucleo");
  const at = a.attributes;

  return (
    <main className="ashell">
      <h1 className="sr-only">Sua carta</h1>
      <header className="atop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <span className="set" style={{ fontSize: 14, fontWeight: 600 }}>Sua carta</span>
      </header>

      <div className="cardbox">
        <div className={"skin k-nucleo" + (skin === "nucleo" ? " on" : "")}>
          <div className="lab">Runner Score</div>
          <div className="rw">
            <div className="rg" style={{ background: `conic-gradient(var(--ac) 0 ${geral}%, rgba(255,255,255,.07) 0)` }} />
            <div className="rc"><span className="n tnum">{geral}</span><span className="l">Geral</span></div>
          </div>
          <div className="who"><div className="nm">{a.name}</div><div className="sub">{leagueName} · {a.archetype}</div></div>
          <div className="bars tnum">
            <div className="b"><span className="bl">RES</span><span className="bt"><span className="bf" style={{ width: `${at.resistencia}%` }} /></span><span className="bv">{at.resistencia}</span></div>
            <div className="b"><span className="bl">REG</span><span className="bt"><span className="bf" style={{ width: `${at.regularidade}%` }} /></span><span className="bv">{at.regularidade}</span></div>
            <div className="b"><span className="bl">EVO</span><span className="bt"><span className="bf" style={{ width: `${at.evolucao}%` }} /></span><span className="bv">{at.evolucao}</span></div>
          </div>
        </div>

        <div className={"skin k-arena" + (skin === "arena" ? " on" : "")}>
          <div className="in">
            <div className="top">
              <div className="ov"><div className="n tnum">{geral}</div><div className="l">GERAL · {a.level.toUpperCase()}</div><div className="a">{a.archetype}</div></div>
              <div className="emb">{a.initials}</div>
            </div>
            <div className="name">{a.name.split(" ")[0]?.toUpperCase()}</div>
            <div className="attrs tnum">
              <div><span className="v">{at.ritmo}</span><span className="c">RIT</span></div>
              <div><span className="v">{at.resistencia}</span><span className="c">RES</span></div>
              <div><span className="v">{at.regularidade}</span><span className="c">REG</span></div>
              <div><span className="v">{at.subida}</span><span className="c">SUB</span></div>
              <div><span className="v">{at.finalizacao}</span><span className="c">FIN</span></div>
              <div><span className="v">{at.evolucao}</span><span className="c">EVO</span></div>
            </div>
          </div>
        </div>

        <div className={"skin k-mov" + (skin === "movimento" ? " on" : "")}>
          <div className="in">
            <div className="tag">{leagueName}</div>
            <div className="num tnum">{geral}</div>
            <div className="gl">Score geral</div>
            <div className="nm">{a.name.split(" ")[0]}</div>
            <div className="loc">{a.city}</div>
            <div className="pills tnum">
              <span className="pill">RES<b>{at.resistencia}</b></span>
              <span className="pill">EVO<b>{at.evolucao}</b></span>
              <span className="pill">SUB<b>{at.subida}</b></span>
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

      <div className="dests">
        <button className="dest" type="button"><span className="ic"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" /></svg></span><span className="dl">Stories</span></button>
        <button className="dest" type="button"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 17a3 3 0 1 0 3 3V7c1 1.5 2.5 2.3 4.5 2.4V6.4C15 6.2 13.8 5 13.5 3.5" /></svg></span><span className="dl">TikTok</span></button>
        <button className="dest" type="button"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.4-4A8 8 0 1 1 9 19.6L4 20z" /><path d="M9 10c.5 3 2 4.5 5 5" /></svg></span><span className="dl">WhatsApp</span></button>
        <button className="dest" type="button"><span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 15l6-6" /><path d="M10 6l1-1a4 4 0 0 1 6 6l-1 1" /><path d="M14 18l-1 1a4 4 0 0 1-6-6l1-1" /></svg></span><span className="dl">Link</span></button>
      </div>

      <BottomNav active="carta" />
    </main>
  );
}
