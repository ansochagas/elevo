import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assessorias, athleteProfiles, users } from "@/lib/db/schema";
import { activateInvite } from "@/lib/actions";

const CSS = `
.login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.lbox { width: 100%; max-width: 400px; }
.lbrand { display: flex; align-items: center; gap: 10px; margin-bottom: 26px; justify-content: center; }
.lbrand .g { width: 34px; height: 34px; border-radius: 9px; background: var(--ac); color: var(--ac-ink); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
.lbrand .n { font-size: 19px; font-weight: 700; }
.lcard { background: var(--s1); border: 1px solid var(--bd); border-radius: 18px; padding: 26px 24px; }
.lcard h1 { font-size: 17px; font-weight: 600; margin: 0 0 4px; }
.lcard .sub { font-size: 13px; color: var(--t2); margin: 0 0 20px; line-height: 1.55; }
.consent { display: flex; gap: 10px; align-items: flex-start; background: #0c0f12; border: 1px solid var(--bd); border-radius: 10px; padding: 12px; margin-bottom: 16px; }
.consent input { margin-top: 3px; }
.consent label { font-size: 12.5px; color: #cdd4db; line-height: 1.5; }
`;

export default async function ConvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { token } = await params;
  const { erro } = await searchParams;

  const rows = await db
    .select({
      userId: athleteProfiles.userId,
      name: users.name,
      email: users.email,
      assessoriaName: assessorias.name,
    })
    .from(athleteProfiles)
    .innerJoin(users, eq(users.id, athleteProfiles.userId))
    .leftJoin(assessorias, eq(assessorias.id, athleteProfiles.assessoriaId))
    .where(eq(athleteProfiles.inviteToken, token))
    .limit(1);
  const invite = rows[0] ?? null;

  return (
    <main className="login">
      <style>{CSS}</style>
      <div className="lbox">
        <div className="lbrand"><span className="g">E</span><span className="n">Elevo</span></div>
        <div className="lcard">
          {!invite ? (
            <>
              <h1>Convite inválido</h1>
              <p className="sub">Este link de convite não existe ou já foi usado. Peça ao seu treinador para gerar um novo.</p>
            </>
          ) : (
            <>
              <h1>Bem-vindo, {invite.name.split(" ")[0]}!</h1>
              <p className="sub">
                {invite.assessoriaName ? `A ${invite.assessoriaName} te convidou` : "Você foi convidado"} para a Elevo —
                descubra o corredor que você está se tornando.
              </p>
              {erro === "senha" ? <div className="notice warn">A senha precisa ter pelo menos 8 caracteres.</div> : null}
              {erro === "consentimento" ? <div className="notice warn">Para continuar, autorize o acompanhamento pelo seu treinador.</div> : null}
              {erro === "email" ? <div className="notice warn">Este e-mail já está em uso — tente outro.</div> : null}
              <form action={activateInvite}>
                <input type="hidden" name="token" value={token} />
                <div className="field">
                  <label htmlFor="email">Seu e-mail (para entrar)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={invite.email.endsWith("@pendente.elevo") ? "" : invite.email}
                    placeholder="voce@email.com"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Crie sua senha (mín. 8 caracteres)</label>
                  <input id="password" name="password" type="password" minLength={8} required />
                </div>
                <div className="consent">
                  <input id="consent" name="consent" type="checkbox" required />
                  <label htmlFor="consent">
                    Autorizo que {invite.assessoriaName ?? "minha assessoria"} acompanhe minhas corridas e minha
                    evolução na Elevo. Posso revogar quando quiser — meus dados são meus.
                  </label>
                </div>
                <button className="btnp" type="submit" style={{ width: "100%" }}>Ativar minha conta</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
