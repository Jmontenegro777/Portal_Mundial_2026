"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema, TeamFormValues } from "@/lib/validations/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CONFEDERATION_LABELS } from "@/lib/utils";

interface TeamFormProps {
  team?: { id: string; name: string; code: string; confederation: string; coach: string | null; flagUrl: string | null; groupId: string | null } | null;
  groups: { id: string; name: string }[];
  onSuccess: () => void;
}

export function TeamForm({ team, groups, onSuccess }: TeamFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name ?? "",
      code: team?.code ?? "",
      confederation: (team?.confederation as TeamFormValues["confederation"]) ?? undefined,
      coach: team?.coach ?? "",
      flagUrl: team?.flagUrl ?? "",
      groupId: team?.groupId ?? "",
    },
  });

  async function onSubmit(data: TeamFormValues) {
    const url = team ? `/api/teams/${team.id}` : "/api/teams";
    const method = team ? "PATCH" : "POST";
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
        <div className="col-span-2 space-y-1">
          <Label>Nombre del equipo *</Label>
          <Input {...register("name")} placeholder="Brasil" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Código FIFA (3 letras) *</Label>
          <Input {...register("code")} placeholder="BRA" maxLength={3} className="uppercase" />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Confederación *</Label>
          <Select
            defaultValue={team?.confederation}
            onValueChange={(v) => setValue("confederation", v as TeamFormValues["confederation"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONFEDERATION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.confederation && <p className="text-xs text-red-500">{errors.confederation.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Entrenador</Label>
          <Input {...register("coach")} placeholder="Nombre del entrenador" />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>URL de la Bandera</Label>
          <Input {...register("flagUrl")} placeholder="https://..." />
          {errors.flagUrl && <p className="text-xs text-red-500">{errors.flagUrl.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Grupo</Label>
          <Select
            defaultValue={team?.groupId ?? ""}
            onValueChange={(v) => setValue("groupId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin grupo asignado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin grupo</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>Grupo {g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {team ? "Guardar Cambios" : "Crear Equipo"}
        </Button>
      </div>
    </form>
  );
}
