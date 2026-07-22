import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Não logado: só a tela de login é pública.
  if (!session?.user) {
    if (pathname === "/login") return;
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Logado tentando ver o login → manda para a casa certa.
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/ir", req.nextUrl));
  }

  // Atleta não vê o painel do treinador.
  if (session.user.role === "athlete" && pathname === "/") {
    return NextResponse.redirect(new URL("/atleta", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-192.png|icon-512.png|apple-touch-icon.png).*)",
  ],
};
