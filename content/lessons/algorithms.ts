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
  {
    id: "heap-sort",
    pillar: "Algorithms",
    name: "Heap Sort",
    easy: "Heap sort is like a tournament bracket. Arrange everyone so every 'parent' is bigger than their 'children' — that shape is called a heap, and it always pushes the biggest player to the very top. Take the champion off the top and place it at the end of your sorted list. Let the next-biggest rise to the top, and repeat.",
    how: [
      "Arrange the whole list into a max heap, so the largest item sits at the root (index 0).",
      "Swap the root with the last unsorted item — that puts the current largest in its final sorted spot.",
      "Shrink the heap by one and 'heapify' (fix the heap shape) from the root down. Repeat until nothing is left to sort.",
    ],
    when: "When you need guaranteed O(n log n) sorting without merge sort's extra memory — heap sort sorts in place. Heaps also power priority queues directly.",
    big: "O(n log n) time — every item moves down roughly log n levels · O(1) space since it sorts in place.",
    mistakes: [
      "Getting the child index formulas wrong — a node at index i has children at 2i+1 and 2i+2.",
      "Forgetting to re-heapify after swapping the root, which leaves the heap shape broken for the rest of the sort.",
    ],
    code: {
      JavaScript: `function heapSort(arr) {
  const a = [...arr];
  const n = a.length;

  function heapify(size, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(size, largest); // fix the heap shape further down
    }
  }

  // Build the initial max heap.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

  // Repeatedly move the max to the end and shrink the heap.
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    heapify(end, 0);
  }
  return a;
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", heapSort(data).join(" "));`,
      Python: `def heap_sort(arr):
    a = arr[:]
    n = len(a)

    def heapify(size, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        if left < size and a[left] > a[largest]:
            largest = left
        if right < size and a[right] > a[largest]:
            largest = right
        if largest != i:
            a[i], a[largest] = a[largest], a[i]
            heapify(size, largest)  # fix the heap shape further down

    # Build the initial max heap.
    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)

    # Repeatedly move the max to the end and shrink the heap.
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        heapify(end, 0)
    return a

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in heap_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "counting-sort",
    pillar: "Algorithms",
    name: "Counting Sort",
    easy: "Counting sort is like tallying exam scores into labeled bins instead of comparing papers to each other. You count how many times each score appears, then read the bins off in order. It never compares two items directly — it just counts.",
    how: [
      "Find the biggest value in the list, so you know how many bins you need.",
      "Make a bin (a count) for every possible value from 0 up to that max, and count how often each value shows up.",
      "Walk the bins in order from smallest to largest, writing out each value as many times as it was counted.",
    ],
    when: "Sorting small-range non-negative integers — like ages, grades, or dice rolls — where it can beat comparison sorts by never comparing items at all.",
    big: "O(n + k) time, where k is the range of possible values · O(k) space for the count bins. Not a comparison sort like the ones above.",
    mistakes: [
      "Using it on data with a huge range (like arbitrary floats or huge numbers) — the bin array becomes enormous.",
      "Forgetting it only works on non-negative integers without extra adjustment for negatives.",
    ],
    code: {
      JavaScript: `function countingSort(arr) {
  if (arr.length === 0) return [];
  const max = Math.max(...arr);
  const counts = new Array(max + 1).fill(0);
  for (const num of arr) counts[num]++; // tally each value

  const result = [];
  for (let value = 0; value <= max; value++) {
    for (let c = 0; c < counts[value]; c++) result.push(value);
  }
  return result;
}

const data = [5, 2, 9, 1, 5, 6];
console.log("Before:", data.join(" "));
console.log("Sorted:", countingSort(data).join(" "));`,
      Python: `def counting_sort(arr):
    if not arr:
        return []
    max_val = max(arr)
    counts = [0] * (max_val + 1)
    for num in arr:
        counts[num] += 1  # tally each value

    result = []
    for value in range(max_val + 1):
        result.extend([value] * counts[value])
    return result

data = [5, 2, 9, 1, 5, 6]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in counting_sort(data)))`,
    },
    output: `Before: 5 2 9 1 5 6
Sorted: 1 2 5 5 6 9`,
  },
  {
    id: "jump-search",
    pillar: "Algorithms",
    name: "Jump Search",
    easy: "Jump search is like flipping through a phone book in big chunks instead of one page at a time. Jump ahead by a whole block of pages. As soon as you overshoot the name you want, stop and search that one block page by page. It only works if the data is sorted first.",
    how: [
      "Pick a block size (usually the square root of the list's length).",
      "Jump ahead by that many items at a time until you land on a block that could contain the target.",
      "Walk through that one block item by item (a small linear search) to find the exact match.",
    ],
    when: "Searching a large sorted list when jumping backward is expensive (like on a tape or slow storage) — a middle ground between linear search and binary search.",
    big: "O(sqrt n) time — far fewer checks than linear search, though more than binary search's O(log n) · O(1) space.",
    mistakes: [
      "Running it on unsorted data — like binary search, it requires the list to be sorted first.",
      "Letting the block index run past the end of the array instead of capping it there.",
    ],
    code: {
      JavaScript: `function jumpSearch(arr, target) {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let block = 0;

  // Jump ahead block by block until we overshoot the target.
  while (block + step <= n && arr[block + step - 1] < target) {
    block += step;
  }

  // Linear-search inside the block we landed on.
  for (let i = block; i < Math.min(block + step, n); i++) {
    if (arr[i] === target) return i;
  }
  return -1; // not found
}

const sorted = [4, 8, 15, 16, 23, 42];
console.log("Index of 23:", jumpSearch(sorted, 23));
console.log("Index of 10:", jumpSearch(sorted, 10));`,
      Python: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    block = 0

    # Jump ahead block by block until we overshoot the target.
    while block + step <= n and arr[block + step - 1] < target:
        block += step

    # Linear-search inside the block we landed on.
    for i in range(block, min(block + step, n)):
        if arr[i] == target:
            return i
    return -1  # not found

sorted_nums = [4, 8, 15, 16, 23, 42]
print("Index of 23:", jump_search(sorted_nums, 23))
print("Index of 10:", jump_search(sorted_nums, 10))`,
    },
    output: `Index of 23: 4
Index of 10: -1`,
  },
  {
    id: "two-pointers",
    pillar: "Algorithms",
    name: "Two Pointers",
    easy: "Picture two people standing at opposite ends of a sorted line of numbered cards. They walk toward each other. If their two cards don't add up to the target yet, whoever holds the smaller card steps inward — that's the only move that can raise the sum.",
    how: [
      "Make sure the list is sorted first.",
      "Put one pointer at the very start and one at the very end.",
      "If the two values add up to the target, you're done. Too small? Move the left pointer right. Too big? Move the right pointer left. Repeat until the pointers meet.",
    ],
    when: "Finding a pair with a target sum in sorted data, or similar problems (removing duplicates, reversing in place) — it does the job in one pass with almost no extra memory.",
    big: "O(n log n) if you need to sort first, then O(n) for the single pass · O(1) extra space (besides the sort).",
    mistakes: [
      "Forgetting to sort the list first — the pointer logic only works because sorted order guarantees which side to move.",
      "Moving the wrong pointer (or both at once) and skipping over the actual answer.",
    ],
    code: {
      JavaScript: `function twoSum(arr, target) {
  const a = [...arr].sort((x, y) => x - y);
  let left = 0;
  let right = a.length - 1;

  while (left < right) {
    const sum = a[left] + a[right];
    if (sum === target) return [a[left], a[right]];
    if (sum < target) left++;  // need a bigger sum
    else right--;              // need a smaller sum
  }
  return null; // no pair found
}

const nums = [8, 2, 9, 1, 5, 6];
const pair = twoSum(nums, 10);
console.log("Numbers:", nums.join(" "));
if (pair) {
  console.log("Pair summing to 10:", pair.join(" "));
} else {
  console.log("Pair summing to 10: none");
}`,
      Python: `def two_sum(arr, target):
    a = sorted(arr)
    left, right = 0, len(a) - 1

    while left < right:
        total = a[left] + a[right]
        if total == target:
            return [a[left], a[right]]
        if total < target:
            left += 1   # need a bigger sum
        else:
            right -= 1  # need a smaller sum
    return None  # no pair found

nums = [8, 2, 9, 1, 5, 6]
pair = two_sum(nums, 10)
print("Numbers:", " ".join(str(v) for v in nums))
if pair:
    print("Pair summing to 10:", " ".join(str(v) for v in pair))
else:
    print("Pair summing to 10: none")`,
    },
    output: `Numbers: 8 2 9 1 5 6
Pair summing to 10: 1 9`,
  },
  {
    id: "sliding-window",
    pillar: "Algorithms",
    name: "Sliding Window",
    easy: "Sliding window is like looking through a train window that only shows a fixed number of seats at a time. As the train moves, you don't re-count everyone in view from scratch — you just drop the person who left the view and add the person who entered it.",
    how: [
      "Add up the first 'window' of k items — that's your starting sum.",
      "Slide the window forward one step: subtract the item that just left, add the item that just entered.",
      "Keep track of the best (e.g. largest) sum you've seen as the window slides across the whole list.",
    ],
    when: "Problems about a fixed-size (or growing) window of consecutive items — max/min sum, longest run, or average over a moving range — much faster than recomputing each window from scratch.",
    big: "O(n) time — each item is added to the window once and removed once · O(1) space.",
    mistakes: [
      "Recomputing the whole window's sum from scratch every time it slides — that's O(n*k) and defeats the purpose.",
      "Getting the window's start/end indices off by one, especially at the very end of the list.",
    ],
    code: {
      JavaScript: `function maxSumSubarray(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i]; // first window

  let maxSum = windowSum;
  for (let end = k; end < arr.length; end++) {
    windowSum += arr[end] - arr[end - k]; // slide: add new, drop old
    if (windowSum > maxSum) maxSum = windowSum;
  }
  return maxSum;
}

const data = [2, 1, 5, 1, 3, 2];
console.log("Numbers:", data.join(" "));
console.log("Max sum of 3 consecutive:", maxSumSubarray(data, 3));`,
      Python: `def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])  # first window
    max_sum = window_sum

    for end in range(k, len(arr)):
        window_sum += arr[end] - arr[end - k]  # slide: add new, drop old
        if window_sum > max_sum:
            max_sum = window_sum
    return max_sum

data = [2, 1, 5, 1, 3, 2]
print("Numbers:", " ".join(str(v) for v in data))
print("Max sum of 3 consecutive:", max_sum_subarray(data, 3))`,
    },
    output: `Numbers: 2 1 5 1 3 2
Max sum of 3 consecutive: 9`,
  },
  {
    id: "dynamic-programming",
    pillar: "Algorithms",
    name: "Dynamic Programming (Memoization)",
    easy: "Dynamic programming is like writing an answer on a sticky note the first time you work it out, so next time someone asks the same question you just read the note instead of redoing the work. That sticky-note cache is called 'memoization' — remembering answers to subproblems you've already solved.",
    how: [
      "Before computing an answer, check a cache (like an object or dictionary) to see if you've already solved this exact subproblem.",
      "If it's cached, return it immediately — no recomputation needed.",
      "If not, compute it (often by recursion into smaller subproblems), save the result in the cache, then return it.",
    ],
    when: "Recursive problems that ask the same question over and over — Fibonacci numbers, counting paths on a grid, coin-change problems — anywhere plain recursion would redo the same work many times.",
    big: "O(n) time and O(n) space for Fibonacci with memoization — a huge improvement over plain recursion's O(2^n) time, at the cost of some memory for the cache.",
    mistakes: [
      "Forgetting to check the cache first, which silently falls back to slow, repeated recomputation.",
      "In Python, using a mutable default argument (like memo={}) — it gets shared and reused across calls instead of starting fresh.",
    ],
    code: {
      JavaScript: `function fib(n, memo = {}) {
  if (n in memo) return memo[n];      // already solved — reuse it
  if (n <= 1) return n;
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo); // solve once, remember it
  return memo[n];
}

console.log("fib(10) =", fib(10));
console.log("fib(20) =", fib(20));`,
      Python: `def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]  # already solved — reuse it
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)  # solve once, remember it
    return memo[n]

print("fib(10) =", fib(10))
print("fib(20) =", fib(20))`,
    },
    output: `fib(10) = 55
fib(20) = 6765`,
    note: "In Python, avoid a mutable default like memo={} — it's the same trap as DFS's default list. We use None and create a fresh cache instead.",
  },
  {
    id: "kadanes-algorithm",
    pillar: "Algorithms",
    name: "Kadane's Algorithm",
    easy: "Kadane's algorithm is like tracking your running profit day by day. If your running total ever drops below what today alone is worth, you cut your losses and restart counting from today. The whole time, you remember the best streak you've ever had.",
    how: [
      "Start both the 'current streak' sum and the 'best streak' sum at the first item.",
      "At each next item, decide: is it better to extend the current streak, or to start a fresh streak from here?",
      "Update the best streak seen so far after every step. Keep going to the end of the list.",
    ],
    when: "Finding the best contiguous run in a sequence — the most profitable stretch of stock price changes, or the best streak of gains in any series of ups and downs.",
    big: "O(n) time — a single pass through the list · O(1) space.",
    mistakes: [
      "Resetting the current sum to 0 instead of to the current item — that breaks the algorithm when all numbers are negative.",
      "Forgetting to update the best sum on every step, not just when you reset.",
    ],
    code: {
      JavaScript: `function maxSubArraySum(arr) {
  let currentSum = arr[0];
  let maxSum = arr[0];

  for (let i = 1; i < arr.length; i++) {
    // Either extend the streak, or start fresh at this item.
    currentSum = Math.max(arr[i], currentSum + arr[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}

const data = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log("Numbers:", data.join(" "));
console.log("Max subarray sum:", maxSubArraySum(data));`,
      Python: `def max_subarray_sum(arr):
    current_sum = arr[0]
    max_sum = arr[0]

    for i in range(1, len(arr)):
        # Either extend the streak, or start fresh at this item.
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)
    return max_sum

data = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print("Numbers:", " ".join(str(v) for v in data))
print("Max subarray sum:", max_subarray_sum(data))`,
    },
    output: `Numbers: -2 1 -3 4 -1 2 1 -5 4
Max subarray sum: 6`,
  },
  {
    id: "dijkstras-algorithm",
    pillar: "Algorithms",
    name: "Dijkstra's Shortest Path",
    easy: "Dijkstra's algorithm is a road-trip planner that always drives to the closest unvisited city next. From each city, it asks: is it cheaper to reach my neighbors through here than the best way I already knew? It only works when every road's distance is zero or positive — no roads that pay you to drive them.",
    how: [
      "Set the distance to the starting point as 0, and every other point as 'unknown' (infinity) for now.",
      "Repeatedly pick the unvisited point with the smallest known distance, and mark it visited.",
      "'Relax' its neighbors: if reaching a neighbor through this point is shorter than what you knew before, update it. Repeat until every reachable point is visited.",
    ],
    when: "Shortest paths in a weighted graph where weights aren't negative — GPS route planning, network routing, or any 'cheapest way from A to B' problem.",
    big: "O(V²) time with this simple version (V = number of points, scanning all of them each round) · O(V) space for the distances. A priority queue speeds this up to O((V + E) log V) on large graphs.",
    mistakes: [
      "Using it on a graph with negative edge weights — Dijkstra assumes distances only ever grow, and gives wrong answers there.",
      "Forgetting to mark points as visited once settled, which wastes time re-checking them.",
    ],
    code: {
      JavaScript: `function dijkstra(graph, start) {
  const dist = {};
  const visited = new Set();
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    // Pick the unvisited node with the smallest known distance.
    let current = null;
    for (const node in graph) {
      if (!visited.has(node) && (current === null || dist[node] < dist[current])) {
        current = node;
      }
    }
    if (current === null || dist[current] === Infinity) break;
    visited.add(current);

    for (const neighbor in graph[current]) {
      const newDist = dist[current] + graph[current][neighbor];
      if (newDist < dist[neighbor]) dist[neighbor] = newDist; // relax
    }
  }
  return dist;
}

const graph = {
  A: { B: 4, C: 1 },
  B: { A: 4, D: 1 },
  C: { A: 1, B: 2, D: 5 },
  D: { B: 1, C: 5 },
};

const distances = dijkstra(graph, "A");
const order = ["A", "B", "C", "D"]; // fixed order so the output is deterministic
const line = order.map((node) => node + ":" + distances[node]).join(" ");
console.log("Distances from A:", line);`,
      Python: `import math

def dijkstra(graph, start):
    dist = {node: math.inf for node in graph}
    dist[start] = 0
    visited = set()

    while len(visited) < len(graph):
        # Pick the unvisited node with the smallest known distance.
        current = None
        for node in graph:
            if node not in visited and (current is None or dist[node] < dist[current]):
                current = node
        if current is None or dist[current] == math.inf:
            break
        visited.add(current)

        for neighbor, weight in graph[current].items():
            new_dist = dist[current] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist  # relax

    return dist

graph = {
    "A": {"B": 4, "C": 1},
    "B": {"A": 4, "D": 1},
    "C": {"A": 1, "B": 2, "D": 5},
    "D": {"B": 1, "C": 5},
}

distances = dijkstra(graph, "A")
order = ["A", "B", "C", "D"]  # fixed order so the output is deterministic
line = " ".join(node + ":" + str(distances[node]) for node in order)
print("Distances from A:", line)`,
    },
    output: `Distances from A: A:0 B:3 C:1 D:4`,
    note: "Node distances come out as plain integers here because every edge weight is a whole number — no floats to worry about matching between languages.",
  },
  {
    id: "topological-sort",
    pillar: "Algorithms",
    name: "Topological Sort",
    easy: "Topological sort figures out what order to do tasks in when some tasks need others done first — you can't take Physics before Math. It lines up every task so each requirement comes before whatever depends on it. This only works when tasks don't depend on each other in a circle, like A needing B while B also needs A — that's called a cycle, and it has no valid order.",
    how: [
      "Pick a task you haven't fully explored yet, and dive into everything it depends on first (that's a DFS — depth-first search).",
      "Once you've explored ALL of a task's dependents, mark it 'finished' and push it onto a stack — it's now safe to schedule.",
      "After every task has been explored, read the stack back to front. That's a valid order where every prerequisite comes before what needs it.",
    ],
    when: "Scheduling tasks with dependencies — a build system figuring out compile order, course prerequisites, or installing packages so dependencies go in before the packages that need them.",
    big: "O(V + E) time — every task (V) and every dependency arrow (E) is visited once · O(V) space for the visited set and the stack.",
    mistakes: [
      "Running it on a graph that has a cycle (A needs B, and B needs A) — there's no valid order, and naive code can loop forever.",
      "Pushing a task onto the stack too early, before all of its dependents have been fully explored — that breaks the ordering guarantee.",
    ],
    code: {
      JavaScript: `function topologicalSort(graph) {
  const visited = new Set();
  const stack = [];

  function visit(node) {
    if (visited.has(node)) return;
    visited.add(node);
    for (const next of graph[node]) {
      visit(next);
    }
    stack.push(node); // fully explored — safe to schedule
  }

  for (const node in graph) visit(node);
  return stack.reverse();
}

const graph = {
  Math: ["Physics", "CS"],
  Physics: ["Robotics"],
  CS: ["Robotics"],
  Robotics: [],
  English: [],
};

console.log("Topological order:", topologicalSort(graph).join(" "));`,
      Python: `def topological_sort(graph):
    visited = set()
    stack = []

    def visit(node):
        if node in visited:
            return
        visited.add(node)
        for nxt in graph[node]:
            visit(nxt)
        stack.append(node)  # fully explored — safe to schedule

    for node in graph:
        visit(node)
    stack.reverse()
    return stack

graph = {
    "Math": ["Physics", "CS"],
    "Physics": ["Robotics"],
    "CS": ["Robotics"],
    "Robotics": [],
    "English": [],
}

print("Topological order:", " ".join(topological_sort(graph)))`,
    },
    output: `Topological order: English Math CS Physics Robotics`,
  },
  {
    id: "backtracking-permutations",
    pillar: "Algorithms",
    name: "Backtracking (Permutations)",
    easy: "Backtracking is like trying on outfits. Put on one item, then see if the rest of the outfit can be completed. Hit a dead end? Take that item off — that's the 'backtrack' — and try something else. Generating every permutation (every possible ordering of a list) works the same way: place one item in the next open slot, try to fill the rest, then undo it and try the next item instead.",
    how: [
      "Keep a 'path' (the ordering built so far) and a list of 'remaining' items not yet placed.",
      "For each remaining item: place it in the path, then recursively try to fill the rest of the path with what's left.",
      "When no items remain, the path is one full permutation — record it. Then undo the last placement ('backtrack') and try the next remaining item instead.",
    ],
    when: "Generating every possible arrangement or combination — permutations, subsets, puzzle solutions like Sudoku or N-Queens — anywhere you need to explore every branch of choices and abandon the ones that don't pan out.",
    big: "O(n!) time to generate all permutations of n items — there really are that many orderings · O(n) space for the recursion depth, not counting the output itself.",
    mistakes: [
      "Forgetting to 'undo' the choice after recursing — the actual backtrack step — without it, leftover state leaks into the next branch.",
      "Not realizing n! grows explosively — permutations of just 10 items is already 3.6 million orderings.",
    ],
    code: {
      JavaScript: `function permutations(arr) {
  const results = [];

  function backtrack(path, remaining) {
    if (remaining.length === 0) {
      results.push(path.join("")); // e.g. [1, 2, 3] -> "123"
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const rest = remaining.slice(0, i).concat(remaining.slice(i + 1));
      path.push(next); // choose
      backtrack(path, rest); // explore
      path.pop(); // un-choose — this is the "backtrack" step
    }
  }

  backtrack([], arr);
  return results;
}

const nums = [1, 2, 3];
console.log("Permutations:", permutations(nums).join(" "));`,
      Python: `def permutations(arr):
    results = []

    def backtrack(path, remaining):
        if not remaining:
            results.append("".join(str(v) for v in path))  # e.g. [1, 2, 3] -> "123"
            return
        for i in range(len(remaining)):
            next_val = remaining[i]
            rest = remaining[:i] + remaining[i + 1:]
            path.append(next_val)   # choose
            backtrack(path, rest)   # explore
            path.pop()              # un-choose — this is the "backtrack" step

    backtrack([], arr)
    return results

nums = [1, 2, 3]
print("Permutations:", " ".join(permutations(nums)))`,
    },
    output: `Permutations: 123 132 213 231 312 321`,
  },
  {
    id: "greedy-coin-change",
    pillar: "Algorithms",
    name: "Greedy Coin Change",
    easy: "A greedy algorithm always grabs the best-looking option available right now and never looks back. Making change like a cashier is the classic example: hand over the biggest coin that still fits, then the next biggest, and so on. It's fast and often works — but only because everyday coin systems happen to be 'greedy-friendly'.",
    how: [
      "Sort the coin values from largest to smallest.",
      "Take as many of the largest coin as fit into the remaining amount.",
      "Move to the next-smaller coin and repeat, until the remaining amount hits zero.",
    ],
    when: "Making change with a 'canonical' coin system like US currency or most real-world money, or any problem where grabbing the locally-best choice also happens to be the globally optimal one.",
    big: "O(n log n) time to sort the coins, then O(n) to hand them out · O(1) extra space besides the list of coins used.",
    mistakes: [
      "Assuming greedy always gives the FEWEST coins — with an oddball coin system (like [1, 3, 4] for amount 6), greedy can do worse than the true optimum, which needs dynamic programming to guarantee.",
      "Forgetting to sort the coins first, so the biggest coin isn't actually tried first.",
    ],
    code: {
      JavaScript: `function greedyCoinChange(amount, coins) {
  const sorted = [...coins].sort((a, b) => b - a); // largest first
  const used = [];
  let remaining = amount;

  for (const coin of sorted) {
    while (remaining >= coin) {
      used.push(coin);
      remaining -= coin;
    }
  }
  return used;
}

const coins = [25, 10, 5, 1];
const amount = 63;
const used = greedyCoinChange(amount, coins);
console.log("Amount:", amount);
console.log("Coins used:", used.join(" "));
console.log("Total coins:", used.length);`,
      Python: `def greedy_coin_change(amount, coins):
    sorted_coins = sorted(coins, reverse=True)  # largest first
    used = []
    remaining = amount

    for coin in sorted_coins:
        while remaining >= coin:
            used.append(coin)
            remaining -= coin
    return used

coins = [25, 10, 5, 1]
amount = 63
used = greedy_coin_change(amount, coins)
print("Amount:", amount)
print("Coins used:", " ".join(str(c) for c in used))
print("Total coins:", len(used))`,
    },
    output: `Amount: 63
Coins used: 25 25 10 1 1 1
Total coins: 6`,
  },
  {
    id: "prefix-sums",
    pillar: "Algorithms",
    name: "Prefix Sums",
    easy: "Think of a car's odometer readings at every mile marker. To find the distance between mile 20 and mile 50, you don't re-measure the road — you just subtract two odometer readings. A prefix sum array does the same trick for a list of numbers: precompute the running totals once, and any 'sum of this range' question becomes a single subtraction.",
    how: [
      "Build a prefix array where prefix[i] holds the sum of all original items before index i (prefix[0] is 0 — nothing summed yet).",
      "To get the sum of a range from index left to right (inclusive), take prefix[right + 1] minus prefix[left].",
      "Reuse the same prefix array for as many range-sum questions as you like — each one is now one subtraction instead of a fresh loop.",
    ],
    when: "Answering many 'sum of this range' questions on data that doesn't change — analytics dashboards, spreadsheet-style range totals, or any repeated range-sum queries where re-adding every time would be too slow.",
    big: "O(n) time to build the prefix array once · O(1) time per range-sum query afterward, down from O(n) per query without it · O(n) space for the prefix array.",
    mistakes: [
      "Off-by-one errors — forgetting that prefix[i] is the sum BEFORE index i, so range [left, right] needs prefix[right + 1] - prefix[left], not prefix[right] - prefix[left].",
      "Rebuilding the prefix array on every query instead of once up front, which throws away the whole speed benefit.",
    ],
    code: {
      JavaScript: `function buildPrefixSums(arr) {
  const prefix = [0];
  for (let i = 0; i < arr.length; i++) {
    prefix.push(prefix[i] + arr[i]);
  }
  return prefix;
}

function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left]; // inclusive range [left, right]
}

const data = [2, 4, 6, 8, 10];
const prefix = buildPrefixSums(data);
console.log("Numbers:", data.join(" "));
console.log("Sum of indices 1..3:", rangeSum(prefix, 1, 3));
console.log("Sum of indices 0..4:", rangeSum(prefix, 0, 4));`,
      Python: `def build_prefix_sums(arr):
    prefix = [0]
    for i in range(len(arr)):
        prefix.append(prefix[i] + arr[i])
    return prefix

def range_sum(prefix, left, right):
    return prefix[right + 1] - prefix[left]  # inclusive range [left, right]

data = [2, 4, 6, 8, 10]
prefix = build_prefix_sums(data)
print("Numbers:", " ".join(str(v) for v in data))
print("Sum of indices 1..3:", range_sum(prefix, 1, 3))
print("Sum of indices 0..4:", range_sum(prefix, 0, 4))`,
    },
    output: `Numbers: 2 4 6 8 10
Sum of indices 1..3: 18
Sum of indices 0..4: 30`,
  },
  {
    id: "bit-manipulation",
    pillar: "Algorithms",
    name: "Bit Manipulation",
    easy: "Every number is stored as a row of on/off switches called bits — this is binary. Some tricks flip those switches directly instead of doing normal math. One handy trick, n & (n - 1), always turns off the rightmost switch that's on. Do that over and over and you're counting how many switches were on. And if a number has exactly one switch on, it's a power of two.",
    how: [
      "To count 'set bits' (switches that are on): repeatedly do n = n & (n - 1), which clears the lowest set bit each time, and count how many times you did it before n hit 0.",
      "To check if a number is a power of two: a power of two has exactly one set bit, so n & (n - 1) comes out to exactly 0 for it (and only it, among positive numbers).",
      "Both tricks lean on the same operation, n & (n - 1) — just used to answer two different questions.",
    ],
    when: "Performance-sensitive counting or flag-checking — feature flags packed into a single number, checking if a size is power-of-two-friendly (like array capacities or hash table sizes), or anywhere bitwise math beats looping over digits.",
    big: "O(number of set bits) time for the counting trick — far fewer steps than checking every single bit position · O(1) space.",
    mistakes: [
      "Forgetting the n > 0 check before the power-of-two test — the bit trick alone would wrongly call 0 a power of two.",
      "Assuming bit tricks behave the same on negative numbers — their underlying binary representation (two's complement) works differently.",
    ],
    code: {
      JavaScript: `function countSetBits(n) {
  let count = 0;
  while (n > 0) {
    n = n & (n - 1); // clears the lowest set bit
    count++;
  }
  return count;
}

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0; // powers of two have exactly one set bit
}

console.log("Set bits in 44:", countSetBits(44));
console.log("Is 16 a power of two?", isPowerOfTwo(16) ? "yes" : "no");
console.log("Is 18 a power of two?", isPowerOfTwo(18) ? "yes" : "no");`,
      Python: `def count_set_bits(n):
    count = 0
    while n > 0:
        n = n & (n - 1)  # clears the lowest set bit
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0  # powers of two have exactly one set bit

print("Set bits in 44:", count_set_bits(44))
print("Is 16 a power of two?", "yes" if is_power_of_two(16) else "no")
print("Is 18 a power of two?", "yes" if is_power_of_two(18) else "no")`,
    },
    output: `Set bits in 44: 3
Is 16 a power of two? yes
Is 18 a power of two? no`,
  },
  {
    id: "substring-search",
    pillar: "Algorithms",
    name: "Substring Search",
    easy: "Finding a short word inside a longer piece of text is like sliding a strip of paper with the word written on it along the sentence, one letter at a time, checking whether everything under the strip matches. That's the simplest way to search for a substring — slow but completely honest about what it's doing.",
    how: [
      "Slide a window the same length as the pattern across the text, one starting position at a time.",
      "At each position, compare the window's letters to the pattern's letters one by one.",
      "If every letter matches, record that starting index as a match. Either way, slide the window one step and repeat until it no longer fits inside the text.",
    ],
    when: "Simple text search where the text is short-to-medium, or as the mental model before reaching for a faster algorithm (like KMP) when the text is huge and speed really matters.",
    big: "O(n·m) time in the worst case, where n is the text length and m is the pattern length, because a near-match can force a full comparison at almost every position · O(1) space. Smarter algorithms like KMP bring this down to O(n + m) by never re-checking letters they've already matched.",
    mistakes: [
      "Letting the starting position go too far — it can't start past text.length - pattern.length, or the window runs off the end of the text.",
      "Assuming this naive approach is 'the' way to search text — it's a solid starting point, but real editors and grep use smarter algorithms for long documents.",
    ],
    code: {
      JavaScript: `function findAllOccurrences(text, pattern) {
  const indices = [];
  for (let i = 0; i <= text.length - pattern.length; i++) {
    let matched = true;
    for (let j = 0; j < pattern.length; j++) {
      if (text[i + j] !== pattern[j]) {
        matched = false;
        break;
      }
    }
    if (matched) indices.push(i);
  }
  return indices;
}

const text = "ababcabab";
const pattern = "abab";
const matches = findAllOccurrences(text, pattern);
console.log("Text:", text);
console.log("Pattern:", pattern);
console.log("Found at indices:", matches.join(" "));`,
      Python: `def find_all_occurrences(text, pattern):
    indices = []
    for i in range(len(text) - len(pattern) + 1):
        matched = True
        for j in range(len(pattern)):
            if text[i + j] != pattern[j]:
                matched = False
                break
        if matched:
            indices.append(i)
    return indices

text = "ababcabab"
pattern = "abab"
matches = find_all_occurrences(text, pattern)
print("Text:", text)
print("Pattern:", pattern)
print("Found at indices:", " ".join(str(i) for i in matches))`,
    },
    output: `Text: ababcabab
Pattern: abab
Found at indices: 0 5`,
  },
  {
    id: "floyds-cycle-detection",
    pillar: "Algorithms",
    name: "Floyd's Cycle Detection",
    easy: "Picture two runners on a track. The tortoise takes one step at a time; the hare takes two. If the track is a straight line with an end, the hare just finishes first. But if the track secretly loops back on itself, the faster hare eventually laps the tortoise — they land on the exact same spot again. That's proof the track is a loop. This trick finds a loop in a linked list using almost no extra memory.",
    how: [
      "Start two pointers, 'slow' and 'fast', at the head of the linked list.",
      "Move slow one step at a time, and fast two steps at a time, over and over.",
      "If fast ever lands on the exact same node as slow, there's a cycle. If fast instead reaches the end (a null 'next'), there's no cycle.",
    ],
    when: "Detecting an accidental loop in a linked list — a bug where some node's 'next' pointer loops backward — or any 'does this chain of steps ever repeat' problem, using O(1) extra memory instead of a whole visited-set.",
    big: "O(n) time — the hare catches up to the tortoise within one lap of the cycle if one exists · O(1) space, which is the whole point compared to tracking every visited node in a set.",
    mistakes: [
      "Checking fast.next.next without first checking that fast.next isn't null — that crashes on lists that end partway through.",
      "Comparing node VALUES instead of the actual node objects — two different nodes can hold the same value, but a cycle means revisiting the same node, not the same number.",
    ],
    code: {
      JavaScript: `function makeNode(value) {
  return { value, next: null };
}

function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next; // tortoise: one step
    fast = fast.next.next; // hare: two steps
    if (slow === fast) return true; // they lapped — it's a loop
  }
  return false; // hare reached the end — no loop
}

// List with a cycle: 1 -> 2 -> 3 -> 4 -> 5 -> back to 3
const a1 = makeNode(1), a2 = makeNode(2), a3 = makeNode(3), a4 = makeNode(4), a5 = makeNode(5);
a1.next = a2; a2.next = a3; a3.next = a4; a4.next = a5; a5.next = a3;

// List with no cycle: 1 -> 2 -> 3
const b1 = makeNode(1), b2 = makeNode(2), b3 = makeNode(3);
b1.next = b2; b2.next = b3;

console.log("List with cycle has a cycle?", hasCycle(a1) ? "yes" : "no");
console.log("List without a cycle has a cycle?", hasCycle(b1) ? "yes" : "no");`,
      Python: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

def has_cycle(head):
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next       # tortoise: one step
        fast = fast.next.next  # hare: two steps
        if slow is fast:
            return True  # they lapped — it's a loop
    return False  # hare reached the end — no loop

# List with a cycle: 1 -> 2 -> 3 -> 4 -> 5 -> back to 3
a1, a2, a3, a4, a5 = Node(1), Node(2), Node(3), Node(4), Node(5)
a1.next, a2.next, a3.next, a4.next, a5.next = a2, a3, a4, a5, a3

# List with no cycle: 1 -> 2 -> 3
b1, b2, b3 = Node(1), Node(2), Node(3)
b1.next, b2.next = b2, b3

print("List with cycle has a cycle?", "yes" if has_cycle(a1) else "no")
print("List without a cycle has a cycle?", "yes" if has_cycle(b1) else "no")`,
    },
    output: `List with cycle has a cycle? yes
List without a cycle has a cycle? no`,
  },
  {
    id: "quickselect",
    pillar: "Algorithms",
    name: "Quickselect",
    easy: "Quickselect is quicksort's lazier cousin. Quicksort fully sorts both sides of a pivot. Quickselect only wants one answer — the kth smallest item. So after splitting into a 'smaller' pile and a 'bigger' pile, it throws away whichever pile can't hold the answer, and only digs into the one that can.",
    how: [
      "Pick a pivot item and split the rest into two piles: smaller-than-pivot and bigger-than-or-equal-to-pivot.",
      "Figure out where the pivot itself would land: right after all the 'smaller' items. If that's the kth position you want, the pivot IS the answer.",
      "Otherwise, only recurse into whichever pile — smaller or bigger — actually contains the kth position, and completely ignore the other pile.",
    ],
    when: "Finding the kth smallest or largest value (like a median, or a 'top 10' cutoff) without needing the whole list sorted — noticeably faster than sorting everything just to read off one position.",
    big: "O(n) time on average — each step throws away a whole pile instead of sorting it · O(n²) worst case with unlucky pivots · O(log n) space for the recursion.",
    mistakes: [
      "Forgetting that k is a POSITION (like '3rd smallest'), not a value — mixing those up gives nonsense results.",
      "Recursing into BOTH piles like quicksort does — that defeats the entire point of quickselect, which is to ignore the pile you don't need.",
    ],
    code: {
      JavaScript: `function quickSelect(arr, k) {
  if (arr.length === 1) return arr[0];
  const pivot = arr[arr.length - 1];
  const smaller = [];
  const bigger = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) smaller.push(arr[i]);
    else bigger.push(arr[i]);
  }
  if (k <= smaller.length) return quickSelect(smaller, k); // answer is in the smaller pile
  if (k === smaller.length + 1) return pivot; // pivot IS the kth smallest
  return quickSelect(bigger, k - smaller.length - 1); // answer is in the bigger pile
}

const data = [7, 2, 9, 4, 1, 6];
console.log("Numbers:", data.join(" "));
console.log("3rd smallest:", quickSelect(data, 3));
console.log("1st smallest:", quickSelect(data, 1));`,
      Python: `def quick_select(arr, k):
    if len(arr) == 1:
        return arr[0]
    pivot = arr[-1]
    smaller = [x for x in arr[:-1] if x < pivot]
    bigger = [x for x in arr[:-1] if x >= pivot]
    if k <= len(smaller):
        return quick_select(smaller, k)                # answer is in the smaller pile
    if k == len(smaller) + 1:
        return pivot                                     # pivot IS the kth smallest
    return quick_select(bigger, k - len(smaller) - 1)    # answer is in the bigger pile

data = [7, 2, 9, 4, 1, 6]
print("Numbers:", " ".join(str(v) for v in data))
print("3rd smallest:", quick_select(data, 3))
print("1st smallest:", quick_select(data, 1))`,
    },
    output: `Numbers: 7 2 9 4 1 6
3rd smallest: 4
1st smallest: 1`,
  },
  {
    id: "euclids-gcd",
    pillar: "Algorithms",
    name: "Euclid's GCD",
    easy: "Imagine two ropes, one 48 inches and one 18 inches, and you want the longest ruler that measures both exactly with nothing left over. Euclid's trick: measure off the shorter rope against the longer one, look at what's left over, and repeat using that leftover as your new short rope. Keep going until nothing's left over — the last rope length you used is the greatest common divisor (GCD), the biggest number that divides both originals evenly.",
    how: [
      "Take two numbers, a and b.",
      "Divide a by b and find the remainder r (that's a % b).",
      "Replace a with b, and b with r. Repeat until b becomes 0 — then a is the GCD.",
    ],
    when: "Whenever you need the largest shared factor of two numbers — simplifying a fraction to lowest terms, finding a common ratio, or as a building block inside more advanced math and cryptography algorithms.",
    big: "O(log(min(a, b))) time — surprisingly fast, since each step shrinks the numbers quickly · O(1) space.",
    mistakes: [
      "Assuming it needs sorted or special input — it works on any two non-negative integers, in either order.",
      "Forgetting that gcd(0, n) should just return n — the loop already handles this correctly, but it's easy to special-case it wrongly by hand.",
    ],
    code: {
      JavaScript: `function gcd(a, b) {
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

console.log("GCD of 48 and 18:", gcd(48, 18));
console.log("GCD of 17 and 5:", gcd(17, 5));`,
      Python: `def gcd(a, b):
    while b != 0:
        r = a % b
        a = b
        b = r
    return a

print("GCD of 48 and 18:", gcd(48, 18))
print("GCD of 17 and 5:", gcd(17, 5))`,
    },
    output: `GCD of 48 and 18: 6
GCD of 17 and 5: 1`,
  },
  {
    id: "sieve-of-eratosthenes",
    pillar: "Algorithms",
    name: "Sieve of Eratosthenes",
    easy: "Picture writing every number from 2 to 30 on a whiteboard. Circle the first number left standing (2), then cross out every multiple of it (4, 6, 8, ...) — those can't be prime, since 2 divides them. Move to the next number that's still standing (3), circle it, cross out its multiples, and keep going. Whatever is still standing at the end, never crossed out, is prime.",
    how: [
      "Make a list of 'is it prime?' flags for every number from 0 up to n, starting them all as true, except 0 and 1 which aren't prime.",
      "Starting at 2, if a number is still flagged prime, cross out every multiple of it above itself.",
      "Move to the next still-flagged number and repeat, up through the square root of n — anything left flagged at the end is prime.",
    ],
    when: "Finding all primes up to some limit — much faster than testing each number one at a time for primality. Useful in cryptography, number theory problems, and building prime lookup tables.",
    big: "O(n log log n) time — nearly linear · O(n) space for the flags array.",
    mistakes: [
      "Starting the crossing-out at i + i instead of i * i — smaller multiples of i were already crossed out by smaller primes, so starting at i * i (skipping straight to the square) is a common speedup, though starting earlier still gives a correct (just slightly slower) result.",
      "Forgetting to mark 0 and 1 as not prime — the loop logic alone won't exclude them.",
    ],
    code: {
      JavaScript: `function sieveOfEratosthenes(limit) {
  const isPrime = new Array(limit + 1).fill(true);
  isPrime[0] = false;
  if (limit >= 1) isPrime[1] = false;

  for (let i = 2; i * i <= limit; i++) {
    if (isPrime[i]) {
      for (let multiple = i * i; multiple <= limit; multiple += i) {
        isPrime[multiple] = false;
      }
    }
  }

  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (isPrime[i]) primes.push(i);
  }
  return primes;
}

const primes = sieveOfEratosthenes(30);
console.log("Primes up to 30:", primes.join(" "));`,
      Python: `def sieve_of_eratosthenes(limit):
    is_prime = [True] * (limit + 1)
    is_prime[0] = False
    if limit >= 1:
        is_prime[1] = False

    i = 2
    while i * i <= limit:
        if is_prime[i]:
            for multiple in range(i * i, limit + 1, i):
                is_prime[multiple] = False
        i += 1

    primes = [i for i in range(2, limit + 1) if is_prime[i]]
    return primes

primes = sieve_of_eratosthenes(30)
print("Primes up to 30:", " ".join(str(p) for p in primes))`,
    },
    output: `Primes up to 30: 2 3 5 7 11 13 17 19 23 29`,
  },
  {
    id: "fast-exponentiation",
    pillar: "Algorithms",
    name: "Fast Exponentiation",
    easy: "Imagine folding a piece of paper in half again and again — each fold doubles the number of layers, so you reach a huge number of layers in just a few folds instead of adding one layer at a time. Fast exponentiation computes powers the same way: instead of multiplying the base by itself n times in a row, it repeatedly squares a smaller result, cutting the exponent in half at each step.",
    how: [
      "If the exponent is 0, the answer is 1 — that's the base case.",
      "If the exponent is even, compute base raised to half the exponent, then square that result.",
      "If the exponent is odd, compute base raised to one less than the exponent (now even) the same way, then multiply by one more base.",
    ],
    when: "Computing large powers quickly — modular exponentiation in cryptography (like RSA), fast matrix powers, or any place you'd otherwise multiply the same number hundreds of times.",
    big: "O(log n) time — each step cuts the exponent in half, so even huge exponents finish in a handful of multiplications · O(log n) space for the recursion (O(1) if written as a loop).",
    mistakes: [
      "Forgetting the odd-exponent case and only handling even ones — that silently gives wrong answers for odd powers.",
      "Recomputing base raised to half the exponent twice instead of computing it once and squaring it — that throws away the entire speed advantage.",
    ],
    code: {
      JavaScript: `function fastPower(base, exponent) {
  if (exponent === 0) return 1;
  if (exponent % 2 === 0) {
    const half = fastPower(base, exponent / 2);
    return half * half;
  }
  return base * fastPower(base, exponent - 1);
}

console.log("2^10 =", fastPower(2, 10));
console.log("3^13 =", fastPower(3, 13));`,
      Python: `def fast_power(base, exponent):
    if exponent == 0:
        return 1
    if exponent % 2 == 0:
        half = fast_power(base, exponent // 2)
        return half * half
    return base * fast_power(base, exponent - 1)

print("2^10 =", fast_power(2, 10))
print("3^13 =", fast_power(3, 13))`,
    },
    output: `2^10 = 1024
3^13 = 1594323`,
  },
  {
    id: "merge-intervals",
    pillar: "Algorithms",
    name: "Merge Intervals",
    easy: "Imagine a list of meeting times on your calendar, some of which overlap — like 9-10am and 9:30-11am. Merging intervals means combining any that overlap into one longer block, so your calendar shows the fewest possible non-overlapping chunks of busy time.",
    how: [
      "Sort the intervals by their start time.",
      "Walk through them one by one, keeping a 'current merged' interval.",
      "If the next interval starts before (or exactly when) the current one ends, stretch the current one to cover both. Otherwise, close out the current merged interval and start a new one.",
    ],
    when: "Combining overlapping ranges — merging busy calendar slots, combining overlapping time windows in logs, or simplifying a list of numeric ranges before processing them.",
    big: "O(n log n) time to sort, then O(n) to merge in one pass · O(n) space for the result.",
    mistakes: [
      "Forgetting to sort by start time first — the one-pass merge only works because the intervals arrive in order.",
      "Using strict less-than instead of less-than-or-equal when checking overlap, which misses back-to-back intervals that touch exactly at the boundary, like [1, 3] and [3, 5].",
    ],
    code: {
      JavaScript: `function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0].slice()];

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end); // overlaps — stretch the current one
    } else {
      merged.push([start, end]); // no overlap — start a new block
    }
  }
  return merged;
}

const meetings = [[1, 3], [2, 6], [8, 10], [15, 18], [9, 12]];
const merged = mergeIntervals(meetings);
const line = merged.map(([s, e]) => \`\${s}-\${e}\`).join(" ");
console.log("Merged:", line);`,
      Python: `def merge_intervals(intervals):
    if not intervals:
        return []
    sorted_intervals = sorted(intervals, key=lambda pair: pair[0])
    merged = [list(sorted_intervals[0])]

    for start, end in sorted_intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)  # overlaps — stretch the current one
        else:
            merged.append([start, end])  # no overlap — start a new block
    return merged

meetings = [[1, 3], [2, 6], [8, 10], [15, 18], [9, 12]]
merged = merge_intervals(meetings)
line = " ".join(f"{s}-{e}" for s, e in merged)
print("Merged:", line)`,
    },
    output: `Merged: 1-6 8-12 15-18`,
  },
  {
    id: "boyer-moore-majority-vote",
    pillar: "Algorithms",
    name: "Boyer-Moore Majority Vote",
    easy: "Imagine a room where more than half the people are wearing red, and everyone else is wearing some other color. If you keep pairing up one red person with one non-red person and sending both out of the room, red still wins in the end — there were simply more of them to begin with. The Boyer-Moore trick works the same way: cancel one 'vote' for the current leading candidate against one vote for anything else, and whoever's left standing at the end is the majority.",
    how: [
      "Keep a 'candidate' and a 'count', starting count at 0.",
      "For each item: if count is 0, make this item the new candidate. Then add 1 to count if the item matches the candidate, or subtract 1 if it doesn't.",
      "After one full pass, the candidate is the majority element — the value appearing more than half the time (this only works when such a majority actually exists in the list).",
    ],
    when: "Finding an element that appears more than half the time in a list — like the winning candidate in an election tally — in a single pass using almost no extra memory, instead of counting every distinct value with a hash map.",
    big: "O(n) time — one pass through the list · O(1) space.",
    mistakes: [
      "Trusting the result without checking the list actually has a majority element — if no value appears more than half the time, this algorithm still returns some candidate, just not a valid majority.",
      "Resetting the candidate on every mismatch instead of only when count hits exactly 0 — that breaks the cancellation logic.",
    ],
    code: {
      JavaScript: `function majorityElement(arr) {
  let candidate = null;
  let count = 0;

  for (const item of arr) {
    if (count === 0) candidate = item;
    count += item === candidate ? 1 : -1;
  }
  return candidate;
}

const votes = [2, 2, 1, 1, 1, 2, 2];
console.log("Votes:", votes.join(" "));
console.log("Majority element:", majorityElement(votes));`,
      Python: `def majority_element(arr):
    candidate = None
    count = 0

    for item in arr:
        if count == 0:
            candidate = item
        count += 1 if item == candidate else -1
    return candidate

votes = [2, 2, 1, 1, 1, 2, 2]
print("Votes:", " ".join(str(v) for v in votes))
print("Majority element:", majority_element(votes))`,
    },
    output: `Votes: 2 2 1 1 1 2 2
Majority element: 2`,
  },
  {
    id: "longest-common-subsequence",
    pillar: "Algorithms",
    name: "Longest Common Subsequence (DP)",
    easy: "Imagine two friends each type out the story of their week, one event per line. The longest common subsequence is the longest thread of events that show up in both stories, IN THE SAME ORDER — but not necessarily back-to-back, since other unrelated events can sit in between. It's not about matching whole chunks of text; it's about finding the longest 'both of us did these things, in this order' thread.",
    how: [
      "Build a grid where cell (i, j) answers: what's the longest common thread using only the first i letters of string A and the first j letters of string B?",
      "If the letters at those positions match, the answer is one better than the diagonal cell before them (extend the thread by one letter).",
      "If they don't match, the answer is the better of 'drop this letter from A' or 'drop this letter from B' — whichever neighboring cell is bigger. Fill the whole grid this way, then walk it backward from the corner to read out the actual matching letters.",
    ],
    when: "Comparing two sequences for shared structure — diffing two versions of a file, DNA sequence comparison, spell-check suggestions, or measuring how similar two pieces of text really are beyond a simple equality check.",
    big: "O(n·m) time and O(n·m) space, where n and m are the two string lengths — one grid cell per pair of positions.",
    mistakes: [
      "Confusing 'subsequence' with 'substring' — a subsequence can skip letters and doesn't need to be contiguous, so 'ACE' is a subsequence of 'ABCDE' even though the letters aren't next to each other.",
      "Getting the grid's off-by-one indexing wrong — row/column 0 represents 'zero letters used', so the actual string characters start at index i - 1 and j - 1, not i and j.",
    ],
    code: {
      JavaScript: `function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // letters match — extend the thread
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // take the better neighbor
      }
    }
  }

  // Walk backward through the grid to read out the actual matching letters.
  let i = m, j = n;
  const chars = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      chars.push(a[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  chars.reverse();
  return { length: dp[m][n], sequence: chars.join("") };
}

const a = "ABCBDAB";
const b = "BDCABA";
const result = lcs(a, b);
console.log("String A:", a);
console.log("String B:", b);
console.log("LCS length:", result.length);
console.log("LCS sequence:", result.sequence);`,
      Python: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # letters match — extend the thread
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # take the better neighbor

    # Walk backward through the grid to read out the actual matching letters.
    i, j = m, n
    chars = []
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            chars.append(a[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    chars.reverse()
    return dp[m][n], "".join(chars)

a = "ABCBDAB"
b = "BDCABA"
length, sequence = lcs(a, b)
print("String A:", a)
print("String B:", b)
print("LCS length:", length)
print("LCS sequence:", sequence)`,
    },
    output: `String A: ABCBDAB
String B: BDCABA
LCS length: 4
LCS sequence: BCBA`,
  },
  {
    id: "coin-change-min-coins",
    pillar: "Algorithms",
    name: "Coin Change (Minimum Coins)",
    easy: "This is the honest version of making change — no shortcuts, no assuming the biggest coin is always the smart pick. For every amount from 1 up to the target, you ask: what's the fewest coins that make exactly this much, built from answers you've already worked out for smaller amounts? By the time you reach the target amount, you've genuinely tried every combination, not just the greedy-looking one.",
    how: [
      "Make a table where table[amount] holds the fewest coins needed to make that exact amount, starting table[0] at 0 (zero coins for zero amount) and everything else as 'not yet known'.",
      "For every amount from 1 up to the target, try using each coin: if that coin fits, check whether 'one more coin' plus the best answer for (amount minus that coin) beats what's currently in the table.",
      "After filling the whole table, table[target] holds the answer — or a sign that it's impossible if no combination of coins can hit that exact amount.",
    ],
    when: "Making exact change with coin systems that AREN'T greedy-friendly, or any 'fewest steps to reach an exact total' problem — real currency systems, token/resource costs, or minimum moves in a game where each move has a fixed cost.",
    big: "O(amount · number of coin types) time — for every amount, you check every coin once · O(amount) space for the table.",
    mistakes: [
      "Trusting greedy (always grab the biggest coin) to give the true minimum — with coins like [1, 3, 4], greedy on amount 6 would grab 4 then two 1s (3 coins), while the true best is 3 + 3 (2 coins). Only this table-based approach is guaranteed correct.",
      "Forgetting to handle the 'impossible' case — if no combination of coins reaches the exact amount, the table cell for it should stay marked unreachable, not silently return a wrong number.",
    ],
    code: {
      JavaScript: `function minCoins(amount, coins) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // zero coins needed to make zero

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]; // -1 means impossible
}

const coins = [1, 3, 4];
const amount = 6;
console.log("Amount:", amount);
console.log("Coins available:", coins.join(" "));
console.log("Minimum coins needed:", minCoins(amount, coins));

const coins2 = [2, 5];
const amount2 = 3;
console.log("Amount:", amount2);
console.log("Coins available:", coins2.join(" "));
console.log("Minimum coins needed:", minCoins(amount2, coins2));`,
      Python: `import math

def min_coins(amount, coins):
    dp = [math.inf] * (amount + 1)
    dp[0] = 0  # zero coins needed to make zero

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1
    return -1 if dp[amount] == math.inf else dp[amount]  # -1 means impossible

coins = [1, 3, 4]
amount = 6
print("Amount:", amount)
print("Coins available:", " ".join(str(c) for c in coins))
print("Minimum coins needed:", min_coins(amount, coins))

coins2 = [2, 5]
amount2 = 3
print("Amount:", amount2)
print("Coins available:", " ".join(str(c) for c in coins2))
print("Minimum coins needed:", min_coins(amount2, coins2))`,
    },
    output: `Amount: 6
Coins available: 1 3 4
Minimum coins needed: 2
Amount: 3
Coins available: 2 5
Minimum coins needed: -1`,
  },
  {
    id: "dutch-national-flag",
    pillar: "Algorithms",
    name: "Dutch National Flag (3-Way Partition)",
    easy: "Named after the Dutch flag's three horizontal stripes (red, white, blue), this trick sorts a list that only ever contains three distinct values — like 0s, 1s, and 2s — into their three neat groups in a single pass. Picture sorting a pile of laundry into three baskets (whites, colors, darks) by walking past each item exactly once, instead of picking it up over and over.",
    how: [
      "Keep three markers: 'low' (the boundary for 0s), 'mid' (the item currently being looked at), and 'high' (the boundary for 2s).",
      "Look at the item at 'mid'. If it's a 0, swap it down to the 'low' boundary and advance both low and mid. If it's a 1, it's already in the middle group — just advance mid.",
      "If it's a 2, swap it out to the 'high' boundary and pull high inward — but don't advance mid yet, since the item swapped in from the high end still needs to be checked. Stop once mid passes high.",
    ],
    when: "Sorting data that only has a small, fixed number of distinct categories — like sorting objects by three colors, classifying items as low/medium/high, or as a partitioning step inside quicksort when many items share the same value.",
    big: "O(n) time — a single pass through the list, touching each item a constant number of times · O(1) extra space, since it sorts in place.",
    mistakes: [
      "Advancing 'mid' after every swap, including swaps with 'high' — the item just pulled in from the high end hasn't been checked yet, so mid must stay put in that case.",
      "Using this approach on data with more than three distinct values — it's specifically built for exactly three categories, not general sorting.",
    ],
    code: {
      JavaScript: `function dutchFlagSort(arr) {
  const a = [...arr];
  let low = 0, mid = 0, high = a.length - 1;

  while (mid <= high) {
    if (a[mid] === 0) {
      [a[low], a[mid]] = [a[mid], a[low]]; // send 0 to the front group
      low++; mid++;
    } else if (a[mid] === 1) {
      mid++; // already in the middle group
    } else {
      [a[mid], a[high]] = [a[high], a[mid]]; // send 2 to the back group
      high--; // don't advance mid — the swapped-in item is still unchecked
    }
  }
  return a;
}

const data = [2, 0, 2, 1, 1, 0];
console.log("Before:", data.join(" "));
console.log("Sorted:", dutchFlagSort(data).join(" "));`,
      Python: `def dutch_flag_sort(arr):
    a = arr[:]
    low, mid, high = 0, 0, len(a) - 1

    while mid <= high:
        if a[mid] == 0:
            a[low], a[mid] = a[mid], a[low]  # send 0 to the front group
            low += 1
            mid += 1
        elif a[mid] == 1:
            mid += 1  # already in the middle group
        else:
            a[mid], a[high] = a[high], a[mid]  # send 2 to the back group
            high -= 1  # don't advance mid — the swapped-in item is still unchecked
    return a

data = [2, 0, 2, 1, 1, 0]
print("Before:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in dutch_flag_sort(data)))`,
    },
    output: `Before: 2 0 2 1 1 0
Sorted: 0 0 1 1 2 2`,
  },
  {
    id: "binary-search-on-answer",
    pillar: "Algorithms",
    name: "Binary Search on the Answer",
    easy: "Normally binary search hunts for a value sitting inside a sorted list. This trick reuses the same halving idea for a different job: guessing the ANSWER to a problem instead of a position in a list. If you can quickly check 'would this guess work or not' and know that small guesses fail while big guesses succeed (or vice versa), you can binary search over the range of possible answers themselves — even though no actual list of answers exists anywhere.",
    how: [
      "Figure out the smallest and largest values the true answer could possibly be — that's your search range.",
      "Try the middle guess in that range, and run a quick 'does this guess work?' check — something that must get easier to satisfy as the guess grows (or shrinks) in one consistent direction.",
      "If the guess works, it might be more than needed — try smaller. If it fails, try bigger. Keep halving the range until it narrows down to the smallest guess that actually works.",
    ],
    when: "Optimization problems that ask for a minimum (or maximum) value satisfying some condition — the smallest ship capacity to deliver packages in time, the minimum speed to eat all your food before it's gone, or 'smallest X such that check(X) succeeds' whenever check() runs fast and the answer space is sorted by feasibility.",
    big: "O(log(range) · cost of the feasibility check) time — each guess halves the range of possible answers, same as classic binary search, just spent on guesses instead of array positions.",
    mistakes: [
      "Picking a feasibility check that ISN'T consistently one-directional — binary search on the answer only works if 'works' and 'doesn't work' split the range cleanly into two halves, with no answer flip-flopping back and forth.",
      "Setting the initial search range too narrow and accidentally excluding the true answer — the lower bound must be a guess that could realistically still fail, and the upper bound one that's guaranteed to succeed.",
    ],
    code: {
      JavaScript: `function canShip(weights, days, capacity) {
  let daysNeeded = 1;
  let currentLoad = 0;
  for (const w of weights) {
    if (currentLoad + w > capacity) {
      daysNeeded++;      // today's load is full — start a new day
      currentLoad = 0;
    }
    currentLoad += w;
  }
  return daysNeeded <= days;
}

function minCapacity(weights, days) {
  let low = Math.max(...weights);           // capacity must fit the heaviest package
  let high = weights.reduce((a, b) => a + b, 0); // shipping it all in one day always works

  while (low < high) {
    const mid = Math.floor((low + high) / 2); // guess a capacity
    if (canShip(weights, days, mid)) {
      high = mid;      // this capacity works — try smaller
    } else {
      low = mid + 1;   // too small — need more room
    }
  }
  return low;
}

const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const days = 5;
console.log("Weights:", weights.join(" "));
console.log("Days:", days);
console.log("Minimum capacity:", minCapacity(weights, days));`,
      Python: `def can_ship(weights, days, capacity):
    days_needed = 1
    current_load = 0
    for w in weights:
        if current_load + w > capacity:
            days_needed += 1  # today's load is full — start a new day
            current_load = 0
        current_load += w
    return days_needed <= days

def min_capacity(weights, days):
    low = max(weights)     # capacity must fit the heaviest package
    high = sum(weights)    # shipping it all in one day always works

    while low < high:
        mid = (low + high) // 2  # guess a capacity
        if can_ship(weights, days, mid):
            high = mid       # this capacity works — try smaller
        else:
            low = mid + 1    # too small — need more room
    return low

weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
days = 5
print("Weights:", " ".join(str(w) for w in weights))
print("Days:", days)
print("Minimum capacity:", min_capacity(weights, days))`,
    },
    output: `Weights: 1 2 3 4 5 6 7 8 9 10
Days: 5
Minimum capacity: 15`,
  },
  {
    id: "spiral-matrix-traversal",
    pillar: "Algorithms",
    name: "Spiral Matrix Traversal",
    easy: "Imagine peeling a rectangular sticker off a grid from the outside in: read across the top edge, down the right edge, back across the bottom edge, and up the left edge — then shrink the rectangle by one layer and repeat. That's a spiral traversal: visiting every item in a grid by walking its shrinking outer ring over and over until nothing's left.",
    how: [
      "Track four boundaries: top, bottom, left, and right — the edges of the rectangle still unvisited.",
      "Walk across the top row (left to right), down the right column (top to bottom), across the bottom row (right to left), and up the left column (bottom to top) — shrinking each boundary inward right after you walk it.",
      "Check before each of the last two walks that the boundaries haven't crossed yet (the rectangle might have collapsed into a single row or column). Repeat the whole ring-walk until top passes bottom or left passes right.",
    ],
    when: "Reading or processing a 2D grid in a specific visual order — image processing that scans outside-in, generating spiral-numbered puzzles, or any problem literally phrased as 'return the elements of this matrix in spiral order'.",
    big: "O(rows · columns) time — every cell is visited exactly once · O(1) extra space besides the output list.",
    mistakes: [
      "Forgetting the 'boundaries haven't crossed' checks before the bottom-row and left-column walks — without them, a single row or single column gets walked twice, double-counting cells.",
      "Shrinking a boundary at the wrong time (before finishing that edge's walk instead of right after) — that skips cells or reads the wrong row/column on the next leg.",
    ],
    code: {
      JavaScript: `function spiralOrder(matrix) {
  const result = [];
  if (matrix.length === 0) return result;
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) result.push(matrix[top][col]);
    top++;
    for (let row = top; row <= bottom; row++) result.push(matrix[row][right]);
    right--;
    if (top <= bottom) {
      for (let col = right; col >= left; col--) result.push(matrix[bottom][col]);
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) result.push(matrix[row][left]);
      left++;
    }
  }
  return result;
}

const matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
console.log("Spiral order:", spiralOrder(matrix).join(" "));`,
      Python: `def spiral_order(matrix):
    result = []
    if not matrix:
        return result
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    return result

matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
print("Spiral order:", " ".join(str(v) for v in spiral_order(matrix)))`,
    },
    output: `Spiral order: 1 2 3 4 8 12 11 10 9 5 6 7`,
  },
];

export default lessons;
