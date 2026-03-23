import { z } from "zod";

export const playerSchema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  number: z.coerce.number().int().min(1).max(99),
  position: z.enum(["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"]),
  dateOfBirth: z.string().min(1, "Fecha de nacimiento requerida"),
  nationality: z.string().min(2, "Nacionalidad requerida"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  teamId: z.string().min(1, "Equipo requerido"),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;
