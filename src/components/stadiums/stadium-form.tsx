"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stadiumSchema, StadiumFormValues } from "@/lib/validations/stadium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface StadiumFormProps {
  stadium?: {
    id: string;
    name: string;
    city: string;
    country: string;
    capacity: number;
    photoUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  onSuccess: () => void;
}

export function StadiumForm({ stadium, onSuccess }: StadiumFormProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<StadiumFormValues>({
    resolver: zodResolver(stadiumSchema),
    defaultValues: {
      name: stadium?.name ?? "",
      city: stadium?.city ?? "",
      country: (stadium?.country as StadiumFormValues["country"]) ?? undefined,
      capacity: stadium?.capacity ?? undefined,
      photoUrl: stadium?.photoUrl ?? "",
      latitude: stadium?.latitude ?? undefined,
      longitude: stadium?.longitude ?? undefined,
    },
  });

  async function onSubmit(data: StadiumFormValues) {
    const url = stadium ? `/api/stadiums/${stadium.id}` : "/api/stadiums";
    const method = stadium ? "PATCH" : "POST";
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
          <Label>Nombre del estadio *</Label>
          <Input {...register("name")} placeholder="MetLife Stadium" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Ciudad *</Label>
          <Input {...register("city")} placeholder="East Rutherford" />
          {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>País *</Label>
          <Select defaultValue={stadium?.country} onValueChange={(v) => setValue("country", v as StadiumFormValues["country"])}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">🇺🇸 Estados Unidos</SelectItem>
              <SelectItem value="Mexico">🇲🇽 México</SelectItem>
              <SelectItem value="Canada">🇨🇦 Canadá</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Capacidad *</Label>
          <Input type="number" {...register("capacity")} placeholder="82500" min={1000} />
          {errors.capacity && <p className="text-xs text-red-500">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>URL de foto</Label>
          <Input {...register("photoUrl")} placeholder="https://..." />
        </div>

        <div className="space-y-1">
          <Label>Latitud</Label>
          <Input type="number" step="any" {...register("latitude")} placeholder="40.8135" />
        </div>

        <div className="space-y-1">
          <Label>Longitud</Label>
          <Input type="number" step="any" {...register("longitude")} placeholder="-74.0744" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {stadium ? "Guardar Cambios" : "Crear Estadio"}
        </Button>
      </div>
    </form>
  );
}
