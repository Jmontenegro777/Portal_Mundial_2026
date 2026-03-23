import { z } from "zod";

export const matchSchema = z.object({
  matchNumber: z.coerce.number().int().min(1),
  stage: z.enum(["GROUP", "ROUND_OF_32", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "THIRD_PLACE", "FINAL"]),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"]).default("SCHEDULED"),
  scheduledAt: z.string().min(1, "Fecha requerida"),
  homeTeamId: z.string().optional(),
  awayTeamId: z.string().optional(),
  stadiumId: z.string().min(1, "Estadio requerido"),
  homeScore: z.coerce.number().int().min(0).optional(),
  awayScore: z.coerce.number().int().min(0).optional(),
  homeScorePens: z.coerce.number().int().min(0).optional(),
  awayScorePens: z.coerce.number().int().min(0).optional(),
  attendance: z.coerce.number().int().min(0).optional(),
  groupId: z.string().optional(),
});

export const goalSchema = z.object({
  playerId: z.string().min(1, "Jugador requerido"),
  minute: z.coerce.number().int().min(1).max(120),
  isOwnGoal: z.boolean().default(false),
  isPenalty: z.boolean().default(false),
});

export const cardSchema = z.object({
  playerId: z.string().min(1, "Jugador requerido"),
  type: z.enum(["YELLOW", "RED", "YELLOW_RED"]),
  minute: z.coerce.number().int().min(1).max(120),
});

export type MatchFormValues = z.infer<typeof matchSchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
export type CardFormValues = z.infer<typeof cardSchema>;
