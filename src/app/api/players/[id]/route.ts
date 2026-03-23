import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/player";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: true,
        goals: { include: { match: { include: { homeTeam: true, awayTeam: true } } } },
        cards: { include: { match: { include: { homeTeam: true, awayTeam: true } } } },
      },
    });
    if (!player) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    return NextResponse.json(player);
  } catch {
    return NextResponse.json({ error: "Error al obtener jugador" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = playerSchema.partial().parse(body);
    const player = await prisma.player.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        photoUrl: data.photoUrl || null,
      },
      include: { team: true },
    });
    return NextResponse.json(player);
  } catch {
    return NextResponse.json({ error: "Error al actualizar jugador" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar jugador" }, { status: 500 });
  }
}
