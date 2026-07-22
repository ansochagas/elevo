import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

const CSS = `
.login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.lbox { width: 100%; max-width: 380px; }
.lbrand { display: flex; align-items: center; gap: 10px; margin-bottom: 26px; justify-content: center; }
.lbrand .g { width: 34px; height: 34px; border-radius: 9px; background: var(--ac); color: var(--ac-ink); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
.lbrand .n { font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
.lcard { background: var(--s1); border: 1px solid var(--bd); border-radius: 18px; padding: 26px 24px; }
.lcard h1 { font-size: 17px; font-weight: 600; margin: 0 0 4px; }
.lcard .sub { font-size: 13px; color: var(--t2); margin: 0 0 20px; line-height: 1.5; }
.lfield { margin-bottom: 14px; }
.lfield label { display: block; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--t3); font-weight: 600; margin-bottom: 7px; }
.lfield input { width: 100%; background: #0c0f12; border: 1px solid var(--bd); border-radius: 10px; padding: 13px 14px; font-size: 14px; color: var(--t1); font-family: inherit; outline: none; }
.lfield input:focus { border-color: var(--ac); }
.lerr { font-size: 12.5px; color: var(--sum); background: #2c1512; border-radius: 9px; padding: 10px 12px; margin-bottom: 14px; }
.lbtn { width: 100%; background: var(--ac); color: var(--ac-ink); border: none; border-radius: 11px; padding: 14px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 4px; }
.lfoot { text-align: center; font-size: 11.5px; color: var(--t3); margin-top: 18px; line-height: 1.5; }
`;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  async function entrar(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/ir",
      });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?erro=1");
      throw e;
    }
  }

  return (
    <main className="login">
      <style>{CSS}</style>
      <div className="lbox">
        <div className="lbrand">
          <span className="g">E</span>
          <span className="n">Elevo</span>
        </div>
        <div className="lcard">
          <h1>Entrar</h1>
          <p className="sub">Acesso do piloto — use as credenciais que você recebeu.</p>
          {erro ? <div className="lerr">E-mail ou senha incorretos. Tente de novo.</div> : null}
          <form action={entrar}>
            <div className="lfield">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="lfield">
              <label htmlFor="password">Senha</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <button className="lbtn" type="submit">Entrar</button>
          </form>
        </div>
        <p className="lfoot">Elevo · piloto fechado · seus dados são seus</p>
      </div>
    </main>
  );
}
