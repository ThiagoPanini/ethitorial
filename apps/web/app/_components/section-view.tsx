import Link from "next/link";
import type { Section, Source } from "@/lib/catalog";

interface SourceWithCount extends Source {
  postCount: number;
}

export function SectionWithSourcesView({
  section,
  sources,
}: {
  section: Section;
  sources: SourceWithCount[];
}) {
  return (
    <div className="page wrap">
      <div className="page-head">
        <span className="kicker">Rubrica</span>
        <h1>{section.title}</h1>
        <p className="desc">{section.description}</p>
        <div className="metaline meta">
          <span>
            {sources.length} {sources.length === 1 ? "fonte" : "fontes"}
          </span>
        </div>
      </div>

      {sources.map((source) => (
        <Link key={source.slug} href={`/${section.slug}/${source.slug}`} className="src-card">
          {source.studyStatus && (
            <span className="kicker">
              <span className="status-chip">
                {source.studyStatus === "ongoing" ? "em andamento" : "concluído"}
              </span>
            </span>
          )}
          <div className="src-name">{source.name}</div>
          <div className="src-by">
            por {source.author} · {source.postCount}{" "}
            {source.postCount === 1 ? "nota" : "notas"}
          </div>
          {source.description && <p className="src-desc">{source.description}</p>}
        </Link>
      ))}
    </div>
  );
}
