import type { Metadata } from "next";
import Link from "next/link";
import { en as text } from "@/content/en";

const page = text.howWeCalculate;

export const metadata: Metadata = {
  title: page.title,
};

function BackLink() {
  return (
    <Link href="/planner" className="font-medium underline underline-offset-4">
      {page.backToPlanner}
    </Link>
  );
}

export default function HowWeCalculate() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <BackLink />
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      {page.sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-zinc-600 dark:text-zinc-400">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <div className="flex flex-col gap-1 border-t border-zinc-300 pt-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        <p className="font-medium">{text.planner.disclaimer.notAdvice}</p>
        <p>{text.planner.disclaimer.illustrations}</p>
      </div>
      <BackLink />
    </main>
  );
}
