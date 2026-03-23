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
import { StadiumForm } from "@/components/stadiums/stadium-form";

type Stadium = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  _count: { matches: number };
};

const countryFlag: Record<string, string> = {
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
};

interface StadiumsClientProps {
  stadiums: Stadium[];
}

export function StadiumsClient({ stadiums: initialStadiums }: StadiumsClientProps) {
  const router = useRouter();
  const [stadiums, setStadiums] = useState(initialStadiums);
  const [formOpen, setFormOpen] = useState(false);
  const [editStadium, setEditStadium] = useState<Stadium | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/stadiums/${deleteId}`, { method: "DELETE" });
    setStadiums((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  const columns: ColumnDef<Stadium>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Estadio <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "city",
      header: "Ciudad",
    },
    {
      accessorKey: "country",
      header: "País",
      cell: ({ row }) => (
        <span>{countryFlag[row.original.country] ?? ""} {row.original.country}</span>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacidad",
      cell: ({ row }) => (
        <span>{row.original.capacity.toLocaleString("es-ES")}</span>
      ),
    },
    {
      accessorKey: "_count.matches",
      header: "Partidos",
      cell: ({ row }) => <Badge variant="secondary">{row.original._count.matches}</Badge>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setEditStadium(row.original); setFormOpen(true); }}>
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
          <h2 className="text-2xl font-bold">Estadios</h2>
          <p className="text-muted-foreground">{stadiums.length} estadios registrados</p>
        </div>
        <Button onClick={() => { setEditStadium(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Estadio
        </Button>
      </div>

      <DataTable columns={columns} data={stadiums} searchKey="name" searchPlaceholder="Buscar estadio..." />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editStadium ? "Editar Estadio" : "Nuevo Estadio"}</DialogTitle>
          </DialogHeader>
          <StadiumForm
            stadium={editStadium}
            onSuccess={() => { setFormOpen(false); setEditStadium(null); router.refresh(); }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="¿Eliminar estadio?"
        description="Esta acción eliminará el estadio. Los partidos asociados quedarán sin estadio."
      />
    </div>
  );
}
