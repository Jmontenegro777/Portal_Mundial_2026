import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teamSchema } from "@/lib/validations/team";
import { requireRole } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        group: true,
        players: { orderBy: { number: "asc" } },
        homeMatches: { include: { awayTeam: true, stadium: true }, orderBy: { scheduledAt: "asc" } },
        awayMatches: { include: { homeTeam: true, stadium: true }, orderBy: { scheduledAt: "asc" } },
      },
    });
    if (!team) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    return NextResponse.json(team);
  } catch {
    return NextResponse.json({ error: "Error al obtener equipo" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireRole("EDITOR");
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await req.json();
    const data = teamSchema.partial().parse(body);
    const team = await prisma.team.update({
      where: { id },
      data: {
        ...data,
        flagUrl: data.flagUrl || null,
        groupId: data.groupId || null,
        coach: data.coach || null,
      },
    });
    return NextResponse.json(team);
  } catch {
    return NextResponse.json({ error: "Error al actualizar equipo" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireRole("ADMIN");
  if (authError) return authError;
  try {
    const { id } = await params;
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar equipo" }, { status: 500 });
  }
}
