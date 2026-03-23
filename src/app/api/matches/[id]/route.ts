import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchSchema } from "@/lib/validations/match";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { include: { players: { orderBy: { number: "asc" } } } },
        awayTeam: { include: { players: { orderBy: { number: "asc" } } } },
        stadium: true,
        goals: {
          include: { player: { include: { team: true } } },
          orderBy: { minute: "asc" },
        },
        cards: {
          include: { player: { include: { team: true } } },
          orderBy: { minute: "asc" },
        },
      },
    });
    if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    return NextResponse.json(match);
  } catch {
    return NextResponse.json({ error: "Error al obtener partido" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = matchSchema.partial().parse(body);
    const match = await prisma.match.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        homeTeamId: data.homeTeamId ?? undefined,
        awayTeamId: data.awayTeamId ?? undefined,
        groupId: data.groupId ?? undefined,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        stadium: true,
      },
    });
    return NextResponse.json(match);
  } catch {
    return NextResponse.json({ error: "Error al actualizar partido" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar partido" }, { status: 500 });
  }
}
