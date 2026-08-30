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
];

export default lessons;
