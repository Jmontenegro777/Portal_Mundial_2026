import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/player";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const position = searchParams.get("position");

    const players = await prisma.player.findMany({
      where: {
        ...(teamId && { teamId }),
        ...(position && { position: position as never }),
      },
      include: {
        team: { select: { id: true, name: true, code: true, flagUrl: true } },
        _count: { select: { goals: true, cards: true } },
      },
      orderBy: [{ team: { name: "asc" } }, { number: "asc" }],
    });
    return NextResponse.json(players);
  } catch {
    return NextResponse.json({ error: "Error al obtener jugadores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = playerSchema.parse(body);
    const player = await prisma.player.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        photoUrl: data.photoUrl || null,
      },
      include: { team: true },
    });
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique")) {
      return NextResponse.json({ error: "El número ya está en uso en este equipo" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear jugador" }, { status: 500 });
  }
}
