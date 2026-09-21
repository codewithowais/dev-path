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
// Array-transform algorithms
import { CountingSort } from "./visualizers/CountingSort";
import { MergeIntervals } from "./visualizers/MergeIntervals";
import { BoyerMoore } from "./visualizers/BoyerMoore";
import { Quickselect } from "./visualizers/Quickselect";
import { BinarySearchAnswer } from "./visualizers/BinarySearchAnswer";
// Number-theory & bit algorithms
import { RecursionTree } from "./visualizers/RecursionTree";
import { EuclidGcd } from "./visualizers/EuclidGcd";
import { Sieve } from "./visualizers/Sieve";
import { FastExponentiation } from "./visualizers/FastExponentiation";
import { BitManipulation } from "./visualizers/BitManipulation";
// Matrix / string / misc algorithms
import { SpiralMatrix } from "./visualizers/SpiralMatrix";
import { SubstringSearch } from "./visualizers/SubstringSearch";
import { FloydsCycle } from "./visualizers/FloydsCycle";
import { Backtracking } from "./visualizers/Backtracking";
import { GreedyCoinChange } from "./visualizers/GreedyCoinChange";
// Hashing data structures
import { HashMapViz } from "./visualizers/HashMapViz";
import { SetViz } from "./visualizers/SetViz";
import { FrequencyMapViz } from "./visualizers/FrequencyMapViz";
import { SortedSetViz } from "./visualizers/SortedSetViz";
import { BloomFilterViz } from "./visualizers/BloomFilterViz";
// Tree data structures
import { BSTViz } from "./visualizers/BSTViz";
import { MinHeapViz } from "./visualizers/MinHeapViz";
import { PriorityQueueViz } from "./visualizers/PriorityQueueViz";
import { TrieViz } from "./visualizers/TrieViz";
import { SegmentTreeViz } from "./visualizers/SegmentTreeViz";
// Graph / advanced data structures
import { GraphDSViz } from "./visualizers/GraphDSViz";
import { UnionFindViz } from "./visualizers/UnionFindViz";
import { FenwickTreeViz } from "./visualizers/FenwickTreeViz";
import { SkipListViz } from "./visualizers/SkipListViz";
// Matrix-family data structures
import { ArrayViz } from "./visualizers/ArrayViz";
import { MatrixViz } from "./visualizers/MatrixViz";
import { AdjacencyMatrixViz } from "./visualizers/AdjacencyMatrixViz";
import { SparseMatrixViz } from "./visualizers/SparseMatrixViz";
// Linear-extra data structures
import { CircularBufferViz } from "./visualizers/CircularBufferViz";
import { MinStackViz } from "./visualizers/MinStackViz";
import { LruCacheViz } from "./visualizers/LruCacheViz";
import { TupleViz } from "./visualizers/TupleViz";

/** Every lesson visualizer takes exactly these props. The pillar accent colour
 *  and the lesson's Big-O string come from LessonView. `lessonData` is the exact
 *  number array from the lesson's code sample, when one exists — visualizers
 *  that chart a list of numbers (sort/search) offer a "from code" toggle for it;
 *  the rest ignore it. */
export type VizProps = {
  accent: string;
  complexity?: string;
  /** First integer-array literal from the lesson's code (sort/search charts). */
  lessonData?: number[];
  /** The lesson's full JavaScript code sample. Visualizers that can bind to the
   *  exact data in the code (DP tables, data structures) parse what they need
   *  from this and offer a "from code / random" toggle. */
  code?: string;
};

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

  // Array-transform algorithms.
  "counting-sort": CountingSort,
  "merge-intervals": MergeIntervals,
  "boyer-moore-majority-vote": BoyerMoore,
  quickselect: Quickselect,
  "binary-search-on-answer": BinarySearchAnswer,

  // Number-theory & bit algorithms.
  recursion: RecursionTree,
  "euclids-gcd": EuclidGcd,
  "sieve-of-eratosthenes": Sieve,
  "fast-exponentiation": FastExponentiation,
  "bit-manipulation": BitManipulation,

  // Matrix / string / misc algorithms.
  "spiral-matrix-traversal": SpiralMatrix,
  "substring-search": SubstringSearch,
  "floyds-cycle-detection": FloydsCycle,
  "backtracking-permutations": Backtracking,
  "greedy-coin-change": GreedyCoinChange,

  // Hashing data structures.
  "hash-map": HashMapViz,
  set: SetViz,
  "frequency-map": FrequencyMapViz,
  "sorted-set": SortedSetViz,
  "bloom-filter": BloomFilterViz,

  // Tree data structures.
  "binary-search-tree": BSTViz,
  "min-heap": MinHeapViz,
  "priority-queue": PriorityQueueViz,
  trie: TrieViz,
  "segment-tree": SegmentTreeViz,

  // Graph / advanced data structures.
  graph: GraphDSViz,
  "union-find": UnionFindViz,
  "fenwick-tree": FenwickTreeViz,
  "skip-list": SkipListViz,

  // Matrix-family data structures.
  array: ArrayViz,
  matrix: MatrixViz,
  "adjacency-matrix": AdjacencyMatrixViz,
  "sparse-matrix": SparseMatrixViz,

  // Linear-extra data structures.
  "circular-buffer": CircularBufferViz,
  "min-stack": MinStackViz,
  "lru-cache": LruCacheViz,
  tuple: TupleViz,
};
