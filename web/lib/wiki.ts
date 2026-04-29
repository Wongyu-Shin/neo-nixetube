import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Repo root from web/ — go up one
const REPO_ROOT = path.resolve(process.cwd(), "..");
const WIKI_DIR = path.join(REPO_ROOT, "harness", "wiki");

export interface WikiEntry {
  slug: string;
  title: string;
  keywords: string[];
  created: string;
  sources: string[];
  half_life_days: number;
  body: string;
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

export function listWikiSlugs(): string[] {
  if (!fs.existsSync(WIKI_DIR)) return [];
  return fs
    .readdirSync(WIKI_DIR)
    .filter((f) => f.endsWith(".md") && f !== "SCHEMA.md" && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

export function loadWikiEntry(slug: string): WikiEntry | null {
  const p = path.join(WIKI_DIR, `${slug}.md`);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug: String(data.slug ?? slug),
    title: String(data.title ?? slug),
    keywords: asArray(data.keywords),
    created: String(data.created ?? ""),
    sources: asArray(data.sources),
    half_life_days: Number(data.half_life_days ?? 90),
    body: content,
  };
}

export function listWikiEntries(): WikiEntry[] {
  return listWikiSlugs()
    .map(loadWikiEntry)
    .filter((e): e is WikiEntry => e !== null)
    .sort((a, b) => (a.created < b.created ? 1 : -1));
}
