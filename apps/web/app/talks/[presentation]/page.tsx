import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { PresentationPageView } from "@/app/_components/presentation-page-view";
import { getCatalog } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog()
    .getPresentations()
    .map((presentation) => ({ presentation: presentation.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ presentation: string }> }) {
  const { presentation: slug } = await params;
  const presentation = getCatalog().getPresentation(slug);
  if (!presentation) return {};
  return { title: presentation.title, description: presentation.summary };
}

export default async function PresentationRoute({
  params,
}: {
  params: Promise<{ presentation: string }>;
}) {
  const { presentation: slug } = await params;
  const presentation = getCatalog().getPresentation(slug);
  if (!presentation) notFound();

  return (
    <AppShell>
      <PresentationPageView presentation={presentation} />
    </AppShell>
  );
}
