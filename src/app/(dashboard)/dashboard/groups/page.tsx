import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

async function getGroupsWithStandings() {
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

  return groups.map((group) => {
    const standings = group.teams.map((team) => {
      let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;
      team.homeMatches.forEach((m) => {
        if (m.homeScore !== null && m.awayScore !== null) {
          played++; gf += m.homeScore; ga += m.awayScore;
          if (m.homeScore > m.awayScore) won++;
          else if (m.homeScore === m.awayScore) drawn++;
          else lost++;
        }
      });
      team.awayMatches.forEach((m) => {
        if (m.homeScore !== null && m.awayScore !== null) {
          played++; gf += m.awayScore; ga += m.homeScore;
          if (m.awayScore > m.homeScore) won++;
          else if (m.awayScore === m.homeScore) drawn++;
          else lost++;
        }
      });
      return { id: team.id, name: team.name, code: team.code, flagUrl: team.flagUrl, played, won, drawn, lost, gf, ga, gd: gf - ga, points: won * 3 + drawn };
    }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    return { ...group, standings };
  });
}

export default async function GroupsPage() {
  const groups = await getGroupsWithStandings();

  if (groups.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Grupos</h2>
          <p className="text-muted-foreground">No hay grupos configurados aún.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Grupos & Clasificación</h2>
        <p className="text-muted-foreground">{groups.length} grupos — Copa del Mundo 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Badge className="text-sm px-3 py-1">Grupo {group.name}</Badge>
                <span className="text-muted-foreground font-normal text-sm">
                  {group.teams.length} equipos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.standings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Sin equipos asignados</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-6">#</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead className="text-center w-8">PJ</TableHead>
                      <TableHead className="text-center w-8">G</TableHead>
                      <TableHead className="text-center w-8">E</TableHead>
                      <TableHead className="text-center w-8">P</TableHead>
                      <TableHead className="text-center w-8">GD</TableHead>
                      <TableHead className="text-center w-10 font-bold">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.standings.map((team, i) => (
                      <TableRow
                        key={team.id}
                        className={i < 2 ? "bg-green-50 hover:bg-green-100" : ""}
                      >
                        <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {team.flagUrl ? (
                              <img src={team.flagUrl} alt={team.code} className="h-4 w-6 object-cover rounded" />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">{team.code}</span>
                            )}
                            <span className="font-medium text-sm">{team.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">{team.played}</TableCell>
                        <TableCell className="text-center text-sm">{team.won}</TableCell>
                        <TableCell className="text-center text-sm">{team.drawn}</TableCell>
                        <TableCell className="text-center text-sm">{team.lost}</TableCell>
                        <TableCell className="text-center text-sm">{team.gd > 0 ? `+${team.gd}` : team.gd}</TableCell>
                        <TableCell className="text-center font-bold">{team.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
