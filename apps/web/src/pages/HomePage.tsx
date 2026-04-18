import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LayoutGrid, Plus } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoardsDirectoryStore } from "@/stores/boards-directory-store";
import { ApiError } from "@/api/client";

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
  const createBoard = useBoardsDirectoryStore((s) => s.createBoard);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadBoardsDirectory();
  }, [loadBoardsDirectory]);

  const loading = status === "loading" || boards === null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = boardName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const board = await createBoard(name);
      setDialogOpen(false);
      setBoardName("");
      navigate(`/board/${board.id}`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not create board.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-6 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Boards
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open a board to manage columns and tasks.
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => {
            setCreateError(null);
            setBoardName("");
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          New board
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="new-board-name">Board name</Label>
              <Input
                id="new-board-name"
                ref={inputRef}
                autoFocus
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="e.g. Sprint 12"
              />
            </div>
            {createError ? (
              <p className="text-sm text-destructive" role="alert">
                {createError}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={creating || !boardName.trim()}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((row) => (
            <li key={row.id}>
              <Link to={`/board/${row.id}`} className="group block h-full outline-none">
                <Card className="h-full min-h-[140px] border-border/40 bg-card transition-all hover:border-border/70 hover:shadow-[0_4px_16px_rgb(0_0_0/0.06)] focus-visible:ring-2 focus-visible:ring-ring/30">
                  <CardHeader className="flex h-full flex-col gap-3 pb-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <CardTitle className="line-clamp-2 text-base font-bold leading-snug tracking-tight">
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
