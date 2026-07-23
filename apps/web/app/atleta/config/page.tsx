import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { changePassword, updateAccount, updateDiscoverable } from "@/lib/actions";
import { getDiscoverable } from "@/lib/data";
import { BottomNav } from "@/components/athlete/BottomNav";

const OK: Record<string, string> = {
  conta: "Dados atualizados.",
  senha: "Senha alterada com sucesso.",
  "descoberta-on": "Seu perfil agora pode aparecer em buscadores.",
  "descoberta-off": "Seu perfil não aparece mais em buscadores.",
};
const ERRO: Record<string, string> = {
  email: "Este e-mail já está em uso.",
  "senha-curta": "A nova senha precisa ter pelo menos 8 caracteres.",
  "senha-atual": "A senha atual não confere.",
  "descoberta-migracao": "Essa opção ainda não está disponível — avise o suporte.",
};

export default async function AtletaConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { ok, erro } = await searchParams;
  const discoverable = await getDiscoverable(session.user.id);

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
        <h3>Perfil público</h3>
        <p className="uplmsg" style={{ marginTop: 0 }}>
          O link da sua carta sempre funciona quando você compartilha. Ligue esta opção se quiser que
          seu perfil também possa <b>aparecer em buscadores</b> como o Google.
        </p>
        <form action={updateDiscoverable} className="toggleform">
          <label className="toggle">
            <input type="checkbox" name="discoverable" defaultChecked={discoverable} />
            <span>Deixar meu perfil descobrível em buscadores</span>
          </label>
          <button className="btnp" type="submit">Salvar preferência</button>
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
