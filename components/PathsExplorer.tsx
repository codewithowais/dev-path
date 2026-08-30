"use client";

import { useState } from "react";
import { paths } from "@/content/paths";
import { PathCard } from "@/components/PathCard";
import { Roadmap } from "@/components/Roadmap";

export function PathsExplorer() {
  const [selectedId, setSelectedId] = useState(paths[0].id);
  const selected = paths.find((p) => p.id === selectedId) ?? paths[0];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path) => (
          <PathCard
            key={path.id}
            path={path}
            selected={path.id === selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      <section
        aria-live="polite"
        className="mt-8 rounded-card border border-line bg-card p-6 sm:p-8"
      >
        <Roadmap path={selected} />
      </section>
    </div>
  );
}
