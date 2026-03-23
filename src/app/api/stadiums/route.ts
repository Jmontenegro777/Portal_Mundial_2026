import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stadiumSchema } from "@/lib/validations/stadium";

export async function GET() {
  try {
    const stadiums = await prisma.stadium.findMany({
      include: { _count: { select: { matches: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(stadiums);
  } catch {
    return NextResponse.json({ error: "Error al obtener estadios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = stadiumSchema.parse(body);
    const stadium = await prisma.stadium.create({
      data: {
        ...data,
        photoUrl: data.photoUrl || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
    return NextResponse.json(stadium, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear estadio" }, { status: 500 });
  }
}
