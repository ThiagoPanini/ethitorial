import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { getAllStaticSectionSlugs, getSiteModel } from "@/lib/site/model";
import { AppShell } from "../_components/app-shell";
import { SectionGrid, WipTemplate } from "../_components/surfaces";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllStaticSectionSlugs().map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionSlug } = await params;
  const model = getSiteModel();
  const section = model.sections.find((candidate) => candidate.slug === sectionSlug);

  if (sectionSlug === "about") {
    return (
      <AppShell
        activeSection={null}
        crumbs={[{ href: "/", label: "epistemix" }, { label: "Sobre" }]}
        model={model}
      >
        <WipTemplate />
      </AppShell>
    );
  }

  if (!section) notFound();

  if (!section.ready) {
    return (
      <AppShell
        activeSection={section.slug}
        crumbs={[{ href: "/", label: "epistemix" }, { label: section.title }]}
        model={model}
      >
        <WipTemplate section={section} />
      </AppShell>
    );
  }

  const catalog = getCatalog();
  const sources = catalog.getSources(sectionSlug).map((source) => ({
    ...source,
    postCount: catalog.getPosts(sectionSlug, source.slug).length,
  }));

  return (
    <AppShell
      activeSection={section.slug}
      crumbs={[{ href: "/", label: "epistemix" }, { label: section.title }]}
      model={model}
    >
      <SectionGrid section={section} sources={sources} />
    </AppShell>
  );
}
