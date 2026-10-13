import Link from "next/link";
import { en as text } from "@/content/en";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
        {text.home.headline}
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        {text.home.intro}
      </p>
      <Link
        href="/planner"
        className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-80"
      >
        {text.home.start}
      </Link>
    </main>
  );
}
