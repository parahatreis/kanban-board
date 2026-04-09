/**
 * Seeds persistent mock data for local development (no HTTP).
 * Run after: db:generate + db:migrate, with DATABASE_URL set.
 *
 * Idempotent: if a board named "Demo board" already exists for the demo user, exits without duplicating.
 */
import { loadMonorepoEnv } from "../lib/load-env.js";
import {
  createDb,
  createPool,
  getUserByEmail,
  insertBoard,
  insertCard,
  insertColumn,
  insertUser,
  listBoardsByUser,
} from "../db/index.js";

const DEMO_EMAIL = "demo@kanban.local";
const DEMO_BOARD_NAME = "Demo board";

loadMonorepoEnv();

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  return url;
}

async function main() {
  const pool = createPool(getDatabaseUrl());
  const db = createDb(pool);

  let user = await getUserByEmail(db, DEMO_EMAIL);
  if (!user) {
    const created = await insertUser(db, {
      email: DEMO_EMAIL,
      displayName: "Demo User",
    });
    if (!created) throw new Error("insertUser returned nothing");
    user = created;
  }

  const boards = await listBoardsByUser(db, user.id);
  if (boards.some((b) => b.name === DEMO_BOARD_NAME)) {
    console.log(`seed-db: skipped (already seeded — "${DEMO_BOARD_NAME}" exists)`);
    await pool.end();
    return;
  }

  const board = await insertBoard(db, {
    userId: user.id,
    name: DEMO_BOARD_NAME,
  });
  if (!board) throw new Error("insertBoard returned nothing");

  const colTodo = await insertColumn(db, {
    boardId: board.id,
    title: "Todo",
    position: 0,
  });
  const colDone = await insertColumn(db, {
    boardId: board.id,
    title: "Done",
    position: 1,
  });
  if (!colTodo || !colDone) throw new Error("insertColumn returned nothing");

  await insertCard(db, {
    boardId: board.id,
    columnId: colTodo.id,
    title: "Welcome to the board",
    description: "Drag cards between columns when the UI is wired up.",
    position: 0,
    label: "feature",
  });
  await insertCard(db, {
    boardId: board.id,
    columnId: colTodo.id,
    title: "Fix login redirect",
    description: "",
    position: 1,
    label: "bug",
  });
  await insertCard(db, {
    boardId: board.id,
    columnId: colDone.id,
    title: "Project setup",
    description: "Monorepo and DB are ready.",
    position: 0,
    label: "feature",
  });

  console.log("seed-db: ok (demo user, board, columns, and cards created)");
  await pool.end();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
