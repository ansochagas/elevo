import Link from "next/link";
import type { ReactNode } from "react";

export function CoachShell({
  assessoriaName,
  coachName,
  active,
  children,
}: {
  assessoriaName: string;
  coachName: string;
  active: "painel" | "alunos" | "config";
  children: ReactNode;
}) {
  return (
    <main className="app">
      <div className="frame">
        <header className="top">
          <div className="g">{assessoriaName[0]?.toUpperCase() ?? "E"}</div>
          <div>
            <div className="nm">{assessoriaName}</div>
            <div className="sub">Painel do treinador</div>
          </div>
          <nav className="cnav">
            <Link href="/" className={active === "painel" ? "on" : ""}>Painel</Link>
            <Link href="/alunos" className={active === "alunos" ? "on" : ""}>Alunos</Link>
            <Link href="/config" className={active === "config" ? "on" : ""}>Configurações</Link>
          </nav>
          <div className="who">
            <div>
              <div className="cn">{coachName}</div>
              <div className="cr">Treinador</div>
            </div>
            <a className="sairlink" href="/sair">Sair</a>
          </div>
        </header>
        <div className="body">{children}</div>
      </div>
    </main>
  );
}
