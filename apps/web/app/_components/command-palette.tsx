"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteModel, SitePost, SiteSection, SiteSource } from "@/lib/site/model";
import { Icon, type IconName } from "./primitives";

type CommandRoute = { kind: "path"; href: string } | { kind: "player" };

interface CommandItem {
  icon: IconName;
  kind: string;
  sub: string;
  title: string;
  route: CommandRoute;
}

interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export function CommandPalette({
  model,
  onClose,
  onOpenPlayer,
}: {
  model: SiteModel;
  onClose: () => void;
  onOpenPlayer: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const groups = useMemo(() => buildResults(model, query, activeTags), [activeTags, model, query]);
  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  function choose(item: CommandItem | undefined) {
    if (!item) return;
    onClose();
    if (item.route.kind === "player") {
      onOpenPlayer();
      return;
    }
    router.push(item.route.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flat.length > 0) setSelected((current) => Math.min(current + 1, flat.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flat.length > 0) setSelected((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      choose(flat[selected]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  function toggleTag(slug: string) {
    setActiveTags((tags) =>
      tags.includes(slug) ? tags.filter((tag) => tag !== slug) : [...tags, slug],
    );
    setSelected(0);
  }

  let runningIndex = -1;

  return (
    <div className="overlay">
      <button
        aria-label="Fechar busca"
        className="overlay-backdrop"
        onClick={onClose}
        type="button"
      />
      <div aria-label="Buscar" className="cmdk" onKeyDown={onKeyDown} role="dialog">
        <div className="cmdk-input-row">
          <Icon className="search-ic" name="search" size={17} />
          <input
            className="cmdk-input"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            placeholder="Buscar posts, sources, sections..."
            ref={inputRef}
            value={query}
          />
          <button className="cmdk-esc" onClick={onClose} type="button">
            esc
          </button>
        </div>

        <div className="cmdk-tags">
          <span className="tl">Tags:</span>
          {model.tags.map((tag) => (
            <button
              className={`tag-filter${activeTags.includes(tag.slug) ? " on" : ""}`}
              key={tag.slug}
              onClick={() => toggleTag(tag.slug)}
              type="button"
            >
              {tag.label}
            </button>
          ))}
        </div>

        <div className="cmdk-results" ref={listRef}>
          {flat.length === 0 ? (
            <div className="cmdk-empty">Nada encontrado{query ? ` para "${query}"` : ""}.</div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div className="cmdk-group-label">{group.label}</div>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  return (
                    <button
                      className={`cmdk-item${selected === index ? " sel" : ""}`}
                      key={`${item.kind}-${item.title}`}
                      onClick={() => choose(item)}
                      onMouseEnter={() => setSelected(index)}
                      type="button"
                    >
                      <span className="ci-ic">
                        <Icon name={item.icon} size={15} />
                      </span>
                      <span className="ci-main">
                        <span className="ci-title">{item.title}</span>
                        <span className="ci-sub">{item.sub}</span>
                      </span>
                      <span className="ci-kind">{item.kind}</span>
                      <span className="ci-enter">
                        <Icon name="enter" size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="cmdk-foot">
          <span className="fk">
            <kbd>up</kbd>
            <kbd>down</kbd> navegar
          </span>
          <span className="fk">
            <kbd>enter</kbd> abrir
          </span>
          <span className="fk">
            <kbd>esc</kbd> fechar
          </span>
          <span className="cmdk-count">
            {flat.length} resultado{flat.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}

function buildResults(model: SiteModel, query: string, activeTags: string[]): CommandGroup[] {
  const q = query.trim().toLowerCase();
  const tagOk = (tags: string[]) =>
    activeTags.length === 0 || activeTags.every((tag) => tags.includes(tag));
  const matches = (text: string) => q === "" || text.toLowerCase().includes(q);
  const sourceTags = getSourceTags(model.posts);

  const sources = model.sources.filter(
    (source) =>
      matches(`${source.name} ${source.author} ${source.description}`) &&
      tagOk(sourceTags.get(source.slug) ?? []),
  );

  const posts = model.posts.filter((post) => {
    const labels = post.tags
      .map((tag) => model.tags.find((known) => known.slug === tag)?.label ?? tag)
      .join(" ");
    return matches(`${post.title} ${post.summary} ${labels}`) && tagOk(post.tags);
  });

  const sections =
    activeTags.length > 0
      ? []
      : model.sections.filter((section) =>
          q === "" ? false : matches(`${section.title} ${section.description}`),
        );

  const deckMatch =
    activeTags.length === 0 &&
    q !== "" &&
    "apresentacao apresentação visao visão arquitetura epistemix slides deck presentation player".includes(
      q,
    );

  const groups: CommandGroup[] = [];
  if (sources.length > 0) {
    groups.push({
      label: "Sources · Courses",
      items: sources.map((source) => sourceItem(source)),
    });
  }
  if (posts.length > 0) {
    groups.push({
      label: "Posts · Courses",
      items: posts.map((post) => postItem(post, model)),
    });
  }
  if (sections.length > 0) {
    groups.push({
      label: "Ir para Section",
      items: sections.map((section) => sectionItem(section)),
    });
  }
  if (deckMatch) {
    groups.push({
      label: "Presentations",
      items: [
        {
          icon: "present",
          kind: "deck",
          route: { kind: "player" },
          sub: "Abrir player de slides · demo",
          title: "Visão & arquitetura",
        },
      ],
    });
  }

  return groups;
}

function sourceItem(source: SiteSource): CommandItem {
  return {
    icon: "courses",
    kind: "source",
    route: { kind: "path", href: `/${source.sectionSlug}/${source.slug}` },
    sub: source.author,
    title: source.name,
  };
}

function postItem(post: SitePost, model: SiteModel): CommandItem {
  return {
    icon: "doc",
    kind: "post",
    route: {
      kind: "path",
      href: `/${post.sectionSlug}/${post.sourceSlug}/${post.slug}`,
    },
    sub: `${post.sourceName} · ${post.tags
      .map((tag) => model.tags.find((known) => known.slug === tag)?.label ?? tag)
      .join(", ")}`,
    title: post.title,
  };
}

function sectionItem(section: SiteSection): CommandItem {
  return {
    icon: section.icon,
    kind: "section",
    route: { kind: "path", href: `/${section.slug}` },
    sub: section.ready ? section.description : "em breve",
    title: section.title,
  };
}

function getSourceTags(posts: SitePost[]) {
  const bySource = new Map<string, string[]>();
  for (const post of posts) {
    bySource.set(post.sourceSlug, [
      ...new Set([...(bySource.get(post.sourceSlug) ?? []), ...post.tags]),
    ]);
  }
  return bySource;
}
