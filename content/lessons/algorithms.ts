// content/lessons/algorithms.ts
// Pillar: Algorithms — how to work with your data.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/algorithms.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "bubble-sort",
    pillar: "Algorithms",
    name: "Bubble Sort",
    easy: "Bubble sort is like sorting a shelf of books by height by only ever swapping two neighbors. You walk along comparing each pair; if the left one is bigger, swap them. The biggest 'bubbles' to the end each pass.",
    how: [
      "Compare the first two items; if they're out of order, swap them.",
      "Move one step right and compare the next pair. Repeat to the end.",
      "After each full pass the largest item is parked at the end. Repeat until no swaps are needed.",
    ],
    when: "Almost never in real code — it's slow. But it's the perfect first sort to learn because you can see exactly what's happening.",
    big: "O(n²) time (nested loops) · O(1) space. On a big list, painfully slow.",
    mistakes: [
      "Looping one step too far and comparing past the end of the array.",
      "Reaching for bubble sort in real projects — use the language's built-in sort instead.",
    ],
    code: {
      JavaScript: `function bubbleSort(arr) {
  const a = [...arr]; // copy so we don't change the original
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]]; // swap
      }
    }
  }
  return a;
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", bubbleSort(data).join(" "));`,
      Python: `def bubble_sort(arr):
    a = arr[:]  # copy so we don't change the original
    for i in range(len(a) - 1):
        for j in range(len(a) - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]  # swap
    return a

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in bubble_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "selection-sort",
    pillar: "Algorithms",
    name: "Selection Sort",
    easy: "Selection sort is like picking a sports team: scan everyone, pick the shortest person, and line them up first. Then scan the rest, pick the next shortest, and so on until everyone's in order.",
    how: [
      "Look through the whole unsorted part and find the smallest item.",
      "Swap it into the next sorted position at the front.",
      "Repeat for the remaining unsorted items until done.",
    ],
    when: "A teaching example, or when swaps are expensive — it makes the fewest swaps of the simple sorts.",
    big: "O(n²) time · O(1) space. Slow, but simple and predictable.",
    mistakes: [
      "Swapping too early — find the smallest first, then do one swap per pass.",
      "Re-scanning items you've already sorted.",
    ],
    code: {
      JavaScript: `function selectionSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", selectionSort(data).join(" "));`,
      Python: `def selection_sort(arr):
    a = arr[:]
    for i in range(len(a) - 1):
        min_i = i
        for j in range(i + 1, len(a)):
            if a[j] < a[min_i]:
                min_i = j
        if min_i != i:
            a[i], a[min_i] = a[min_i], a[i]
    return a

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in selection_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "insertion-sort",
    pillar: "Algorithms",
    name: "Insertion Sort",
    easy: "Insertion sort is how most people sort a hand of playing cards. You pick up cards one at a time and slide each new card into its correct spot among the cards you're already holding.",
    how: [
      "Start with the second item and compare it leftward.",
      "Slide bigger items one spot to the right to make room.",
      "Drop the item into its correct place. Repeat for every item.",
    ],
    when: "Great for small lists or lists that are already almost sorted — it's genuinely fast there.",
    big: "O(n²) worst case · O(n) if already nearly sorted · O(1) space.",
    mistakes: [
      "Overwriting a value before you've saved it in a temporary variable.",
      "Running the inner loop past the start of the array.",
    ],
    code: {
      JavaScript: `function insertionSort(arr) {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; // slide right
      j--;
    }
    a[j + 1] = key; // drop into place
  }
  return a;
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", insertionSort(data).join(" "));`,
      Python: `def insertion_sort(arr):
    a = arr[:]
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]  # slide right
            j -= 1
        a[j + 1] = key  # drop into place
    return a

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in insertion_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "merge-sort",
    pillar: "Algorithms",
    name: "Merge Sort",
    easy: "Merge sort uses 'divide and conquer'. Split the list in half, then in half again, until each piece is a single item (already sorted by itself). Then merge the little sorted pieces back together in order.",
    how: [
      "Keep splitting the list in half until each piece has one item.",
      "Merge two sorted pieces by repeatedly taking the smaller front item.",
      "Keep merging pairs upward until the whole list is one sorted list.",
    ],
    when: "Large lists where you need reliably fast sorting, or when a stable sort (keeping equal items in original order) matters.",
    big: "O(n log n) time — much faster than the simple sorts on big data · O(n) extra space for the merges.",
    mistakes: [
      "Forgetting to copy the leftover items from one half after the other runs out.",
      "Splitting wrong and dropping the middle element.",
    ],
    code: {
      JavaScript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
function merge(left, right) {
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  return out.concat(left.slice(i)).concat(right.slice(j));
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", mergeSort(data).join(" "));`,
      Python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in merge_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "quick-sort",
    pillar: "Algorithms",
    name: "Quick Sort",
    easy: "Quick sort picks one item as a 'pivot', then splits the rest into two buckets: smaller-than-pivot and bigger-than-pivot. It sorts each bucket the same way. Like organizing papers by putting each one left or right of a chosen middle one.",
    how: [
      "Pick a pivot item from the list.",
      "Put everything smaller on its left, everything bigger on its right.",
      "Repeat the same process on the left and right groups, then join them.",
    ],
    when: "A very common general-purpose sort — it's fast in practice and sorts in place with little extra memory.",
    big: "O(n log n) on average · O(n²) worst case (bad pivots) · O(log n) space for the recursion.",
    mistakes: [
      "Always picking the first item as the pivot — on already-sorted data that's the slow worst case.",
      "Off-by-one errors when partitioning into the two groups.",
    ],
    code: {
      JavaScript: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const smaller = [];
  const bigger = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= pivot) smaller.push(arr[i]);
    else bigger.push(arr[i]);
  }
  return [...quickSort(smaller), pivot, ...quickSort(bigger)];
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", quickSort(data).join(" "));`,
      Python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    smaller = [x for x in arr[:-1] if x <= pivot]
    bigger = [x for x in arr[:-1] if x > pivot]
    return quick_sort(smaller) + [pivot] + quick_sort(bigger)

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in quick_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "linear-search",
    pillar: "Algorithms",
    name: "Linear Search",
    easy: "Linear search is checking every seat in a theater one by one to find your friend. Simple and always works, even if the seats are in no particular order — you just look at each until you find them (or run out).",
    how: [
      "Start at the first item.",
      "Compare it to what you're looking for. Match? You're done — return its position.",
      "No match? Move to the next. If you reach the end, it's not there.",
    ],
    when: "Small lists, or unsorted data where you can't do anything smarter. It's the fallback that always works.",
    big: "O(n) time — worst case you check every item · O(1) space.",
    mistakes: [
      "Returning too early or forgetting to return -1 when the item isn't found.",
      "Using it on huge sorted data where binary search would be far faster.",
    ],
    code: {
      JavaScript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1; // not found
}

const nums = [4, 8, 15, 16, 23, 42];
console.log("Index of 16:", linearSearch(nums, 16));
console.log("Index of 99:", linearSearch(nums, 99));`,
      Python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1  # not found

nums = [4, 8, 15, 16, 23, 42]
print("Index of 16:", linear_search(nums, 16))
print("Index of 99:", linear_search(nums, 99))`,
    },
    output: `Index of 16: 3
Index of 99: -1`,
  },
  {
    id: "binary-search",
    pillar: "Algorithms",
    name: "Binary Search",
    easy: "Binary search is how you find a word in a dictionary. Open to the middle. Too far? Ignore the whole second half. Not far enough? Ignore the first half. Each check throws away half of what's left — but the list MUST be sorted first.",
    how: [
      "Look at the middle item of the sorted list.",
      "Equal to your target? Found it. Smaller? Search the right half. Bigger? Search the left half.",
      "Repeat on the half that's left until you find it or nothing remains.",
    ],
    when: "Finding something fast in a large sorted list — a name in a contact list, a value in a sorted database index.",
    big: "O(log n) time — each step halves the list, so a million items take ~20 checks · O(1) space.",
    mistakes: [
      "Running it on an unsorted list — it only works if the data is sorted.",
      "Getting the mid/low/high updates wrong and looping forever.",
    ],
    code: {
      JavaScript: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1; // not found
}

const sorted = [4, 8, 15, 16, 23, 42];
console.log("Index of 23:", binarySearch(sorted, 23));
console.log("Index of 10:", binarySearch(sorted, 10));`,
      Python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1  # not found

sorted_nums = [4, 8, 15, 16, 23, 42]
print("Index of 23:", binary_search(sorted_nums, 23))
print("Index of 10:", binary_search(sorted_nums, 10))`,
    },
    output: `Index of 23: 4
Index of 10: -1`,
  },
  {
    id: "bfs",
    pillar: "Algorithms",
    name: "Breadth-First Search (BFS)",
    easy: "BFS explores a map like ripples spreading in a pond. Starting from one spot, it visits all immediate neighbors first, then their neighbors, and so on — level by level. It uses a queue (a line) to remember who to visit next.",
    how: [
      "Put the starting point in a queue and mark it visited.",
      "Take the front of the queue, then add all its unvisited neighbors to the back.",
      "Repeat until the queue is empty — you've visited everything reachable, nearest first.",
    ],
    when: "Finding the shortest path in an unweighted map (fewest steps), or exploring things level by level — like a social network's 'friends of friends'.",
    big: "O(V + E) time — you visit every point (V) and every connection (E) once.",
    mistakes: [
      "Forgetting to mark nodes visited, causing infinite loops.",
      "Using a stack instead of a queue — that turns it into depth-first search.",
    ],
    code: {
      JavaScript: `const graph = {
  A: ["B", "C"], B: ["A", "D", "E"], C: ["A", "F"],
  D: ["B"], E: ["B", "F"], F: ["C", "E"],
};

function bfs(start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

console.log("BFS from A:", bfs("A").join(" "));`,
      Python: `from collections import deque

graph = {
    "A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "F"],
    "D": ["B"], "E": ["B", "F"], "F": ["C", "E"],
}

def bfs(start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)
    return order

print("BFS from A:", " ".join(bfs("A")))`,
    },
    output: `BFS from A: A B C D E F`,
  },
  {
    id: "dfs",
    pillar: "Algorithms",
    name: "Depth-First Search (DFS)",
    easy: "DFS explores a maze by always going as deep as possible down one path before backing up. Pick a direction, keep walking until you hit a dead end, then step back to the last fork and try another way.",
    how: [
      "Visit the starting point and mark it.",
      "Go to its first unvisited neighbor, then that neighbor's first unvisited neighbor — keep diving deeper.",
      "Hit a dead end? Back up to the last spot with an unexplored path and continue.",
    ],
    when: "Exploring all possibilities (like maze or puzzle solving), detecting cycles, or walking a tree/folder structure top-to-bottom.",
    big: "O(V + E) time — every point and connection visited once · space up to O(V) for the recursion stack.",
    mistakes: [
      "Forgetting the visited set, so it loops forever on cycles.",
      "Blowing the call stack with recursion on a very deep or huge graph.",
    ],
    code: {
      JavaScript: `const graph = {
  A: ["B", "C"], B: ["A", "D", "E"], C: ["A", "F"],
  D: ["B"], E: ["B", "F"], F: ["C", "E"],
};

function dfs(start, visited = new Set(), order = []) {
  visited.add(start);
  order.push(start);
  for (const next of graph[start]) {
    if (!visited.has(next)) dfs(next, visited, order);
  }
  return order;
}

console.log("DFS from A:", dfs("A").join(" "));`,
      Python: `graph = {
    "A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "F"],
    "D": ["B"], "E": ["B", "F"], "F": ["C", "E"],
}

def dfs(start, visited=None, order=None):
    if visited is None:
        visited = set()
    if order is None:
        order = []
    visited.add(start)
    order.append(start)
    for nxt in graph[start]:
        if nxt not in visited:
            dfs(nxt, visited, order)
    return order

print("DFS from A:", " ".join(dfs("A")))`,
    },
    output: `DFS from A: A B D E F C`,
    note: "In Python, avoid using a mutable default like order=[] — it's a classic trap that shares one list across calls. We use None and create fresh ones instead.",
  },
  {
    id: "recursion",
    pillar: "Algorithms",
    name: "Recursion",
    easy: "Recursion is a function that calls itself to solve a smaller version of the same problem. Think of Russian nesting dolls: to open the biggest, you open the next, and the next — until the tiniest one that opens no further (the 'base case').",
    how: [
      "Define the base case: the smallest input where you stop and return a direct answer.",
      "Otherwise, call yourself with a smaller input.",
      "Combine that smaller answer with the current step to build the full result.",
    ],
    when: "Problems that naturally break into smaller copies of themselves: tree/folder walking, divide-and-conquer sorts, and many math definitions.",
    big: "Depends on the problem, but each pending call uses stack space — O(depth) space.",
    mistakes: [
      "Forgetting the base case, so it calls itself forever and crashes ('stack overflow').",
      "Not making the input actually smaller each call, which also never ends.",
    ],
    code: {
      JavaScript: `function factorial(n) {
  if (n <= 1) return 1;        // base case: stop here
  return n * factorial(n - 1); // smaller version of the problem
}

console.log("5! =", factorial(5));
console.log("0! =", factorial(0));`,
      Python: `def factorial(n):
    if n <= 1:
        return 1              # base case: stop here
    return n * factorial(n - 1)  # smaller version of the problem

print("5! =", factorial(5))
print("0! =", factorial(0))`,
    },
    output: `5! = 120
0! = 1`,
  },
];

export default lessons;
