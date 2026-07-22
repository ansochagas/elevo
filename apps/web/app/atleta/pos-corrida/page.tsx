"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { athlete, ATTR_LABEL } from "@/lib/athlete";

const km = (v: number) => v.toFixed(1).replace(".", ",");

export default function PosCorridaPage() {
  const a = athlete;
  const lr = a.lastRun;
  const [score, setScore] = useState(lr.scoreFrom);
  const [ringP, setRingP] = useState(lr.scoreFrom / 10);
  const [shown, setShown] = useState(false);
  const [barsOn, setBarsOn] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) {
      setScore(lr.scoreTo);
      setRingP(lr.scoreTo / 10);
      setShown(true);
      setBarsOn(true);
      return;
    }
    setShown(true);
    const dur = 1300;
    let start: number | null = null;
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const v = lr.scoreFrom + (lr.scoreTo - lr.scoreFrom) * ease(p);
      setScore(Math.round(v));
      setRingP(v / 10);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const t0 = setTimeout(() => { raf = requestAnimationFrame(step); }, 250);
    const t1 = setTimeout(() => setBarsOn(true), 600);
    return () => { clearTimeout(t0); clearTimeout(t1); cancelAnimationFrame(raf); };
  }, [lr.scoreFrom, lr.scoreTo]);

  const fade = (delay: number, base = "") => ({
    className: (base ? base + " " : "") + "fade" + (shown ? " in" : ""),
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <main className="reveal">
      <h1 className="sr-only">Sua corrida foi analisada</h1>
      <div className="synced">
        <span className="tk">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ac-ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
        </span>
        Corrida sincronizada
      </div>
      <div className="rl"><b>{km(lr.distanceKm)} km</b> · {lr.timeStr} · {lr.paceStr} · Fortaleza</div>

      <div className="ring">
        <div className="rg" style={{ background: `conic-gradient(var(--ac) 0 ${ringP.toFixed(1)}%, rgba(255,255,255,.07) 0)` }} />
        <div className="rc">
          <span className="lab">Runner Score</span>
          <span className="n tnum">{score}</span>
        </div>
      </div>
      <div {...fade(150, "hd")}>+{lr.scoreTo - lr.scoreFrom} desde a última corrida</div>

      <div {...fade(300, "sct")}>O que mudou</div>
      <div className="chg tnum">
        {lr.changed.map((c, i) => (
          <div key={c.key} {...fade(420 + i * 130, "row")}>
            <span className="cl">{ATTR_LABEL[c.key]}</span>
            <span className="ct"><span className="cf" style={{ width: barsOn ? `${a.attributes[c.key]}%` : 0 }} /></span>
            <span className="cd">+{c.delta}</span>
          </div>
        ))}
      </div>

      <div {...fade(820, "badge")}>
        <span className="bi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3c1.5 3 1 5-1 7 3 0 5 2 5 5a4 4 0 0 1-8 0c0-1 .3-1.8.8-2.5C7 16 6 18 8 21c-3-1-5-3.5-5-7 0-5 5-6 9-11z" /></svg>
        </span>
        <div>
          <div className="bt">Nova conquista</div>
          <div className="bn">{lr.achievement}</div>
        </div>
      </div>

      <div {...fade(980, "cta")}>
        <button className="btn p" type="button">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M12 15V3" /><path d="M8 7l4-4 4 4" /></svg>
          Compartilhar minha carta
        </button>
        <Link href="/atleta" className="btn s">Ver meu perfil</Link>
      </div>
    </main>
  );
}
