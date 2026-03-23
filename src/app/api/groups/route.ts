import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        teams: {
          include: {
            homeMatches: { where: { stage: "GROUP", status: "FINISHED" } },
            awayMatches: { where: { stage: "GROUP", status: "FINISHED" } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Calculate standings for each group
    const groupsWithStandings = groups.map((group) => {
      const standings = group.teams.map((team) => {
        let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

        team.homeMatches.forEach((m) => {
          if (m.homeScore !== null && m.awayScore !== null) {
            played++;
            gf += m.homeScore;
            ga += m.awayScore;
            if (m.homeScore > m.awayScore) won++;
            else if (m.homeScore === m.awayScore) drawn++;
            else lost++;
          }
        });

        team.awayMatches.forEach((m) => {
          if (m.homeScore !== null && m.awayScore !== null) {
            played++;
            gf += m.awayScore;
            ga += m.homeScore;
            if (m.awayScore > m.homeScore) won++;
            else if (m.awayScore === m.homeScore) drawn++;
            else lost++;
          }
        });

        return {
          teamId: team.id,
          name: team.name,
          code: team.code,
          flagUrl: team.flagUrl,
          played,
          won,
          drawn,
          lost,
          gf,
          ga,
          gd: gf - ga,
          points: won * 3 + drawn,
        };
      });

      standings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

      return { ...group, standings };
    });

    return NextResponse.json(groupsWithStandings);
  } catch {
    return NextResponse.json({ error: "Error al obtener grupos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const group = await prisma.group.create({ data: { name: name.toUpperCase() } });
    return NextResponse.json(group, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear grupo" }, { status: 500 });
  }
}
