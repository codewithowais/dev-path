// scripts/verify-output.mjs
//
// Runs every code sample in content/lessons.ts and checks its real program
// output against the lesson's `output` field — for BOTH languages.
//
//   node scripts/verify-output.mjs
//
// Exits non-zero if any sample fails to run or its output doesn't match.
// Node 23+ can import .ts directly via type stripping.

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Optional arg: a single lesson module to verify in isolation, e.g.
//   node scripts/verify-output.mjs content/lessons/algorithms.ts
// With no arg, verify the whole combined set. Verifying one file in isolation
// lets parallel contributors check their own pillar without importing (and
// tripping over) files someone else is mid-edit on.
// The pillar files, loaded directly. We avoid importing index.ts here because
// Node's native TS runner needs explicit extensions on real (value) imports;
// each pillar file only imports its types (erased at runtime), so it loads
// cleanly on its own.
const PILLAR_FILES = [
  "../content/lessons/data-structures.ts",
  "../content/lessons/algorithms.ts",
  "../content/lessons/design-patterns.ts",
  "../content/lessons/system-design.ts",
  "../content/lessons/cloud.ts",
  "../content/lessons/data-science.ts",
  "../content/lessons/genai.ts",
];

async function loadLessons(path) {
  const mod = await import(path);
  const arr = mod.default ?? mod.lessons;
  if (!Array.isArray(arr)) {
    throw new Error(`${path} has no default-exported Lesson[] or 'lessons' export.`);
  }
  return arr;
}

const targetArg = process.argv[2];
let lessons;
if (targetArg) {
  lessons = await loadLessons(resolve(process.cwd(), targetArg));
} else {
  const groups = await Promise.all(
    PILLAR_FILES.map((rel) => loadLessons(resolve(__dirname, rel)))
  );
  lessons = groups.flat();
}

// How to run each language: file extension + command.
const RUNNERS = {
  JavaScript: { ext: "mjs", cmd: (file) => ["node", [file]] },
  Python: { ext: "py", cmd: (file) => [pythonCmd(), [file]] },
};

function pythonCmd() {
  for (const c of ["python3", "python"]) {
    const probe = spawnSync(c, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) return c;
  }
  throw new Error("No python3/python found on PATH.");
}

const workDir = mkdtempSync(join(tmpdir(), "devpath-verify-"));

// Normalize: trim trailing whitespace on each line + trim surrounding blank lines.
function normalize(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/^\n+|\n+$/g, "");
}

let pass = 0;
let fail = 0;
const failures = [];

for (const lesson of lessons) {
  for (const [lang, source] of Object.entries(lesson.code)) {
    const runner = RUNNERS[lang];
    if (!runner) {
      console.log(`  ?  ${lesson.id} [${lang}] — no runner configured, skipped`);
      continue;
    }
    const file = join(workDir, `${lesson.id}.${runner.ext}`);
    writeFileSync(file, source);
    const [cmd, argv] = runner.cmd(file);
    const run = spawnSync(cmd, argv, { encoding: "utf8" });

    if (run.status !== 0) {
      fail++;
      failures.push(
        `${lesson.id} [${lang}] — program errored:\n${run.stderr || run.stdout}`
      );
      console.log(`  ✗  ${lesson.id} [${lang}] — runtime error`);
      continue;
    }

    const got = normalize(run.stdout);
    const want = normalize(lesson.output);
    if (got === want) {
      pass++;
      console.log(`  ✓  ${lesson.id} [${lang}]`);
    } else {
      fail++;
      failures.push(
        `${lesson.id} [${lang}] — output mismatch\n--- expected ---\n${want}\n--- got ---\n${got}`
      );
      console.log(`  ✗  ${lesson.id} [${lang}] — output mismatch`);
    }
  }
}

rmSync(workDir, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed.`);
if (failures.length) {
  console.log("\n──────── FAILURES ────────\n");
  console.log(failures.join("\n\n"));
  process.exit(1);
}
