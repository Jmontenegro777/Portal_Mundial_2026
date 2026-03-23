import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Swords,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { GoalsBarChart } from "@/components/statistics/goals-bar-chart";

export const dynamic = "force-dynamic";

async function getStatistics() {
  const [totalTeams, totalPlayers, finishedMatches, totalGoals, topScorersRaw, cardStats] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.match.count({ where: { status: "FINISHED" } }),
    prisma.goal.count({ where: { isOwnGoal: false } }),
    prisma.goal.groupBy({
      by: ["playerId"],
      _count: { id: true },
      where: { isOwnGoal: false },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.card.groupBy({
      by: ["playerId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const scorerIds = topScorersRaw.map((s) => s.playerId);
  const cardIds = cardStats.map((c) => c.playerId);

  const [scorerPlayers, cardPlayers, finishedMatchesData] = await Promise.all([
    prisma.player.findMany({
      where: { id: { in: scorerIds } },
      include: { team: { select: { name: true, code: true, flagUrl: true } } },
    }),
    prisma.player.findMany({
      where: { id: { in: cardIds } },
      include: { team: { select: { name: true, code: true } } },
    }),
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

  const topScorers = topScorersRaw.map((s) => {
    const player = scorerPlayers.find((p) => p.id === s.playerId);
    return { goals: s._count.id, player };
  }).filter((s) => s.player);

  const topCards = cardStats.map((c) => {
    const player = cardPlayers.find((p) => p.id === c.playerId);
    return { cards: c._count.id, player };
  }).filter((c) => c.player);

  // Goals by team
  const teamGoals: Record<string, { name: string; code: string; goals: number }> = {};
  finishedMatchesData.forEach((m) => {
    if (m.homeTeamId && m.homeTeam && m.homeScore !== null) {
      if (!teamGoals[m.homeTeamId]) teamGoals[m.homeTeamId] = { name: m.homeTeam.name, code: m.homeTeam.code, goals: 0 };
      teamGoals[m.homeTeamId].goals += m.homeScore;
    }
    if (m.awayTeamId && m.awayTeam && m.awayScore !== null) {
      if (!teamGoals[m.awayTeamId]) teamGoals[m.awayTeamId] = { name: m.awayTeam.name, code: m.awayTeam.code, goals: 0 };
      teamGoals[m.awayTeamId].goals += m.awayScore;
    }
  });

  const goalsByTeam = Object.values(teamGoals).sort((a, b) => b.goals - a.goals).slice(0, 12);
  const avgGoals = finishedMatches > 0 ? (totalGoals / finishedMatches).toFixed(2) : "0";

  return { totalTeams, totalPlayers, finishedMatches, totalGoals, avgGoals, topScorers, topCards, goalsByTeam };
}

export default async function StatisticsPage() {
  const stats = await getStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Estadísticas</h2>
        <p className="text-muted-foreground">Resumen estadístico del torneo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Equipos" value={stats.totalTeams} icon={Shield} colorClass="bg-blue-500" />
        <StatCard title="Jugadores" value={stats.totalPlayers} icon={Users} colorClass="bg-emerald-500" />
        <StatCard title="Partidos Jugados" value={stats.finishedMatches} icon={Swords} colorClass="bg-purple-500" />
        <StatCard title="Total Goles" value={stats.totalGoals} icon={Trophy} colorClass="bg-orange-500" description={`Promedio: ${stats.avgGoals}/partido`} />
      </div>

      {/* Charts */}
      {stats.goalsByTeam.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Goles por Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalsBarChart data={stats.goalsByTeam} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabla de Goleadores</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topScorers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin goles registrados</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">Goles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topScorers.map((s, i) => (
                    <TableRow key={s.player?.id ?? i}>
                      <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {s.player?.firstName} {s.player?.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {s.player?.team?.flagUrl && (
                            <img src={s.player.team.flagUrl} alt="" className="h-4 w-5 object-cover rounded" />
                          )}
                          <span className="text-sm">{s.player?.team?.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge>{s.goals}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jugadores con más Tarjetas</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin tarjetas registradas</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">Tarjetas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topCards.map((c, i) => (
                    <TableRow key={c.player?.id ?? i}>
                      <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {c.player?.firstName} {c.player?.lastName}
                      </TableCell>
                      <TableCell className="text-sm">{c.player?.team?.code}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="warning">{c.cards}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
