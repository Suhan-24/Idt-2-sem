# Knowledge Transfer & Handover Document

## 1. System Architecture
MedCare is a full-stack healthcare platform running entirely locally to prevent data loss during testing.
- **Frontend**: React + Vite (TypeScript) using `react-router-dom` for navigation.
- **Backend**: Express (Node.js).
- **Database**: Persistent local SQLite (`server/medcare.db`).
- **Testing**: Playwright (E2E full-stack verification).

## 2. Codebase Structure
The repository follows standard Vite/Express layout:
- `src/`: Frontend React source.
  - `components/`: UI and feature components (`MedicineShop`, `DoctorSearch`, etc.).
  - `context/`: Global state providers (`GlobalContext.tsx`).
  - `services/`: API interaction layer (`api.ts`).
  - `App.tsx`: Main React Router configuration.
- `server/`: Backend API and database logic.
  - `routes/`: Express endpoint controllers.
  - `seed.js`: Hardcoded initial database seed data.
  - `db.js`: SQLite connection initialization.
- `tests/e2e/`: Playwright test scripts mirroring critical user flows.

## 3. Getting Started
To bootstrap the environment:
1. **Install dependencies:** `npm i`
2. **Reset/Seed Database:** `node server/seed.js` (Deletes current data and seeds fresh).
3. **Run Full Stack:** `npm run dev:full` (Boots Vite on `localhost:5173` and Express on `localhost:3001` concurrently).
4. **Run Test Suite:** `npx playwright test` (Headless) or `python3 visual_test.py` (Visual execution with slow-motion).

## 4. Critical Guardrails (READ BEFORE CODING)
If you are modifying this codebase, you must adhere to the following constraints to avoid breaking the system:

- **Framer Motion Race Conditions:** The UI heavily utilizes `framer-motion` (`AnimatePresence mode="wait"`). Components persist in the DOM for milliseconds while fading out. **Do not use raw Playwright `.click()` or `.fill()` immediately after navigation.** You must wait for the new elements to become fully visible, or use `{ force: true }` to bypass the animating outgoing elements.
- **SQLite Concurrency Limits:** SQLite writes lock the database. Automated testing will throw `SQLITE_BUSY` errors if run concurrently. **Keep `workers: 1` in `playwright.config.ts`.**
- **Test Visual Delays:** Every Playwright test explicitly ends with a `waitForTimeout(2000)`. Do not remove this; it is required for visual debugging of the final application state.
- **Deployment Limitations:** Because the backend uses a local `.db` file, **do not deploy this to Vercel or any serverless provider.** Serverless cold-starts will instantly wipe the SQLite file. If cloud deployment is requested, you must first migrate the DB layer to PostgreSQL or MongoDB Atlas.
