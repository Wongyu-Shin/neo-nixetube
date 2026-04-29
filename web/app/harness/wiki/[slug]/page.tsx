import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { listWikiSlugs, loadWikiEntry } from "../../../../lib/wiki";

export function generateStaticParams() {
  return listWikiSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = loadWikiEntry(slug);
  if (!entry) return { title: "Not found" };
  return { title: `${entry.title} — Harness Wiki` };
}

export default async function WikiEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = loadWikiEntry(slug);
  if (!entry) notFound();

  const halfLifeMs = entry.half_life_days * 24 * 60 * 60 * 1000;
  const ageMs = entry.created
    ? Date.now() - new Date(entry.created).getTime()
    : 0;
  const stale = ageMs > halfLifeMs;

  return (
    <article className="max-w-3xl mx-auto">
      <nav className="text-xs text-stone-500 mb-6">
        <Link href="/harness/wiki" className="hover:text-amber-300">
          ← /harness/wiki
        </Link>
      </nav>

      <header className="mb-8 pb-6 border-b border-white/[0.06]">
        <div className="text-xs font-mono uppercase tracking-wider text-amber-400/70 mb-2">
          {entry.slug}
        </div>
        <h1 className="text-3xl font-bold text-amber-300 mb-4">
          {entry.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-3">
          {entry.keywords.map((k) => (
            <span
              key={k}
              className="text-[12px] px-2 py-0.5 rounded-md border border-amber-400/20 bg-amber-400/[0.06] text-amber-200/90"
            >
              {k}
            </span>
          ))}
        </div>
        <div className="text-xs text-stone-500 flex gap-4">
          <span>created {entry.created || "—"}</span>
          <span className={stale ? "text-orange-400" : ""}>
            half-life {entry.half_life_days}d {stale ? "(stale — revalidate)" : ""}
          </span>
        </div>
      </header>

      <div className="prose-wiki text-stone-300 leading-relaxed">
        <MDXRemote
          source={entry.body}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>

      {entry.sources.length > 0 && (
        <footer className="mt-12 pt-6 border-t border-white/[0.06]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400/70 mb-2">
            Sources
          </h2>
          <ul className="text-sm text-stone-400 space-y-1 list-disc list-inside">
            {entry.sources.map((s) => (
              <li key={s}>
                {s.startsWith("http") ? (
                  <a
                    href={s}
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                  >
                    {s}
                  </a>
                ) : (
                  <code className="font-mono text-amber-200/90">{s}</code>
                )}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
