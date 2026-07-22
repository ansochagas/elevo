import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { changePassword, updateAccount } from "@/lib/actions";
import { BottomNav } from "@/components/athlete/BottomNav";

const OK: Record<string, string> = {
  conta: "Dados atualizados.",
  senha: "Senha alterada com sucesso.",
};
const ERRO: Record<string, string> = {
  email: "Este e-mail já está em uso.",
  "senha-curta": "A nova senha precisa ter pelo menos 8 caracteres.",
  "senha-atual": "A senha atual não confere.",
};

export default async function AtletaConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { ok, erro } = await searchParams;

  return (
    <main className="ashell">
      <h1 className="sr-only">Configurações da conta</h1>
      <header className="atop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <a className="sairlink" href="/sair">Sair</a>
      </header>

      {ok && OK[ok] ? <div className="notice ok">{OK[ok]}</div> : null}
      {erro && ERRO[erro] ? <div className="notice warn">{ERRO[erro]}</div> : null}

      <section className="acard">
        <h3>Minha conta</h3>
        <form action={updateAccount}>
          <div className="field">
            <label htmlFor="name">Seu nome</label>
            <input id="name" name="name" defaultValue={session.user.name ?? ""} required />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail de acesso</label>
            <input id="email" name="email" type="email" defaultValue={session.user.email ?? ""} required />
          </div>
          <button className="btnp" type="submit">Salvar</button>
        </form>
      </section>

      <section className="acard">
        <h3>Trocar senha</h3>
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
      </section>

      <BottomNav active="perfil" />
    </main>
  );
}
