import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessoriaOf } from "@/lib/data";
import { changePassword, updateAccount, updateAssessoria } from "@/lib/actions";
import { CoachShell } from "@/components/CoachShell";

const OK: Record<string, string> = {
  assessoria: "Nome da assessoria atualizado.",
  conta: "Dados da conta atualizados.",
  senha: "Senha alterada com sucesso.",
};
const ERRO: Record<string, string> = {
  email: "Este e-mail já está em uso.",
  "senha-curta": "A nova senha precisa ter pelo menos 8 caracteres.",
  "senha-atual": "A senha atual não confere.",
};

export default async function ConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "coach") redirect("/atleta/config");
  const assessoria = await getAssessoriaOf(session.user.id);
  if (!assessoria) redirect("/ir");
  const { ok, erro } = await searchParams;

  return (
    <CoachShell assessoriaName={assessoria.name} coachName={session.user.name ?? ""} active="config">
      {ok && OK[ok] ? <div className="notice ok">{OK[ok]}</div> : null}
      {erro && ERRO[erro] ? <div className="notice warn">{ERRO[erro]}</div> : null}

      <div className="grid">
        <div className="rstack">
          <div className="panel">
            <div className="ph"><h2>Assessoria</h2></div>
            <form action={updateAssessoria}>
              <div className="field">
                <label htmlFor="aname">Nome da assessoria</label>
                <input id="aname" name="name" defaultValue={assessoria.name} required />
              </div>
              <button className="btnp" type="submit">Salvar</button>
            </form>
            <p className="uplmsg">Este nome aparece no painel, nos convites e nas cartas dos seus alunos.</p>
          </div>

          <div className="panel">
            <div className="ph"><h2>Minha conta</h2></div>
            <form action={updateAccount}>
              <div className="field">
                <label htmlFor="cname">Seu nome</label>
                <input id="cname" name="name" defaultValue={session.user.name ?? ""} required />
              </div>
              <div className="field">
                <label htmlFor="cemail">E-mail de acesso</label>
                <input id="cemail" name="email" type="email" defaultValue={session.user.email ?? ""} required />
              </div>
              <button className="btnp" type="submit">Salvar</button>
            </form>
          </div>
        </div>

        <div className="panel" style={{ alignSelf: "start" }}>
          <div className="ph"><h2>Trocar senha</h2></div>
          <form action={changePassword}>
            <div className="field">
              <label htmlFor="current">Senha atual</label>
              <input id="current" name="current" type="password" required />
            </div>
            <div className="field">
              <label htmlFor="next">Nova senha (mín. 8 caracteres)</label>
              <input id="next" name="next" type="password" minLength={8} required />
            </div>
            <button className="btnp" type="submit">Alterar senha</button>
          </form>
        </div>
      </div>
    </CoachShell>
  );
}
