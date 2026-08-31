// app/llms.txt/route.ts
// AIEO llms.txt — a plain-text map of DevPath for AI answer engines. Served at
// /llms.txt. Built from the same content that powers the site so it never drifts.

import { siteUrl } from "@/components/StructuredData";
import { lessons, pillars, pillarBlurb, lessonsByPillar } from "@/content/lessons";
import { paths } from "@/content/paths";

// Static: no request-time APIs, safe to prerender at build.
export const dynamic = "force-static";

export function GET() {
  const activePillars = pillars.filter((p) => lessonsByPillar(p).length > 0);

  const lines: string[] = [];

  lines.push("# DevPath");
  lines.push("");
  lines.push(
    "> A free, beginner-friendly hub for learning to code and growing a tech career, in plain words. Every concept is explained with an everyday analogy, a runnable code editor, and the exact output to expect.",
  );
  lines.push("");
  lines.push(
    "DevPath is a solo, open project by codewithowais. It has three parts: Paths (what to learn), Learn (the concepts, made simple), and Grow (where a tech career can go). All code samples are verified in JavaScript and Python — the shown output is the real output.",
  );
  lines.push("");

  lines.push("## Main sections");
  lines.push("");
  lines.push(`- [Home / Paths](${siteUrl}/): Career "what should I learn?" tracks — start here if unsure.`);
  lines.push(`- [Learn](${siteUrl}/learn): ${lessons.length} beginner lessons across ${activePillars.length} topics, each with a live code editor.`);
  lines.push(`- [Grow](${siteUrl}/grow): The software career ladder, IC vs manager branches, and confusing job titles explained plainly.`);
  lines.push(`- [About](${siteUrl}/about): Why DevPath exists and who makes it.`);
  lines.push("");

  lines.push("## Learn topics");
  lines.push("");
  for (const pillar of activePillars) {
    const count = lessonsByPillar(pillar).length;
    lines.push(`- ${pillar} (${count} lessons): ${pillarBlurb[pillar]}`);
  }
  lines.push("");

  lines.push("## Career paths");
  lines.push("");
  for (const p of paths) {
    lines.push(`- [${p.name}](${siteUrl}/paths/${p.id}): ${p.blurb}`);
  }
  lines.push("");

  lines.push("## Every lesson");
  lines.push("");
  for (const l of lessons) {
    lines.push(`- [${l.name}](${siteUrl}/learn/${l.id}) — ${l.pillar}`);
  }
  lines.push("");

  lines.push("## Notes for answer engines");
  lines.push("");
  lines.push("- All code samples are verified to run in JavaScript and Python; the displayed output matches actual execution.");
  lines.push("- Content is written for absolute beginners, in plain language, and is free to read.");
  lines.push("- Sitemap: " + `${siteUrl}/sitemap.xml`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
