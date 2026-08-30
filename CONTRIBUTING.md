# Contributing to DevPath

DevPath teaches, it doesn't just dump code. Everything here exists to make a total beginner feel *"oh, I actually get it now."* If a change moves toward that, it belongs.

All content lives in typed files under [`content/`](content/). You almost never need to touch a component to add content.

---

## The golden rule: the teacher voice

Write like a patient friend explaining something to a total beginner.

- **Analogy first.** Before any jargon, give a real-world picture (a stack is a pile of plates).
- **Translate every term in the same breath.** "IC = Individual Contributor." Never assume prior knowledge.
- **Short sentences. Concrete examples.** No fluff, no showing off.
- **Be honest.** If something is rarely used in real life (hi, bubble sort), say so.

---

## Adding a lesson

Add an entry to [`content/lessons.ts`](content/lessons.ts). Every lesson must have all six parts of the content standard:

1. **`easy`** — the idea in plain English, analogy first.
2. **`how`** — an array of numbered, simple steps.
3. **`when`** — when you'd actually reach for it.
4. **`big`** — complexity, *explained* (not just "O(n²)" — say why).
5. **`mistakes`** — common beginner traps.
6. **`code` + `output`** — runnable code and its **verified** output.

```ts
type Lesson = {
  id: string;                        // kebab-case, unique
  pillar: "Data Structures" | "Algorithms" | "Design Patterns";
  name: string;
  easy: string;                      // plain-English explanation + analogy
  how: string[];                     // numbered steps
  when: string;                      // when you'd use it
  big?: string;                      // e.g. "O(log n) time · O(1) space"
  mistakes?: string[];               // common beginner mistakes
  code: Partial<Record<Language, string>>;   // { JavaScript: "...", Python: "..." }
  output: string;                    // VERIFIED expected output
  note?: string;                     // optional language-specific quirk
};

type Language = "JavaScript" | "Python" | "Java" | "Cpp"; // extend freely
```

### Rules for code samples

- **At least JavaScript and Python.** Structure it so more languages slot in later.
- **Every sample must print something** and its output must **exactly match** the `output` field.
- **Keep output identical across languages.** Watch the classic gaps:
  - Booleans: JS prints `true`/`false`, Python prints `True`/`False`. Format them to strings instead (e.g. print `"yes"`/`"no"`).
  - Arrays: `console.log([1,2,3])` and `print([1,2,3])` differ. Join explicitly: `arr.join(" ")` and `" ".join(map(str, arr))`.
- **Verify before you commit:**

  ```bash
  npm run verify
  ```

  This runs every sample in both languages and checks the output. It must pass.

---

## Adding a path (learning track)

Add to [`content/paths.ts`](content/paths.ts). The **first step is treated as "start here"**, so order matters.

```ts
type Path = {
  id: string;
  name: string;
  tag: string;      // short chip text, e.g. "The engine behind the app"
  color: string;    // hex accent
  blurb: string;    // one plain-English line
  steps: [title: string, description: string][]; // ordered; [0] = start here
};
```

Each step's description is one plain-English line — what it is and why it matters, no jargon.

---

## Adding to the career trees

Edit [`content/career.ts`](content/career.ts):

- **`ladder`** — the shared rungs everyone climbs (bottom of the array = bottom of the ladder).
- **`branches`** — the IC and Manager tracks after Senior.
- **`titleGuide`** — the "confusing titles, in plain words" Q&A.

```ts
type Rung = { id: string; role: string; years: string; desc: string; color: string };
type Branch = { title: string; sub: string; color: string; roles: [string, string][] };
```

Keep career descriptions honest and short. "Years" are rough ranges, not promises.

---

## The quality floor (non-negotiable)

Any UI change must keep:

- Responsive down to mobile
- Visible keyboard focus (don't remove outlines)
- `prefers-reduced-motion` respected
- Semantic HTML (real headings, lists, buttons)
- Accessible color contrast
- No dead links
- Verified code outputs (`npm run verify` passes)

---

## Before opening a PR

```bash
npm run lint      # no lint errors
npm run build     # builds cleanly
npm run verify    # all sample outputs match
```

Thanks for helping beginners find their path. 🧭
