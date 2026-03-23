import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validations/match";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;
    const body = await req.json();
    const data = goalSchema.parse(body);
    const goal = await prisma.goal.create({
      data: { ...data, matchId },
      include: { player: { include: { team: true } } },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al registrar gol" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("goalId");
    if (!goalId) return NextResponse.json({ error: "goalId requerido" }, { status: 400 });
    await prisma.goal.delete({ where: { id: goalId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar gol" }, { status: 500 });
  }
}
