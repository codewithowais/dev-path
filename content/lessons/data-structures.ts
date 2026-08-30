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
];

export default lessons;
