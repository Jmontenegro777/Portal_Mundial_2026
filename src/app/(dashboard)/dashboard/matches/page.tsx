import { prisma } from "@/lib/prisma";
import { MatchesClient } from "./matches-client";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const [matches, teams, stadiums] = await Promise.all([
    prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, code: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, code: true, flagUrl: true } },
        stadium: { select: { id: true, name: true, city: true, country: true } },
        _count: { select: { goals: true, cards: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.team.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.stadium.findMany({ select: { id: true, name: true, city: true }, orderBy: { name: "asc" } }),
  ]);

  return <MatchesClient matches={matches} teams={teams} stadiums={stadiums} />;
}
