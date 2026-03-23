import { prisma } from "@/lib/prisma";
import { PlayersClient } from "./players-client";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [players, teams] = await Promise.all([
    prisma.player.findMany({
      include: {
        team: { select: { id: true, name: true, code: true, flagUrl: true } },
        _count: { select: { goals: true, cards: true } },
      },
      orderBy: [{ team: { name: "asc" } }, { number: "asc" }],
    }),
    prisma.team.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
  ]);

  return <PlayersClient players={players} teams={teams} />;
}
