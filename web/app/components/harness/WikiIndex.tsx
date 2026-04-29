import Link from "next/link";
import { listWikiEntries } from "../../../lib/wiki";

export default function WikiIndex() {
  const entries = listWikiEntries();
  if (entries.length === 0) {
    return (
      <p className="text-stone-500 italic">
        아직 위키 항목이 없다. <code>/harness:wiki-add</code>로 첫 항목을 추가한다.
      </p>
    );
  }
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-3">
      {entries.map((e) => {
        const halfLifeMs = e.half_life_days * 24 * 60 * 60 * 1000;
        const ageMs = e.created
          ? Date.now() - new Date(e.created).getTime()
          : 0;
        const stale = ageMs > halfLifeMs;
        const tldr = (e.body.match(/##?\s*TL;DR\s*\n+([\s\S]*?)(?=\n##|\n\n#|\n---|\Z)/i)?.[1] ?? "")
          .trim()
          .replace(/\n+/g, " ")
          .slice(0, 220);
        return (
          <Link
            key={e.slug}
            href={`/harness/wiki/${e.slug}`}
            className="group flex flex-col gap-1.5 rounded-lg border border-stone-700/50 bg-stone-900/30 p-4 transition-all hover:border-amber-400/25 hover:bg-amber-400/[0.04]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] text-amber-400/70 uppercase tracking-wider truncate">
                {e.slug}
              </span>
              <span
                className={
                  "font-mono text-[11px] " +
                  (stale ? "text-orange-400" : "text-stone-500")
                }
              >
                {e.created || "—"}
                {stale ? " · stale" : ""}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-stone-100 leading-snug">
              {e.title}
            </h3>
            {tldr && (
              <p className="text-[12px] text-stone-400 leading-relaxed line-clamp-3">
                {tldr}
              </p>
            )}
            {e.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {e.keywords.slice(0, 6).map((k) => (
                  <span
                    key={k}
                    className="text-[11px] px-1.5 py-0.5 rounded border border-amber-400/15 bg-amber-400/[0.04] text-amber-200/80"
                  >
                    {k}
                  </span>
                ))}
                {e.keywords.length > 6 && (
                  <span className="text-[11px] text-stone-500 self-center">
                    +{e.keywords.length - 6}
                  </span>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
