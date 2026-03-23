import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  colorClass?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, colorClass = "bg-blue-500" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend !== undefined && (
              <p className={cn("text-xs font-medium", trend >= 0 ? "text-green-600" : "text-red-600")}>
                {trend >= 0 ? "+" : ""}{trend}% vs anterior
              </p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", colorClass)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
