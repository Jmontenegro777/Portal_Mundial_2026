"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Algo salió mal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.message || "Ocurrió un error inesperado. Intenta nuevamente."}
          </p>
        </div>
        <Button onClick={reset} variant="outline">
          <RefreshCcw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
