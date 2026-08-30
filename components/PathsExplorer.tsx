import { paths } from "@/content/paths";
import { PathCard } from "@/components/PathCard";

/** Grid of learning-track cards. Each card links to its full roadmap page. */
export function PathsExplorer() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
