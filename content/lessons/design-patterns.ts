// content/lessons/design-patterns.ts
// Pillar: Design Patterns — how to organize big code.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/design-patterns.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "singleton",
    pillar: "Design Patterns",
    name: "Singleton",
    easy: "A singleton makes sure there's only ONE of something in your whole app. Like a country having only one official government: no matter who you ask, you get the same one. Handy for shared settings or a single database connection.",
    how: [
      "The first time it's created, make and store the one instance.",
      "Every later request returns that same stored instance instead of making a new one.",
      "So everyone shares the exact same object and its data.",
    ],
    when: "App-wide settings, a logger, or a single shared connection — anything where a second copy would cause confusion or waste.",
    big: "Creation and access are O(1). The 'cost' is design, not speed.",
    mistakes: [
      "Overusing it — a global shared object can make code hard to test and reason about.",
      "Accidentally creating new copies because the 'only one' check is wrong.",
    ],
    code: {
      JavaScript: `class Settings {
  constructor() {
    if (Settings.instance) return Settings.instance; // reuse the one
    this.theme = "light";
    Settings.instance = this;
  }
}

const a = new Settings();
const b = new Settings();
a.theme = "dark"; // change via a...

console.log("Same object?", a === b ? "yes" : "no");
console.log("b.theme:", b.theme); // ...b sees it too`,
      Python: `class Settings:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.theme = "light"
        return cls._instance  # reuse the one

a = Settings()
b = Settings()
a.theme = "dark"  # change via a...

print("Same object?", "yes" if a is b else "no")
print("b.theme:", b.theme)  # ...b sees it too`,
    },
    output: `Same object? yes
b.theme: dark`,
  },
  {
    id: "factory",
    pillar: "Design Patterns",
    name: "Factory",
    easy: "A factory is a single function you ask for an object, and it decides which exact kind to build for you. Like ordering 'a coffee' at a counter — you don't assemble it; you say what you want and the barista hands back the right drink.",
    how: [
      "You call one function and pass what kind of thing you want.",
      "The function contains the 'which type?' decision in one place.",
      "It builds and returns the right object, so your code doesn't need to know the details.",
    ],
    when: "When object creation is complicated or the exact type depends on input — and you want that decision in one tidy spot instead of scattered everywhere.",
    big: "Creating one object is O(1). The value is cleaner, centralized code.",
    mistakes: [
      "Letting the factory grow into a giant tangle of if-statements — split it up when it gets big.",
      "Forgetting a sensible default for unknown types.",
    ],
    code: {
      JavaScript: `function createAnimal(type) {
  if (type === "dog") return { speak: () => "Woof" };
  if (type === "cat") return { speak: () => "Meow" };
  return { speak: () => "..." }; // default for unknown types
}

console.log("dog:", createAnimal("dog").speak());
console.log("cat:", createAnimal("cat").speak());
console.log("fish:", createAnimal("fish").speak());`,
      Python: `def create_animal(kind):
    if kind == "dog":
        return lambda: "Woof"
    if kind == "cat":
        return lambda: "Meow"
    return lambda: "..."  # default for unknown types

print("dog:", create_animal("dog")())
print("cat:", create_animal("cat")())
print("fish:", create_animal("fish")())`,
    },
    output: `dog: Woof
cat: Meow
fish: ...`,
  },
  {
    id: "observer",
    pillar: "Design Patterns",
    name: "Observer",
    easy: "The observer pattern is a newsletter. People subscribe, and whenever there's news, everyone subscribed gets notified automatically. The publisher doesn't need to know who the subscribers are — it just announces, and they all react.",
    how: [
      "A 'subject' keeps a list of subscribers (functions to call).",
      "Anyone interested subscribes by adding themselves to that list.",
      "When something happens, the subject calls every subscriber so they all react.",
    ],
    when: "When one change should update many things: UI updating when data changes, notifications, or event systems.",
    big: "Notifying everyone is O(n) in the number of subscribers.",
    mistakes: [
      "Forgetting to unsubscribe, causing memory leaks or zombie updates.",
      "Assuming subscribers run in a guaranteed order.",
    ],
    code: {
      JavaScript: `class Newsletter {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  publish(msg) { this.subscribers.forEach((fn) => fn(msg)); }
}

const news = new Newsletter();
news.subscribe((msg) => console.log("Alice got:", msg));
news.subscribe((msg) => console.log("Bob got:", msg));
news.publish("New article!");`,
      Python: `class Newsletter:
    def __init__(self):
        self.subscribers = []
    def subscribe(self, fn):
        self.subscribers.append(fn)
    def publish(self, msg):
        for fn in self.subscribers:
            fn(msg)

news = Newsletter()
news.subscribe(lambda msg: print("Alice got:", msg))
news.subscribe(lambda msg: print("Bob got:", msg))
news.publish("New article!")`,
    },
    output: `Alice got: New article!
Bob got: New article!`,
  },
  {
    id: "strategy",
    pillar: "Design Patterns",
    name: "Strategy",
    easy: "The strategy pattern lets you swap out an interchangeable 'how' at runtime. Like a navigation app choosing between driving, walking, or cycling directions: same goal (get there), different method you can pick on the fly.",
    how: [
      "Define several interchangeable methods that all do the same kind of job.",
      "Store or pass in which one to use.",
      "Call it through a common entry point — swapping the method changes the behavior without rewriting the caller.",
    ],
    when: "When you have several ways to do one thing (sorting orders, payment methods, pricing rules) and want to switch between them cleanly.",
    big: "Choosing and running a strategy is O(1) plus whatever that strategy costs.",
    mistakes: [
      "Hardcoding one behavior with if/else everywhere instead of swapping strategies.",
      "Making strategies that don't share the same inputs/outputs, so they aren't truly interchangeable.",
    ],
    code: {
      JavaScript: `const strategies = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
};

function calculate(strategy, a, b) {
  return strategies[strategy](a, b);
}

console.log("add:", calculate("add", 3, 4));
console.log("multiply:", calculate("multiply", 3, 4));`,
      Python: `strategies = {
    "add": lambda a, b: a + b,
    "multiply": lambda a, b: a * b,
}

def calculate(strategy, a, b):
    return strategies[strategy](a, b)

print("add:", calculate("add", 3, 4))
print("multiply:", calculate("multiply", 3, 4))`,
    },
    output: `add: 7
multiply: 12`,
  },
];

export default lessons;
