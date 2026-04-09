# Ravenna Coding Challenge

## Kanban Board Product + Backend API

Build a small Kanban board product with:
- A frontend application (React)
- A backend API server

This challenge evaluates frontend engineering, product/UX design, and backend correctness.

**Expected time: 4–6 hours**

---

## Core Requirements

### Frontend (Kanban product)

Your app must support:

- Create, edit, delete cards (title + description minimum)
- Move cards between columns
- Reorder cards within a column (drag-and-drop or similar UX)
- Filter cards by at least one attribute
- Group cards by an attribute (board reorganizes when grouping changes)

**State management**
- Use an approach suitable for a real product
- Briefly explain your choice in the README

**UI/UX expectations**
- Clear component structure (Board, Column, Card, Filters, etc.)
- Good visual hierarchy and spacing
- Keyboard-friendly modals/forms and focus management
- Reasonable accessibility defaults

TypeScript is strongly preferred.

Basic tests are required for core logic (create/move/filter/group).

---

### Backend (API server)

Implement HTTP APIs that power the Kanban experience.

The server must:

- Be type-safe
- Validate inputs and return consistent errors
- Include basic logging
- Include basic tests for core paths

**Minimum functionality**

- Persist boards, columns, and cards (SQLite/Postgres/etc.)
- APIs for:
  - CRUD cards
  - Moving cards between columns
  - Reordering cards within a column
  - Listing cards with filters

You may assume a single user (no auth required).

---

## Extended Requirements (Optional)

**Frontend**
- Card details panel (subtasks, tags, comments)
- Column creation/reordering
- Keyboard shortcuts
- Dark mode or theming
- Mobile responsiveness

**Backend**
- Pagination or search
- Soft delete
- Basic concurrency safety for reordering
- Simple rate limiting

**Engineering quality**
- Integration tests
- Structured logging
- Performance optimizations for large boards

---

## Bonus

- Deployed demo
- Clear documentation of UX decisions
- Database schema + migrations
- Well‑explained trade-offs

---

## Evaluation Criteria (20 points total)

- **Frontend implementation – 7**
  UI correctness, state handling, component structure, responsiveness

- **Product & interaction design – 6**
  User flows, UX decisions, visual clarity, edge cases

- **Backend implementation – 5**
  API correctness, type safety, validation, tests, logging

- **Infrastructure & setup – 2**
  Local setup simplicity and defaults

---

## Documentation (README)

Include:

- Setup/run instructions
- Architecture overview
- State management approach
- Database + schema overview
- API overview
- Key UX decisions
- Trade-offs and future improvements

---

## Tips

- Start with a working end-to-end Kanban flow
- Keep the backend focused on supporting the UX
- Favor clarity over feature count
- Make design decisions explicit
- Clean code beats clever code

---

## Submission

- Source code
- README
- Assumptions and trade-offs
- Optional deployed link

