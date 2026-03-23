"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Users,
  Grid3X3,
  Swords,
  Building2,
  BarChart3,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Torneo",
    items: [
      { title: "Equipos", href: "/dashboard/teams", icon: Shield },
      { title: "Jugadores", href: "/dashboard/players", icon: Users },
      { title: "Grupos", href: "/dashboard/groups", icon: Grid3X3 },
      { title: "Partidos", href: "/dashboard/matches", icon: Swords },
      { title: "Estadios", href: "/dashboard/stadiums", icon: Building2 },
    ],
  },
  {
    title: "Analítica",
    items: [
      { title: "Estadísticas", href: "/dashboard/statistics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-slate-700", collapsed && "justify-center")}>
        <Trophy className="h-8 w-8 text-yellow-400 shrink-0" />
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">Portal Mundial</p>
            <p className="text-xs text-slate-400">FIFA 2026 Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((section, i) => (
          <div key={i}>
            {"items" in section ? (
              <>
                {!collapsed && (
                  <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </p>
                )}
                {section.items?.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.title}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")}
                    collapsed={collapsed}
                  />
                ))}
              </>
            ) : (
              <NavLink
                href={section.href}
                icon={section.icon}
                label={section.title}
                active={pathname === section.href}
                collapsed={collapsed}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm hover:bg-slate-100"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white",
        collapsed && "justify-center"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
