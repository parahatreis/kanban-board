import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";

const STORAGE_KEY = "kanban-sidebar-collapsed";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const location = useLocation();

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="flex h-dvh min-h-0 max-h-dvh flex-col overflow-hidden bg-background md:flex-row">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex transform transition-[transform,width] duration-200 ease-out md:relative md:z-0 md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-[200px] md:w-14" : "w-[200px] md:w-42",
        )}
      >
        <div className="relative flex h-full min-h-0 flex-1 flex-col bg-sidebar shadow-xl md:shadow-none">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 md:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
          <WorkspaceSidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <Link
            to="/"
            className="truncate text-sm font-semibold tracking-tight text-foreground"
          >
            Kanban
          </Link>
        </header>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            location.pathname.startsWith("/board")
              ? "bg-canvas"
              : "bg-background",
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
