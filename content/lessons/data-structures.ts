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
    easy: "An array is like an egg carton. It has a row of numbered slots, and each slot holds one thing. The slots stay in order. Each slot has a number, called its index. The first index is 0.",
    how: [
      "Put items in a row of slots, in order.",
      "Reach any item right away by its slot number. This number is called the index, and it starts at 0.",
      "Add an item to the end, remove one from the end, or loop through every slot.",
    ],
    when: "You'll use arrays almost everywhere. Use one whenever you have a list of things in a specific order, like a to-do list, search results, or the players in a game.",
    big: "Read by index: O(1), instant · Add or remove at the end: O(1) · Search for a value: O(n)",
    mistakes: [
      "You may forget indexes start at 0. So the first item is arr[0], not arr[1].",
      "Don't go past the end of the array, like arr[arr.length]. There's nothing there.",
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
    easy: "A stack is a pile of plates. You add a plate on top. You take the top plate off first. The last thing you add is the first thing you remove. This rule is called LIFO, short for Last In, First Out.",
    how: [
      "push: put a new item on top.",
      "pop: remove the top item. This is the most recent one you added.",
      "peek: look at the top item without removing it.",
    ],
    when: "Use a stack for an app's undo button, a browser's back button, or checking if brackets in code match up.",
    big: "push: O(1) · pop: O(1) · peek: O(1). All three are instant because you only ever touch the top item.",
    mistakes: [
      "Don't try to grab an item from the middle. A stack only lets you touch the top item.",
      "Don't pop from an empty stack without checking first. This can cause an error.",
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
    easy: "A queue is a line at a coffee shop. The first person to arrive is the first person served. This rule is called FIFO, short for First In, First Out. New people join the back of the line. Served people leave from the front.",
    how: [
      "enqueue: a new item joins the back of the line.",
      "dequeue: the item at the front is served and leaves.",
      "front: check who is next without serving them.",
    ],
    when: "Use a queue for anything handled in the order it arrives, like print jobs, support tickets, or tasks waiting to run.",
    big: "enqueue: O(1) · dequeue: O(1) with the right structure · front: O(1)",
    mistakes: [
      "Don't mix up the ends. You add items to the back and remove them from the front.",
      "In JavaScript, array.shift() is slow on a huge list. A real queue design avoids this problem.",
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
    note: "Python's collections.deque is the right tool for a queue. Removing from the front is fast, unlike with a plain list.",
  },
  {
    id: "linked-list",
    pillar: "Data Structures",
    name: "Linked List",
    easy: "A linked list is like a treasure hunt. Each clue is called a node. Each node holds one value, plus a note pointing to the next clue. You can't jump straight to clue #5. You must follow the notes from the first clue, one at a time.",
    how: [
      "Each node stores a value and a link to the next node.",
      "The list only remembers the first node. This is called the head.",
      "To reach an item, start at the head and follow the links one by one.",
    ],
    when: "Use a linked list when you add and remove items often, and don't need to jump straight to item #500. It grows without shuffling every other item, unlike an array.",
    big: "Add to the front: O(1) · Find an item: O(n), because you must walk the whole chain.",
    mistakes: [
      "Don't lose the head reference. If you do, you lose the whole list.",
      "Remember to update the .next links when you insert or remove a node. If you don't, you break the chain.",
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
    easy: "A hash map is like a coat check. You hand over your coat, which is the value. You get a numbered tag back, which is the key. Later, you show the tag and get your exact coat back right away. No one has to search through every coat.",
    how: [
      "You store data as key → value pairs (like word → count).",
      "The map turns your key into a slot number behind the scenes.",
      "Look up, add, or update an item by its key. You never need to scan the whole map.",
    ],
    when: "Use a hash map for counting things, remembering settings by name, caching results, or looking things up by name or ID.",
    big: "Add: O(1) · Look up by key: O(1) · Delete: O(1). On average, all three are effectively instant.",
    mistakes: [
      "Don't assume the keys stay in a sorted order. Don't rely on order in your logic.",
      "Remember to handle the case where a key doesn't exist. Don't forget the 'not found' case.",
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
    easy: "A binary search tree is like the game '20 questions,' turned into a shape. Each value can have up to two values below it. These are called its children. The smaller child goes on the left. The bigger child goes on the right. To find a value, start at the top. Keep asking 'is it smaller or bigger?' Step left or right each time.",
    how: [
      "Start at the top (the root).",
      "Smaller than the current node? Go left. Bigger? Go right.",
      "Keep going until you find the value or hit an empty spot.",
    ],
    when: "Use this when you need data kept in sorted order, plus fast lookups and inserts. Reading it left to right, called in-order, gives you everything sorted for free.",
    big: "Search or insert: O(log n) when the tree is balanced, because each step cuts the search in half. O(n) if the tree becomes a lopsided chain.",
    mistakes: [
      "Don't assume it's always fast. A tree built from already-sorted data becomes a slow straight line.",
      "Don't mix up the rule. Smaller always goes left. Bigger always goes right.",
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
    easy: "A set is like a guest list at a party door. Each name can appear only once. If you try to add the same name twice, nothing changes. It's already on the list.",
    how: [
      "Add items. The set ignores duplicates automatically.",
      "Check if an item exists. You get a fast yes or no answer.",
      "Remove an item, or loop through everything that's left.",
    ],
    when: "Use a set to remove duplicates from a list, quickly check 'have I seen this before?', or track unique visitors to a page.",
    big: "Add, check, or remove an item: O(1) on average. This is instant, no matter how many items you store.",
    mistakes: [
      "Don't expect a set to remember the order you added items. If order matters, sort the items before printing.",
      "Don't assume printing a set always shows the same order. Python sets don't guarantee any order.",
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
    easy: "A doubly linked list is like a train. Each car connects to the car in front and the car behind. A regular linked list only lets you walk forward. This one lets you walk backward too.",
    how: [
      "Each node stores a value, a link to the next node, and a link to the previous node.",
      "The list remembers both the first node, called the head, and the last node, called the tail.",
      "Walk forward by following .next links, or backward by following .prev links.",
    ],
    when: "Use this for anything you browse in both directions, like a browser's back and forward history, or a music player's next and previous track.",
    big: "Add to the front or back: O(1) · Find an item: O(n) · Remove a node you already have: O(1), since you don't need to search for its neighbors.",
    mistakes: [
      "When you insert or remove a node, update both .next and .prev. If you forget one, you break the chain in that direction.",
      "Remember to update the tail pointer when you add to the end. If you forget, finding the last node needs a slow walk from the head.",
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
    easy: "A min-heap is like a hospital waiting room organized by urgency. The most critical patient is always easiest to reach, at the front. Everyone else is only loosely arranged, not fully sorted.",
    how: [
      "Insert: put the new item at the end. Let it 'bubble up' past any bigger parent, until it lands in a valid spot.",
      "Peek: the smallest item always sits at the top. You don't need to search for it.",
      "Remove the smallest: swap it with the last item, then remove it. Let that last item 'bubble down' past smaller children.",
    ],
    when: "Use a min-heap for task schedulers that must run the most urgent job next, for finding the smallest or largest few items in a big pile, or for Dijkstra's shortest-path algorithm.",
    big: "Insert: O(log n), because an item only ever travels up one branch of the tree · Remove the smallest: O(log n) · Peek at the smallest: O(1), instant.",
    mistakes: [
      "Don't think a heap is fully sorted. It only guarantees the smallest item is on top. The other items are not in order.",
      "Don't build it as a tree of linked nodes. A heap is usually just a plain array. Simple math finds each parent and child by index.",
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
    note: "Python's built-in heapq module is the standard tool for a heap. It manages a plain list for you. The JavaScript version here writes the same bubble-up and bubble-down logic by hand, so you can see how a heap really works underneath.",
  },
  {
    id: "trie",
    pillar: "Data Structures",
    name: "Trie",
    easy: "A trie (say 'try', short for retrieval tree) is like a filing cabinet organized one letter at a time. Each drawer holds a single letter. Opening a drawer reveals more drawers for the next letter. Words that share a beginning also share the same drawers.",
    how: [
      "Start at an empty root — no letters yet.",
      "For each letter in a word, step into (or create) the drawer for that letter.",
      "Mark the drawer for the word's last letter as 'a complete word ends here.'",
      "To check a word or prefix, walk the same drawers letter by letter.",
    ],
    when: "Use a trie for autocomplete and search suggestions, spell checkers, or anything that must quickly find all words starting with a given prefix.",
    big: "Insert or search a word with L letters: O(L). You only take as many steps as the word is long, no matter how many other words you store.",
    mistakes: [
      "Don't confuse 'this is a prefix of a stored word' with 'this exact word was stored.' 'Cat' can be part of the path to 'catalog' without 'cat' itself ever being inserted.",
      "Remember to mark the end of a word. If you forget, every stored prefix looks like a complete word, or none of them do.",
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
    easy: "A graph is like a map of friendships. Each person is a dot, called a node. Each friendship is a line connecting two dots, called an edge. An 'adjacency list' is like a phone book. For every person, it lists their direct friends.",
    how: [
      "Store the graph as a lookup. Each node maps to a list of its direct neighbors.",
      "Adding a connection means adding each node to the other's neighbor list.",
      "To explore from a starting point, visit a node, then visit its unvisited neighbors, and keep going. This process is called a traversal.",
    ],
    when: "Use a graph to model anything with connections, like social networks, road maps, recommendation systems, or which tasks must finish before others.",
    big: "Add a connection: O(1) · Visit every node and connection once (a full traversal): O(V + E), where V is the number of nodes and E is the number of connections.",
    mistakes: [
      "Remember a graph can have cycles. A traversal must track which nodes it already visited, or it can loop forever.",
      "Don't mix up directed and undirected connections. In an undirected friendship graph, adding one edge must update both people's neighbor lists.",
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
    easy: "A deque (say 'deck') is like a line where you can join or leave from either end. Think of a deck of cards, where you can add or draw from the top or the bottom. It combines a stack and a queue into one flexible tool.",
    how: [
      "addFront / addBack: put a new item at either end.",
      "removeFront / removeBack: take an item off either end.",
      "peekFront / peekBack: look at either end without removing anything.",
    ],
    when: "Use a deque for sliding-window problems, like tracking the biggest number in the last K items. Also use it for browser back and forward history, or a 'recently used' list where items get pulled from either end.",
    big: "Add or remove from either end: O(1). With the right structure, both ends are equally fast, not just one.",
    mistakes: [
      "Don't use a plain array with shift() and unshift() a lot in real production code. These are slow for big lists, because every other item has to shift over. A real deque avoids this problem.",
      "Don't mix up which end is 'front' and which is 'back' when reading someone else's deque code.",
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
    note: "Python's collections.deque is a true double-ended queue. It's O(1) at both ends. The JS version here uses a plain array with shift() and unshift() for simplicity. That's O(n) at the front in real large-scale code.",
  },
  {
    id: "union-find",
    pillar: "Data Structures",
    name: "Union-Find (Disjoint Set)",
    easy: "Union-Find is like tracking friend groups at a party. Everyone starts alone, in their own tiny group. When two people become friends, their two whole groups merge into one. To check 'are these two in the same group?', you don't list every member. You just look up each person's group leader and see if the leaders match.",
    how: [
      "find(x): follow x's 'leader' pointer up the chain, until you reach someone who is their own leader. That person represents the group.",
      "While you follow that chain, point every node straight at the final leader. This is called path compression, and it makes the next find instant.",
      "union(a, b): find both leaders. If they differ, make one leader point to the other, so the two groups become one.",
      "connected(a, b): this is true only when find(a) and find(b) land on the same leader.",
    ],
    when: "Use Union-Find to detect cycles in a graph, build a minimum spanning tree with Kruskal's algorithm, or group things into 'friend circles.' It fits anything that keeps asking 'are these two already connected?' while you add connections over time.",
    big: "find and union: O(α(n)) each. α is the inverse Ackermann function, a number that stays under 5. In practice, this is effectively constant time, thanks to path compression.",
    mistakes: [
      "Don't skip path compression or union by rank/size. Without one of these, chains can grow long, and every find slows toward O(n).",
      "If you call union on two items already in the same group, nothing happens. This is correct behavior, not a bug.",
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
    easy: "An LRU cache, short for Least Recently Used, is like a small whiteboard with a fixed number of slots. Every time you write or reread something, it moves to the 'freshest' spot. When the board is full and you need to add something new, you erase whatever hasn't been touched for the longest time.",
    how: [
      "Store key-value pairs in a structure that remembers insertion order, like a Map in JavaScript, or a dict in modern Python.",
      "On get(key): if the key exists, move it to the 'most recently used' end before returning its value.",
      "On put(key, value): if the cache is full and this key is brand-new, remove whatever sits at the 'least recently used' end first.",
      "Add or update the key at the 'most recently used' end.",
    ],
    when: "Use an LRU cache for database query results, browser tabs, image thumbnails, or any fixed-size cache where you want to keep what's popular and drop what's gone cold.",
    big: "get and put: O(1) each. This uses a hash map combined with an order-preserving structure, so you never scan to find the oldest entry.",
    mistakes: [
      "Remember that a get() also counts as 'using' an item. It must refresh that item's position, not just insert().",
      "Don't evict an item on every put(). Only evict when the cache is full and the key is genuinely new.",
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
    easy: "A circular buffer is like a merry-go-round with a fixed number of seats. New riders keep boarding. Once every seat is taken, the next new rider bumps off whoever has sat there the longest. The 'track' has a fixed size, but it just keeps looping around instead of running out of room.",
    how: [
      "Reserve a fixed-size array up front — the capacity never grows.",
      "Keep track of where the oldest item lives. Call this position start. Also track how many slots are currently filled, called count.",
      "write(value): place the new value right after the newest item, wrapping back to index 0 once you run off the end.",
      "Once the buffer is full, writing a new value overwrites the oldest one and slides 'start' forward by one.",
    ],
    when: "Use a circular buffer for streaming the last N sensor readings, a fixed-size 'recent activity' log, audio or video buffering, or any rolling window where old data should fall off automatically.",
    big: "write: O(1), always. This holds whether the buffer is empty, partly full, or completely full, because nothing else has to shift.",
    mistakes: [
      "Don't confuse a circular buffer with a normal array that keeps growing. Its whole point is a fixed size, with old data quietly overwritten.",
      "Don't forget the modulo, or wrap-around, math. Without it, the 'next' index walks off the end of the array instead of looping back to 0.",
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
    easy: "A Bloom filter is like a bouncer with a bad memory but a clever trick. It doesn't remember names. Instead, whenever someone is added, it flips a few switches on a shared panel. To check a name later, it looks at those same switches. If any switch is still off, that person was definitely never added. If all switches are on, that person was probably added, but that could be a coincidence, called a false positive. One thing it never does is wrongly say 'no' to someone who really was added.",
    how: [
      "Start with a fixed-size row of switches, called bits. All start off, at 0.",
      "add(item): run the item through a few different hash functions. Each one points at one switch. Flip those switches on.",
      "mightContain(item): run the same hash functions again. If every switch is on, say 'probably yes.' If even one switch is off, say 'definitely no.'",
      "Nothing is ever removed or stored directly. Only the switches remember that anything happened.",
    ],
    when: "Use a Bloom filter to quickly rule out 'definitely not in the set,' before doing an expensive lookup. Examples: checking a username against millions of taken ones, or asking 'have we crawled this URL before?' Use it when a rare false positive is fine, but a false negative is not.",
    big: "add and mightContain: O(k), where k is the number of hash functions. This is a small constant, so both are effectively instant. A Bloom filter also uses far less memory than storing every item.",
    mistakes: [
      "Don't treat 'might contain' as a guarantee. A Bloom filter can say yes for something never added, called a false positive. Always follow up with a real check when it matters.",
      "Don't try to remove an item. A basic Bloom filter can't do this. Flipping a switch off could accidentally make a different, still-present item disappear too.",
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
    note: "Real-world Bloom filters use more hash functions and careful sizing, to keep false positives rare. This lesson uses just two simple hash functions, so you can trace the bit flips by hand.",
  },
  {
    id: "fenwick-tree",
    pillar: "Data Structures",
    name: "Fenwick Tree (Binary Indexed Tree)",
    easy: "A Fenwick tree is like a row of donation jars, but a clever kind. One single running-total jar is slow to update. A full day-by-day list is slow to add up. Instead, each jar here covers a different-sized range of days. So getting 'the total so far' means peeking into just a handful of jars, not adding up every single day.",
    how: [
      "Store values in a 1-indexed array. Position 0 is unused. Real data starts at position 1.",
      "update(i, delta): add delta to position i. Then hop to i plus i's lowest set bit, and repeat until you walk off the end. This updates every jar that covers position i.",
      "prefixSum(i): add up the jar at position i. Then hop to i minus i's lowest set bit, and repeat until you hit 0. This visits only O(log n) jars.",
      "rangeSum(l, r): just prefixSum(r) minus prefixSum(l − 1). This is the sum of everything up to r, minus everything before l.",
    ],
    when: "Use a Fenwick tree for running totals that change often, like live leaderboards, cumulative sales by day, or counting how many items are 'less than X' seen so far. Use it anywhere you need both fast updates and fast prefix sums.",
    big: "update and prefixSum: O(log n) each. Every step jumps by a power of two, instead of visiting every element. This is much faster than recomputing a sum from scratch, at O(n), after every change.",
    mistakes: [
      "Don't use index 0 for real data. Fenwick trees rely on 1-indexing. The math i & (-i) breaks down at index 0.",
      "Don't reach for a Fenwick tree when values never change. If the data is fixed, a simple precomputed prefix-sum array is simpler and just as fast to query.",
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
    easy: "A matrix is like a spreadsheet. It has rows and columns of cells. You find every cell using two numbers instead of one: its row and its column. Under the hood, it's usually just 'a list of lists.' The outer list holds the rows. Each row is itself a list of cell values.",
    how: [
      "Build a grid of rows and columns, each cell reachable as grid[row][col].",
      "Read or write a cell directly using its row and column index.",
      "Walk the whole grid with a nested loop: an outer loop over rows, an inner loop over columns.",
      "Transpose flips rows into columns: the value at [row][col] moves to [col][row] in a new grid.",
    ],
    when: "Use a matrix for anything laid out on a grid: spreadsheets, game boards like chess, Tic-Tac-Toe, or Minesweeper, images made of rows of pixels, or grid-based pathfinding maps.",
    big: "Read/write a cell: O(1) · Visit every cell: O(rows × cols) · Transpose: O(rows × cols), since every cell is copied exactly once.",
    mistakes: [
      "Don't swap row and column by accident. grid[row][col] and grid[col][row] are usually different cells, unless the grid is square and symmetric.",
      "Don't assume every row has the same length after building a grid by hand. A 'ragged' 2D array, with rows of different lengths, will break code that expects a clean rectangle.",
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
    easy: "A priority queue works like airport boarding, not a coffee line. It doesn't matter who arrived at the gate first. Whoever has the best priority, like first class, then priority members, then everyone else, boards next. Every item carries a priority number. The item that leaves next always has the best priority, not the oldest one.",
    how: [
      "enqueue(item, priority): add the item along with its priority number.",
      "dequeue(): find and remove whichever item currently has the best priority. Here, the lowest number is the best.",
      "peek(): look at what would leave next, without removing it.",
    ],
    when: "Use a priority queue for task schedulers, hospital triage, or turn-based games, where 'most important next' matters more than 'arrived first.' Use it anywhere arrival order shouldn't decide who goes next.",
    big: "With a simple sorted list, as shown below: enqueue is O(n), dequeue is O(1). With a heap (see Min-Heap), both become O(log n). A heap is the standard real-world choice for a priority queue.",
    mistakes: [
      "Don't confuse it with a regular queue. A priority queue lets a brand-new item cut straight to the front, if its priority is high enough.",
      "Decide up front whether a lower number or a higher number means more urgent. Don't mix the two up while adding items.",
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
    easy: "A frequency map is like a tally chart at a school election. Instead of writing down every vote one by one, you keep a single running count next to each candidate's name. You bump the count up each time their name comes up. It's a hash map whose values always answer 'how many times have I seen this?' It's sometimes called a multiset, because it tracks duplicates without storing every single copy.",
    how: [
      "Start with an empty map from item to count.",
      "Every time an item appears, look up its current count. If it's brand new, start at 0. Then add 1.",
      "To read: check any single item's count directly, or scan the whole map to find the item with the highest count.",
    ],
    when: "Use a frequency map for counting word frequency in text, finding the most common item in a list, checking if two words are anagrams (they have the same letter counts), or tracking how many times each event happened.",
    big: "Add or update one count: O(1) · Build the full frequency map for n items: O(n) · Find the most common item: O(k), where k is the number of distinct items.",
    mistakes: [
      "Remember to default to 0 for an item you haven't seen yet. If you forget, the very first count crashes.",
      "Don't confuse 'the highest count' with 'the item that has it.' You want the key whose count is highest, not the count number itself.",
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
    easy: "An adjacency matrix is like a friendship spreadsheet. Write everyone's name across the top and down the side. To check if two people are friends, find the cell where their row and column meet. A 1 means friends, a 0 means not. It's the same map of connections as an adjacency list, just stored as a grid instead of a phone book.",
    how: [
      "Make an N x N grid of zeros, one row and one column per node (N = number of nodes).",
      "To connect node A and node B, set grid[A][B] = 1 (and grid[B][A] = 1 too, if the connection goes both ways).",
      "To check if two nodes are connected, just read one cell, grid[A][B] — no searching needed.",
      "To find all of a node's neighbors, scan its whole row and collect every column that's a 1.",
    ],
    when: "Use an adjacency matrix for dense graphs, where most pairs of nodes are connected. Also use it whenever 'are A and B connected?' needs to be instant, and extra memory isn't a problem.",
    big: "Check if two specific nodes are connected: O(1), one cell lookup · Find all neighbors of a node: O(n), scanning its row · Space: O(n^2), even if there are very few actual connections.",
    mistakes: [
      "Don't use an adjacency matrix for a huge, sparse graph with few actual connections. You'd allocate n^2 cells to store only a handful of 1s. An adjacency list is far lighter there.",
      "Remember to mirror the update for an undirected graph. If you set grid[A][B] = 1 without also setting grid[B][A] = 1, the connection is only 'visible' from one side.",
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
    easy: "A min-stack is like a pile of plates, where each plate secretly remembers the smallest number in the whole pile at the moment it was placed. You can only see the top plate. But that top plate's secret note always tells you the smallest number in the whole pile, instantly, with no digging.",
    how: [
      "Keep two stacks side by side: a main stack for the actual values, and a mini stack that tracks the running minimum.",
      "push(x): push x onto the main stack. Also push onto the mini stack whichever is smaller: x, or the mini stack's current top. If the mini stack is empty, just push x.",
      "pop(): pop from both stacks together, so they always stay the same size and in sync.",
      "getMin(): just peek at the top of the mini stack — the smallest value is always sitting right there.",
    ],
    when: "Use a min-stack anywhere you need normal stack behavior, like push, pop, and peek, plus an instant answer to 'what's the smallest value in here right now?' You avoid scanning the whole stack every time.",
    big: "push, pop, peek, getMin: all O(1) — the mini stack means you never have to scan the whole stack to find the minimum.",
    mistakes: [
      "Don't pop from only the main stack and forget the mini stack. If you do, the two stacks fall out of sync, and getMin() starts giving wrong answers.",
      "Don't assume you need to search for the new minimum on every push. Just compare the new value to the mini stack's current top.",
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
    easy: "A segment tree is like a company's reporting chain, built to answer 'what's our total?' instantly. Every employee, called a leaf, reports one number. Each manager's number is just their two direct reports added together. This keeps going up, level by level, until the person at the top holds the grand total of everyone below. If you change one employee's number, only the managers directly above them need to redo their math, not the whole company.",
    how: [
      "Build a tree where each leaf holds one array value, and each parent holds the combined result (here, the sum) of its two children.",
      "The node at the top ends up holding the combined result for the whole array — for a sum tree, the grand total.",
      "update(i, value): change one leaf's value, then walk back up to the top, recomputing each ancestor along the way.",
      "query(l, r): combine only the handful of nodes that exactly cover the range [l, r), skipping everything outside it.",
    ],
    when: "Use a segment tree for frequent range queries, like sum, min, or max over a range, mixed with frequent updates to individual elements. For example, a leaderboard that must answer 'what's the total score between rank 10 and 50?' right after every new score comes in.",
    big: "build: O(n) once · update: O(log n) · range query: O(log n) — both far faster than recomputing a range from scratch (O(n)) after every change.",
    mistakes: [
      "Don't reach for a segment tree when the array never changes. A precomputed prefix-sum array answers range-sum queries just as fast, with much simpler code.",
      "Remember that after update(i, value), every ancestor of that leaf must be recomputed on the way back up. If you skip this, the tree quietly keeps stale totals.",
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
    easy: "A tuple is like a sealed gift box with numbered slots. Slot 1 always holds the ribbon color, and slot 2 always holds the size. You can peek inside and read any slot at any time. But you can't swap out what's in slot 2 without unwrapping a whole new box. Once you make a tuple, it's locked. This is called immutable, meaning nothing inside it can change.",
    how: [
      "Group a fixed set of values together, in a fixed order, sealed at the moment you create it.",
      "Read any value by its position (index), exactly like an array.",
      "Unpack the whole tuple into separate named variables in one line, if the language supports it.",
      "To 'change' anything, build and return a brand new tuple. The original one never changes.",
    ],
    when: "Use a tuple to return more than one value from a function, like a minimum and a maximum together. Also use it for a small fixed record, like a color as (r, g, b) or a point as (x, y), where each position's meaning is fixed and should never accidentally shift.",
    big: "Read by index: O(1) · Create: O(n) for n elements · No add/remove after creation — the size is locked in forever.",
    mistakes: [
      "Don't try to change a tuple in place, like tup[0] = 5. Real tuples reject this outright. Treat them as a stamped, read-only record, not a growable list.",
      "Don't reach for a tuple when you actually need a variable-length, growable collection. That job belongs to an array or list, not a tuple.",
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
    note: "JavaScript has no native tuple type. So this lesson simulates one with Object.freeze on an array. This seals the array, so any write to it throws an error. Python's tuple is immutable by design. It needs no freezing.",
  },
  {
    id: "sorted-set",
    pillar: "Data Structures",
    name: "Sorted Set",
    easy: "A sorted set is like a bookshelf where, the moment you add a book, you slide it straight into alphabetical position instead of dumping it at the end. The shelf is always in order. If you try to add a book that's already there, nothing changes. It's already shelved.",
    how: [
      "Keep only unique items, like a normal set. Adding the same item twice changes nothing.",
      "But also keep every item in sorted order at all times, not just any order.",
      "Insert a new item by finding exactly where it belongs (its sorted position) and sliding it into that spot.",
      "Because the layout is always sorted, questions like 'what's the smallest?' or 'what's everything between 20 and 60?' are cheap to answer.",
    ],
    when: "Use a sorted set for leaderboards that must display scores in order at all times, range questions like 'every score between 50 and 90,' or removing duplicates from data while keeping it sorted for display.",
    big: "Insert, using an array as shown below: O(n). Sliding items over to make room costs time, even though finding the spot is fast. Contains: O(log n), using binary search on the sorted layout. A real sorted set backed by a balanced tree gets insert down to O(log n) too.",
    mistakes: [
      "Don't confuse a sorted set with a sorted list that allows duplicates. A sorted set silently drops repeats. A sorted list keeps every copy.",
      "Don't assume insert is always instant just because lookups are fast. Keeping items in order costs something. A plain hash set inserts faster but keeps no order at all.",
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
    note: "This lesson stores items in a plain sorted array, using binary search to find insertion points. That's enough to see the idea. Production sorted sets, like Redis's ZSET, use a skip list or balanced tree underneath, so insert is O(log n) too.",
  },
  {
    id: "skip-list",
    pillar: "Data Structures",
    name: "Skip List",
    easy: "A skip list is like a subway map with express trains stacked over the local line. The local line, the bottom level, stops at every single station, in order. This is slow to cross town. An express line above it skips over several stops at once. A super-express line above that skips even more. To find a station, ride the fastest line you can until you'd overshoot it. Then drop down one line and keep going. You land on your stop after just a handful of hops, instead of walking every local station.",
    how: [
      "Store items in sorted order across several stacked linked levels.",
      "The bottom level is a complete, ordinary sorted linked list. Every item lives there.",
      "Higher levels hold only some of those same items, acting as 'express lanes' that skip over chunks of the level below.",
      "To search: start at the top level. Move forward while the next item is still less than the target. Drop down a level whenever moving forward would overshoot. Repeat until you land at the bottom.",
    ],
    when: "Use a skip list anywhere you want fast sorted-order search, insert, and delete, without the rebalancing logic a balanced tree needs. Redis's sorted sets are built on skip lists internally.",
    big: "Search, insert, delete: O(log n) on average. Each level lets you skip over a chunk of items at once, instead of checking them one by one. Space: O(n), since higher levels only add a smaller number of extra shortcut pointers.",
    mistakes: [
      "Don't assume a skip list is just a fancier array. It's really a stack of linked lists. The 'skipping' comes from having fewer items, and thus bigger jumps, at each level up.",
      "Remember that every item must exist at the bottom level. Higher levels are just optional shortcuts on top of that complete base list, not separate storage.",
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
    note: "Real-world skip lists pick each node's level with a coin flip, a random process. This is what makes them 'probabilistically balanced.' This lesson picks levels with a fixed rule instead, purely so the example is repeatable. But the search and insert logic is exactly the same as a production skip list.",
  },
  {
    id: "sparse-matrix",
    pillar: "Data Structures",
    name: "Sparse Matrix",
    easy: "A sparse matrix is like a star catalog, not a photograph of the whole night sky. A photograph records every single pixel, including all the empty black space. A star catalog only lists where the actual stars are, their coordinates and brightness. It treats everywhere else as 'nothing, obviously.' A sparse matrix does the same for a huge grid that's almost entirely zeros. It only records where the non-zero values live.",
    how: [
      "Instead of a full rows x cols grid, keep a lookup keyed by (row, col) that only holds entries for non-zero values.",
      "get(row, col): look up that key. If you find it, return its value. If not, the cell is 0 by definition.",
      "set(row, col, value): if the value is 0, remove that key entirely. There's no point storing a zero. Otherwise, store or update it.",
      "To scan or total the matrix, loop only over the stored, non-zero entries. Never loop over every empty cell.",
    ],
    when: "Use a sparse matrix for huge grids that are almost entirely zero: scientific and engineering simulations, one-hot encoded machine-learning feature vectors, or graph connections where there are far fewer edges than possible node pairs.",
    big: "get or set one cell: O(1) on average, using a hash-map lookup. Space: O(k), where k is the number of non-zero entries, not rows times cols. A full scan, like summing every value: O(k), not O(rows times cols).",
    mistakes: [
      "Don't store an explicit 0 anyway. That defeats the entire point. Always treat 'missing from storage' as the zero value. Never store zero itself.",
      "Don't reach for a sparse matrix when the data is mostly filled in. The overhead of a hash-map lookup per cell makes it slower than a plain 2D array, once most cells actually hold a value.",
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
