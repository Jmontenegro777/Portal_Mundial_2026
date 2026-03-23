import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teamSchema } from "@/lib/validations/team";
import { requireRole } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const confederation = searchParams.get("confederation");

    const teams = await prisma.team.findMany({
      where: {
        ...(groupId && { groupId }),
        ...(confederation && { confederation: confederation as never }),
      },
      include: { group: true, _count: { select: { players: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(teams);
  } catch {
    return NextResponse.json({ error: "Error al obtener equipos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireRole("EDITOR");
  if (authError) return authError;
  try {
    const body = await req.json();
    const data = teamSchema.parse(body);
    const team = await prisma.team.create({
      data: {
        ...data,
        flagUrl: data.flagUrl || null,
        groupId: data.groupId || null,
        coach: data.coach || null,
      },
    });
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique")) {
      return NextResponse.json({ error: "El código de equipo ya existe" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear equipo" }, { status: 500 });
  }
}
