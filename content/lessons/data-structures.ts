// content/lessons/data-structures.ts
// Pillar: Data Structures — how to hold your data.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/data-structures.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "array",
    pillar: "Data Structures",
    name: "Array",
    easy: "An array is like an egg carton: a row of numbered slots, each holding one thing. The slots are in order, and each has a number (its index) starting at 0.",
    how: [
      "Make a row of slots and put items in order.",
      "Reach any item instantly by its slot number (index), starting at 0.",
      "Add to the end, remove from the end, or loop through every slot.",
    ],
    when: "Almost everywhere — any time you have a list of things in a specific order: a to-do list, search results, the players in a game.",
    big: "Read by index: O(1) (instant) · Add/remove at the end: O(1) · Search for a value: O(n)",
    mistakes: [
      "Forgetting indexes start at 0, so the first item is arr[0], not arr[1].",
      "Going past the end (arr[arr.length]) — there's nothing there.",
    ],
    code: {
      JavaScript: `const fruits = ["apple", "banana", "cherry"];
fruits.push("date"); // add to the end

console.log("Items:", fruits.join(", "));
console.log("Count:", fruits.length);
console.log("First:", fruits[0]);
console.log("Removed:", fruits.pop()); // remove from the end`,
      Python: `fruits = ["apple", "banana", "cherry"]
fruits.append("date")  # add to the end

print("Items:", ", ".join(fruits))
print("Count:", len(fruits))
print("First:", fruits[0])
print("Removed:", fruits.pop())  # remove from the end`,
    },
    output: `Items: apple, banana, cherry, date
Count: 4
First: apple
Removed: date`,
  },
  {
    id: "stack",
    pillar: "Data Structures",
    name: "Stack",
    easy: "A stack is a pile of plates. You add a plate on top, and you take the top one off first. The last thing you put in is the first thing you take out — that's called LIFO (Last In, First Out).",
    how: [
      "push: put a new item on top.",
      "pop: take the top item off (the most recent one).",
      "peek: look at the top item without removing it.",
    ],
    when: "The 'undo' button in an app, the back button in your browser, or checking if brackets in code are balanced.",
    big: "push: O(1) · pop: O(1) · peek: O(1) — all instant because you only ever touch the top.",
    mistakes: [
      "Trying to grab an item from the middle — a stack only lets you touch the top.",
      "Popping from an empty stack without checking first.",
    ],
    code: {
      JavaScript: `class Stack {
  constructor() { this.items = []; }
  push(x) { this.items.push(x); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  size() { return this.items.length; }
}

const s = new Stack();
s.push(1); s.push(2); s.push(3);

console.log("Top:", s.peek());
console.log("Pop:", s.pop());
console.log("Pop:", s.pop());
console.log("Remaining:", s.size());`,
      Python: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, x):
        self.items.append(x)
    def pop(self):
        return self.items.pop()
    def peek(self):
        return self.items[-1]
    def size(self):
        return len(self.items)

s = Stack()
s.push(1); s.push(2); s.push(3)

print("Top:", s.peek())
print("Pop:", s.pop())
print("Pop:", s.pop())
print("Remaining:", s.size())`,
    },
    output: `Top: 3
Pop: 3
Pop: 2
Remaining: 1`,
  },
  {
    id: "queue",
    pillar: "Data Structures",
    name: "Queue",
    easy: "A queue is a line at a coffee shop. The first person to arrive is the first person served. First In, First Out — FIFO. New people join the back; served people leave from the front.",
    how: [
      "enqueue: a new item joins the back of the line.",
      "dequeue: the item at the front is served and leaves.",
      "front: peek at who's next without serving them.",
    ],
    when: "Anything handled in the order it arrived: print jobs, customer support tickets, or tasks waiting to run.",
    big: "enqueue: O(1) · dequeue: O(1) with the right structure · front: O(1)",
    mistakes: [
      "Mixing up which end is which — you add to the back and remove from the front.",
      "In JavaScript, using array.shift() on a huge list is slow; a real queue avoids that.",
    ],
    code: {
      JavaScript: `class Queue {
  constructor() { this.items = []; }
  enqueue(x) { this.items.push(x); }
  dequeue() { return this.items.shift(); }
  front() { return this.items[0]; }
  size() { return this.items.length; }
}

const q = new Queue();
q.enqueue("a"); q.enqueue("b"); q.enqueue("c");

console.log("Front:", q.front());
console.log("Serve:", q.dequeue());
console.log("Serve:", q.dequeue());
console.log("Waiting:", q.size());`,
      Python: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    def enqueue(self, x):
        self.items.append(x)
    def dequeue(self):
        return self.items.popleft()
    def front(self):
        return self.items[0]
    def size(self):
        return len(self.items)

q = Queue()
q.enqueue("a"); q.enqueue("b"); q.enqueue("c")

print("Front:", q.front())
print("Serve:", q.dequeue())
print("Serve:", q.dequeue())
print("Waiting:", q.size())`,
    },
    output: `Front: a
Serve: a
Serve: b
Waiting: 1`,
    note: "Python's collections.deque is the proper tool for a queue — removing from the front is fast, unlike a plain list.",
  },
  {
    id: "linked-list",
    pillar: "Data Structures",
    name: "Linked List",
    easy: "A linked list is a treasure hunt. Each clue, called a node, holds one value plus a note pointing to where the next clue is. There's no jumping straight to clue #5 — you follow the notes from the very first clue, one at a time.",
    how: [
      "Each node stores a value and a link to the next node.",
      "The list remembers only the first node (the head).",
      "To reach an item, start at the head and follow the links one by one.",
    ],
    when: "When you add and remove items constantly and don't need to jump to item #500 directly. It grows without shuffling everything, unlike an array.",
    big: "Add to front: O(1) · Find an item: O(n) because you must walk the chain.",
    mistakes: [
      "Losing the head reference — then the whole list is gone.",
      "Forgetting to update the .next links when inserting or removing, which breaks the chain.",
    ],
    code: {
      JavaScript: `class Node {
  constructor(value) { this.value = value; this.next = null; }
}
class LinkedList {
  constructor() { this.head = null; }
  add(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
  }
  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) { out.push(cur.value); cur = cur.next; }
    return out;
  }
}

const list = new LinkedList();
list.add(10); list.add(20); list.add(30);

console.log("List:", list.toArray().join(" -> "));
console.log("Head:", list.head.value);`,
      Python: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    def add(self, value):
        node = Node(value)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node
    def to_list(self):
        out = []
        cur = self.head
        while cur:
            out.append(cur.value)
            cur = cur.next
        return out

lst = LinkedList()
lst.add(10); lst.add(20); lst.add(30)

print("List:", " -> ".join(str(v) for v in lst.to_list()))
print("Head:", lst.head.value)`,
    },
    output: `List: 10 -> 20 -> 30
Head: 10`,
  },
  {
    id: "hash-map",
    pillar: "Data Structures",
    name: "Hash Map",
    easy: "A hash map is a coat check. You hand over your coat (the value) and get a numbered tag (the key). Later you show the tag and instantly get your exact coat back — no searching through every coat.",
    how: [
      "You store data as key → value pairs (like word → count).",
      "The map turns your key into a slot number behind the scenes.",
      "Look up, add, or update by key — no scanning the whole thing.",
    ],
    when: "Counting things, remembering settings by name, caching results, or any 'look this up by its name/id' situation.",
    big: "Add: O(1) · Look up by key: O(1) · Delete: O(1) — on average, all effectively instant.",
    mistakes: [
      "Assuming the keys stay in a sorted order — don't rely on order for logic.",
      "Looking up a key that doesn't exist and forgetting to handle the 'not found' case.",
    ],
    code: {
      JavaScript: `const counts = {};
const words = ["cat", "dog", "cat", "bird", "dog", "cat"];

for (const w of words) {
  counts[w] = (counts[w] || 0) + 1; // default to 0, then add 1
}

console.log("cat:", counts["cat"]);
console.log("dog:", counts["dog"]);
console.log("bird:", counts["bird"]);`,
      Python: `counts = {}
words = ["cat", "dog", "cat", "bird", "dog", "cat"]

for w in words:
    counts[w] = counts.get(w, 0) + 1  # default to 0, then add 1

print("cat:", counts["cat"])
print("dog:", counts["dog"])
print("bird:", counts["bird"])`,
    },
    output: `cat: 3
dog: 2
bird: 1`,
  },
  {
    id: "binary-search-tree",
    pillar: "Data Structures",
    name: "Binary Search Tree",
    easy: "A binary search tree is the game '20 questions' turned into a shape. Each value sits above at most two smaller values below it, called its children: the smaller child goes left, the bigger child goes right. To find a value, start at the top and keep asking 'is it smaller or bigger?', stepping left or right each time.",
    how: [
      "Start at the top (the root).",
      "Smaller than the current node? Go left. Bigger? Go right.",
      "Keep going until you find the value or hit an empty spot.",
    ],
    when: "When you need data kept in sorted order AND fast lookups/inserts. Reading it left-to-right (in-order) gives everything sorted for free.",
    big: "Search/insert: O(log n) when balanced (each step halves the search) · O(n) if it becomes a lopsided chain.",
    mistakes: [
      "Assuming it's always fast — a tree that grows in sorted order becomes a slow straight line.",
      "Mixing up the rule: smaller goes left, bigger goes right, every time.",
    ],
    code: {
      JavaScript: `class TreeNode {
  constructor(value) { this.value = value; this.left = null; this.right = null; }
}
class BST {
  constructor() { this.root = null; }
  insert(value) { this.root = this._insert(this.root, value); }
  _insert(node, value) {
    if (!node) return new TreeNode(value);
    if (value < node.value) node.left = this._insert(node.left, value);
    else node.right = this._insert(node.right, value);
    return node;
  }
  inOrder(node = this.root, out = []) {
    if (node) {
      this.inOrder(node.left, out);
      out.push(node.value);
      this.inOrder(node.right, out);
    }
    return out;
  }
}

const tree = new BST();
[5, 3, 8, 1, 4, 7, 9].forEach((v) => tree.insert(v));

console.log("Sorted:", tree.inOrder().join(" "));
console.log("Root:", tree.root.value);`,
      Python: `class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    def insert(self, value):
        self.root = self._insert(self.root, value)
    def _insert(self, node, value):
        if node is None:
            return TreeNode(value)
        if value < node.value:
            node.left = self._insert(node.left, value)
        else:
            node.right = self._insert(node.right, value)
        return node
    def in_order(self, node="root", out=None):
        if node == "root":
            node = self.root
        if out is None:
            out = []
        if node:
            self.in_order(node.left, out)
            out.append(node.value)
            self.in_order(node.right, out)
        return out

tree = BST()
for v in [5, 3, 8, 1, 4, 7, 9]:
    tree.insert(v)

print("Sorted:", " ".join(str(v) for v in tree.in_order()))
print("Root:", tree.root.value)`,
    },
    output: `Sorted: 1 3 4 5 7 8 9
Root: 5`,
  },
  {
    id: "set",
    pillar: "Data Structures",
    name: "Set",
    easy: "A set is like a guest list at a party door: each name can only appear once. If you try to add the same name twice, nothing changes — it's already on the list.",
    how: [
      "Add items — duplicates are automatically ignored.",
      "Check if an item exists — you get a fast yes/no answer.",
      "Remove an item, or loop through everything that's left.",
    ],
    when: "Removing duplicates from a list, quickly checking 'have I seen this before?', or tracking unique visitors to a page.",
    big: "Add, check, or remove an item: O(1) on average — instant no matter how many items are stored.",
    mistakes: [
      "Expecting a set to remember the order you added things in — if order matters, sort before printing.",
      "Assuming printing a set always shows the same order — Python sets don't guarantee one.",
    ],
    code: {
      JavaScript: `const seen = new Set();
const visitors = ["amy", "bo", "amy", "cy", "bo", "amy"];

for (const v of visitors) {
  seen.add(v); // duplicates are silently ignored
}

const unique = [...seen].sort();
console.log("Unique:", unique.join(" "));
console.log("Count:", seen.size);
console.log("Has bo:", seen.has("bo") ? "yes" : "no");
seen.delete("bo");
console.log("Has bo:", seen.has("bo") ? "yes" : "no");`,
      Python: `seen = set()
visitors = ["amy", "bo", "amy", "cy", "bo", "amy"]

for v in visitors:
    seen.add(v)  # duplicates are silently ignored

unique = sorted(seen)
print("Unique:", " ".join(unique))
print("Count:", len(seen))
print("Has bo:", "yes" if "bo" in seen else "no")
seen.discard("bo")
print("Has bo:", "yes" if "bo" in seen else "no")`,
    },
    output: `Unique: amy bo cy
Count: 3
Has bo: yes
Has bo: no`,
  },
  {
    id: "doubly-linked-list",
    pillar: "Data Structures",
    name: "Doubly Linked List",
    easy: "A doubly linked list is a train: each car is coupled to the car in front AND the car behind. A regular linked list only lets you walk forward — this one lets you walk backward too.",
    how: [
      "Each node stores a value, a link to the next node, and a link to the previous node.",
      "The list remembers both the first node (head) and the last node (tail).",
      "Walk forward by following .next links, or backward by following .prev links.",
    ],
    when: "Anything you need to browse in both directions: a browser's back/forward history, or a music player's next/previous track.",
    big: "Add to the front or back: O(1) · Find an item: O(n) · Remove a node you already have a reference to: O(1), since you don't need to search for its neighbors.",
    mistakes: [
      "Updating only .next and forgetting .prev (or vice versa) when inserting or removing a node — that breaks the chain in one direction.",
      "Forgetting to update the tail pointer when adding to the end, forcing a slow walk from the head just to find the last node.",
    ],
    code: {
      JavaScript: `class Node {
  constructor(value) { this.value = value; this.next = null; this.prev = null; }
}
class DoublyLinkedList {
  constructor() { this.head = null; this.tail = null; }
  addLast(value) {
    const node = new Node(value);
    if (!this.tail) { this.head = node; this.tail = node; return; }
    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
  }
  forward() {
    const out = [];
    let cur = this.head;
    while (cur) { out.push(cur.value); cur = cur.next; }
    return out;
  }
  backward() {
    const out = [];
    let cur = this.tail;
    while (cur) { out.push(cur.value); cur = cur.prev; }
    return out;
  }
}

const list = new DoublyLinkedList();
list.addLast(10); list.addLast(20); list.addLast(30);

console.log("Forward:", list.forward().join(" -> "));
console.log("Backward:", list.backward().join(" -> "));`,
      Python: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
    def add_last(self, value):
        node = Node(value)
        if not self.tail:
            self.head = node
            self.tail = node
            return
        node.prev = self.tail
        self.tail.next = node
        self.tail = node
    def forward(self):
        out = []
        cur = self.head
        while cur:
            out.append(cur.value)
            cur = cur.next
        return out
    def backward(self):
        out = []
        cur = self.tail
        while cur:
            out.append(cur.value)
            cur = cur.prev
        return out

lst = DoublyLinkedList()
lst.add_last(10); lst.add_last(20); lst.add_last(30)

print("Forward:", " -> ".join(str(v) for v in lst.forward()))
print("Backward:", " -> ".join(str(v) for v in lst.backward()))`,
    },
    output: `Forward: 10 -> 20 -> 30
Backward: 30 -> 20 -> 10`,
  },
  {
    id: "min-heap",
    pillar: "Data Structures",
    name: "Min-Heap",
    easy: "A min-heap is like a hospital waiting room organized by urgency: the most critical patient is always easiest to reach at the front, but everyone else is only loosely arranged — not fully sorted.",
    how: [
      "Insert: put the new item at the end, then let it 'bubble up' past any bigger parent until it lands in a valid spot.",
      "Peek: the smallest item is always sitting right at the top — no searching needed.",
      "Remove the smallest: swap it with the last item, take it off, then let that item 'bubble down' past smaller children.",
    ],
    when: "Task schedulers that must always run the most urgent job next, finding the smallest (or largest) few items in a big pile, or Dijkstra's shortest-path algorithm.",
    big: "Insert: O(log n), because an item only ever travels up one branch of the tree · Remove the smallest: O(log n) · Peek at the smallest: O(1), instant.",
    mistakes: [
      "Thinking a heap is fully sorted — it only guarantees the smallest is on top, not that every other item is in order.",
      "Building it as a tree of linked nodes — a heap is usually just a plain array, with simple math to find each parent/child by index.",
    ],
    code: {
      JavaScript: `class MinHeap {
  constructor() { this.items = []; }
  insert(value) {
    this.items.push(value);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[parent] <= this.items[i]) break;
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }
  peek() { return this.items[0]; }
  popMin() {
    const min = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left] < this.items[smallest]) smallest = left;
        if (right < this.items.length && this.items[right] < this.items[smallest]) smallest = right;
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]];
        i = smallest;
      }
    }
    return min;
  }
  size() { return this.items.length; }
}

const heap = new MinHeap();
[5, 2, 8, 1, 9, 3].forEach((v) => heap.insert(v));

console.log("Smallest:", heap.peek());
console.log("Pop:", heap.popMin());
console.log("Pop:", heap.popMin());
console.log("Remaining:", heap.size());`,
      Python: `import heapq

heap = []
for v in [5, 2, 8, 1, 9, 3]:
    heapq.heappush(heap, v)

print("Smallest:", heap[0])
print("Pop:", heapq.heappop(heap))
print("Pop:", heapq.heappop(heap))
print("Remaining:", len(heap))`,
    },
    output: `Smallest: 1
Pop: 1
Pop: 2
Remaining: 4`,
    note: "Python's built-in heapq module is the standard tool for a heap — it manages a plain list for you. The JavaScript version implements the same bubble-up/bubble-down logic by hand so you can see how a heap actually works underneath.",
  },
  {
    id: "trie",
    pillar: "Data Structures",
    name: "Trie",
    easy: "A trie (say 'try', short for retrieval tree) is a filing cabinet organized one letter at a time. Each drawer holds a single letter, and opening it reveals more drawers for the next letter. Words that share a beginning share the same drawers.",
    how: [
      "Start at an empty root — no letters yet.",
      "For each letter in a word, step into (or create) the drawer for that letter.",
      "Mark the drawer for the word's last letter as 'a complete word ends here.'",
      "To check a word or prefix, walk the same drawers letter by letter.",
    ],
    when: "Autocomplete and search suggestions, spell checkers, or anything that needs to quickly find all words starting with a given prefix.",
    big: "Insert or search a word with L letters: O(L) — you only ever take as many steps as the word is long, no matter how many other words are stored.",
    mistakes: [
      "Confusing 'this is a prefix of a stored word' with 'this exact word was stored' — 'cat' being part of the path to 'catalog' doesn't mean 'cat' itself was ever inserted.",
      "Forgetting to mark the end of a word, so every stored prefix looks like a complete word (or none of them do).",
    ],
    code: {
      JavaScript: `class TrieNode {
  constructor() { this.children = {}; this.isEnd = false; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}

const trie = new Trie();
["cat", "car", "cart"].forEach((w) => trie.insert(w));

console.log("Has 'car':", trie.search("car") ? "yes" : "no");
console.log("Has 'ca':", trie.search("ca") ? "yes" : "no");
console.log("Starts with 'ca':", trie.startsWith("ca") ? "yes" : "no");
console.log("Starts with 'dog':", trie.startsWith("dog") ? "yes" : "no");`,
      Python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True
    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end
    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True

trie = Trie()
for w in ["cat", "car", "cart"]:
    trie.insert(w)

print("Has 'car':", "yes" if trie.search("car") else "no")
print("Has 'ca':", "yes" if trie.search("ca") else "no")
print("Starts with 'ca':", "yes" if trie.starts_with("ca") else "no")
print("Starts with 'dog':", "yes" if trie.starts_with("dog") else "no")`,
    },
    output: `Has 'car': yes
Has 'ca': no
Starts with 'ca': yes
Starts with 'dog': no`,
  },
  {
    id: "graph",
    pillar: "Data Structures",
    name: "Graph (Adjacency List)",
    easy: "A graph is a map of friendships. Each person is a dot, called a node. Each friendship is a line connecting two dots, called an edge. An 'adjacency list' is just a phone book: for every person, it lists their direct friends.",
    how: [
      "Store the graph as a lookup: each node maps to a list of its directly connected neighbors.",
      "Adding a connection means adding each node to the other's neighbor list.",
      "To explore from a starting point, visit a node, then visit its unvisited neighbors, and keep going — this is called a traversal.",
    ],
    when: "Modeling anything with connections: social networks, road maps, recommendation systems, or which tasks must finish before others.",
    big: "Add a connection: O(1) · Visit every node and connection once (a full traversal): O(V + E), where V is the number of nodes and E is the number of connections.",
    mistakes: [
      "Forgetting a graph can have cycles — a traversal must track which nodes it already visited, or it can loop forever.",
      "Mixing up directed vs undirected connections: in an undirected friendship graph, adding one edge must update BOTH people's neighbor lists.",
    ],
    code: {
      JavaScript: `class Graph {
  constructor() { this.adjacency = {}; }
  addNode(node) {
    if (!this.adjacency[node]) this.adjacency[node] = [];
  }
  addEdge(a, b) {
    this.addNode(a); this.addNode(b);
    this.adjacency[a].push(b);
    this.adjacency[b].push(a);
  }
  bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      for (const neighbor of this.adjacency[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return order;
  }
}

const graph = new Graph();
graph.addEdge("Amy", "Bo");
graph.addEdge("Amy", "Cy");
graph.addEdge("Bo", "Dee");
graph.addEdge("Cy", "Dee");

console.log("Visit order:", graph.bfs("Amy").join(" -> "));
console.log("Amy's friends:", graph.adjacency["Amy"].join(", "));`,
      Python: `from collections import deque

class Graph:
    def __init__(self):
        self.adjacency = {}
    def add_node(self, node):
        if node not in self.adjacency:
            self.adjacency[node] = []
    def add_edge(self, a, b):
        self.add_node(a)
        self.add_node(b)
        self.adjacency[a].append(b)
        self.adjacency[b].append(a)
    def bfs(self, start):
        visited = {start}
        queue = deque([start])
        order = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in self.adjacency[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order

graph = Graph()
graph.add_edge("Amy", "Bo")
graph.add_edge("Amy", "Cy")
graph.add_edge("Bo", "Dee")
graph.add_edge("Cy", "Dee")

print("Visit order:", " -> ".join(graph.bfs("Amy")))
print("Amy's friends:", ", ".join(graph.adjacency["Amy"]))`,
    },
    output: `Visit order: Amy -> Bo -> Cy -> Dee
Amy's friends: Bo, Cy`,
  },
  {
    id: "deque",
    pillar: "Data Structures",
    name: "Deque (Double-Ended Queue)",
    easy: "A deque (say 'deck') is a line where you can join or leave from EITHER end — like a deck of cards where you can add or draw from the top or the bottom. It's a stack and a queue rolled into one flexible tool.",
    how: [
      "addFront / addBack: put a new item at either end.",
      "removeFront / removeBack: take an item off either end.",
      "peekFront / peekBack: look at either end without removing anything.",
    ],
    when: "Sliding-window problems (like tracking the biggest number in the last K items), browser back/forward history, or a 'recently used' list where items get pulled from either end.",
    big: "Add or remove from either end: O(1) — with the right structure, both ends are equally fast, not just one.",
    mistakes: [
      "Using a plain array and calling shift()/unshift() a lot in real production code — those are slow for big lists because everything else has to shift over; a real deque avoids that.",
      "Mixing up which end is 'front' and which is 'back' when reading someone else's deque code.",
    ],
    code: {
      JavaScript: `class Deque {
  constructor() { this.items = []; }
  addFront(x) { this.items.unshift(x); }
  addBack(x) { this.items.push(x); }
  removeFront() { return this.items.shift(); }
  removeBack() { return this.items.pop(); }
  peekFront() { return this.items[0]; }
  peekBack() { return this.items[this.items.length - 1]; }
}

const dq = new Deque();
dq.addBack(2); dq.addBack(3);
dq.addFront(1);

console.log("All:", dq.items.join(" "));
console.log("Front:", dq.peekFront());
console.log("Back:", dq.peekBack());
console.log("Remove front:", dq.removeFront());
console.log("Remove back:", dq.removeBack());
console.log("Left:", dq.items.join(" "));`,
      Python: `from collections import deque

class Deque:
    def __init__(self):
        self.items = deque()
    def add_front(self, x):
        self.items.appendleft(x)
    def add_back(self, x):
        self.items.append(x)
    def remove_front(self):
        return self.items.popleft()
    def remove_back(self):
        return self.items.pop()
    def peek_front(self):
        return self.items[0]
    def peek_back(self):
        return self.items[-1]

dq = Deque()
dq.add_back(2); dq.add_back(3)
dq.add_front(1)

print("All:", " ".join(str(x) for x in dq.items))
print("Front:", dq.peek_front())
print("Back:", dq.peek_back())
print("Remove front:", dq.remove_front())
print("Remove back:", dq.remove_back())
print("Left:", " ".join(str(x) for x in dq.items))`,
    },
    output: `All: 1 2 3
Front: 1
Back: 3
Remove front: 1
Remove back: 3
Left: 2`,
    note: "Python's collections.deque is a true double-ended queue — O(1) at both ends. The JS version here uses a plain array with shift()/unshift() for simplicity, which is O(n) at the front in real large-scale code.",
  },
  {
    id: "union-find",
    pillar: "Data Structures",
    name: "Union-Find (Disjoint Set)",
    easy: "Union-Find is like tracking friend groups at a party. Everyone starts alone, in their own tiny group. When two people become friends, their two whole groups merge into one. To check 'are these two in the same group?', you don't list every member — you just look up each person's group leader and see if the leaders match.",
    how: [
      "find(x): follow x's 'leader' pointer up the chain until you reach someone who is their own leader — that's the group's representative.",
      "While following that chain, point every node straight at the final leader (path compression), so the next find is instant.",
      "union(a, b): find both leaders; if they differ, make one leader point to the other so the two groups become one.",
      "connected(a, b): true exactly when find(a) and find(b) land on the same leader.",
    ],
    when: "Detecting cycles in a graph, building a minimum spanning tree (Kruskal's algorithm), or grouping things into 'friend circles' — anything that keeps asking 'are these two already connected?' while connections are added over time.",
    big: "find and union: O(α(n)) each — α is the inverse Ackermann function, a number so small (under 5, ever) it's effectively constant time in practice, thanks to path compression.",
    mistakes: [
      "Forgetting path compression (or union by rank/size) — without either, the chains can grow long and every find degrades toward O(n).",
      "Calling union on two items already in the same group and expecting something to happen — it's a no-op, which is correct, not a bug.",
    ],
    code: {
      JavaScript: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }
  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return;
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA]++;
    }
  }
  connected(a, b) {
    return this.find(a) === this.find(b);
  }
}

const uf = new UnionFind(6); // six people, numbered 0..5
uf.union(0, 1);
uf.union(1, 2);
uf.union(3, 4);

console.log("0 and 2 connected:", uf.connected(0, 2) ? "yes" : "no");
console.log("0 and 3 connected:", uf.connected(0, 3) ? "yes" : "no");
uf.union(2, 3);
console.log("0 and 3 connected:", uf.connected(0, 3) ? "yes" : "no");
console.log("5 and 0 connected:", uf.connected(5, 0) ? "yes" : "no");`,
      Python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]
    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return
        if self.rank[root_a] < self.rank[root_b]:
            self.parent[root_a] = root_b
        elif self.rank[root_a] > self.rank[root_b]:
            self.parent[root_b] = root_a
        else:
            self.parent[root_b] = root_a
            self.rank[root_a] += 1
    def connected(self, a, b):
        return self.find(a) == self.find(b)

uf = UnionFind(6)  # six people, numbered 0..5
uf.union(0, 1)
uf.union(1, 2)
uf.union(3, 4)

print("0 and 2 connected:", "yes" if uf.connected(0, 2) else "no")
print("0 and 3 connected:", "yes" if uf.connected(0, 3) else "no")
uf.union(2, 3)
print("0 and 3 connected:", "yes" if uf.connected(0, 3) else "no")
print("5 and 0 connected:", "yes" if uf.connected(5, 0) else "no")`,
    },
    output: `0 and 2 connected: yes
0 and 3 connected: no
0 and 3 connected: yes
5 and 0 connected: no`,
  },
  {
    id: "lru-cache",
    pillar: "Data Structures",
    name: "LRU Cache",
    easy: "An LRU (Least Recently Used) cache is a small whiteboard with a fixed number of slots. Every time you write or reread something, it moves to the 'freshest' spot. When the board is full and you need to add something new, you erase whatever hasn't been touched in the longest time.",
    how: [
      "Store key → value pairs in a structure that remembers insertion order (like a Map, or a dict in modern Python).",
      "On get(key): if the key exists, move it to the 'most recently used' end before returning its value.",
      "On put(key, value): if the cache is already at capacity and this is a brand-new key, remove whatever sits at the 'least recently used' end first.",
      "Add or update the key at the 'most recently used' end.",
    ],
    when: "Caching database query results, browser tabs, image thumbnails, or any fixed-size cache where you want to keep what's hot and drop what's gone cold.",
    big: "get and put: O(1) each, using a hash map combined with an order-preserving structure — no scanning needed to find the oldest entry.",
    mistakes: [
      "Forgetting that a get() also counts as 'using' an item — it must refresh that item's position, not just insert() does.",
      "Evicting on every put() instead of only when the cache is full AND the key is genuinely new.",
    ],
    code: {
      JavaScript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // Map remembers insertion order in JS
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value); // move to the most-recently-used end
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value; // front = least recently used
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}

const cache = new LRUCache(2);
cache.put("a", 1);
cache.put("b", 2);
console.log("get a:", cache.get("a")); // touching 'a' makes it the freshest
cache.put("c", 3); // cache is full — evicts 'b', the least recently used
console.log("get b:", cache.get("b"));
console.log("get a:", cache.get("a"));
console.log("get c:", cache.get("c"));`,
      Python: `class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}  # regular dicts preserve insertion order in modern Python
    def get(self, key):
        if key not in self.map:
            return -1
        value = self.map.pop(key)
        self.map[key] = value  # move to the most-recently-used end
        return value
    def put(self, key, value):
        if key in self.map:
            del self.map[key]
        elif len(self.map) >= self.capacity:
            oldest_key = next(iter(self.map))  # front = least recently used
            del self.map[oldest_key]
        self.map[key] = value

cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
print("get a:", cache.get("a"))  # touching 'a' makes it the freshest
cache.put("c", 3)  # cache is full — evicts 'b', the least recently used
print("get b:", cache.get("b"))
print("get a:", cache.get("a"))
print("get c:", cache.get("c"))`,
    },
    output: `get a: 1
get b: -1
get a: 1
get c: 3`,
  },
  {
    id: "circular-buffer",
    pillar: "Data Structures",
    name: "Circular Buffer (Ring Buffer)",
    easy: "A circular buffer is a merry-go-round with a fixed number of seats. New riders keep boarding, and once every seat is taken, the next new rider bumps off whoever has been sitting there the longest. The 'track' has a fixed size, but it just keeps looping around instead of running out of room.",
    how: [
      "Reserve a fixed-size array up front — the capacity never grows.",
      "Keep track of where the oldest item lives (start) and how many slots are currently filled (count).",
      "write(value): place the new value right after the newest item, wrapping back to index 0 once you run off the end.",
      "Once the buffer is full, writing a new value overwrites the oldest one and slides 'start' forward by one.",
    ],
    when: "Streaming the last N sensor readings, a fixed-size 'recent activity' log, audio/video buffering, or any rolling window where old data should just fall off automatically.",
    big: "write: O(1) — always, whether the buffer is empty, partially full, or completely full, because there's no shifting of other elements.",
    mistakes: [
      "Confusing a circular buffer with a normal array that just keeps growing — its whole point is a FIXED size, with old data quietly overwritten.",
      "Forgetting the modulo (wrap-around) math, so the 'next' index walks off the end of the array instead of looping back to 0.",
    ],
    code: {
      JavaScript: `class CircularBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = new Array(capacity).fill(null);
    this.start = 0; // index of the oldest item
    this.count = 0;
  }
  write(value) {
    const end = (this.start + this.count) % this.capacity;
    this.items[end] = value;
    if (this.count < this.capacity) {
      this.count++;
    } else {
      this.start = (this.start + 1) % this.capacity; // full: oldest gets overwritten
    }
  }
  toArray() {
    const out = [];
    for (let i = 0; i < this.count; i++) {
      out.push(this.items[(this.start + i) % this.capacity]);
    }
    return out;
  }
}

const buf = new CircularBuffer(3);
buf.write(1); buf.write(2); buf.write(3);
console.log("Buffer:", buf.toArray().join(" "));
buf.write(4); // wraps around, overwriting the oldest value (1)
console.log("Buffer:", buf.toArray().join(" "));
buf.write(5);
console.log("Buffer:", buf.toArray().join(" "));
console.log("Count:", buf.count);`,
      Python: `class CircularBuffer:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = [None] * capacity
        self.start = 0  # index of the oldest item
        self.count = 0
    def write(self, value):
        end = (self.start + self.count) % self.capacity
        self.items[end] = value
        if self.count < self.capacity:
            self.count += 1
        else:
            self.start = (self.start + 1) % self.capacity  # full: oldest gets overwritten
    def to_list(self):
        return [self.items[(self.start + i) % self.capacity] for i in range(self.count)]

buf = CircularBuffer(3)
buf.write(1); buf.write(2); buf.write(3)
print("Buffer:", " ".join(str(v) for v in buf.to_list()))
buf.write(4)  # wraps around, overwriting the oldest value (1)
print("Buffer:", " ".join(str(v) for v in buf.to_list()))
buf.write(5)
print("Buffer:", " ".join(str(v) for v in buf.to_list()))
print("Count:", buf.count)`,
    },
    output: `Buffer: 1 2 3
Buffer: 2 3 4
Buffer: 3 4 5
Count: 3`,
  },
  {
    id: "bloom-filter",
    pillar: "Data Structures",
    name: "Bloom Filter",
    easy: "A Bloom filter is a bouncer with a bad memory but a clever trick. It doesn't remember names — instead, whenever someone is added, it flips a few switches on a shared panel. To check a name later, it looks at those same switches: any switch still off means that person definitely was never added. All switches on means probably added — but that could just be a coincidence, called a false positive. One thing it never does: wrongly say 'no' to someone who really was added.",
    how: [
      "Start with a fixed-size row of switches (bits), all off (0).",
      "add(item): run the item through a couple of different hash functions, each pointing at one switch, and flip those switches on.",
      "mightContain(item): run the same hash functions again — if EVERY one of those switches is on, say 'probably yes'; if even one is off, say 'definitely no'.",
      "Nothing is ever removed or stored directly — only the switches remember anything happened.",
    ],
    when: "Quickly rejecting 'definitely not in the set' before doing an expensive lookup — checking a username against millions of taken ones, or asking 'have we crawled this URL before?' — when a rare false positive is fine but a false negative is not.",
    big: "add and mightContain: O(k), where k is the number of hash functions — a small constant, so both are effectively instant, and it uses far less memory than storing every item.",
    mistakes: [
      "Treating 'might contain' as a guarantee — a Bloom filter can say yes for something never added (a false positive), so always follow up with a real check when it matters.",
      "Trying to remove an item — a basic Bloom filter can't; flipping a switch off could accidentally make a different, still-present item disappear too.",
    ],
    code: {
      JavaScript: `class BloomFilter {
  constructor(size) {
    this.size = size;
    this.bits = new Array(size).fill(0);
  }
  _hash1(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h += str.charCodeAt(i);
    return h % this.size;
  }
  _hash2(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h += (i + 1) * str.charCodeAt(i);
    return h % this.size;
  }
  add(str) {
    this.bits[this._hash1(str)] = 1;
    this.bits[this._hash2(str)] = 1;
  }
  mightContain(str) {
    return this.bits[this._hash1(str)] === 1 && this.bits[this._hash2(str)] === 1;
  }
}

const filter = new BloomFilter(20);
["apple", "banana", "cherry"].forEach((w) => filter.add(w));

console.log("Might have apple:", filter.mightContain("apple") ? "yes" : "no");
console.log("Might have banana:", filter.mightContain("banana") ? "yes" : "no");
console.log("Might have kiwi:", filter.mightContain("kiwi") ? "yes" : "no");
console.log("Bits set:", filter.bits.join(""));`,
      Python: `class BloomFilter:
    def __init__(self, size):
        self.size = size
        self.bits = [0] * size
    def _hash1(self, s):
        h = 0
        for ch in s:
            h += ord(ch)
        return h % self.size
    def _hash2(self, s):
        h = 0
        for i, ch in enumerate(s):
            h += (i + 1) * ord(ch)
        return h % self.size
    def add(self, s):
        self.bits[self._hash1(s)] = 1
        self.bits[self._hash2(s)] = 1
    def might_contain(self, s):
        return self.bits[self._hash1(s)] == 1 and self.bits[self._hash2(s)] == 1

filt = BloomFilter(20)
for w in ["apple", "banana", "cherry"]:
    filt.add(w)

print("Might have apple:", "yes" if filt.might_contain("apple") else "no")
print("Might have banana:", "yes" if filt.might_contain("banana") else "no")
print("Might have kiwi:", "yes" if filt.might_contain("kiwi") else "no")
print("Bits set:", "".join(str(b) for b in filt.bits))`,
    },
    output: `Might have apple: yes
Might have banana: yes
Might have kiwi: no
Bits set: 00100000011001100000`,
    note: "Real-world Bloom filters use more hash functions and careful sizing to keep false positives rare. This lesson uses just two simple hash functions so you can trace the bit flips by hand.",
  },
  {
    id: "fenwick-tree",
    pillar: "Data Structures",
    name: "Fenwick Tree (Binary Indexed Tree)",
    easy: "A Fenwick tree is a row of donation jars, but a clever kind. One single running-total jar is slow to update. A full day-by-day list is slow to add up. Instead, each jar here covers a different-sized range of days, so getting 'the total so far' means peeking into just a handful of jars — not adding up every single day.",
    how: [
      "Store values in a 1-indexed array (position 0 is unused, real data starts at position 1).",
      "update(i, delta): add delta to position i, then hop to i + (i's lowest set bit) and repeat until you walk off the end — updating every jar that covers position i.",
      "prefixSum(i): add up the jar at position i, then hop to i − (i's lowest set bit) and repeat until you hit 0 — visiting only O(log n) jars.",
      "rangeSum(l, r): just prefixSum(r) − prefixSum(l − 1) — the sum of everything up to r, minus everything before l.",
    ],
    when: "Running totals that change often — live leaderboards, cumulative sales by day, or counting how many items are 'less than X' seen so far — anywhere you need both fast updates AND fast prefix sums.",
    big: "update and prefixSum: O(log n) each, because every step jumps by a power of two instead of visiting every element — much faster than recomputing a sum from scratch (O(n)) after every change.",
    mistakes: [
      "Using index 0 for real data — Fenwick trees rely on 1-indexing; i & (-i) breaks down at index 0.",
      "Reaching for a Fenwick tree when values never change — if the data is fixed, a simple precomputed prefix-sum array is simpler and just as fast to query.",
    ],
    code: {
      JavaScript: `class FenwickTree {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0);
  }
  update(i, delta) {
    for (; i <= this.n; i += i & -i) {
      this.tree[i] += delta;
    }
  }
  prefixSum(i) {
    let sum = 0;
    for (; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }
  rangeSum(l, r) {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }
}

const values = [5, 3, 7, 9, 1, 4]; // treated as 1-indexed positions 1..6
const fenwick = new FenwickTree(values.length);
values.forEach((v, idx) => fenwick.update(idx + 1, v));

console.log("Sum of first 3:", fenwick.prefixSum(3));
console.log("Sum of 2..4:", fenwick.rangeSum(2, 4));
fenwick.update(2, 10); // add 10 to position 2
console.log("Sum of first 3 after update:", fenwick.prefixSum(3));
console.log("Total sum:", fenwick.prefixSum(6));`,
      Python: `class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)
    def update(self, i, delta):
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)
    def prefix_sum(self, i):
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)
        return total
    def range_sum(self, l, r):
        return self.prefix_sum(r) - self.prefix_sum(l - 1)

values = [5, 3, 7, 9, 1, 4]  # treated as 1-indexed positions 1..6
fenwick = FenwickTree(len(values))
for idx, v in enumerate(values):
    fenwick.update(idx + 1, v)

print("Sum of first 3:", fenwick.prefix_sum(3))
print("Sum of 2..4:", fenwick.range_sum(2, 4))
fenwick.update(2, 10)  # add 10 to position 2
print("Sum of first 3 after update:", fenwick.prefix_sum(3))
print("Total sum:", fenwick.prefix_sum(6))`,
    },
    output: `Sum of first 3: 15
Sum of 2..4: 19
Sum of first 3 after update: 25
Total sum: 39`,
  },
  {
    id: "matrix",
    pillar: "Data Structures",
    name: "Matrix (2D Grid)",
    easy: "A matrix is a spreadsheet: rows and columns of cells, where every cell is found by two numbers instead of one — its row and its column. Under the hood it's usually just 'a list of lists': the outer list holds the rows, and each row is itself a list of cell values.",
    how: [
      "Build a grid of rows and columns, each cell reachable as grid[row][col].",
      "Read or write a cell directly using its row and column index.",
      "Walk the whole grid with a nested loop: an outer loop over rows, an inner loop over columns.",
      "Transpose flips rows into columns: the value at [row][col] moves to [col][row] in a new grid.",
    ],
    when: "Anything laid out on a grid: spreadsheets, game boards (chess, Tic-Tac-Toe, Minesweeper), images (rows of pixels), or grid-based pathfinding maps.",
    big: "Read/write a cell: O(1) · Visit every cell: O(rows × cols) · Transpose: O(rows × cols), since every cell is copied exactly once.",
    mistakes: [
      "Swapping row and column by accident — grid[row][col] and grid[col][row] are usually different cells unless the grid is square and symmetric.",
      "Assuming every row has the same length after building a grid by hand — a 'ragged' 2D array (rows of different lengths) will break code that expects a clean rectangle.",
    ],
    code: {
      JavaScript: `class Matrix {
  constructor(rows, cols, fill = 0) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => new Array(cols).fill(fill));
  }
  set(r, c, value) { this.grid[r][c] = value; }
  get(r, c) { return this.grid[r][c]; }
  rowSum(r) { return this.grid[r].reduce((a, b) => a + b, 0); }
  transpose() {
    const t = new Matrix(this.cols, this.rows);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        t.set(c, r, this.grid[r][c]);
      }
    }
    return t;
  }
  toString() {
    return this.grid.map((row) => row.join(" ")).join(" | ");
  }
}

const m = new Matrix(2, 3);
let value = 1;
for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 3; c++) {
    m.set(r, c, value);
    value++;
  }
}

console.log("Grid:", m.toString());
console.log("Cell (1,2):", m.get(1, 2));
console.log("Row 0 sum:", m.rowSum(0));
const t = m.transpose();
console.log("Transposed:", t.toString());`,
      Python: `class Matrix:
    def __init__(self, rows, cols, fill=0):
        self.rows = rows
        self.cols = cols
        self.grid = [[fill] * cols for _ in range(rows)]
    def set(self, r, c, value):
        self.grid[r][c] = value
    def get(self, r, c):
        return self.grid[r][c]
    def row_sum(self, r):
        return sum(self.grid[r])
    def transpose(self):
        t = Matrix(self.cols, self.rows)
        for r in range(self.rows):
            for c in range(self.cols):
                t.set(c, r, self.grid[r][c])
        return t
    def to_string(self):
        return " | ".join(" ".join(str(v) for v in row) for row in self.grid)

m = Matrix(2, 3)
value = 1
for r in range(2):
    for c in range(3):
        m.set(r, c, value)
        value += 1

print("Grid:", m.to_string())
print("Cell (1,2):", m.get(1, 2))
print("Row 0 sum:", m.row_sum(0))
t = m.transpose()
print("Transposed:", t.to_string())`,
    },
    output: `Grid: 1 2 3 | 4 5 6
Cell (1,2): 6
Row 0 sum: 6
Transposed: 1 4 | 2 5 | 3 6`,
  },
  {
    id: "priority-queue",
    pillar: "Data Structures",
    name: "Priority Queue",
    easy: "A priority queue is airport boarding, not a coffee line. It doesn't matter who arrived at the gate first — whoever has the best priority (first class, then priority members, then everyone else) boards next. Every item carries a priority number, and the item that leaves next is always the one with the best priority, not the oldest one.",
    how: [
      "enqueue(item, priority): add the item along with its priority number.",
      "dequeue(): find and remove whichever item currently has the best priority (here, the lowest number).",
      "peek(): look at what would leave next, without removing it.",
    ],
    when: "Task schedulers, hospital triage, or turn-based games where 'most important next' matters more than 'arrived first' — anywhere arrival order isn't what should decide who goes next.",
    big: "With a simple sorted list (as below): enqueue O(n), dequeue O(1). With a heap (see Min-Heap) both become O(log n) — the standard real-world choice for a priority queue.",
    mistakes: [
      "Confusing it with a regular queue — a priority queue can let a brand-new item cut straight to the front if its priority is high enough.",
      "Not deciding up front whether 'lower number' or 'higher number' means more urgent, and then mixing the two up while adding items.",
    ],
    code: {
      JavaScript: `class PriorityQueue {
  constructor() { this.items = []; } // each item: { value, priority }
  enqueue(value, priority) {
    const node = { value, priority };
    let i = 0;
    while (i < this.items.length && this.items[i].priority <= priority) i++;
    this.items.splice(i, 0, node);
  }
  dequeue() {
    const node = this.items.shift();
    return node ? node.value : undefined;
  }
  peek() {
    return this.items.length ? this.items[0].value : undefined;
  }
  size() { return this.items.length; }
}

const pq = new PriorityQueue();
pq.enqueue("economy", 3);
pq.enqueue("first-class", 1);
pq.enqueue("priority", 2);

console.log("Boards next:", pq.peek());
console.log("Board:", pq.dequeue());
console.log("Board:", pq.dequeue());
console.log("Remaining:", pq.size());`,
      Python: `class PriorityQueue:
    def __init__(self):
        self.items = []  # each item: (value, priority)

    def enqueue(self, value, priority):
        i = 0
        while i < len(self.items) and self.items[i][1] <= priority:
            i += 1
        self.items.insert(i, (value, priority))

    def dequeue(self):
        if not self.items:
            return None
        value, _ = self.items.pop(0)
        return value

    def peek(self):
        return self.items[0][0] if self.items else None

    def size(self):
        return len(self.items)

pq = PriorityQueue()
pq.enqueue("economy", 3)
pq.enqueue("first-class", 1)
pq.enqueue("priority", 2)

print("Boards next:", pq.peek())
print("Board:", pq.dequeue())
print("Board:", pq.dequeue())
print("Remaining:", pq.size())`,
    },
    output: `Boards next: first-class
Board: first-class
Board: priority
Remaining: 1`,
  },
  {
    id: "frequency-map",
    pillar: "Data Structures",
    name: "Counter / Frequency Map",
    easy: "A frequency map is a tally chart at a school election. Instead of writing every vote down one by one, you keep a single running count next to each candidate's name and bump it up each time their name comes up. It's a hash map whose values are always 'how many times have I seen this?' — sometimes called a multiset, because it tracks duplicates without storing every single copy.",
    how: [
      "Start with an empty map from item to count.",
      "Every time an item appears, look up its current count (or 0 if it's brand new) and add 1.",
      "To read: check any single item's count directly, or scan the whole map to find the item with the highest count.",
    ],
    when: "Counting word frequency in text, finding the most common item in a list, checking if two words are anagrams (same letter counts), or tracking how many times each event happened.",
    big: "Add or update one count: O(1) · Build the full frequency map for n items: O(n) · Find the most common item: O(k), where k is the number of distinct items.",
    mistakes: [
      "Forgetting the default of 0 for an item you haven't seen yet, which crashes the very first count.",
      "Confusing 'the highest count' with 'the item that has it' — you want the key whose count is highest, not the count number itself.",
    ],
    code: {
      JavaScript: `const text = "mississippi";
const counts = {};
for (const ch of text) {
  counts[ch] = (counts[ch] || 0) + 1;
}

let mostCommon = null;
let best = 0;
for (const ch of Object.keys(counts)) {
  if (counts[ch] > best) {
    best = counts[ch];
    mostCommon = ch;
  }
}

console.log("i count:", counts["i"]);
console.log("s count:", counts["s"]);
console.log("p count:", counts["p"]);
console.log("Most common:", mostCommon + " (" + best + ")");`,
      Python: `text = "mississippi"
counts = {}
for ch in text:
    counts[ch] = counts.get(ch, 0) + 1

most_common = None
best = 0
for ch in counts:
    if counts[ch] > best:
        best = counts[ch]
        most_common = ch

print("i count:", counts["i"])
print("s count:", counts["s"])
print("p count:", counts["p"])
print("Most common:", most_common + " (" + str(best) + ")")`,
    },
    output: `i count: 4
s count: 4
p count: 2
Most common: i (4)`,
  },
  {
    id: "adjacency-matrix",
    pillar: "Data Structures",
    name: "Adjacency Matrix",
    easy: "An adjacency matrix is a friendship spreadsheet. Write everyone's name across the top AND down the side. To check if two people are friends, find the cell where their row and column meet: a 1 means friends, a 0 means not. It's the same map of connections as an adjacency list — just stored as a grid instead of a phone book.",
    how: [
      "Make an N x N grid of zeros, one row and one column per node (N = number of nodes).",
      "To connect node A and node B, set grid[A][B] = 1 (and grid[B][A] = 1 too, if the connection goes both ways).",
      "To check if two nodes are connected, just read one cell, grid[A][B] — no searching needed.",
      "To find all of a node's neighbors, scan its whole row and collect every column that's a 1.",
    ],
    when: "Dense graphs where most pairs of nodes ARE connected, or whenever 'are A and B connected?' needs to be instant and extra memory is no problem.",
    big: "Check if two specific nodes are connected: O(1), one cell lookup · Find all neighbors of a node: O(n), scanning its row · Space: O(n^2), even if there are very few actual connections.",
    mistakes: [
      "Using an adjacency matrix for a huge, sparse graph (few actual connections) — you'd allocate n^2 cells to store only a handful of 1s; an adjacency list is far lighter there.",
      "Forgetting to mirror the update for an undirected graph — setting grid[A][B] = 1 without also setting grid[B][A] = 1 leaves the connection 'visible' from only one side.",
    ],
    code: {
      JavaScript: `class AdjacencyMatrix {
  constructor(names) {
    this.names = names; // index -> name
    const n = names.length;
    this.grid = Array.from({ length: n }, () => new Array(n).fill(0));
  }
  _index(name) { return this.names.indexOf(name); }
  addEdge(a, b) {
    const i = this._index(a);
    const j = this._index(b);
    this.grid[i][j] = 1;
    this.grid[j][i] = 1;
  }
  connected(a, b) {
    const i = this._index(a);
    const j = this._index(b);
    return this.grid[i][j] === 1;
  }
  neighbors(a) {
    const i = this._index(a);
    const out = [];
    for (let j = 0; j < this.names.length; j++) {
      if (this.grid[i][j] === 1) out.push(this.names[j]);
    }
    return out;
  }
}

const names = ["Amy", "Bo", "Cy", "Dee"];
const g = new AdjacencyMatrix(names);
g.addEdge("Amy", "Bo");
g.addEdge("Amy", "Cy");
g.addEdge("Bo", "Dee");

console.log("Amy-Bo connected:", g.connected("Amy", "Bo") ? "yes" : "no");
console.log("Amy-Dee connected:", g.connected("Amy", "Dee") ? "yes" : "no");
console.log("Amy's friends:", g.neighbors("Amy").join(", "));
console.log("Dee's friends:", g.neighbors("Dee").join(", "));`,
      Python: `class AdjacencyMatrix:
    def __init__(self, names):
        self.names = names  # index -> name
        n = len(names)
        self.grid = [[0] * n for _ in range(n)]

    def _index(self, name):
        return self.names.index(name)

    def add_edge(self, a, b):
        i = self._index(a)
        j = self._index(b)
        self.grid[i][j] = 1
        self.grid[j][i] = 1

    def connected(self, a, b):
        i = self._index(a)
        j = self._index(b)
        return self.grid[i][j] == 1

    def neighbors(self, a):
        i = self._index(a)
        out = []
        for j in range(len(self.names)):
            if self.grid[i][j] == 1:
                out.append(self.names[j])
        return out

names = ["Amy", "Bo", "Cy", "Dee"]
g = AdjacencyMatrix(names)
g.add_edge("Amy", "Bo")
g.add_edge("Amy", "Cy")
g.add_edge("Bo", "Dee")

print("Amy-Bo connected:", "yes" if g.connected("Amy", "Bo") else "no")
print("Amy-Dee connected:", "yes" if g.connected("Amy", "Dee") else "no")
print("Amy's friends:", ", ".join(g.neighbors("Amy")))
print("Dee's friends:", ", ".join(g.neighbors("Dee")))`,
    },
    output: `Amy-Bo connected: yes
Amy-Dee connected: no
Amy's friends: Bo, Cy
Dee's friends: Bo`,
  },
  {
    id: "min-stack",
    pillar: "Data Structures",
    name: "Min-Stack",
    easy: "A min-stack is a pile of plates where each plate secretly remembers the smallest number in the whole pile at the moment it was placed. Even though you can only see the top plate, that top plate's secret note always tells you the smallest number anywhere in the pile — instantly, with no digging.",
    how: [
      "Keep two stacks side by side: a main stack for the actual values, and a mini stack that tracks the running minimum.",
      "push(x): push x onto the main stack. Also push onto the mini stack whichever is smaller — x, or the mini stack's current top (or just x, if the mini stack is empty).",
      "pop(): pop from both stacks together, so they always stay the same size and in sync.",
      "getMin(): just peek at the top of the mini stack — the smallest value is always sitting right there.",
    ],
    when: "Anywhere you need normal stack behavior (push/pop/peek) PLUS 'what's the smallest value in here right now?' answered instantly, instead of scanning the whole stack every time.",
    big: "push, pop, peek, getMin: all O(1) — the mini stack means you never have to scan the whole stack to find the minimum.",
    mistakes: [
      "Popping from only the main stack and forgetting the mini stack — then the two stacks fall out of sync and getMin() starts lying.",
      "Assuming you need to search for the new minimum on every push — you don't; just compare the new value to the mini stack's current top.",
    ],
    code: {
      JavaScript: `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(x) {
    this.stack.push(x);
    if (this.minStack.length === 0 || x < this.minStack[this.minStack.length - 1]) {
      this.minStack.push(x);
    } else {
      this.minStack.push(this.minStack[this.minStack.length - 1]);
    }
  }
  pop() {
    this.minStack.pop();
    return this.stack.pop();
  }
  peek() { return this.stack[this.stack.length - 1]; }
  getMin() { return this.minStack[this.minStack.length - 1]; }
}

const ms = new MinStack();
ms.push(5); ms.push(2); ms.push(7); ms.push(1);

console.log("Min:", ms.getMin());
console.log("Pop:", ms.pop());
console.log("Min:", ms.getMin());
console.log("Pop:", ms.pop());
console.log("Min:", ms.getMin());`,
      Python: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, x):
        self.stack.append(x)
        if not self.min_stack or x < self.min_stack[-1]:
            self.min_stack.append(x)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self):
        self.min_stack.pop()
        return self.stack.pop()

    def peek(self):
        return self.stack[-1]

    def get_min(self):
        return self.min_stack[-1]

ms = MinStack()
ms.push(5); ms.push(2); ms.push(7); ms.push(1)

print("Min:", ms.get_min())
print("Pop:", ms.pop())
print("Min:", ms.get_min())
print("Pop:", ms.pop())
print("Min:", ms.get_min())`,
    },
    output: `Min: 1
Pop: 1
Min: 2
Pop: 7
Min: 2`,
  },
  {
    id: "segment-tree",
    pillar: "Data Structures",
    name: "Segment Tree",
    easy: "A segment tree is a company's reporting chain, built to answer 'what's our total?' instantly. Every employee, a leaf, reports one number. Each manager's number is just their two direct reports added together. This keeps going up, level by level, until the person at the top holds the grand total of everyone below. Change one employee's number, and only the managers directly above them need to redo their math — not the whole company.",
    how: [
      "Build a tree where each leaf holds one array value, and each parent holds the combined result (here, the sum) of its two children.",
      "The node at the top ends up holding the combined result for the whole array — for a sum tree, the grand total.",
      "update(i, value): change one leaf's value, then walk back up to the top, recomputing each ancestor along the way.",
      "query(l, r): combine only the handful of nodes that exactly cover the range [l, r), skipping everything outside it.",
    ],
    when: "Frequent range queries (sum, min, or max over a range) mixed with frequent updates to individual elements — like a leaderboard that must answer 'what's the total score between rank 10 and 50?' right after every new score comes in.",
    big: "build: O(n) once · update: O(log n) · range query: O(log n) — both far faster than recomputing a range from scratch (O(n)) after every change.",
    mistakes: [
      "Reaching for a segment tree when the array never changes — a precomputed prefix-sum array answers range-sum queries just as fast, with much simpler code.",
      "Forgetting that after update(i, value), every ancestor of that leaf must be recomputed on the way back up, or the tree quietly keeps stale totals.",
    ],
    code: {
      JavaScript: `class SegmentTree {
  constructor(values) {
    this.n = values.length;
    this.tree = new Array(2 * this.n).fill(0);
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = values[i];
    for (let i = this.n - 1; i >= 1; i--) this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
  }
  update(i, value) {
    let pos = i + this.n;
    this.tree[pos] = value;
    while (pos > 1) {
      pos = Math.floor(pos / 2);
      this.tree[pos] = this.tree[2 * pos] + this.tree[2 * pos + 1];
    }
  }
  query(l, r) { // sum of [l, r)
    let res = 0;
    l += this.n;
    r += this.n;
    while (l < r) {
      if (l % 2 === 1) { res += this.tree[l]; l++; }
      if (r % 2 === 1) { r--; res += this.tree[r]; }
      l = Math.floor(l / 2);
      r = Math.floor(r / 2);
    }
    return res;
  }
}

const values = [1, 3, 5, 7, 9, 11];
const seg = new SegmentTree(values);

console.log("Total sum:", seg.query(0, 6));
console.log("Sum of indices 1..3:", seg.query(1, 4));
seg.update(2, 100);
console.log("After update, total:", seg.query(0, 6));
console.log("After update, indices 1..3:", seg.query(1, 4));`,
      Python: `class SegmentTree:
    def __init__(self, values):
        self.n = len(values)
        self.tree = [0] * (2 * self.n)
        for i in range(self.n):
            self.tree[self.n + i] = values[i]
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, i, value):
        pos = i + self.n
        self.tree[pos] = value
        while pos > 1:
            pos //= 2
            self.tree[pos] = self.tree[2 * pos] + self.tree[2 * pos + 1]

    def query(self, l, r):  # sum of [l, r)
        res = 0
        l += self.n
        r += self.n
        while l < r:
            if l % 2 == 1:
                res += self.tree[l]
                l += 1
            if r % 2 == 1:
                r -= 1
                res += self.tree[r]
            l //= 2
            r //= 2
        return res

values = [1, 3, 5, 7, 9, 11]
seg = SegmentTree(values)

print("Total sum:", seg.query(0, 6))
print("Sum of indices 1..3:", seg.query(1, 4))
seg.update(2, 100)
print("After update, total:", seg.query(0, 6))
print("After update, indices 1..3:", seg.query(1, 4))`,
    },
    output: `Total sum: 36
Sum of indices 1..3: 15
After update, total: 131
After update, indices 1..3: 110`,
  },
  {
    id: "tuple",
    pillar: "Data Structures",
    name: "Tuple",
    easy: "A tuple is a sealed gift box with numbered slots: slot 1 always holds the ribbon color, slot 2 always holds the size. You can peek inside and read any slot any time, but you can't swap out what's in slot 2 without unwrapping a whole new box — once a tuple is made, it's locked (immutable). Nothing inside it can change.",
    how: [
      "Group a fixed set of values together, in a fixed order, sealed at the moment you create it.",
      "Read any value by its position (index), exactly like an array.",
      "Unpack the whole tuple into separate named variables in one line, if the language supports it.",
      "To 'change' anything, build and return a brand new tuple — the original one never mutates.",
    ],
    when: "Returning more than one value from a function (like a minimum and a maximum together), or representing a small fixed record — a color as (r, g, b), a point as (x, y) — where each position's meaning is fixed and should never accidentally shift.",
    big: "Read by index: O(1) · Create: O(n) for n elements · No add/remove after creation — the size is locked in forever.",
    mistakes: [
      "Trying to mutate a tuple in place (like tup[0] = 5) — real tuples reject this outright; treat them as a stamped, read-only record, not a growable list.",
      "Reaching for a tuple when you actually need a variable-length, growable collection — that job belongs to an array/list, not a tuple.",
    ],
    code: {
      JavaScript: `const point = Object.freeze([3, 4]); // an immutable (x, y) pair
console.log("x:", point[0]);
console.log("y:", point[1]);

const [px, py] = point; // unpack into named variables
console.log("Unpacked:", px + "," + py);

function minMax(nums) {
  return Object.freeze([Math.min(...nums), Math.max(...nums)]);
}
const result = minMax([7, 2, 9, 4]);
console.log("Min:", result[0]);
console.log("Max:", result[1]);

let blocked = false;
try {
  point[0] = 99; // sealed — this throws instead of silently changing anything
} catch (e) {
  blocked = true;
}
console.log("Blocked:", blocked ? "yes" : "no");
console.log("Still:", point[0]);`,
      Python: `point = (3, 4)  # an immutable (x, y) pair
print("x:", point[0])
print("y:", point[1])

px, py = point  # unpack into named variables
print("Unpacked:", f"{px},{py}")


def min_max(nums):
    return (min(nums), max(nums))


result = min_max([7, 2, 9, 4])
print("Min:", result[0])
print("Max:", result[1])

blocked = False
try:
    point[0] = 99  # sealed — this raises instead of silently changing anything
except TypeError:
    blocked = True

print("Blocked:", "yes" if blocked else "no")
print("Still:", point[0])`,
    },
    output: `x: 3
y: 4
Unpacked: 3,4
Min: 2
Max: 9
Blocked: yes
Still: 3`,
    note: "JavaScript has no native tuple type, so this lesson simulates one with Object.freeze on an array — it seals the array so any write to it throws. Python's tuple is immutable by design, no freezing needed.",
  },
  {
    id: "sorted-set",
    pillar: "Data Structures",
    name: "Sorted Set",
    easy: "A sorted set is a bookshelf where, the moment you add a book, you slide it straight into alphabetical position instead of dumping it at the end. The shelf is always in order, and if you try to add a book that's already there, nothing changes — it's already shelved.",
    how: [
      "Keep only unique items, like a normal set — adding the same item twice changes nothing.",
      "But also keep every item in sorted order at all times, not just any order.",
      "Insert a new item by finding exactly where it belongs (its sorted position) and sliding it into that spot.",
      "Because the layout is always sorted, questions like 'what's the smallest?' or 'what's everything between 20 and 60?' are cheap to answer.",
    ],
    when: "Leaderboards that must display scores in order at all times, range questions like 'every score between 50 and 90,' or removing duplicates from data while keeping it sorted for display.",
    big: "Insert (array-backed, as below): O(n), because sliding items over to make room costs time even though finding the spot is fast · Contains: O(log n) via binary search on the sorted layout · A real balanced-tree-backed sorted set gets insert down to O(log n) too.",
    mistakes: [
      "Confusing a sorted set with a sorted list that allows duplicates — a sorted set silently drops repeats, a sorted list keeps every copy.",
      "Assuming insert is always instant just because lookups are fast — keeping items in order costs something; a plain hash set inserts faster but keeps no order at all.",
    ],
    code: {
      JavaScript: `class SortedSet {
  constructor() { this.items = []; }
  _indexOf(value) {
    let lo = 0, hi = this.items.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (this.items[mid] < value) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  add(value) {
    const i = this._indexOf(value);
    if (this.items[i] === value) return; // already present, ignore
    this.items.splice(i, 0, value);
  }
  has(value) {
    const i = this._indexOf(value);
    return this.items[i] === value;
  }
  range(lo, hi) {
    return this.items.filter((v) => v >= lo && v <= hi);
  }
}

const scores = new SortedSet();
[42, 17, 89, 42, 3, 56, 17].forEach((v) => scores.add(v));

console.log("Sorted:", scores.items.join(" "));
console.log("Smallest:", scores.items[0]);
console.log("Largest:", scores.items[scores.items.length - 1]);
console.log("Has 56:", scores.has(56) ? "yes" : "no");
console.log("Has 99:", scores.has(99) ? "yes" : "no");
console.log("Range 20-60:", scores.range(20, 60).join(" "));`,
      Python: `import bisect

class SortedSet:
    def __init__(self):
        self.items = []

    def add(self, value):
        i = bisect.bisect_left(self.items, value)
        if i < len(self.items) and self.items[i] == value:
            return  # already present, ignore
        self.items.insert(i, value)

    def has(self, value):
        i = bisect.bisect_left(self.items, value)
        return i < len(self.items) and self.items[i] == value

    def range(self, lo, hi):
        return [v for v in self.items if lo <= v <= hi]

scores = SortedSet()
for v in [42, 17, 89, 42, 3, 56, 17]:
    scores.add(v)

print("Sorted:", " ".join(str(v) for v in scores.items))
print("Smallest:", scores.items[0])
print("Largest:", scores.items[-1])
print("Has 56:", "yes" if scores.has(56) else "no")
print("Has 99:", "yes" if scores.has(99) else "no")
print("Range 20-60:", " ".join(str(v) for v in scores.range(20, 60)))`,
    },
    output: `Sorted: 3 17 42 56 89
Smallest: 3
Largest: 89
Has 56: yes
Has 99: no
Range 20-60: 42 56`,
    note: "This lesson stores items in a plain sorted array with binary search to find insertion points — enough to see the idea. Production sorted sets (like Redis's ZSET) use a skip list or balanced tree underneath so insert is O(log n) too.",
  },
  {
    id: "skip-list",
    pillar: "Data Structures",
    name: "Skip List",
    easy: "A skip list is a subway map with express trains stacked over the local line. The local line (the bottom level) stops at every single station, in order — slow to cross town. An express line above it skips over several stops at once, and a super-express line above that skips even more. To find a station, ride the fastest line you can until you'd overshoot it, then drop down one line and keep going — landing on your stop after just a handful of hops instead of walking every local station.",
    how: [
      "Store items in sorted order across several stacked linked levels.",
      "The bottom level is a complete, ordinary sorted linked list — every item lives there.",
      "Higher levels hold only some of those same items, acting as 'express lanes' that skip over chunks of the level below.",
      "To search: start at the top level, move forward while the next item is still less than the target, and drop down a level whenever moving forward would overshoot — repeat until you land at the bottom.",
    ],
    when: "Anywhere you want fast sorted-order search, insert, and delete without the rebalancing logic a balanced tree needs — Redis's sorted sets are built on skip lists internally.",
    big: "Search, insert, delete: O(log n) on average, because each level lets you skip over a chunk of items at once instead of checking them one by one · Space: O(n), since higher levels only add a smaller number of extra shortcut pointers.",
    mistakes: [
      "Assuming a skip list is just a fancier array — it's really a stack of linked lists; the 'skipping' comes from having fewer items (and thus bigger jumps) at each level up.",
      "Forgetting that every item must exist at the bottom level — higher levels are just optional shortcuts on top of that complete base list, not separate storage.",
    ],
    code: {
      JavaScript: `class SkipListNode {
  constructor(value, level) {
    this.value = value;
    this.next = new Array(level + 1).fill(null);
  }
}
class SkipList {
  constructor(maxLevel) {
    this.maxLevel = maxLevel;
    this.head = new SkipListNode(-Infinity, maxLevel);
    this.topLevel = 0;
    this.insertCount = 0;
  }
  _levelFor(n) { // deterministic level, based on how many times n divides evenly by 2
    let level = 0;
    while (n % 2 === 0 && level < this.maxLevel) {
      n = Math.floor(n / 2);
      level++;
    }
    return level;
  }
  insert(value) {
    this.insertCount++;
    const update = new Array(this.maxLevel + 1).fill(this.head);
    let cur = this.head;
    for (let level = this.topLevel; level >= 0; level--) {
      while (cur.next[level] !== null && cur.next[level].value < value) {
        cur = cur.next[level];
      }
      update[level] = cur;
    }
    const newLevel = this._levelFor(this.insertCount);
    if (newLevel > this.topLevel) {
      for (let level = this.topLevel + 1; level <= newLevel; level++) update[level] = this.head;
      this.topLevel = newLevel;
    }
    const node = new SkipListNode(value, newLevel);
    for (let level = 0; level <= newLevel; level++) {
      node.next[level] = update[level].next[level];
      update[level].next[level] = node;
    }
  }
  contains(value) {
    let cur = this.head;
    for (let level = this.topLevel; level >= 0; level--) {
      while (cur.next[level] !== null && cur.next[level].value < value) {
        cur = cur.next[level];
      }
    }
    cur = cur.next[0];
    return cur !== null && cur.value === value;
  }
  levelSizes() {
    const sizes = [];
    for (let level = 0; level <= this.topLevel; level++) {
      let count = 0;
      let cur = this.head.next[level];
      while (cur !== null) { count++; cur = cur.next[level]; }
      sizes.push(count);
    }
    return sizes;
  }
  bottomRow() {
    const out = [];
    let cur = this.head.next[0];
    while (cur !== null) { out.push(cur.value); cur = cur.next[0]; }
    return out;
  }
}

const list = new SkipList(3);
[50, 10, 30, 70, 20, 60, 40, 80].forEach((v) => list.insert(v));

console.log("Sorted:", list.bottomRow().join(" "));
console.log("Level sizes:", list.levelSizes().join(" "));
console.log("Has 40:", list.contains(40) ? "yes" : "no");
console.log("Has 45:", list.contains(45) ? "yes" : "no");
console.log("Has 80:", list.contains(80) ? "yes" : "no");`,
      Python: `class SkipListNode:
    def __init__(self, value, level):
        self.value = value
        self.next = [None] * (level + 1)

class SkipList:
    def __init__(self, max_level):
        self.max_level = max_level
        self.head = SkipListNode(float("-inf"), max_level)
        self.top_level = 0
        self.insert_count = 0

    def _level_for(self, n):  # deterministic level, based on how many times n divides evenly by 2
        level = 0
        while n % 2 == 0 and level < self.max_level:
            n //= 2
            level += 1
        return level

    def insert(self, value):
        self.insert_count += 1
        update = [self.head] * (self.max_level + 1)
        cur = self.head
        for level in range(self.top_level, -1, -1):
            while cur.next[level] is not None and cur.next[level].value < value:
                cur = cur.next[level]
            update[level] = cur

        new_level = self._level_for(self.insert_count)
        if new_level > self.top_level:
            for level in range(self.top_level + 1, new_level + 1):
                update[level] = self.head
            self.top_level = new_level

        node = SkipListNode(value, new_level)
        for level in range(0, new_level + 1):
            node.next[level] = update[level].next[level]
            update[level].next[level] = node

    def contains(self, value):
        cur = self.head
        for level in range(self.top_level, -1, -1):
            while cur.next[level] is not None and cur.next[level].value < value:
                cur = cur.next[level]
        cur = cur.next[0]
        return cur is not None and cur.value == value

    def level_sizes(self):
        sizes = []
        for level in range(0, self.top_level + 1):
            count = 0
            cur = self.head.next[level]
            while cur is not None:
                count += 1
                cur = cur.next[level]
            sizes.append(count)
        return sizes

    def bottom_row(self):
        out = []
        cur = self.head.next[0]
        while cur is not None:
            out.append(cur.value)
            cur = cur.next[0]
        return out

lst = SkipList(3)
for v in [50, 10, 30, 70, 20, 60, 40, 80]:
    lst.insert(v)

print("Sorted:", " ".join(str(v) for v in lst.bottom_row()))
print("Level sizes:", " ".join(str(v) for v in lst.level_sizes()))
print("Has 40:", "yes" if lst.contains(40) else "no")
print("Has 45:", "yes" if lst.contains(45) else "no")
print("Has 80:", "yes" if lst.contains(80) else "no")`,
    },
    output: `Sorted: 10 20 30 40 50 60 70 80
Level sizes: 8 4 2 1
Has 40: yes
Has 45: no
Has 80: yes`,
    note: "Real-world skip lists pick each node's level with a coin flip (a random process), which is what makes them 'probabilistically balanced.' This lesson picks levels with a fixed, deterministic rule instead — purely so the example is repeatable — but the search/insert logic is exactly the same as a production skip list.",
  },
  {
    id: "sparse-matrix",
    pillar: "Data Structures",
    name: "Sparse Matrix",
    easy: "A sparse matrix is a star catalog, not a photograph of the whole night sky. A photograph records every single pixel, including all the empty black space. A star catalog only lists where the actual stars are — their coordinates and brightness — and treats everywhere else as 'nothing, obviously.' A sparse matrix does the same for a huge grid that's almost entirely zeros: it only records where the non-zero values live.",
    how: [
      "Instead of a full rows x cols grid, keep a lookup keyed by (row, col) that only holds entries for non-zero values.",
      "get(row, col): look up that key — if it's found, return its value; if not, the cell is 0 by definition.",
      "set(row, col, value): if value is 0, remove that key entirely (there's no point storing a zero); otherwise, store or update it.",
      "To scan or total the matrix, loop only over the stored (non-zero) entries — never over every empty cell.",
    ],
    when: "Huge grids that are almost entirely zero — scientific and engineering simulations, one-hot encoded machine-learning feature vectors, or graph connections for graphs with far fewer edges than the number of possible node pairs.",
    big: "get/set one cell: O(1) on average, via a hash-map lookup · Space: O(k), where k is the number of non-zero entries — not rows x cols · A full scan (like summing every value): O(k), not O(rows x cols).",
    mistakes: [
      "Storing an explicit 0 anyway — that defeats the entire point; always treat 'missing from storage' as the zero value, never store zero itself.",
      "Reaching for a sparse matrix when the data is mostly filled in — the overhead of a hash-map lookup per cell makes it slower than a plain 2D array once most cells actually hold a value.",
    ],
    code: {
      JavaScript: `class SparseMatrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = new Map(); // "row,col" -> non-zero value only
  }
  _key(r, c) { return r + "," + c; }
  set(r, c, value) {
    const key = this._key(r, c);
    if (value === 0) {
      this.data.delete(key); // storing a zero defeats the point — just remove it
    } else {
      this.data.set(key, value);
    }
  }
  get(r, c) {
    const key = this._key(r, c);
    return this.data.has(key) ? this.data.get(key) : 0; // missing key means the cell is 0
  }
  nonZeroCount() { return this.data.size; }
  sum() {
    let total = 0;
    for (const v of this.data.values()) total += v;
    return total;
  }
}

const grid = new SparseMatrix(5, 5);
grid.set(0, 0, 5);
grid.set(2, 3, 7);
grid.set(4, 4, 2);
grid.set(2, 3, 9); // overwrite an existing non-zero cell
grid.set(0, 0, 0); // "clearing" a cell just removes it from storage

console.log("Cell (2,3):", grid.get(2, 3));
console.log("Cell (0,0):", grid.get(0, 0));
console.log("Cell (1,1):", grid.get(1, 1));
console.log("Stored cells:", grid.nonZeroCount());
console.log("Sum:", grid.sum());`,
      Python: `class SparseMatrix:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.data = {}  # "row,col" -> non-zero value only

    def _key(self, r, c):
        return f"{r},{c}"

    def set(self, r, c, value):
        key = self._key(r, c)
        if value == 0:
            self.data.pop(key, None)  # storing a zero defeats the point — just remove it
        else:
            self.data[key] = value

    def get(self, r, c):
        key = self._key(r, c)
        return self.data.get(key, 0)  # missing key means the cell is 0

    def non_zero_count(self):
        return len(self.data)

    def sum(self):
        return sum(self.data.values())

grid = SparseMatrix(5, 5)
grid.set(0, 0, 5)
grid.set(2, 3, 7)
grid.set(4, 4, 2)
grid.set(2, 3, 9)  # overwrite an existing non-zero cell
grid.set(0, 0, 0)  # "clearing" a cell just removes it from storage

print("Cell (2,3):", grid.get(2, 3))
print("Cell (0,0):", grid.get(0, 0))
print("Cell (1,1):", grid.get(1, 1))
print("Stored cells:", grid.non_zero_count())
print("Sum:", grid.sum())`,
    },
    output: `Cell (2,3): 9
Cell (0,0): 0
Cell (1,1): 0
Stored cells: 2
Sum: 11`,
  },
];

export default lessons;
