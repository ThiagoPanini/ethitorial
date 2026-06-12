import Link from "next/link";
import type { TimelineEvent, TimelineEventType } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

const TYPE_LABEL: Record<TimelineEventType, string> = {
  publication: "publicação",
  note: "nota",
  lecture: "palestra",
  start: "início",
  conquest: "conquista",
};

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  const years = groupByYear(events);

  return (
    <div className="content-inner timeline-page">
      <div className="page-head">
        <span className="page-eyebrow">Cronologia · catálogo derivado</span>
        <h1 className="page-title">Cronologia</h1>
        <p className="page-desc">
          Publicações, notas de estudo, inícios e conquistas, todos derivados do catálogo MDX.
        </p>
      </div>

      {years.length > 0 ? (
        <div className="timeline-stack">
          {years.map(([year, yearEvents]) => (
            <section className="tl-year-group" key={year}>
              <h2 className="tl-year">{year}</h2>
              <div className="tl-lines">
                {yearEvents.map((event) => (
                  <Link className="tl-row" href={event.href} key={event.id}>
                    <time className="tl-date" dateTime={event.date}>
                      {formatDate(event.date)}
                    </time>
                    <span className={`tl-type${event.hot ? " hot" : ""}`}>
                      {TYPE_LABEL[event.type]}
                    </span>
                    <span className="tl-main">
                      <span className="tl-t">{event.label}</span>
                      <span className="tl-detail">{event.detail}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nada na cronologia ainda</h2>
          <p>Quando o catálogo tiver publicações ou estudos datados, eles aparecem aqui.</p>
        </div>
      )}
    </div>
  );
}

function groupByYear(events: TimelineEvent[]): Array<[string, TimelineEvent[]]> {
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const group = groups.get(event.year);
    if (group) {
      group.push(event);
    } else {
      groups.set(event.year, [event]);
    }
  }

  return Array.from(groups.entries());
}
