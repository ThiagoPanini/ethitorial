---
target: home section
total_score: 29
p0_count: 0
p1_count: 2
timestamp: 2026-06-07T01-48-36Z
slug: apps-web-app-components-home-landing-tsx
---
# Critique — Home landing (`/`)

Target: `apps/web/app/_components/home-landing.tsx` (route `/`, rendered via `app/page.tsx`).
Register: brand (the one design-IS-the-product surface in a product-register project).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Status badge ("Fase 1 · read-only") + live pulse dot are honest; little async on a landing. |
| 2 | Match System / Real World | 3 | Natural pt-BR; the Greek-thinker = knowledge metaphor is a familiar trope. |
| 3 | User Control and Freedom | 3 | ⌘K palette, Esc, single CTA, repo link; no traps. |
| 4 | Consistency and Standards | 4 | Brand mark, wordmark, button + token system identical to the app shell. |
| 5 | Error Prevention | 3 | CTA can route into an empty/WIP section (mild dead-end risk). |
| 6 | Recognition Rather Than Recall | 2 | ⌘K is the only search and it is invisible on the landing; first-timers can't discover it. |
| 7 | Flexibility and Efficiency | 3 | ⌘K command palette is a real accelerator. |
| 8 | Aesthetic and Minimalist Design | 3 | Committed, uncluttered composition; the abstract headline keeps it from a 4. |
| 9 | Error Recovery | 3 | 404/WIP views exist elsewhere; n/a on the landing itself. |
| 10 | Help and Documentation | 2 | Only the badge + tagline + GitHub link explain what this is; thin for a first-timer. |
| **Total** | | **29/40** | **Good** (28–35) |

## Anti-Patterns Verdict

**Does this look AI-generated? No.** The dark canvas + drifting violet aurora + grayscaled-and-violet-tinted classical figure, in an asymmetric left-aligned hero, is a committed, non-templated composition with a point of view. It actively avoids the four PRODUCT.md anti-references: no SaaS-cream, no hero-metric template, no identical card grid, no Notion-gray flatness.

**LLM assessment.** Three things flirt with the slop line, none fatal:
- **Gradient text** on the hero word "compartilhado." (`.grad`) and the wordmark. This is normally an absolute ban, but it is the committed brand signature used in exactly the two sanctioned spots from DESIGN.md (wordmark + hero). Identity-preservation holds; it stays on the right side of the line *because it's used once*.
- **The classical-statue-as-knowledge metaphor** is a recognizable trope ("philosophy = Greek bust"). The heavy desaturation + violet color-blend + fade-to-bg rescue it from stock-cliché, but it's the least distinctive choice on the page.
- **The headline copy is generic** (see P1 below): an abstract noun phrase doing the work that a specific claim should.

**Deterministic scan.** `detect.mjs` on `home-landing.tsx` + `page.tsx`: **0 findings, exit 0 (clean).** Caveat: this is a class-based system where the visual rhetoric lives in `globals.css`; a markup-only scan can't see the gradient-text or backdrop-filter rules, so the clean result is necessary, not sufficient. My manual CSS review above covers that gap.

**Visual overlays.** None. No browser automation in this session and no dev server running, so no user-visible overlay was injected. Fallback: source + CSS review.

## Overall Impression

The first impression is genuinely strong: this looks like a person's considered hub, not a template. The biggest opportunity is the inverse of its strength: the page is *all atmosphere and no substance*. It tells the visitor a feeling ("Conhecimento compartilhado.") but shows them nothing of what's actually inside, which directly contradicts the project's own "Mostre, não conte" principle. Sharpen the words and give one glimpse of real content and this jumps a band.

## What's Working

1. **Committed art direction.** The aurora + tinted figure + asymmetric hero is a real visual identity, reused coherently from the app shell. This is the hardest thing to get right and it's right.
2. **Honest, restrained chrome.** One primary CTA, a status badge that sets expectations ("Fase 1 · read-only"), an open-source signal in both nav and footer. No fake metrics, no clutter.
3. **Power-user affordance on a landing.** ⌘K works from the home, matching the codewiki DNA. (Its invisibility is the problem, not its existence.)

## Priority Issues

- **[P1] Generic hero copy.** "Conhecimento compartilhado." is an abstract noun + adjective with no verb and no specificity; the tagline ("percepções e tutoriais criados para uso da comunidade") is flat and slightly corporate ("para uso da comunidade"). The gradient is carrying emphasis the words haven't earned.
  - **Why it matters:** the headline is the single highest-leverage element on a brand surface, and right now it could sit on any learning site. PRODUCT.md's voice asks for "substantivo concreto e verbo que descreve o que a coisa faz."
  - **Fix:** say what's specific and concrete — the formats and the person. Something closer to "Notas, código e o raciocínio por trás. Em público." or naming the actual artifact types (cursos, livros, certs, slides). Let the words, not the gradient, carry the weight.
  - **Suggested command:** `$impeccable clarify`

- **[P1] The landing shows nothing of what's inside.** No section preview, no recent Post, no proof. A "vitrine curada" whose front door displays zero artifacts undercuts its own promise and gives a visiting engineer no way to judge quality before clicking.
  - **Why it matters:** violates "Mostre, não conte"; the emotional peak (the hero) is followed by a content void.
  - **Fix:** add one quiet glimpse — a row of the five section tiles, or the 2–3 most recent Posts — below or beside the hero. Even in Fase 1, section tiles communicate scope.
  - **Suggested command:** `$impeccable shape` (a "recent content / sections" fold)

- **[P2] ⌘K is the only search and it's invisible here.** The home nav has a brand block and a repo button, but no visible search/explore affordance; the palette is keyboard-only. First-timers (and mobile users, who have no ⌘K) can't discover it.
  - **Why it matters:** Recognition-over-recall failure; the best navigation tool is hidden.
  - **Fix:** add a visible "Buscar" / explore trigger in the home nav (the app shell already has `.search-trigger`), or surface a second textual link beside the CTA.
  - **Suggested command:** `$impeccable layout`

- **[P2] Contrast on the byline and footer fails the page's own claim.** `.home-byline` ("by Thiago Panini", 10.5px) and `.home-foot` use `--text-faint` (#5b6069, ≈3.2:1 on #08090a), below WCAG AA — and the footer literally reads "WCAG AA."
  - **Why it matters:** an a11y promise contradicted in the same line that makes it; Sam (screen-magnifier / low-vision) loses the byline.
  - **Fix:** bump these to `--text-muted` (#8a8f98, ≈6:1) or raise `--text-faint` toward it for text use.
  - **Suggested command:** `$impeccable audit`

- **[P2] The single CTA can dead-end.** "Explorar Conteúdos" routes to `/courses`, which currently renders the WIP template if empty. Clicking the one call-to-action into an empty page is a peak-end letdown.
  - **Why it matters:** the only conversion path may land on "estou construindo isto."
  - **Fix:** point the CTA at the most populated section (or a content index), or make the WIP destination itself show something real.
  - **Suggested command:** `$impeccable harden`

## Persona Red Flags

**Jordan (First-Timer).** Lands on "Conhecimento compartilhado." and can't tell within 5 seconds what's inside (blog? courses? both?). No visible search; the only button, "Explorar Conteúdos," may open an empty section. Leaves unsure what the site actually offers.

**Visiting Engineer (project persona, from PRODUCT.md audience).** Arrives wanting substance fast to gauge whether the writing is worth their time. The home shows zero artifacts, so there's nothing to judge; "Mostre, não conte" is violated on the very surface meant to prove the brand. Will click through on faith or bounce.

**Casey (Distracted Mobile).** Figure opacity correctly drops on mobile and the CTA (42px) is thumb-friendly, but ⌘K is unavailable on touch with no visible alternative, and the faint byline/footer text is hard to read one-handed in daylight. The repo button label can truncate.

## Minor Observations

- Hard-coded `<br>` in the h1 is fine for two short words, but verify "Conhecimento" doesn't crowd at the 42px clamp floor on ~320px screens.
- `.home-badge` uses `backdrop-filter: blur(8px)` over the figure/aurora — functional here (legibility over a busy area), not decorative glass; keep it that way.
- Entrance motion is figure-only (`fig-rise` translateX); the copy doesn't move. Restrained is on-brand, but a quiet copy reveal could lift the peak (optional).
- `--text-muted` tagline sits over the brightening figure on small screens; spot-check that it holds 4.5:1 where the figure is lightest.

## Questions to Consider

- What would the headline say if the gradient were removed entirely? If it gets weaker, the words were leaning on decoration.
- What's the smallest amount of *real* content that could appear on this page to prove the hub is worth exploring?
- If a visitor never presses ⌘K, does the landing still give them a way in besides one button?
