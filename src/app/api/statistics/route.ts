import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalTeams,
      totalPlayers,
      totalMatches,
      finishedMatches,
      totalGoals,
      topScorers,
      topCards,
      goalsByTeam,
    ] = await Promise.all([
      prisma.team.count(),
      prisma.player.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: "FINISHED" } }),
      prisma.goal.count({ where: { isOwnGoal: false } }),
      // Top 10 scorers
      prisma.goal.groupBy({
        by: ["playerId"],
        _count: { id: true },
        where: { isOwnGoal: false },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      // Top cards by player
      prisma.card.groupBy({
        by: ["playerId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      // Goals by team (home + away)
      prisma.match.findMany({
        where: { status: "FINISHED" },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
          homeTeam: { select: { name: true, code: true } },
          awayTeam: { select: { name: true, code: true } },
        },
      }),
    ]);

    // Enrich top scorers
    const scorerIds = topScorers.map((s) => s.playerId);
    const scorerPlayers = await prisma.player.findMany({
      where: { id: { in: scorerIds } },
      include: { team: { select: { name: true, code: true, flagUrl: true } } },
    });

    const enrichedScorers = topScorers.map((s) => {
      const player = scorerPlayers.find((p) => p.id === s.playerId);
      return {
        playerId: s.playerId,
        goals: s._count.id,
        firstName: player?.firstName,
        lastName: player?.lastName,
        team: player?.team,
      };
    });

    // Enrich top cards
    const cardIds = topCards.map((c) => c.playerId);
    const cardPlayers = await prisma.player.findMany({
      where: { id: { in: cardIds } },
      include: { team: { select: { name: true, code: true, flagUrl: true } } },
    });

    const enrichedCards = topCards.map((c) => {
      const player = cardPlayers.find((p) => p.id === c.playerId);
      return {
        playerId: c.playerId,
        cards: c._count.id,
        firstName: player?.firstName,
        lastName: player?.lastName,
        team: player?.team,
      };
    });

    // Aggregate goals by team
    const teamGoals: Record<string, { name: string; code: string; goals: number }> = {};
    goalsByTeam.forEach((match) => {
      if (match.homeTeamId && match.homeTeam && match.homeScore !== null) {
        if (!teamGoals[match.homeTeamId]) {
          teamGoals[match.homeTeamId] = { name: match.homeTeam.name, code: match.homeTeam.code, goals: 0 };
        }
        teamGoals[match.homeTeamId].goals += match.homeScore;
      }
      if (match.awayTeamId && match.awayTeam && match.awayScore !== null) {
        if (!teamGoals[match.awayTeamId]) {
          teamGoals[match.awayTeamId] = { name: match.awayTeam.name, code: match.awayTeam.code, goals: 0 };
        }
        teamGoals[match.awayTeamId].goals += match.awayScore;
      }
    });

    const goalsByTeamSorted = Object.values(teamGoals)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 15);

    const avgAttendance = await prisma.match.aggregate({
      _avg: { attendance: true },
      where: { status: "FINISHED", attendance: { not: null } },
    });

    return NextResponse.json({
      overview: {
        totalTeams,
        totalPlayers,
        totalMatches,
        finishedMatches,
        totalGoals,
        avgGoalsPerMatch: finishedMatches > 0 ? (totalGoals / finishedMatches).toFixed(2) : 0,
        avgAttendance: Math.round(avgAttendance._avg.attendance || 0),
      },
      topScorers: enrichedScorers,
      topCards: enrichedCards,
      goalsByTeam: goalsByTeamSorted,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
