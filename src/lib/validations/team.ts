import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  code: z.string().length(3, "El código debe tener 3 caracteres").toUpperCase(),
  confederation: z.enum(["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"]),
  coach: z.string().optional(),
  flagUrl: z.string().url("URL de bandera inválida").optional().or(z.literal("")),
  groupId: z.string().optional(),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
