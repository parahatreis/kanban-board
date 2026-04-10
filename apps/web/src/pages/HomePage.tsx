import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBoardsDirectoryStore } from "@/stores/boards-directory-store";

function formatBoardDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(d);
  } catch {
    return String(d);
  }
}

export function HomePage() {
  const boards = useBoardsDirectoryStore((s) => s.boards);
  const error = useBoardsDirectoryStore((s) => s.error);
  const status = useBoardsDirectoryStore((s) => s.status);
  const loadBoardsDirectory = useBoardsDirectoryStore((s) => s.loadBoardsDirectory);

  useEffect(() => {
    void loadBoardsDirectory();
  }, [loadBoardsDirectory]);

  const loading = status === "loading" || boards === null;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Boards
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Open a board to manage columns and tasks.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading boards…</p>
      ) : boards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No boards yet. Seed the database and run the API to see boards here.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((row) => (
            <li key={row.id}>
              <Link to={`/board/${row.id}`} className="group block h-full outline-none">
                <Card className="h-full min-h-[140px] border-border/80 bg-card transition-shadow hover:border-border hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/40">
                  <CardHeader className="flex h-full flex-col gap-3 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
                          {row.name}
                        </CardTitle>
                      </div>
                      <ArrowRight
                        className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </div>
                    <CardDescription className="text-xs">
                      Created {formatBoardDate(row.createdAt)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
