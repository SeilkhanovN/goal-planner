# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Goal Planner is a website that shows how much to save each month for a purchase goal (like a car) instead of taking a loan. The UI is English only for now.

Current state: a home page (`/`) with a "Start planning" link, a placeholder `/planner` page ("Coming soon"), and the savings engine in `src/lib/engine/`. The engine isn't connected to the UI yet.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also runs the TypeScript check)
npm run lint    # ESLint (flat config, eslint-config-next core-web-vitals + typescript)
npm test        # Vitest, single run (vitest run)
npx vitest run src/lib/engine/savings.test.ts   # one test file
npx vitest run -t "single month"                # tests whose name matches
```

Vitest runs with no config file. Test files sit next to their source as `*.test.ts`.

## Workflow

- Run `npm run check` before saying a task is done.
- Write tests for calculation logic.
- Use one branch per task.

## Engine (`src/lib/engine/`)

The financial math lives here as pure TypeScript, with no React or Next.js imports, so it can be unit-tested on its own.

- `savings.ts`: `monthlySavingNeeded` gives the deposit to make at the end of each month. Savings grow at a monthly rate compounded from the yearly return (`toMonthlyRate`), and the target is the price grown to the purchase date (`priceAtDate`).
- Rates are decimals (`0.11` means 11%). The functions never round; round only when showing numbers in the UI.
- Input checks: `months` must be a whole number from 1 to 360, and `price` and `savings` must not be negative, otherwise the function throws. Rates may be negative (for example, a price that falls). The result is never below 0.

## Next.js version caveat

This project uses Next.js 16.4 with React 19.3, which is newer than most training data (see `AGENTS.md`). Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/` covers the App Router) and follow any deprecation notices.

Notable settings in `next.config.ts`:

- `cacheComponents: true` and `partialPrefetching: true` are on, so check the docs for how these affect data fetching and dynamic rendering before adding them.
- Tailwind CSS v4 runs through the `@tailwindcss/turbopack` loader configured under `turbopack.rules`, not through PostCSS. There is no `postcss.config` or `tailwind.config`; the theme tokens live in `src/app/globals.css` (`@theme inline`, `--background`/`--foreground` with a dark-mode override).

## Structure

- App Router under `src/app/`. Each route is a folder with a `page.tsx`.
- The root `layout.tsx` loads the Geist fonts with `next/font` and sets the site metadata. It types its props with the global `LayoutProps<"/">` helper.
- The import alias `@/*` maps to `src/*`.
- There is no `public/` folder. The starter assets were removed; create the folder again if static files are needed.
