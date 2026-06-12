import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { getAllStaticSectionSlugs, getSiteModel } from "@/lib/site/model";
import { AppShell } from "../_components/app-shell";
import { WipPage } from "../_components/wip-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllStaticSectionSlugs().map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionSlug } = await params;
  const model = getSiteModel();

  if (sectionSlug === "about") {
    return (
      <AppShell>
        <WipPage title="Sobre" description="Sobre o epistemix e seu autor." />
      </AppShell>
    );
  }

  const section = model.sections.find((candidate) => candidate.slug === sectionSlug);
  if (!section) notFound();

  if (!section.ready) {
    return (
      <AppShell>
        <WipPage title={section.title} description={section.description} />
      </AppShell>
    );
  }

  const catalog = getCatalog();
  const sources = catalog.getSources(sectionSlug);

  return (
    <AppShell>
      <div className="page wrap">
        <div className="page-head">
          <h1>{section.title}</h1>
          <p className="desc">{section.description}</p>
          <p
            className="meta mono"
            style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "12px" }}
          >
            {sources.length} {sources.length === 1 ? "fonte" : "fontes"}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
