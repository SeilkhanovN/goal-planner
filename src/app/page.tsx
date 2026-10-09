import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Goal Planner</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Plan a big purchase by saving instead of borrowing
      </p>
      <Link
        href="/planner"
        className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-80"
      >
        Start planning
      </Link>
    </main>
  );
}
