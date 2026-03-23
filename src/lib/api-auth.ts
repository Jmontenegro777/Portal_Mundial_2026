import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type Role = "ADMIN" | "EDITOR" | "VIEWER";

const ROLE_LEVEL: Record<Role, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

/**
 * Verifica que el usuario autenticado tenga el nivel mínimo de rol requerido.
 * Retorna null si está autorizado, o un NextResponse 401/403 si no.
 */
export async function requireRole(minRole: Role = "EDITOR") {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userRole = ((session.user as { role?: string }).role ?? "VIEWER") as Role;
  const userLevel = ROLE_LEVEL[userRole] ?? 0;
  const required = ROLE_LEVEL[minRole];

  if (userLevel < required) {
    return NextResponse.json(
      { error: `Rol insuficiente. Se requiere: ${minRole}` },
      { status: 403 }
    );
  }

  return null; // autorizado
}
