# DevPath

A beginner-friendly learning + career hub. Learn to code in plain words, in the language you like, with the **exact output** you should expect — plus career **paths** (what to learn) and career **growth trees** (where your job title can go next).

**194 lessons across 10 topics, every code sample actually run and output-verified in both JavaScript and Python.**

Built with Next.js (App Router) + TypeScript + Tailwind CSS v4. Deployable to Vercel. Calm "wayfinder" design with tasteful, reduced-motion-safe animations.

## The three product areas

| Area | Question it answers | Route |
| --- | --- | --- |
| **Paths** | "What should I learn?" — 14 ordered roadmaps (Foundations, Frontend, Backend, Full-stack, AI, DevOps, Mobile, Data Analyst, Data Scientist, Cybersecurity, Cloud, QA, Game Dev, UI/UX→Dev) | `/` · `/paths/[slug]` |
| **Grow** | "Where can my career go?" — a ladder from Student → Senior that branches into IC vs Manager, 16 role-specific growth trees, and confusing job titles in plain words | `/grow` |
| **Learn** | The lessons — **10 pillars**: Programming Basics, Data Structures, Algorithms, Databases, Web & Internet, Design Patterns, System Design, Cloud, Data Science, Generative AI | `/learn` |

Every path card and role card is clickable and opens the matching roadmap.

## The content standard (the "teacher voice")

Every lesson follows the same shape:

1. **The idea, in plain English** — a real-world analogy first.
2. **How it works, step by step** — numbered and simple.
3. **When you'd use it** — concrete situations.
4. **Complexity** — time & space, explained (not just "O(n²)").
5. **Common beginner mistakes.**
6. **Runnable code + verified expected output.**

Rule: if a term is introduced, it's translated in the same breath ("IC = Individual Contributor"). Never assume prior knowledge.

## Verified outputs

Every code sample is **actually run** and its output checked against the `output` field in the per-pillar files under [`content/lessons/`](content/lessons/) — for **both** JavaScript and Python (388 checks):

```bash
npm run verify
```

You can also verify a single pillar in isolation:

```bash
node scripts/verify-output.mjs content/lessons/algorithms.ts
```

This is the guarantee behind the green "Expected output" blocks: if the code and the stated output ever drift apart, `npm run verify` fails.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run lint     # ESLint
npm run verify   # run every code sample & check its expected output
```

Requirements: Node 18+ and Python 3 (for `npm run verify`).

## Project structure

```
dev-path/
  app/
    layout.tsx           # fonts, metadata, Nav + Footer
    page.tsx             # Home + Paths
    grow/page.tsx        # Career trees + titles guide
    learn/page.tsx       # Lessons
  components/
    Nav.tsx  Footer.tsx
    PathCard.tsx  Roadmap.tsx  PathsExplorer.tsx
    GrowthTree.tsx  TitleGuide.tsx
    LessonCard.tsx  CodeBlock.tsx  LangToggle.tsx
  content/
    paths.ts  career.ts  lessons.ts    # ALL content lives here (typed)
  scripts/
    verify-output.mjs                   # runs samples, checks expected output
  app/globals.css                       # design tokens (the "wayfinder" system)
```

All content lives in typed data files under `content/`, never hardcoded in components — so adding a lesson, a track, or a career rung is a data edit, not a UI rewrite.

## Design system — "wayfinder"

Learning as a journey with waypoints. The signature element is the self-drawing roadmap / growth ladder.

- **Palette:** ink `#191C33`, muted `#727793`, line `#E6E8F2`, paper `#F6F7FB`, card `#FFFFFF`, primary violet `#5B4BEB`, output green `#12B886`, "you are here" coral `#FF8A3D`. Track accents: teal (IC), coral (Manager).
- **Type:** display = Space Grotesk · body = Inter · code = JetBrains Mono.
- **Quality floor:** responsive to mobile · visible keyboard focus · `prefers-reduced-motion` respected · semantic HTML · accessible contrast · verified code outputs.

## Adding content

See [CONTRIBUTING.md](CONTRIBUTING.md) for the schemas and the content standard. In short: add an entry to the right file in `content/`, then run `npm run verify` if you added code.

## Deploy

Push to a Git repo and import it on [Vercel](https://vercel.com/new) — it detects Next.js automatically, no config needed.

## Roadmap (not v1)

Run-the-code button (sandboxed), saved progress, quizzes, search, more career tracks (DevOps, Data Engineer, Mobile), Java & C++ samples, role-specific growth trees.
