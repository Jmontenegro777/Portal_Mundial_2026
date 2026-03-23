import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cardSchema } from "@/lib/validations/match";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;
    const body = await req.json();
    const data = cardSchema.parse(body);
    const card = await prisma.card.create({
      data: { ...data, matchId },
      include: { player: { include: { team: true } } },
    });
    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al registrar tarjeta" }, { status: 500 });
  }
}
