"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface RevealData {
  runLine: string;
  scoreFrom: number;
  scoreTo: number;
  calibrating: boolean;
  changed: { label: string; delta: number; width: number }[];
}

export function RevealView({ d }: { d: RevealData }) {
  const [score, setScore] = useState(d.scoreFrom);
  const [ringP, setRingP] = useState(d.scoreFrom / 10);
  const [shown, setShown] = useState(false);
  const [barsOn, setBarsOn] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm || d.scoreFrom === d.scoreTo) {
      setScore(d.scoreTo);
      setRingP(d.scoreTo / 10);
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
      const v = d.scoreFrom + (d.scoreTo - d.scoreFrom) * ease(p);
      setScore(Math.round(v));
      setRingP(v / 10);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const t0 = setTimeout(() => { raf = requestAnimationFrame(step); }, 250);
    const t1 = setTimeout(() => setBarsOn(true), 600);
    return () => { clearTimeout(t0); clearTimeout(t1); cancelAnimationFrame(raf); };
  }, [d.scoreFrom, d.scoreTo]);

  const fade = (delay: number, base = "") => ({
    className: (base ? base + " " : "") + "fade" + (shown ? " in" : ""),
    style: { transitionDelay: `${delay}ms` },
  });

  const diff = d.scoreTo - d.scoreFrom;

  return (
    <main className="reveal">
      <h1 className="sr-only">Sua última corrida analisada</h1>
      <div className="synced">
        <span className="tk">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ac-ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
        </span>
        Última corrida analisada
      </div>
      <div className="rl">{d.runLine}</div>

      <div className="ring">
        <div className="rg" style={{ background: `conic-gradient(var(--ac) 0 ${ringP.toFixed(1)}%, rgba(255,255,255,.07) 0)` }} />
        <div className="rc">
          <span className="lab">Runner Score</span>
          <span className="n tnum">{d.calibrating ? "…" : score}</span>
        </div>
      </div>
      {diff !== 0 && !d.calibrating ? (
        <div {...fade(150, "hd")}>{diff > 0 ? `+${diff}` : diff} desde a análise anterior</div>
      ) : null}
      {d.calibrating ? <div {...fade(150, "hd")}>calibrando — continue enviando corridas</div> : null}

      {d.changed.length > 0 ? (
        <>
          <div {...fade(300, "sct")}>O que mudou</div>
          <div className="chg tnum">
            {d.changed.map((c, i) => (
              <div key={c.label} {...fade(420 + i * 130, "row")}>
                <span className="cl">{c.label}</span>
                <span className="ct"><span className="cf" style={{ width: barsOn ? `${c.width}%` : 0 }} /></span>
                <span className="cd">+{c.delta}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div {...fade(820, "cta")}>
        <Link href="/atleta/carta" className="btn p">Ver minha carta</Link>
        <Link href="/atleta" className="btn s">Ver meu perfil</Link>
      </div>
    </main>
  );
}
