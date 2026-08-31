import { paths } from "@/content/paths";
import { PathCard } from "@/components/PathCard";
import { Reveal } from "@/components/Reveal";

/** Grid of learning-track cards. Each card links to its full roadmap page.
 *  Cards "rise" into place one after another as the grid scrolls into view. */
export function PathsExplorer() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paths.map((path, i) => (
        <Reveal
          key={path.id}
          variant="rise"
          delay={Math.min(i, 5) * 60}
          className="h-full"
        >
          <PathCard path={path} />
        </Reveal>
      ))}
    </div>
  );
}
