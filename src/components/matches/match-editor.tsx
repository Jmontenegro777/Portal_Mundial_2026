"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, GoalFormValues, cardSchema, CardFormValues } from "@/lib/validations/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { STATUS_LABELS } from "@/lib/utils";

type Player = { id: string; firstName: string; lastName: string; number: number; team: { name: string; code: string } };
type Goal = { id: string; minute: number; isOwnGoal: boolean; isPenalty: boolean; player: Player };
type Card = { id: string; minute: number; type: string; player: Player };

type MatchDetail = {
  id: string;
  matchNumber: number;
  stage: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; code: string; players: Player[] } | null;
  awayTeam: { id: string; name: string; code: string; players: Player[] } | null;
  goals: Goal[];
  cards: Card[];
};

export function MatchEditor({ matchId, onClose }: { matchId: string; onClose: () => void }) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchMatch() {
    const res = await fetch(`/api/matches/${matchId}`);
    const data = await res.json();
    setMatch(data);
    setLoading(false);
  }

  useEffect(() => { fetchMatch(); }, [matchId]);

  async function updateScore(homeScore: number, awayScore: number) {
    setSaving(true);
    await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore, awayScore }),
    });
    await fetchMatch();
    setSaving(false);
  }

  async function updateStatus(status: string) {
    setSaving(true);
    await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchMatch();
    setSaving(false);
  }

  async function addGoal(data: GoalFormValues) {
    await fetch(`/api/matches/${matchId}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchMatch();
  }

  async function removeGoal(goalId: string) {
    await fetch(`/api/matches/${matchId}/goals?goalId=${goalId}`, { method: "DELETE" });
    await fetchMatch();
  }

  async function addCard(data: CardFormValues) {
    await fetch(`/api/matches/${matchId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchMatch();
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!match) return <p>Partido no encontrado</p>;

  const allPlayers = [
    ...(match.homeTeam?.players ?? []),
    ...(match.awayTeam?.players ?? []),
  ];

  return (
    <div className="space-y-6">
      {/* Score & Status */}
      <div className="rounded-lg border bg-slate-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Partido #{match.matchNumber}</h3>
          <div className="flex items-center gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={match.status === value ? "default" : "outline"}
                onClick={() => updateStatus(value)}
                disabled={saving}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="font-bold text-lg">{match.homeTeam?.code ?? "TBD"}</p>
            <p className="text-sm text-muted-foreground">{match.homeTeam?.name ?? "Local"}</p>
          </div>
          <div className="flex items-center gap-4">
            <ScoreControl
              value={match.homeScore ?? 0}
              onChange={(v) => updateScore(v, match.awayScore ?? 0)}
            />
            <span className="text-2xl font-bold">-</span>
            <ScoreControl
              value={match.awayScore ?? 0}
              onChange={(v) => updateScore(match.homeScore ?? 0, v)}
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{match.awayTeam?.code ?? "TBD"}</p>
            <p className="text-sm text-muted-foreground">{match.awayTeam?.name ?? "Visitante"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Goals */}
        <div className="space-y-3">
          <h4 className="font-semibold">Goles</h4>
          <GoalEventForm players={allPlayers} onAdd={addGoal} />
          {match.goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin goles registrados</p>
          ) : (
            <div className="space-y-2">
              {match.goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between rounded border p-2 bg-white">
                  <div>
                    <p className="text-sm font-medium">
                      {goal.player.firstName} {goal.player.lastName}
                      {goal.isOwnGoal && <Badge variant="destructive" className="ml-1 text-xs">OG</Badge>}
                      {goal.isPenalty && <Badge variant="warning" className="ml-1 text-xs">P</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{goal.player.team.name} — Min. {goal.minute}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => removeGoal(goal.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <h4 className="font-semibold">Tarjetas</h4>
          <CardEventForm players={allPlayers} onAdd={addCard} />
          {match.cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin tarjetas registradas</p>
          ) : (
            <div className="space-y-2">
              {match.cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between rounded border p-2 bg-white">
                  <div>
                    <p className="text-sm font-medium">
                      {card.player.firstName} {card.player.lastName}
                      <Badge
                        variant={card.type === "RED" ? "destructive" : "warning"}
                        className="ml-2 text-xs"
                      >
                        {card.type === "YELLOW" ? "Amarilla" : card.type === "RED" ? "Roja" : "2da Amarilla"}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">{card.player.team.name} — Min. {card.minute}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

function ScoreControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => onChange(Math.max(0, value - 1))}>-</Button>
      <span className="text-3xl font-bold w-10 text-center">{value}</span>
      <Button size="sm" variant="outline" onClick={() => onChange(value + 1)}>+</Button>
    </div>
  );
}

function GoalEventForm({ players, onAdd }: { players: Player[]; onAdd: (d: GoalFormValues) => Promise<void> }) {
  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: { isOwnGoal: false, isPenalty: false, minute: undefined as never },
  });

  async function onSubmit(data: GoalFormValues) {
    await onAdd(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Select onValueChange={(v) => setValue("playerId", v)}>
        <SelectTrigger className="flex-1 text-xs h-8">
          <SelectValue placeholder="Jugador..." />
        </SelectTrigger>
        <SelectContent>
          {players.map((p) => (
            <SelectItem key={p.id} value={p.id}>#{p.number} {p.firstName} {p.lastName} ({p.team.code})</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="number" {...register("minute")} placeholder="Min" className="w-16 h-8 text-xs" min={1} max={120} />
      <Button type="submit" size="sm" className="h-8" disabled={isSubmitting}>
        <Plus className="h-3 w-3" />
      </Button>
    </form>
  );
}

function CardEventForm({ players, onAdd }: { players: Player[]; onAdd: (d: CardFormValues) => Promise<void> }) {
  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { type: "YELLOW", minute: undefined as never },
  });

  async function onSubmit(data: CardFormValues) {
    await onAdd(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Select onValueChange={(v) => setValue("playerId", v)}>
        <SelectTrigger className="flex-1 text-xs h-8">
          <SelectValue placeholder="Jugador..." />
        </SelectTrigger>
        <SelectContent>
          {players.map((p) => (
            <SelectItem key={p.id} value={p.id}>#{p.number} {p.firstName} {p.lastName} ({p.team.code})</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue="YELLOW" onValueChange={(v) => setValue("type", v as CardFormValues["type"])}>
        <SelectTrigger className="w-28 text-xs h-8"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="YELLOW">Amarilla</SelectItem>
          <SelectItem value="RED">Roja</SelectItem>
          <SelectItem value="YELLOW_RED">2da Amarilla</SelectItem>
        </SelectContent>
      </Select>
      <Input type="number" {...register("minute")} placeholder="Min" className="w-16 h-8 text-xs" min={1} max={120} />
      <Button type="submit" size="sm" className="h-8" disabled={isSubmitting}>
        <Plus className="h-3 w-3" />
      </Button>
    </form>
  );
}
