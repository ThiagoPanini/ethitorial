import { join } from "node:path";
import { type Catalog, loadCatalog } from "./catalog";

export type { Catalog } from "./catalog";
export type { Post, Section, SectionKind, Source, Tag } from "./domain";

// `content/` vive na raiz do monorepo. O Next roda (dev/build) com cwd em
// `apps/web`, então subimos dois níveis. Override via env para outros contextos.
const contentDir = process.env.EPISTEMIX_CONTENT_DIR ?? join(process.cwd(), "..", "..", "content");

let cached: Catalog | undefined;

// O catálogo é derivado de arquivos read-only (ADR-0018); ler uma vez por
// processo basta. A validação (tags, slugs reservados) roda aqui e quebra a
// build se o conteúdo for inválido.
export function getCatalog(): Catalog {
  if (!cached) cached = loadCatalog(contentDir);
  return cached;
}
