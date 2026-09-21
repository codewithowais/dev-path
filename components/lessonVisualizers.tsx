import type { ComponentType } from "react";
import { SortVisualizer } from "./SortVisualizer";
import { SearchVisualizer } from "./SearchVisualizer";
import { GraphVisualizer } from "./GraphVisualizer";
// Array-scan algorithms
import { TwoPointers } from "./visualizers/TwoPointers";
import { SlidingWindow } from "./visualizers/SlidingWindow";
import { PrefixSums } from "./visualizers/PrefixSums";
import { Kadane } from "./visualizers/Kadane";
import { DutchFlag } from "./visualizers/DutchFlag";
// Dynamic-programming tables
import { DPGrid } from "./visualizers/DPGrid";
import { LCSGrid } from "./visualizers/LCSGrid";
import { CoinChangeGrid } from "./visualizers/CoinChangeGrid";
// Weighted / ordered graph
import { Dijkstra } from "./visualizers/Dijkstra";
import { TopoSort } from "./visualizers/TopoSort";
// Linear data structures
import { StackViz } from "./visualizers/StackViz";
import { QueueViz } from "./visualizers/QueueViz";
import { DequeViz } from "./visualizers/DequeViz";
// Linked data structures
import { LinkedListViz } from "./visualizers/LinkedListViz";
import { DoublyLinkedListViz } from "./visualizers/DoublyLinkedListViz";

/** Every lesson visualizer takes exactly these props. The pillar accent colour
 *  and the lesson's Big-O string come from LessonView. */
export type VizProps = { accent: string; complexity?: string };

/** Registry: lesson id → its "see it in motion" component. Adding a visualizer
 *  means dropping a self-contained component in components/visualizers/ and
 *  registering one line here — nothing else in the app changes. */
export const lessonVisualizers: Record<string, ComponentType<VizProps>> = {
  // Sorting — one component, selected by algorithm.
  "bubble-sort": (p) => <SortVisualizer algo="bubble-sort" {...p} />,
  "selection-sort": (p) => <SortVisualizer algo="selection-sort" {...p} />,
  "insertion-sort": (p) => <SortVisualizer algo="insertion-sort" {...p} />,
  "merge-sort": (p) => <SortVisualizer algo="merge-sort" {...p} />,
  "quick-sort": (p) => <SortVisualizer algo="quick-sort" {...p} />,
  "heap-sort": (p) => <SortVisualizer algo="heap-sort" {...p} />,

  // Searching.
  "linear-search": (p) => <SearchVisualizer algo="linear-search" {...p} />,
  "binary-search": (p) => <SearchVisualizer algo="binary-search" {...p} />,
  "jump-search": (p) => <SearchVisualizer algo="jump-search" {...p} />,

  // Graph traversal.
  bfs: (p) => <GraphVisualizer algo="bfs" {...p} />,
  dfs: (p) => <GraphVisualizer algo="dfs" {...p} />,

  // Array-scan algorithms.
  "two-pointers": TwoPointers,
  "sliding-window": SlidingWindow,
  "prefix-sums": PrefixSums,
  "kadanes-algorithm": Kadane,
  "dutch-national-flag": DutchFlag,

  // Dynamic-programming tables.
  "dynamic-programming": DPGrid,
  "longest-common-subsequence": LCSGrid,
  "coin-change-min-coins": CoinChangeGrid,

  // Weighted / ordered graph.
  "dijkstras-algorithm": Dijkstra,
  "topological-sort": TopoSort,

  // Linear data structures.
  stack: StackViz,
  queue: QueueViz,
  deque: DequeViz,

  // Linked data structures.
  "linked-list": LinkedListViz,
  "doubly-linked-list": DoublyLinkedListViz,
};
