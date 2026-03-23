import { z } from "zod";

export const stadiumSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  city: z.string().min(2, "Ciudad requerida"),
  country: z.enum(["USA", "Mexico", "Canada"]),
  capacity: z.coerce.number().int().min(1000, "Capacidad mínima 1000"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export type StadiumFormValues = z.infer<typeof stadiumSchema>;
