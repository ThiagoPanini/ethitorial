import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { mdxComponents } from "@/lib/mdx-components";
import { getReadTime, getSiteModel } from "@/lib/site/model";
import { slugify } from "@/lib/slug";
import { AppShell } from "../../../_components/app-shell";

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
  params: Promise<{ post: string; section: string; source: string }>;
}) {
  const { section: sectionSlug, source: sourceSlug, post: postSlug } = await params;
  const catalog = getCatalog();
  const model = getSiteModel();
  const section = model.sections.find((candidate) => candidate.slug === sectionSlug);
  const source = catalog.getSource(sectionSlug, sourceSlug);
  const post = catalog.getPost(sectionSlug, sourceSlug, postSlug);
  if (!section || !source || !post) notFound();

  const headings = extractHeadings(post.body);

  return (
    <AppShell>
      <div className="wrap">
        <div className="read-grid">
          <article>
            <header className="read-head">
              <span className="kicker mono">
                {section.title} · {source.name}
              </span>
              <h1>{post.title}</h1>
              {post.summary && <p className="standfirst">{post.summary}</p>}
              <div className="metaline">
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{getReadTime(post.body)} de leitura</span>
              </div>
              {post.tags.length > 0 && (
                <div className="tagrow" style={{ marginTop: "14px" }}>
                  {post.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="engage">
              <button type="button" className="up-btn">
                ▲ Upvote
              </button>
              <span className="eng-stat">0 leituras</span>
              <span className="eng-stat">0 comentários</span>
            </div>

            <div className="prose">
              <MDXRemote
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                source={post.body}
              />
            </div>
          </article>

          {headings.length > 0 && (
            <aside className="toc">
              <div className="toc-label">CONTEÚDO</div>
              {headings.map((h) => (
                <a key={h.id} href={`#${h.id}`}>
                  {h.text}
                </a>
              ))}
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function extractHeadings(body: string): { id: string; level: 2 | 3; text: string }[] {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  return [...withoutCode.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => {
    const text = match[2].trim();
    return {
      id: slugify(text),
      level: match[1].length as 2 | 3,
      text,
    };
  });
}
