import { signOut } from "@/auth";

/** Sair da conta: visita /sair e volta para o login. */
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
