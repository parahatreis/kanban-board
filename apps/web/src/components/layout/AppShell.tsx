import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 px-4 py-3 flex items-center gap-6">
        <Link to="/" className="font-semibold tracking-tight">
          Kanban
        </Link>
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
