import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessoriaOf } from "@/lib/data";
import { addAthlete } from "@/lib/actions";
import { CoachShell } from "@/components/CoachShell";

export default async function NovoAlunoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") redirect("/ir");
  const assessoria = await getAssessoriaOf(session.user.id);
  if (!assessoria) redirect("/ir");
  const { erro } = await searchParams;

  return (
    <CoachShell assessoriaName={assessoria.name} coachName={session.user.name ?? ""} logoUrl={assessoria.logoUrl} active="alunos">
      <div className="panel" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="ph"><h2>Adicionar aluno</h2></div>
        {erro === "nome" ? <div className="notice warn">Informe o nome do aluno.</div> : null}
        {erro === "email" ? <div className="notice warn">Este e-mail já está em uso.</div> : null}
        <form action={addAthlete}>
          <div className="field">
            <label htmlFor="name">Nome *</label>
            <input id="name" name="name" required placeholder="Nome do aluno" />
          </div>
          <div className="field">
            <label htmlFor="phone">WhatsApp (com DDD)</label>
            <input id="phone" name="phone" placeholder="85 99999-9999" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail (opcional — ele pode definir no convite)</label>
            <input id="email" name="email" type="email" placeholder="aluno@email.com" />
          </div>
          <button className="btnp" type="submit">Criar e gerar convite</button>
        </form>
        <p className="uplmsg">Ao criar, você recebe um link de convite para mandar no WhatsApp do aluno. Ele define a senha, autoriza o acompanhamento (LGPD) e já pode enviar as corridas.</p>
      </div>
    </CoachShell>
  );
}
