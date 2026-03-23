import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateAge(dateOfBirth: Date | string) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const STAGE_LABELS: Record<string, string> = {
  GROUP: "Fase de Grupos",
  ROUND_OF_32: "Ronda de 32",
  ROUND_OF_16: "Octavos de Final",
  QUARTERFINAL: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  THIRD_PLACE: "Tercer Puesto",
  FINAL: "Final",
};

export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programado",
  LIVE: "En Vivo",
  FINISHED: "Finalizado",
  POSTPONED: "Postergado",
  CANCELLED: "Cancelado",
};

export const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Portero",
  DEFENDER: "Defensa",
  MIDFIELDER: "Mediocampista",
  FORWARD: "Delantero",
};

export const CONFEDERATION_LABELS: Record<string, string> = {
  UEFA: "UEFA",
  CONMEBOL: "CONMEBOL",
  CONCACAF: "CONCACAF",
  CAF: "CAF",
  AFC: "AFC",
  OFC: "OFC",
};
