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
    <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Boards
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
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
