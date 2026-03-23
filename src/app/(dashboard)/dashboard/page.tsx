import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Swords,
  Goal,
  Building2,
  Clock,
} from "lucide-react";
import { formatDateTime, STAGE_LABELS, STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [
    totalTeams,
    totalPlayers,
    totalMatches,
    finishedMatches,
    liveMatches,
    totalGoals,
    totalStadiums,
    upcomingMatches,
    recentGoals,
  ] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.match.count(),
    prisma.match.count({ where: { status: "FINISHED" } }),
    prisma.match.count({ where: { status: "LIVE" } }),
    prisma.goal.count({ where: { isOwnGoal: false } }),
    prisma.stadium.count(),
    prisma.match.findMany({
      where: { status: { in: ["SCHEDULED", "LIVE"] } },
      include: {
        homeTeam: { select: { name: true, code: true } },
        awayTeam: { select: { name: true, code: true } },
        stadium: { select: { name: true, city: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.goal.findMany({
      where: { isOwnGoal: false },
      include: {
        player: { select: { firstName: true, lastName: true } },
        match: {
          select: {
            homeTeam: { select: { code: true } },
            awayTeam: { select: { code: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalTeams, totalPlayers, totalMatches, finishedMatches,
    liveMatches, totalGoals, totalStadiums, upcomingMatches, recentGoals,
  };
}

const statusColor: Record<string, "default" | "success" | "warning" | "destructive" | "info"> = {
  SCHEDULED: "info",
  LIVE: "success",
  FINISHED: "secondary" as never,
  POSTPONED: "warning",
  CANCELLED: "destructive",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Resumen del Torneo</h2>
        <p className="text-muted-foreground">Copa del Mundo FIFA 2026 — Panel Administrativo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Equipos" value={data.totalTeams} icon={Shield} colorClass="bg-blue-500" description="de 48 equipos clasificados" />
        <StatCard title="Jugadores" value={data.totalPlayers} icon={Users} colorClass="bg-emerald-500" />
        <StatCard title="Partidos Jugados" value={data.finishedMatches} icon={Swords} colorClass="bg-purple-500" description={`de ${data.totalMatches} programados`} />
        <StatCard title="Goles Marcados" value={data.totalGoals} icon={Goal} colorClass="bg-orange-500" description={data.finishedMatches > 0 ? `Promedio: ${(data.totalGoals / data.finishedMatches).toFixed(2)}/partido` : "Sin partidos"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Próximos Partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay partidos programados</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">
                        {match.homeTeam?.code ?? "TBD"} vs {match.awayTeam?.code ?? "TBD"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.stadium.name}, {match.stadium.city}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(match.scheduledAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={statusColor[match.status] ?? "secondary"}>
                        {STATUS_LABELS[match.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{STAGE_LABELS[match.stage]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Goal className="h-4 w-4" />
              Goles Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay goles registrados</p>
            ) : (
              <div className="space-y-2">
                {data.recentGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">
                        {goal.player.firstName} {goal.player.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {goal.match.homeTeam?.code ?? "?"} vs {goal.match.awayTeam?.code ?? "?"}
                      </p>
                    </div>
                    <Badge variant="outline">Min. {goal.minute}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Estadios" value={data.totalStadiums} icon={Building2} colorClass="bg-slate-500" />
        <StatCard title="En Vivo Ahora" value={data.liveMatches} icon={Swords} colorClass="bg-red-500" />
        <StatCard title="Total Partidos" value={data.totalMatches} icon={Swords} colorClass="bg-indigo-500" />
      </div>
    </div>
  );
}
