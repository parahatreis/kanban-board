import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-sm px-5 py-4 flex items-center gap-8 shadow-sm">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          Kanban
        </Link>
        <nav className="text-sm">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </nav>
      </header>
      <div className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
