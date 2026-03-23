"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MatchForm } from "@/components/matches/match-form";
import { MatchEditor } from "@/components/matches/match-editor";
import { formatDateTime, STAGE_LABELS, STATUS_LABELS } from "@/lib/utils";

type Team = { id: string; name: string; code: string; flagUrl: string | null };
type Stadium = { id: string; name: string; city: string; country: string };

type Match = {
  id: string;
  matchNumber: number;
  stage: string;
  status: string;
  scheduledAt: Date;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  stadium: Stadium;
  _count: { goals: number; cards: number };
};

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "info"> = {
  SCHEDULED: "info",
  LIVE: "success" as never,
  FINISHED: "secondary" as never,
  POSTPONED: "warning",
  CANCELLED: "destructive",
};

interface MatchesClientProps {
  matches: Match[];
  teams: { id: string; name: string; code: string }[];
  stadiums: { id: string; name: string; city: string }[];
}

export function MatchesClient({ matches: initialMatches, teams, stadiums }: MatchesClientProps) {
  const router = useRouter();
  const [matches, setMatches] = useState(initialMatches);
  const [formOpen, setFormOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [editorMatchId, setEditorMatchId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/matches/${deleteId}`, { method: "DELETE" });
    setMatches((prev) => prev.filter((m) => m.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  const columns: ColumnDef<Match>[] = [
    {
      accessorKey: "matchNumber",
      header: "N°",
      cell: ({ row }) => <span className="font-mono text-sm">#{row.original.matchNumber}</span>,
    },
    {
      id: "teams",
      header: "Partido",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex items-center gap-2 font-medium">
            <span>{m.homeTeam?.code ?? "TBD"}</span>
            {m.status === "FINISHED" ? (
              <span className="text-lg font-bold text-slate-700">
                {m.homeScore} - {m.awayScore}
              </span>
            ) : (
              <span className="text-slate-400 text-sm">vs</span>
            )}
            <span>{m.awayTeam?.code ?? "TBD"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "stage",
      header: "Fase",
      cell: ({ row }) => <Badge variant="outline">{STAGE_LABELS[row.original.stage]}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={(statusVariant[row.original.status] ?? "secondary") as never}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "scheduledAt",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(row.original.scheduledAt)}</span>
      ),
    },
    {
      accessorKey: "stadium",
      header: "Estadio",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.stadium.name}, {row.original.stadium.city}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Editor de partido"
            onClick={() => { setEditorMatchId(row.original.id); setEditorOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon"
            onClick={() => { setEditMatch(row.original); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive"
            onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Partidos</h2>
          <p className="text-muted-foreground">{matches.length} partidos programados</p>
        </div>
        <Button onClick={() => { setEditMatch(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Partido
        </Button>
      </div>

      <DataTable columns={columns} data={matches} searchKey="teams" searchPlaceholder="Buscar partido..." />

      {/* Create/Edit Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMatch ? "Editar Partido" : "Nuevo Partido"}</DialogTitle>
          </DialogHeader>
          <MatchForm
            match={editMatch}
            teams={teams}
            stadiums={stadiums}
            onSuccess={() => { setFormOpen(false); setEditMatch(null); router.refresh(); }}
          />
        </DialogContent>
      </Dialog>

      {/* Match Editor (score + events) */}
      {editorMatchId && (
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editor de Partido</DialogTitle>
            </DialogHeader>
            <MatchEditor matchId={editorMatchId} onClose={() => { setEditorOpen(false); router.refresh(); }} />
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="¿Eliminar partido?"
        description="Se eliminarán también los goles y tarjetas asociados."
      />
    </div>
  );
}
