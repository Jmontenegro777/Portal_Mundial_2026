import { prisma } from "@/lib/prisma";
import { TeamsClient } from "./teams-client";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [teams, groups] = await Promise.all([
    prisma.team.findMany({
      include: {
        group: true,
        _count: { select: { players: true, homeMatches: true, awayMatches: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <TeamsClient teams={teams} groups={groups} />;
}
