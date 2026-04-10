import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBoardsDirectoryStore } from "@/stores/boards-directory-store";

function boardInitial(name: string): string {
  const t = name.trim();
  return t.length ? t[0]!.toUpperCase() : "?";
}

export function WorkspaceSidebar({
  className,
  collapsed,
  onToggleCollapsed,
}: {
  className?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const location = useLocation();
  const boards = useBoardsDirectoryStore((s) => s.boards);
  const loadBoardsDirectory = useBoardsDirectoryStore((s) => s.loadBoardsDirectory);

  useEffect(() => {
    void loadBoardsDirectory();
  }, [loadBoardsDirectory]);

  const boardsActive = location.pathname === "/";

  const activeBoardId = useMemo(() => {
    const m = location.pathname.match(/^\/board\/([^/]+)/);
    return m?.[1] ?? null;
  }, [location.pathname]);

  const listLoading = boards === null;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground",
        collapsed ? "md:items-stretch" : "",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border/60 px-2 py-3",
          collapsed ? "md:flex-col md:justify-center md:gap-2" : "justify-between",
        )}
      >
        {!collapsed ? (
          <span className="truncate px-1 text-sm font-semibold tracking-tight text-foreground">
            Kanban
          </span>
        ) : (
          <>
            <span className="truncate px-1 text-sm font-semibold tracking-tight text-foreground md:hidden">
              Kanban
            </span>
            <span className="hidden px-1 text-center text-sm font-bold leading-none text-foreground md:block">
              K
            </span>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden shrink-0 md:flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
        <Link
          to="/"
          title={collapsed ? "All boards" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-lg py-2 text-xs font-medium transition-colors",
            collapsed ? "md:justify-center md:px-0" : "px-2.5",
            boardsActive
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
          )}
        >
          <LayoutGrid className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
          <span className={cn(collapsed ? "md:hidden" : "")}>Boards</span>
        </Link>

        <div
          className={cn(
            "pt-2",
            collapsed ? "min-h-0 flex-1 md:overflow-y-auto" : "",
          )}
        >
          {listLoading ? (
            <p
              className={cn(
                "px-2 py-1 text-[10px] text-muted-foreground",
                collapsed ? "md:hidden" : "",
              )}
            >
              Loading…
            </p>
          ) : boards.length === 0 ? (
            <p
              className={cn(
                "px-2 py-1 text-[10px] text-muted-foreground",
                collapsed ? "md:hidden" : "",
              )}
            >
              No boards
            </p>
          ) : (
            <ul className="space-y-0.5">
              {boards.map((b) => {
                const isActive = activeBoardId === b.id;
                return (
                  <li key={b.id}>
                    <Link
                      to={`/board/${b.id}`}
                      title={collapsed ? b.name : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md py-1.5 pl-4 text-xs font-medium transition-colors",
                        collapsed ? "md:justify-center md:px-0 md:py-2" : "px-2 pl-8",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50 text-[10px] font-semibold text-foreground",
                          collapsed ? "hidden md:flex" : "hidden",
                        )}
                        aria-hidden
                      >
                        {boardInitial(b.name)}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate",
                          collapsed ? "md:sr-only" : "",
                        )}
                      >
                        {b.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
}
