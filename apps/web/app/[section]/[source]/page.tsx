import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { getReadTime, getSiteModel } from "@/lib/site/model";
import { AppShell } from "../../_components/app-shell";
import { SourcePageView } from "../../_components/surfaces";

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
  const model = getSiteModel();
  const section = model.sections.find((candidate) => candidate.slug === sectionSlug);
  const source = catalog.getSource(sectionSlug, sourceSlug);
  if (!section || !source) notFound();

  const posts = catalog.getPosts(sectionSlug, sourceSlug).map((post) => ({
    ...post,
    readTime: getReadTime(post.body),
    sourceName: source.name,
  }));
  const siteSource = {
    ...source,
    postCount: posts.length,
  };

  return (
    <AppShell
      activeSection={section.slug}
      crumbs={[
        { href: "/", label: "epistemix" },
        { href: `/${section.slug}`, label: section.title },
        { label: source.name },
      ]}
      model={model}
    >
      <SourcePageView posts={posts} source={siteSource} tags={model.tags} />
    </AppShell>
  );
}
