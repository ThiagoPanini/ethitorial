import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";

// O catálogo é enumerado por inteiro em build-time (MDX-native, ADR-0018):
// qualquer path fora do gerado é 404, sem render on-demand (que dependeria de
// content/ em runtime). Cobre draft, slug reservado e rota inexistente.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog()
    .getSections()
    .map((s) => ({ section: s.slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionSlug } = await params;
  const catalog = getCatalog();
  const section = catalog.getSection(sectionSlug);
  if (!section) notFound();

  const sources = catalog.getSources(sectionSlug);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent">
          {section.title}
        </h1>
        <p className="mt-3 max-w-xl text-neutral-400">{section.description}</p>
      </header>

      <ul className="flex flex-col gap-4">
        {sources.map((source) => (
          <li key={source.slug}>
            <Link
              href={`/${section.slug}/${source.slug}`}
              className="group block rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700 hover:bg-neutral-900/70"
            >
              <h2 className="text-lg font-medium text-neutral-100 group-hover:text-white">
                {source.name}
              </h2>
              <p className="mt-1 text-sm text-neutral-400">{source.description}</p>
              <span className="mt-2 inline-block text-xs text-neutral-500">{source.author}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
