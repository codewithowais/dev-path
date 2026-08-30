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
  {
    id: "adapter",
    pillar: "Design Patterns",
    name: "Adapter",
    easy: "An adapter is like a travel power-plug adapter. Your laptop charger has a US plug, but the wall socket in another country is a different shape. You don't rebuild the charger or the wall — you plug a small adapter in between, and suddenly they fit. In code, an adapter sits between two things that don't match and translates one's shape into the other's.",
    how: [
      "You have an existing object whose methods don't match what your code expects.",
      "Wrap it in an adapter object that exposes the method name your code wants.",
      "Inside, the adapter just calls the old object's real method and returns the result — the translation happens in one place.",
    ],
    when: "When you're plugging in an old class, a third-party library, or someone else's code that almost fits — but not quite — and you don't want to rewrite it.",
    big: "Calling through the adapter is O(1) extra work — just one more function call.",
    mistakes: [
      "Trying to modify the original class instead of wrapping it (sometimes you can't — it's someone else's code).",
      "Putting extra logic inside the adapter beyond translation, which makes it confusing to reason about.",
    ],
    code: {
      JavaScript: `class OldPrinter {
  printOld(text) {
    return "Old printer: " + text;
  }
}

class PrinterAdapter {
  constructor(oldPrinter) {
    this.oldPrinter = oldPrinter; // the thing we're translating for
  }
  print(text) {
    return this.oldPrinter.printOld(text); // translate the call
  }
}

const old = new OldPrinter();
const adapter = new PrinterAdapter(old);
console.log(adapter.print("Hello"));`,
      Python: `class OldPrinter:
    def print_old(self, text):
        return "Old printer: " + text

class PrinterAdapter:
    def __init__(self, old_printer):
        self.old_printer = old_printer  # the thing we're translating for
    def print(self, text):
        return self.old_printer.print_old(text)  # translate the call

old = OldPrinter()
adapter = PrinterAdapter(old)
print(adapter.print("Hello"))`,
    },
    output: `Old printer: Hello`,
  },
  {
    id: "decorator",
    pillar: "Design Patterns",
    name: "Decorator",
    easy: "A decorator is like wrapping a gift. You start with a plain box (the base), then add wrapping paper, then a bow — each layer adds something on top without changing what's inside the box. In code, a decorator wraps a simple object or function and adds extra behavior in layers, one on top of the next.",
    how: [
      "Start with a simple base thing that does the core job.",
      "Wrap it in a decorator that calls the base and adds a bit extra.",
      "Wrap that result in another decorator, and so on — each layer adds one more thing.",
    ],
    when: "When you want to add features (like logging, milk in a coffee, or extra formatting) without changing the original code, and you want to mix and match those extras freely.",
    big: "Each layer adds O(1) extra work, so n layers cost O(n) total.",
    mistakes: [
      "Stacking so many decorators that it's hard to tell what the final behavior actually is.",
      "Forgetting to call the wrapped thing inside the decorator, so the original behavior gets lost.",
    ],
    code: {
      JavaScript: `function coffee() {
  return "Coffee";
}

function withMilk(drink) {
  return () => drink() + " + Milk"; // adds one layer
}

function withSugar(drink) {
  return () => drink() + " + Sugar"; // adds another layer
}

let order = coffee;
order = withMilk(order);
order = withSugar(order);

console.log(order());`,
      Python: `def coffee():
    return "Coffee"

def with_milk(drink):
    return lambda: drink() + " + Milk"  # adds one layer

def with_sugar(drink):
    return lambda: drink() + " + Sugar"  # adds another layer

order = coffee
order = with_milk(order)
order = with_sugar(order)

print(order())`,
    },
    output: `Coffee + Milk + Sugar`,
  },
  {
    id: "facade",
    pillar: "Design Patterns",
    name: "Facade",
    easy: "A facade is like a hotel front desk. Behind the scenes there's housekeeping, room service, billing, and maintenance — lots of separate departments. You don't call each one yourself; you just tell the front desk what you need, and it coordinates everything for you. In code, a facade is one simple object that hides a bunch of complicated parts behind an easy interface.",
    how: [
      "You have several smaller classes or steps that need to happen together in the right order.",
      "Build one 'facade' object that knows how to call all of them correctly.",
      "Your code just talks to the facade's simple method instead of juggling every part itself.",
    ],
    when: "When a task needs several subsystems working together (turning on lights, screen, and music for movie night) and you want one simple entry point instead of exposing all the pieces.",
    big: "The facade itself adds O(1) overhead — it just forwards to the real work underneath.",
    mistakes: [
      "Making the facade so 'smart' it becomes a second complicated system instead of a simple front door.",
      "Hiding things so well that advanced users can't get to the underlying parts when they actually need to.",
    ],
    code: {
      JavaScript: `class Lights {
  on() { return "Lights on"; }
}
class Music {
  play() { return "Music playing"; }
}
class Screen {
  down() { return "Screen down"; }
}

class HomeTheaterFacade {
  constructor() {
    this.lights = new Lights();
    this.music = new Music();
    this.screen = new Screen();
  }
  watchMovie() {
    return [this.lights.on(), this.screen.down(), this.music.play()].join(", ");
  }
}

const theater = new HomeTheaterFacade();
console.log(theater.watchMovie());`,
      Python: `class Lights:
    def on(self):
        return "Lights on"

class Music:
    def play(self):
        return "Music playing"

class Screen:
    def down(self):
        return "Screen down"

class HomeTheaterFacade:
    def __init__(self):
        self.lights = Lights()
        self.music = Music()
        self.screen = Screen()
    def watch_movie(self):
        return ", ".join([self.lights.on(), self.screen.down(), self.music.play()])

theater = HomeTheaterFacade()
print(theater.watch_movie())`,
    },
    output: `Lights on, Screen down, Music playing`,
  },
  {
    id: "builder",
    pillar: "Design Patterns",
    name: "Builder",
    easy: "A builder is like ordering a custom burger at a counter: add a bun, add a patty, add cheese, then say 'that's it, build it.' You add the pieces one step at a time, and only at the end do you get the finished burger. In code, a builder lets you construct a complicated object piece by piece instead of trying to create it all in one giant step.",
    how: [
      "Create a builder object that starts empty.",
      "Call methods on it one at a time to add each part — each one can hand back the builder so you can chain the next step.",
      "Call a final 'build' method to get the finished object out.",
    ],
    when: "When an object has many optional parts or needs to be assembled in steps (a burger, a form, a complex settings object) and one giant constructor call would be messy.",
    big: "Adding each part is O(1); building n parts is O(n) total.",
    mistakes: [
      "Forgetting to return `this` (or `self`) from each step, breaking the chain of calls.",
      "Calling build() before adding the parts you actually needed.",
    ],
    code: {
      JavaScript: `class BurgerBuilder {
  constructor() {
    this.parts = [];
  }
  addBun() {
    this.parts.push("bun");
    return this; // let calls chain together
  }
  addPatty() {
    this.parts.push("patty");
    return this;
  }
  addCheese() {
    this.parts.push("cheese");
    return this;
  }
  build() {
    return this.parts.join(" + ");
  }
}

const burger = new BurgerBuilder().addBun().addPatty().addCheese().build();
console.log("Burger:", burger);`,
      Python: `class BurgerBuilder:
    def __init__(self):
        self.parts = []
    def add_bun(self):
        self.parts.append("bun")
        return self  # let calls chain together
    def add_patty(self):
        self.parts.append("patty")
        return self
    def add_cheese(self):
        self.parts.append("cheese")
        return self
    def build(self):
        return " + ".join(self.parts)

burger = BurgerBuilder().add_bun().add_patty().add_cheese().build()
print("Burger:", burger)`,
    },
    output: `Burger: bun + patty + cheese`,
  },
  {
    id: "command",
    pillar: "Design Patterns",
    name: "Command",
    easy: "A command is like a restaurant order slip. The waiter writes 'make a burger' on a slip instead of cooking it themselves. That slip can be handed to the kitchen, put in a queue, or even used later to say what to undo. In code, a command is an object that packages up 'do this action' so it can be passed around, stored, and even reversed.",
    how: [
      "Wrap an action in a command object with an `execute` method that performs it.",
      "Optionally give it an `undo` method that reverses the action.",
      "Instead of calling the action directly, you call `execute()` on the command — so the caller doesn't need to know the details.",
    ],
    when: "When you want to queue actions, log them, or support undo/redo — think remote controls, menu actions, or task queues.",
    big: "Executing or undoing one command is O(1) — the cost is whatever the wrapped action costs.",
    mistakes: [
      "Forgetting to implement undo symmetrically with execute, so undo doesn't actually reverse things.",
      "Putting the action's real logic outside the command, defeating the point of wrapping it.",
    ],
    code: {
      JavaScript: `class Light {
  constructor() { this.isOn = false; }
  turnOn() { this.isOn = true; return "Light on"; }
  turnOff() { this.isOn = false; return "Light off"; }
}

class TurnOnCommand {
  constructor(light) { this.light = light; }
  execute() { return this.light.turnOn(); }
  undo() { return this.light.turnOff(); }
}

const light = new Light();
const command = new TurnOnCommand(light);

console.log(command.execute());
console.log(command.undo());`,
      Python: `class Light:
    def __init__(self):
        self.is_on = False
    def turn_on(self):
        self.is_on = True
        return "Light on"
    def turn_off(self):
        self.is_on = False
        return "Light off"

class TurnOnCommand:
    def __init__(self, light):
        self.light = light
    def execute(self):
        return self.light.turn_on()
    def undo(self):
        return self.light.turn_off()

light = Light()
command = TurnOnCommand(light)

print(command.execute())
print(command.undo())`,
    },
    output: `Light on
Light off`,
  },
  {
    id: "iterator",
    pillar: "Design Patterns",
    name: "Iterator",
    easy: "An iterator is like a TV remote flipping through channels one at a time. You press 'next' and you get the next channel — you never need to know how the channels are wired up behind the screen. In code, an iterator lets you walk through a collection one item at a time through a simple 'is there more?' and 'give me the next one' interface, without exposing how the collection is actually stored.",
    how: [
      "The collection hands out an iterator instead of its raw internal data.",
      "The iterator tracks its own position and offers a 'hasNext' check plus a 'next' step.",
      "You loop: while there's a next item, ask for it and use it — the collection's internal storage stays hidden.",
    ],
    when: "When you want to walk through any collection (a list, a tree, a custom data structure) the same simple way, without caring how it's stored internally.",
    big: "Walking through all n items is O(n); each single step is O(1).",
    mistakes: [
      "Forgetting to check 'hasNext' before calling 'next', which can run off the end of the collection.",
      "Sharing one iterator's position across code that expected to start over from the beginning.",
    ],
    code: {
      JavaScript: `class Playlist {
  constructor(songs) {
    this.songs = songs;
  }
  createIterator() {
    let index = 0;
    const songs = this.songs;
    return {
      hasNext: () => index < songs.length,
      next: () => songs[index++],
    };
  }
}

const playlist = new Playlist(["Song A", "Song B", "Song C"]);
const iterator = playlist.createIterator();

while (iterator.hasNext()) {
  console.log(iterator.next());
}`,
      Python: `class PlaylistIterator:
    def __init__(self, songs):
        self.songs = songs
        self.index = 0
    def has_next(self):
        return self.index < len(self.songs)
    def next(self):
        song = self.songs[self.index]
        self.index += 1
        return song

class Playlist:
    def __init__(self, songs):
        self.songs = songs
    def create_iterator(self):
        return PlaylistIterator(self.songs)

playlist = Playlist(["Song A", "Song B", "Song C"])
iterator = playlist.create_iterator()

while iterator.has_next():
    print(iterator.next())`,
    },
    output: `Song A
Song B
Song C`,
  },
];

export default lessons;
