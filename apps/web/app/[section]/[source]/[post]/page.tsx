import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { mdxComponents } from "@/lib/mdx-components";

// Ver app/[section]/page.tsx: draft (fora do generateStaticParams) vira 404,
// sem render on-demand — o que também evita depender de content/ em runtime.
export const dynamicParams = false;

export function generateStaticParams() {
  const catalog = getCatalog();
  return catalog.getSections().flatMap((section) =>
    catalog.getSources(section.slug).flatMap((source) =>
      catalog.getPosts(section.slug, source.slug).map((post) => ({
        section: section.slug,
        source: source.slug,
        post: post.slug,
      })),
    ),
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ section: string; source: string; post: string }>;
}) {
  const { section: sectionSlug, source: sourceSlug, post: postSlug } = await params;
  const catalog = getCatalog();

  // getPost só retorna posts `published` → draft cai aqui em 404 (invariante 6).
  const post = catalog.getPost(sectionSlug, sourceSlug, postSlug);
  if (!post) notFound();

  const source = catalog.getSource(sectionSlug, sourceSlug);
  const tagLabels = new Map(catalog.getTags().map((t) => [t.slug, t.label]));

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={`/${sectionSlug}/${sourceSlug}`}
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
      >
        ← {source?.name}
      </Link>

      <header className="mt-6 mb-10">
        <time className="text-sm text-neutral-500">{formatDate(post.date)}</time>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-100">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-400"
              >
                {tagLabels.get(tag) ?? tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      <article className="flex flex-col gap-5 leading-relaxed text-neutral-300">
        <MDXRemote source={post.body} components={mdxComponents} />
      </article>
    </main>
  );
}
