"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchSchema, MatchFormValues } from "@/lib/validations/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/utils";

interface MatchFormProps {
  match?: { id: string; matchNumber: number; stage: string; status: string; scheduledAt: Date; homeTeamId: string | null; awayTeamId: string | null; stadiumId: string; homeScore: number | null; awayScore: number | null; attendance: number | null } | null;
  teams: { id: string; name: string; code: string }[];
  stadiums: { id: string; name: string; city: string }[];
  onSuccess: () => void;
}

export function MatchForm({ match, teams, stadiums, onSuccess }: MatchFormProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      matchNumber: match?.matchNumber ?? undefined,
      stage: (match?.stage as MatchFormValues["stage"]) ?? undefined,
      status: (match?.status as MatchFormValues["status"]) ?? "SCHEDULED",
      scheduledAt: match?.scheduledAt
        ? new Date(match.scheduledAt).toISOString().slice(0, 16)
        : "",
      homeTeamId: match?.homeTeamId ?? "",
      awayTeamId: match?.awayTeamId ?? "",
      stadiumId: match?.stadiumId ?? "",
      homeScore: match?.homeScore ?? undefined,
      awayScore: match?.awayScore ?? undefined,
      attendance: match?.attendance ?? undefined,
    },
  });

  async function onSubmit(data: MatchFormValues) {
    const url = match ? `/api/matches/${match.id}` : "/api/matches";
    const method = match ? "PATCH" : "POST";
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
          <Label>Número de partido *</Label>
          <Input type="number" {...register("matchNumber")} placeholder="1" />
          {errors.matchNumber && <p className="text-xs text-red-500">{errors.matchNumber.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Fase *</Label>
          <Select defaultValue={match?.stage} onValueChange={(v) => setValue("stage", v as MatchFormValues["stage"])}>
            <SelectTrigger><SelectValue placeholder="Seleccionar fase..." /></SelectTrigger>
            <SelectContent>
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.stage && <p className="text-xs text-red-500">{errors.stage.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Estado</Label>
          <Select defaultValue={match?.status ?? "SCHEDULED"} onValueChange={(v) => setValue("status", v as MatchFormValues["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Fecha y hora *</Label>
          <Input type="datetime-local" {...register("scheduledAt")} />
          {errors.scheduledAt && <p className="text-xs text-red-500">{errors.scheduledAt.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Equipo Local</Label>
          <Select defaultValue={match?.homeTeamId ?? ""} onValueChange={(v) => setValue("homeTeamId", v)}>
            <SelectTrigger><SelectValue placeholder="TBD" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">TBD</SelectItem>
              {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Equipo Visitante</Label>
          <Select defaultValue={match?.awayTeamId ?? ""} onValueChange={(v) => setValue("awayTeamId", v)}>
            <SelectTrigger><SelectValue placeholder="TBD" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">TBD</SelectItem>
              {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Estadio *</Label>
          <Select defaultValue={match?.stadiumId} onValueChange={(v) => setValue("stadiumId", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar estadio..." /></SelectTrigger>
            <SelectContent>
              {stadiums.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.city}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.stadiumId && <p className="text-xs text-red-500">{errors.stadiumId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Goles Local</Label>
          <Input type="number" {...register("homeScore")} placeholder="-" min={0} />
        </div>
        <div className="space-y-1">
          <Label>Goles Visitante</Label>
          <Input type="number" {...register("awayScore")} placeholder="-" min={0} />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Asistencia</Label>
          <Input type="number" {...register("attendance")} placeholder="80000" min={0} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {match ? "Guardar Cambios" : "Crear Partido"}
        </Button>
      </div>
    </form>
  );
}
