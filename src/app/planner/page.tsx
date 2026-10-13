import { Suspense } from "react";
import { en as text } from "@/content/en";
import { PlannerForm } from "./planner-form";

export default function Planner() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        {text.planner.title}
      </h1>
      <Suspense
        fallback={
          <p className="text-zinc-600 dark:text-zinc-400">
            {text.planner.loading}
          </p>
        }
      >
        <PlannerForm />
      </Suspense>
    </main>
  );
}
