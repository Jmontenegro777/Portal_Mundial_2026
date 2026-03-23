"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayerForm } from "@/components/players/player-form";
import { calculateAge, POSITION_LABELS } from "@/lib/utils";

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  dateOfBirth: Date;
  nationality: string;
  photoUrl: string | null;
  teamId: string;
  team: { id: string; name: string; code: string; flagUrl: string | null };
  _count: { goals: number; cards: number };
};

interface PlayersClientProps {
  players: Player[];
  teams: { id: string; name: string; code: string }[];
}

export function PlayersClient({ players: initialPlayers, teams }: PlayersClientProps) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [formOpen, setFormOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/players/${deleteId}`, { method: "DELETE" });
    setPlayers((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  const columns: ColumnDef<Player>[] = [
    {
      accessorKey: "number",
      header: "#",
      cell: ({ row }) => (
        <span className="font-bold text-slate-500 w-8 inline-block">{row.original.number}</span>
      ),
    },
    {
      id: "fullName",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Jugador <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.original.nationality}</p>
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Posición",
      cell: ({ row }) => <Badge variant="outline">{POSITION_LABELS[row.original.position]}</Badge>,
    },
    {
      accessorKey: "team",
      header: "Equipo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.team.flagUrl && (
            <img src={row.original.team.flagUrl} alt={row.original.team.code} className="h-4 w-6 object-cover rounded" />
          )}
          <span className="text-sm">{row.original.team.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "dateOfBirth",
      header: "Edad",
      cell: ({ row }) => `${calculateAge(row.original.dateOfBirth)} años`,
    },
    {
      id: "stats",
      header: "Stats",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Badge variant="success" className="text-xs">⚽ {row.original._count.goals}</Badge>
          <Badge variant="warning" className="text-xs">🟨 {row.original._count.cards}</Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setEditPlayer(row.original); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
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
          <h2 className="text-2xl font-bold">Jugadores</h2>
          <p className="text-muted-foreground">{players.length} jugadores registrados</p>
        </div>
        <Button onClick={() => { setEditPlayer(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Jugador
        </Button>
      </div>

      <DataTable columns={columns} data={players} searchKey="fullName" searchPlaceholder="Buscar jugador..." />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editPlayer ? "Editar Jugador" : "Nuevo Jugador"}</DialogTitle>
          </DialogHeader>
          <PlayerForm
            player={editPlayer}
            teams={teams}
            onSuccess={() => { setFormOpen(false); setEditPlayer(null); router.refresh(); }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="¿Eliminar jugador?"
        description="Esta acción no se puede deshacer."
      />
    </div>
  );
}
