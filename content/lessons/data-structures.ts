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
    easy: "A linked list is a treasure hunt. Each clue (node) holds a value AND a pointer to where the next clue is. To find item #5, you follow the chain from the start — there are no shortcuts by number.",
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
    easy: "A binary search tree is like the game '20 questions'. Every value has up to two children: smaller values go left, bigger values go right. Because it's sorted this way, you can find things by repeatedly asking 'higher or lower?'.",
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
    easy: "A graph is a map of a social network: people are dots (called nodes) and friendships are lines connecting them (called edges). An 'adjacency list' is just a phone book — for each person, you keep a list of their direct friends.",
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
    easy: "Union-Find is like tracking friend groups at a huge party. Every guest starts in their own tiny group. Whenever two people become friends, their whole groups merge into one. At any point you can ask 'are these two in the same group?' without listing everyone — you just check who each person's group leader is.",
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
    easy: "A Bloom filter is a bouncer with a bad memory but a good trick. Instead of remembering every name on the guest list, it flips a few switches on a big panel for each guest. To check someone later, it looks at those same switches: if ANY are off, they definitely weren't on the list. If ALL are on, they PROBABLY were — but it could be a coincidence (a false positive). It will never wrongly say 'no' to someone who really was added.",
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
    easy: "A Fenwick tree is a set of cleverly overlapping donation jars. Instead of one jar holding the total for every single day (slow to update) or a running list you re-add every time (slow to query), each jar covers a different-sized range of days chosen by a neat bit trick. Asking 'what's the total so far?' means peeking into just a handful of jars, not every single day.",
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
];

export default lessons;
