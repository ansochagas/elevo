import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Despachante pós-login: cada papel cai na sua casa. */
export default async function IrPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "coach" ? "/" : "/atleta");
}
