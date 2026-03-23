import Link from "next/link";
import { Trophy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center text-white">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400">
          <Trophy className="h-10 w-10 text-slate-900" />
        </div>
        <h1 className="text-8xl font-bold text-yellow-400">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-slate-400">
          La página que buscas no existe o fue movida.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
