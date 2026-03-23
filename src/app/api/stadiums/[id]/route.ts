import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stadiumSchema } from "@/lib/validations/stadium";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stadium = await prisma.stadium.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            homeTeam: { select: { name: true, code: true, flagUrl: true } },
            awayTeam: { select: { name: true, code: true, flagUrl: true } },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });
    if (!stadium) return NextResponse.json({ error: "Estadio no encontrado" }, { status: 404 });
    return NextResponse.json(stadium);
  } catch {
    return NextResponse.json({ error: "Error al obtener estadio" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = stadiumSchema.partial().parse(body);
    const stadium = await prisma.stadium.update({
      where: { id },
      data: {
        ...data,
        photoUrl: data.photoUrl || null,
      },
    });
    return NextResponse.json(stadium);
  } catch {
    return NextResponse.json({ error: "Error al actualizar estadio" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.stadium.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar estadio" }, { status: 500 });
  }
}
