"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playerSchema, PlayerFormValues } from "@/lib/validations/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { POSITION_LABELS } from "@/lib/utils";

interface PlayerFormProps {
  player?: {
    id: string;
    firstName: string;
    lastName: string;
    number: number;
    position: string;
    dateOfBirth: Date;
    nationality: string;
    photoUrl: string | null;
    teamId: string;
  } | null;
  teams: { id: string; name: string; code: string }[];
  onSuccess: () => void;
}

export function PlayerForm({ player, teams, onSuccess }: PlayerFormProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      firstName: player?.firstName ?? "",
      lastName: player?.lastName ?? "",
      number: player?.number ?? undefined,
      position: (player?.position as PlayerFormValues["position"]) ?? undefined,
      dateOfBirth: player?.dateOfBirth
        ? new Date(player.dateOfBirth).toISOString().split("T")[0]
        : "",
      nationality: player?.nationality ?? "",
      photoUrl: player?.photoUrl ?? "",
      teamId: player?.teamId ?? "",
    },
  });

  async function onSubmit(data: PlayerFormValues) {
    const url = player ? `/api/players/${player.id}` : "/api/players";
    const method = player ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Input {...register("firstName")} placeholder="Lionel" />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Apellido *</Label>
          <Input {...register("lastName")} placeholder="Messi" />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Número de camiseta *</Label>
          <Input type="number" {...register("number")} placeholder="10" min={1} max={99} />
          {errors.number && <p className="text-xs text-red-500">{errors.number.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Posición *</Label>
          <Select defaultValue={player?.position} onValueChange={(v) => setValue("position", v as PlayerFormValues["position"])}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {Object.entries(POSITION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Fecha de nacimiento *</Label>
          <Input type="date" {...register("dateOfBirth")} />
          {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Nacionalidad *</Label>
          <Input {...register("nationality")} placeholder="Argentina" />
          {errors.nationality && <p className="text-xs text-red-500">{errors.nationality.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Equipo *</Label>
          <Select defaultValue={player?.teamId} onValueChange={(v) => setValue("teamId", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar equipo..." /></SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teamId && <p className="text-xs text-red-500">{errors.teamId.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>URL de foto</Label>
          <Input {...register("photoUrl")} placeholder="https://..." />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {player ? "Guardar Cambios" : "Crear Jugador"}
        </Button>
      </div>
    </form>
  );
}
