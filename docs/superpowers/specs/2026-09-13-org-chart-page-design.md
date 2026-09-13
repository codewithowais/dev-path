# Org chart page — design

**Date:** 2026-09-13
**Status:** Approved (concept)

## Goal

Add a new page at `/org` (nav label **"Org"**) that shows how a **typical software
development organization** is structured — a generic, educational org chart, not a
real-people reporting hierarchy. It fits DevPath's teaching theme and needs no
private data. It reuses the role families already defined for `/grow` so the two
pages stay consistent.

## Scope

In scope: one new static page, one new presentational component, small additive
content, nav link, sitemap entry.

Out of scope: real employees/names, drag-drop editing, reporting-line data,
per-person nodes.

## Structure shown (2 tiers)

```
                 Engineering Leadership (CTO)
                            │
   ┌──────────┬──────────┬──┴───────┬──────────┬──────────┐
 Build the   Data & AI  Cloud &   Quality &   Lead &     Advise &
  Product              Infra      Security    Manage    Communicate
   │            │         │          │           │           │
 roles…       roles…    roles…     roles…      roles…      roles…
```

- **Tier 1 — Leadership node:** a single centered card ("Engineering Leadership /
  CTO") with a one-line description. New const `orgLeadership` in
  `content/career.ts`.
- **Tier 2 — Departments:** the 6 existing `roleCategories`, each a colored card
  showing the department name, a one-line blurb, and its **roles as chips**
  (from `roleTrees`, chip links to the role's learning path via `pathId`, else
  `/paths/foundations`). A count badge per department.

The leadership → departments connection is drawn with the site's existing
connector style (a centered vertical line + a "branch point" pill, mirroring the
pattern already in `components/GrowthTree.tsx`). Within a department, role chips
wrap; no per-role ladder here (that lives on `/grow`).

## Files

- `content/career.ts` — add `color: string` and `blurb: string` to `RoleCategory`
  and populate the 6 entries; add `orgLeadership = { title, sub }`. (Additive —
  `RoleTree.tsx` on `/grow` ignores the new fields, so `/grow` is unaffected.)
- `components/OrgChart.tsx` — new **server** component (no client state; chips are
  `Link`s). Renders leadership node + department grid. Reuses `dp-card`,
  `rounded-card`, accent `--accent` var + `accentFill`/`accentText`, and `Reveal`.
- `app/org/page.tsx` — new static page: `metadata` export (title/description/
  canonical/openGraph like `/grow`), container
  `mx-auto max-w-6xl px-5 xl:max-w-7xl`, hero (eyebrow "Org", h1, intro), then
  `<OrgChart />`, and a closing line linking to `/grow` for growth ladders.
- `components/Nav.tsx` — add `{ href: "/org", label: "Org", hint: "How a team is organized" }` to `LINKS`.
- `app/sitemap.ts` — add `/org` to `staticRoutes` (priority ~0.7, monthly).

## Department colors (on-brand palette)

Build the Product `#5B4BEB` · Data & AI `#7048E8` · Cloud & Infrastructure
`#4263EB` · Quality & Security `#12B886` · Lead & Manage `#FF8A3D` · Advise &
Communicate `#E64980`. All deepened via `accentFill`/`accentText` for AA contrast.

## Responsive & a11y

- Grid: 1 col (mobile) → `md:grid-cols-2` → `xl:grid-cols-3`. No horizontal
  overflow at 375px.
- Chips are real links (keyboard focusable); connectors are `aria-hidden`.
- Theme-aware via existing tokens (`bg-card`, `border-line`, `text-ink/muted`).

## Verification

- `tsc --noEmit` + `eslint` clean; `next build` succeeds and prerenders `/org`.
- Browser: `/org` renders leadership + 6 departments with all 28 roles as chips,
  chips link to paths, nav "Org" highlights as active, no overflow on mobile,
  `/grow` still works unchanged.
