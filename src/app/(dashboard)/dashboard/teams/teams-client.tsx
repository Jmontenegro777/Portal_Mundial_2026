"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamForm } from "@/components/teams/team-form";
import { CONFEDERATION_LABELS } from "@/lib/utils";

type Team = {
  id: string;
  name: string;
  code: string;
  flagUrl: string | null;
  confederation: string;
  coach: string | null;
  group: { id: string; name: string } | null;
  _count: { players: number; homeMatches: number; awayMatches: number };
};

interface TeamsClientProps {
  teams: Team[];
  groups: { id: string; name: string }[];
}

export function TeamsClient({ teams: initialTeams, groups }: TeamsClientProps) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [formOpen, setFormOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/teams/${deleteId}`, { method: "DELETE" });
    setTeams((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  async function handleSave() {
    setFormOpen(false);
    setEditTeam(null);
    router.refresh();
  }

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Equipo <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.flagUrl ? (
            <img src={row.original.flagUrl} alt={row.original.code} className="h-6 w-9 object-cover rounded" />
          ) : (
            <div className="h-6 w-9 rounded bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
              {row.original.code}
            </div>
          )}
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "confederation",
      header: "Confederación",
      cell: ({ row }) => (
        <Badge variant="outline">{CONFEDERATION_LABELS[row.original.confederation]}</Badge>
      ),
    },
    {
      accessorKey: "group",
      header: "Grupo",
      cell: ({ row }) => row.original.group ? (
        <Badge>Grupo {row.original.group.name}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
    },
    {
      accessorKey: "coach",
      header: "Entrenador",
      cell: ({ row }) => row.original.coach || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: "_count.players",
      header: "Jugadores",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original._count.players}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setEditTeam(row.original); setFormOpen(true); }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
          >
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
          <h2 className="text-2xl font-bold">Equipos</h2>
          <p className="text-muted-foreground">{teams.length} equipos registrados</p>
        </div>
        <Button onClick={() => { setEditTeam(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Equipo
        </Button>
      </div>

      <DataTable columns={columns} data={teams} searchKey="name" searchPlaceholder="Buscar equipo..." />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTeam ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
          </DialogHeader>
          <TeamForm team={editTeam} groups={groups} onSuccess={handleSave} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="¿Eliminar equipo?"
        description="Esta acción eliminará el equipo y todos sus jugadores asociados."
      />
    </div>
  );
}
