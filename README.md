# DevPath

A beginner-friendly learning + career hub. Every explanation is written in plain language, following **ISO 24495-1:2023** (plain language) — analogies before jargon, every term translated in the same breath, no assumed prior knowledge.

DevPath answers three questions:

| Area | Question it answers | Route |
| --- | --- | --- |
| **Paths** | "What should I learn?" — 14 ordered learning tracks, each a dedicated roadmap page | `/` · `/paths/[slug]` |
| **Grow** | "Where can my career go?" — a ladder from Student to Senior, branching into building vs. leading, 16 role-specific growth trees, and a plain-words job-title guide | `/grow` |
| **Learn** | The lessons — 194 lessons across 10 pillars, with a searchable, collapsible overview and a live, runnable code editor on every lesson page | `/learn` · `/learn/[id]` |

## Paths — what should I learn?

14 ordered roadmaps, each answering "learn this, then this" for a specific goal:

Not sure yet? Start here, Frontend, Backend, Full-stack, AI Engineer, DevOps Engineer, Mobile Developer, Data Analyst, Data Scientist / ML, Cybersecurity, Cloud Engineer, QA / Test Automation, Game Developer, and UI/UX Designer-to-Developer.

The home page (`/`) shows every path as a clickable card; each one opens a dedicated roadmap page at `/paths/[slug]` with the full, ordered list of steps and plain-English descriptions.

## Grow — where can my career go?

`/grow` has three parts:

1. **The shared ladder** — everyone climbs the same rungs first: Student/Self-learner → Intern/Trainee → Junior → Mid-level → Senior. Tap a rung to mark "you are here."
2. **The branch point** — after Senior, the ladder splits into an **IC track** (Staff → Principal → Distinguished Engineer — keep building) and a **Manager track** (Engineering Manager → Director → VP/CTO — lead people).
3. **16 role-specific growth trees** — Frontend, Backend, Full-stack, Mobile, DevOps/SRE, Data (Analyst → Scientist → ML Engineer), AI/ML Engineer, QA/SDET, Cybersecurity, Cloud Engineer, Game Developer, Data Engineer, MLOps Engineer, Engineering Manager, Developer Advocate/DevRel, and Technical Writer — each with its own entry-to-senior/lead/architect levels. Cards link straight to the matching learning path.
4. **Confusing titles, in plain words** — a short, honest Q&A on things like Developer vs. Engineer, IC vs. Manager, DevOps vs. SRE, and whether you need a CS degree.

## Learn — the hard stuff, made simple

**194 lessons across 10 pillars:**

- Programming Basics
- Data Structures
- Algorithms
- Databases
- Web & Internet
- Design Patterns
- System Design
- Cloud
- Data Science
- Generative AI

`/learn` is a searchable, collapsible accordion: one section per pillar (with an icon, a one-line blurb, and a lesson count), search across all lessons at once, and "Expand all / Collapse all." Each lesson opens at `/learn/[id]` as a two-column page:

- **Left** — the teaching, in the same shape every time: the idea in plain English (analogy first), how it works step by step, when you'd actually use it, complexity explained in words (not just `O(n²)`), and common beginner mistakes.
- **Right** — a **live, runnable code editor**: edit the code and hit **Run**. JavaScript executes right in your browser inside a Web Worker (so an infinite loop can't freeze the page), while Python shows its verified expected output. The editor has Prism syntax highlighting and line numbers, and a "Reset" button to get back to the original snippet.

## Verified outputs

Every code sample is **actually executed and checked** against its expected `output`, in **both** JavaScript and Python — 388 checks in total, across all 194 lessons:

```bash
npm run verify
```

You can also verify a single pillar file in isolation (handy when you're only adding to one topic):

```bash
node scripts/verify-output.mjs content/lessons/algorithms.ts
```

This is the guarantee behind every "Expected output" block: if a lesson's code and its stated output ever drift apart, `npm run verify` fails.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **prismjs** + **react-simple-code-editor** for the in-browser code editor
- Deployable to **Vercel** — push to a Git repo and import it; Next.js is detected automatically. Set `NEXT_PUBLIC_SITE_URL` if you're on a custom domain, so link previews (Open Graph/Twitter cards) point at the right URL.

## Design system — "wayfinder"

Learning as a journey with waypoints. The signature element is the self-drawing roadmap / growth ladder.

- **Palette:** ink `#191C33`, muted `#727793`, line `#E6E8F2`, paper `#F6F7FB`, card `#FFFFFF`, primary violet `#5B4BEB`, output green `#12B886`, "you are here" coral `#FF8A3D`. Career track accents: teal for IC, coral for Manager.
- **Type:** display = Space Grotesk · body = Inter · code = JetBrains Mono.
- **Atmosphere:** a fixed, brand-tinted radial-gradient wash behind every page, so surfaces never feel flat grey.
- **Motion:** tasteful entrance animations (fade-up, stagger, scale), a hover lift on cards, and a gentle accordion-panel open — all tuned, calm, never gratuitous.
- **Quality floor:** responsive down to mobile, visible keyboard focus (`:focus-visible`), `prefers-reduced-motion` fully respected (all animation/transition durations collapse to ~0), semantic HTML, accessible contrast, and verified code outputs.

## Getting started

Requires **Node.js 20.9+** (Next.js 16) and **Python 3** (for `npm run verify`).

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run lint     # ESLint
npm run verify   # run every code sample (JS + Python) & check its expected output
```

## Project structure

```
dev-path/
  app/
    layout.tsx              # fonts, metadata, Nav + Footer
    page.tsx                # Home + Paths grid
    grow/page.tsx            # Career ladder + role trees + title guide
    learn/page.tsx            # Searchable, collapsible pillar overview
    learn/[id]/page.tsx        # One lesson: explanation + live editor
    paths/[slug]/page.tsx      # One path's full roadmap
  components/
    CodeRunner.tsx           # The live editor: highlighting, run, verify
    LessonBrowser.tsx         # Search + accordion for /learn
    LessonView.tsx           # Lesson page layout
    PillarIcon.tsx           # One SVG icon per pillar
    Reveal.tsx               # Scroll-in entrance animation wrapper
    GrowthTree.tsx           # The shared ladder + IC/Manager branch
    RoleTree.tsx             # The 16 role-specific growth trees
    PathsExplorer.tsx, PathCard.tsx, Roadmap.tsx, TitleGuide.tsx, Nav.tsx, Footer.tsx
  content/
    lessons/
      types.ts               # Lesson & Pillar types, pillar order, pillar blurbs
      index.ts                # Combines all pillar files into one lessons[] list
      programming-basics.ts, data-structures.ts, algorithms.ts,
      databases.ts, web-internet.ts, design-patterns.ts,
      system-design.ts, cloud.ts, data-science.ts, genai.ts
    paths.ts                 # The 14 learning tracks
    career.ts                # Ladder, branches, role trees, title guide
  scripts/
    verify-output.mjs        # Runs every sample & checks its expected output
  app/globals.css            # Design tokens (the "wayfinder" system)
```

All content lives in typed files under `content/`, split per pillar so contributors can work on separate topics without touching a single giant file — adding a lesson, a track, or a career rung is a data edit, not a UI rewrite.

## Adding content

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full schemas and the content standard (the "teacher voice"). In short: add an entry to the right file under `content/`, then run `npm run verify` if you added code.
