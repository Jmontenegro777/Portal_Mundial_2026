import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchSchema } from "@/lib/validations/match";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const status = searchParams.get("status");
    const teamId = searchParams.get("teamId");

    const matches = await prisma.match.findMany({
      where: {
        ...(stage && { stage: stage as never }),
        ...(status && { status: status as never }),
        ...(teamId && {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        }),
      },
      include: {
        homeTeam: { select: { id: true, name: true, code: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, code: true, flagUrl: true } },
        stadium: { select: { id: true, name: true, city: true, country: true } },
        _count: { select: { goals: true, cards: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: "Error al obtener partidos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = matchSchema.parse(body);
    const match = await prisma.match.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        homeTeamId: data.homeTeamId || null,
        awayTeamId: data.awayTeamId || null,
        groupId: data.groupId || null,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
        homeScorePens: data.homeScorePens ?? null,
        awayScorePens: data.awayScorePens ?? null,
        attendance: data.attendance ?? null,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        stadium: true,
      },
    });
    return NextResponse.json(match, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear partido" }, { status: 500 });
  }
}
