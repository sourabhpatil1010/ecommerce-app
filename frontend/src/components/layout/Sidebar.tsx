import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:block dark:bg-slate-900">
      <nav className="p-4">{children}</nav>
    </aside>
  );
}
