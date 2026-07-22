import { readFileSync } from "node:fs";
import { auth } from "@/auth";

/** DEV-ONLY: serve o ZIP local do export para testar o pipeline real de upload. */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("not found", { status: 404 });
  }
  const session = await auth();
  if (!session?.user) return new Response("unauthorized", { status: 401 });
  const bytes = readFileSync("C:\\Users\\ander\\Downloads\\export_128593108 (1).zip");
  return new Response(new Uint8Array(bytes), {
    headers: { "content-type": "application/zip" },
  });
}
