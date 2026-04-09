import { Link } from "react-router-dom";
import { MOCK_BOARDS_TABLE } from "@/mocks/board-datasets";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-y-auto px-6 py-10">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Boards
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Open a board to view its Kanban. Data is stored in the browser for this demo.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Last updated</th>
              <th className="w-28 px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {MOCK_BOARDS_TABLE.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-2.5 font-medium text-foreground">{row.name}</td>
                <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">
                  {row.updatedAt}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    to={`/board/${row.id}`}
                    className="inline-flex rounded-md border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm transition hover:bg-muted/50"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
