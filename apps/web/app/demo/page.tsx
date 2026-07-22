import Link from "next/link";

const CSS = `
.demo { max-width: 720px; margin: 0 auto; padding: clamp(24px,5vw,52px) 20px 60px; }
.demo .eb { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--t3); font-weight: 600; margin: 0 0 .7rem; display: flex; align-items: center; gap: 9px; }
.demo .eb .g { width: 26px; height: 26px; border-radius: 7px; background: var(--ac); color: var(--ac-ink); display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
.demo h1 { font-size: clamp(24px,4vw,32px); font-weight: 700; letter-spacing: -.02em; margin: 0 0 .6rem; }
.demo .sub { font-size: 15px; color: var(--t2); line-height: 1.55; margin: 0 0 2.4rem; max-width: 56ch; }
.demo .grp { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--ac); font-weight: 600; margin: 0 0 12px; }
.demo .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 30px; }
@media (max-width:640px){ .demo .cards { grid-template-columns: 1fr; } }
.demo a.card { display: flex; align-items: center; gap: 14px; background: var(--s1); border: 1px solid var(--bd); border-radius: 14px; padding: 16px 17px; text-decoration: none; color: var(--t1); transition: border-color .2s, background .2s; }
.demo a.card:hover { border-color: #3a4048; background: #14181d; }
.demo a.card.hero { border-color: rgba(116,210,172,.3); background: linear-gradient(150deg,#101a16,#0d1014); }
.demo a.card .ico { width: 38px; height: 38px; border-radius: 10px; background: var(--ac-deep); color: var(--ac); display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
.demo a.card .tt { font-size: 14.5px; font-weight: 600; }
.demo a.card .ds { font-size: 12px; color: var(--t2); margin-top: 2px; line-height: 1.4; }
.demo a.card .ar { margin-left: auto; color: var(--t3); flex: 0 0 auto; }
.demo .note { font-size: 12.5px; color: var(--t3); line-height: 1.6; border-top: 1px solid var(--dv); padding-top: 1.2rem; }
`;

function Card({ href, title, desc, hero, icon }: { href: string; title: string; desc: string; hero?: boolean; icon: React.ReactNode }) {
  return (
    <Link href={href} className={"card" + (hero ? " hero" : "")}>
      <span className="ico">{icon}</span>
      <span>
        <span className="tt">{title}</span>
        <span className="ds">{desc}</span>
      </span>
      <span className="ar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </span>
    </Link>
  );
}

const I = {
  dash: (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>),
  user: (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>),
  card: (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="13" height="15" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v13" /></svg>),
  liga: (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></svg>),
  run: (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>),
};

export default function DemoPage() {
  return (
    <main className="demo">
      <style>{CSS}</style>
      <p className="eb"><span className="g">E</span>Elevo · demonstração interna</p>
      <h1>Navegue o sistema</h1>
      <p className="sub">Sem login, com dados de exemplo (números reais do fundador). Clique para percorrer cada tela do produto — o painel que a assessoria compra e a experiência que o corredor vive.</p>

      <div className="grp">Para a assessoria (o produto B2B)</div>
      <div className="cards">
        <Card href="/" hero title="Painel do treinador" desc="Turma, alunos em risco, evolução e alcance de marca" icon={I.dash} />
      </div>

      <div className="grp">Para o corredor (o que retém e divulga)</div>
      <div className="cards">
        <Card href="/atleta" title="Perfil do corredor" desc="Runner Score, forma, atributos e evolução" icon={I.user} />
        <Card href="/atleta/pos-corrida" title="Momento pós-corrida" desc="A revelação animada do que mudou em você" icon={I.run} />
        <Card href="/atleta/carta" title="Carta compartilhável" desc="Troca de skin ao vivo + destinos de share" icon={I.card} />
        <Card href="/atleta/liga" title="Liga interna" desc="Rivalidade e ranking da turma" icon={I.liga} />
      </div>

      <p className="note">Ilustrativo · frontend de produção com dados de exemplo. O score de cada atleta virá do motor @elevo/engine ao ligar dados reais. Sem auth/banco/sync ao vivo ainda — isso vem quando uma assessoria topar testar.</p>
    </main>
  );
}
