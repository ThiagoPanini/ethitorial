import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

// Ver app/[section]/page.tsx: catálogo é estático; path fora do gerado = 404.
export const dynamicParams = false;

export function generateStaticParams() {
  const catalog = getCatalog();
  return catalog.getSections().flatMap((section) =>
    catalog.getSources(section.slug).map((source) => ({
      section: section.slug,
      source: source.slug,
    })),
  );
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ section: string; source: string }>;
}) {
  const { section: sectionSlug, source: sourceSlug } = await params;
  const catalog = getCatalog();
  const source = catalog.getSource(sectionSlug, sourceSlug);
  if (!source) notFound();

  const posts = catalog.getPosts(sectionSlug, sourceSlug);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`/${sectionSlug}`}
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
      >
        ← {catalog.getSection(sectionSlug)?.title}
      </Link>

      <header className="mt-6 mb-12 border-b border-neutral-800 pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-100">{source.name}</h1>
        <p className="mt-3 max-w-xl text-neutral-400">{source.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
          <span>{source.author}</span>
          <a
            href={source.externalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-cyan-400 transition-colors hover:text-cyan-300"
          >
            {source.externalUrl.replace(/^https?:\/\//, "")} ↗
          </a>
        </div>
      </header>

      {posts.length === 0 ? (
        <p className="text-neutral-500">Ainda sem posts publicados sobre este source.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/${sectionSlug}/${sourceSlug}/${post.slug}`} className="group block">
                <time className="text-xs text-neutral-500">{formatDate(post.date)}</time>
                <h2 className="mt-1 text-xl font-medium text-neutral-100 transition-colors group-hover:text-cyan-300">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
