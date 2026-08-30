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
  {
    id: "prototype",
    pillar: "Design Patterns",
    name: "Prototype",
    easy: "The prototype pattern makes new objects by copying an existing one instead of building it from scratch. Like photocopying a filled-out form and just changing the name field, instead of drawing a brand new blank form and filling in every line again.",
    how: [
      "Start with one fully set-up object to use as the 'prototype'.",
      "Call a clone method on it that copies its fields into a brand new object.",
      "Tweak only the parts of the copy that need to be different — everything else comes for free.",
    ],
    when: "When making a new object from scratch is slow or repetitive, and most new objects look almost identical to one you already have — game characters, document templates, or pre-configured settings.",
    big: "Cloning one object is O(n) in the number of fields being copied — much cheaper than rebuilding everything field by field.",
    mistakes: [
      "Doing a 'shallow' copy when you needed a 'deep' copy, so both objects end up secretly sharing the same nested data.",
      "Forgetting that the original prototype should stay unchanged — editing a clone should never affect the prototype it came from.",
    ],
    code: {
      JavaScript: `class Character {
  constructor(name, health, weapon) {
    this.name = name;
    this.health = health;
    this.weapon = weapon;
  }
  clone() {
    return new Character(this.name, this.health, this.weapon); // copy, don't rebuild
  }
}

const basePrototype = new Character("Warrior", 100, "Sword");

const hero1 = basePrototype.clone();
hero1.name = "Aragorn";

const hero2 = basePrototype.clone();
hero2.name = "Legolas";
hero2.weapon = "Bow";

console.log(hero1.name + ": " + hero1.health + " HP, " + hero1.weapon);
console.log(hero2.name + ": " + hero2.health + " HP, " + hero2.weapon);
console.log("Prototype unchanged:", basePrototype.name);`,
      Python: `class Character:
    def __init__(self, name, health, weapon):
        self.name = name
        self.health = health
        self.weapon = weapon
    def clone(self):
        return Character(self.name, self.health, self.weapon)  # copy, don't rebuild

base_prototype = Character("Warrior", 100, "Sword")

hero1 = base_prototype.clone()
hero1.name = "Aragorn"

hero2 = base_prototype.clone()
hero2.name = "Legolas"
hero2.weapon = "Bow"

print(hero1.name + ": " + str(hero1.health) + " HP, " + hero1.weapon)
print(hero2.name + ": " + str(hero2.health) + " HP, " + hero2.weapon)
print("Prototype unchanged:", base_prototype.name)`,
    },
    output: `Aragorn: 100 HP, Sword
Legolas: 100 HP, Bow
Prototype unchanged: Warrior`,
  },
  {
    id: "chain-of-responsibility",
    pillar: "Design Patterns",
    name: "Chain of Responsibility",
    easy: "Chain of responsibility passes a request along a line of handlers until one of them can deal with it. Like an expense request going to your manager first; if it's too big for them to approve, it moves up to the director, then the VP — each person either handles it or passes it up the chain.",
    how: [
      "Line up a series of handler objects, each one knowing which handler comes next.",
      "Hand the request to the first handler in line.",
      "Each handler checks 'can I handle this?' — if yes, it deals with it; if no, it passes the request to the next handler in line.",
    ],
    when: "When several objects might handle a request but you don't know which one in advance — approval chains, event handling, or support-ticket escalation.",
    big: "In the worst case a request travels through all n handlers, so handling one request is O(n).",
    mistakes: [
      "Forgetting to set the 'next' handler, so a request silently gets dropped instead of passing along.",
      "Building a chain so long that requests take forever to reach the handler that can actually deal with them.",
    ],
    code: {
      JavaScript: `class Approver {
  constructor(name, limit) {
    this.name = name;
    this.limit = limit;
    this.next = null;
  }
  setNext(next) {
    this.next = next;
    return next; // lets us chain setNext calls
  }
  approve(amount) {
    if (amount <= this.limit) return this.name + " approved $" + amount;
    if (this.next) return this.next.approve(amount); // pass it up the chain
    return "No one could approve $" + amount;
  }
}

const manager = new Approver("Manager", 100);
const director = new Approver("Director", 1000);
const vp = new Approver("VP", 1000000);
manager.setNext(director);
director.setNext(vp);

console.log(manager.approve(50));
console.log(manager.approve(500));
console.log(manager.approve(5000));`,
      Python: `class Approver:
    def __init__(self, name, limit):
        self.name = name
        self.limit = limit
        self.next = None
    def set_next(self, next_approver):
        self.next = next_approver
        return next_approver  # lets us chain set_next calls
    def approve(self, amount):
        if amount <= self.limit:
            return self.name + " approved $" + str(amount)
        if self.next:
            return self.next.approve(amount)  # pass it up the chain
        return "No one could approve $" + str(amount)

manager = Approver("Manager", 100)
director = Approver("Director", 1000)
vp = Approver("VP", 1000000)
manager.set_next(director)
director.set_next(vp)

print(manager.approve(50))
print(manager.approve(500))
print(manager.approve(5000))`,
    },
    output: `Manager approved $50
Director approved $500
VP approved $5000`,
  },
  {
    id: "state",
    pillar: "Design Patterns",
    name: "State",
    easy: "The state pattern is a traffic light. A traffic light doesn't run one giant pile of if-statements checking what color comes next — each color simply knows what comes after it. The light just asks its current state 'what's next?' and switches to whatever that state says. In code, an object's behavior changes automatically based on which 'state' it's currently in.",
    how: [
      "Give each state (Red, Green, Yellow) its own small object that knows only what state comes after it.",
      "The main object just holds 'whichever state I'm currently in' and asks that state to move things along.",
      "When a state object switches things to the next state, the main object's behavior automatically changes too — no giant if/else required.",
    ],
    when: "When an object behaves differently depending on its current mode or phase — a traffic light, an order status (placed, shipped, delivered), or a media player (playing, paused, stopped).",
    big: "Switching state is O(1) — you're just swapping which small state object is 'current'.",
    mistakes: [
      "Cramming all the state-transition logic into one giant if/else instead of letting each state own its own transition.",
      "Forgetting to actually update the current state, so the object gets stuck repeating the same behavior forever.",
    ],
    code: {
      JavaScript: `class RedState {
  get name() { return "Red"; }
  next(light) { light.setState(new GreenState()); }
}
class GreenState {
  get name() { return "Green"; }
  next(light) { light.setState(new YellowState()); }
}
class YellowState {
  get name() { return "Yellow"; }
  next(light) { light.setState(new RedState()); }
}

class TrafficLight {
  constructor() { this.state = new RedState(); }
  setState(state) { this.state = state; }
  change() {
    this.state.next(this); // ask the current state what's next
    return this.state.name;
  }
}

const light = new TrafficLight();
console.log("Start:", light.state.name);
console.log("Change:", light.change());
console.log("Change:", light.change());
console.log("Change:", light.change());`,
      Python: `class RedState:
    name = "Red"
    def next(self, light):
        light.set_state(GreenState())

class GreenState:
    name = "Green"
    def next(self, light):
        light.set_state(YellowState())

class YellowState:
    name = "Yellow"
    def next(self, light):
        light.set_state(RedState())

class TrafficLight:
    def __init__(self):
        self.state = RedState()
    def set_state(self, state):
        self.state = state
    def change(self):
        self.state.next(self)  # ask the current state what's next
        return self.state.name

light = TrafficLight()
print("Start:", light.state.name)
print("Change:", light.change())
print("Change:", light.change())
print("Change:", light.change())`,
    },
    output: `Start: Red
Change: Green
Change: Yellow
Change: Red`,
  },
  {
    id: "template-method",
    pillar: "Design Patterns",
    name: "Template Method",
    easy: "A template method is a recipe card with some steps fixed and others left blank for you to fill in. 'Boil water' and 'pour into cup' are always the same, but 'brew' and 'add condiments' change depending on whether you're making tea or coffee. In code, a base class locks in the overall order of steps, while subclasses fill in just the steps that differ.",
    how: [
      "Write one method in a base class that calls a fixed sequence of steps in order.",
      "Implement the steps that never change directly in the base class.",
      "Leave the steps that do change unimplemented in the base class, and let each subclass fill them in its own way.",
    ],
    when: "When several processes share the same overall shape but differ in a few specific steps — brewing a hot drink, running a report, or processing different file formats through the same pipeline.",
    big: "Running the template is O(n) in the number of steps — same cost as writing it out by hand, but organized instead of duplicated.",
    mistakes: [
      "Copy-pasting the whole sequence for every variant instead of pulling the shared steps into one template.",
      "Forgetting to override a required step, silently falling back to a base behavior that doesn't make sense for that subclass.",
    ],
    code: {
      JavaScript: `class HotBeverage {
  prepare() {
    const steps = [this.boilWater(), this.brew(), this.pourInCup(), this.addCondiments()];
    return steps.join(" -> ");
  }
  boilWater() { return "Boil water"; } // shared, fixed step
  pourInCup() { return "Pour in cup"; } // shared, fixed step
}

class Tea extends HotBeverage {
  brew() { return "Steep tea"; }
  addCondiments() { return "Add lemon"; }
}
class Coffee extends HotBeverage {
  brew() { return "Brew coffee grounds"; }
  addCondiments() { return "Add sugar and milk"; }
}

const tea = new Tea();
const coffee = new Coffee();
console.log("Tea:", tea.prepare());
console.log("Coffee:", coffee.prepare());`,
      Python: `class HotBeverage:
    def prepare(self):
        steps = [self.boil_water(), self.brew(), self.pour_in_cup(), self.add_condiments()]
        return " -> ".join(steps)
    def boil_water(self):
        return "Boil water"  # shared, fixed step
    def pour_in_cup(self):
        return "Pour in cup"  # shared, fixed step

class Tea(HotBeverage):
    def brew(self):
        return "Steep tea"
    def add_condiments(self):
        return "Add lemon"

class Coffee(HotBeverage):
    def brew(self):
        return "Brew coffee grounds"
    def add_condiments(self):
        return "Add sugar and milk"

tea = Tea()
coffee = Coffee()
print("Tea:", tea.prepare())
print("Coffee:", coffee.prepare())`,
    },
    output: `Tea: Boil water -> Steep tea -> Pour in cup -> Add lemon
Coffee: Boil water -> Brew coffee grounds -> Pour in cup -> Add sugar and milk`,
  },
  {
    id: "composite",
    pillar: "Design Patterns",
    name: "Composite",
    easy: "Composite is how folders work: a folder can contain files, but it can also contain more folders — which themselves contain files and folders. Composite lets you treat a single file and a whole folder full of files the exact same way, calling the same method on both and letting each one figure out what that means for itself.",
    how: [
      "Give both the simple items (files) and the containers (folders) the same method name, like getSize().",
      "A simple item just returns its own answer directly.",
      "A container loops over everything inside it — files or more folders — and combines their answers, so it works no matter how deeply things are nested.",
    ],
    when: "When you have tree-shaped data — file systems, UI components containing other components, org charts — and want to treat a single item and a whole group of them the same way.",
    big: "Working with a composite touches every node once, so it's O(n) in the total number of items, including nested ones.",
    mistakes: [
      "Giving containers and simple items different method names, forcing you to check 'is this a file or a folder?' everywhere instead of calling the same method on both.",
      "Accidentally letting a folder contain itself, causing infinite loops when you try to add up its size.",
    ],
    code: {
      JavaScript: `class File {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
  getSize() { return this.size; } // simple item: just its own answer
}

class Folder {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  add(child) {
    this.children.push(child);
    return this;
  }
  getSize() {
    let total = 0;
    for (const child of this.children) total += child.getSize(); // same method, file or folder
    return total;
  }
}

const file1 = new File("resume.pdf", 200);
const file2 = new File("photo.jpg", 500);
const photos = new Folder("Photos");
photos.add(file2);
const documents = new Folder("Documents");
documents.add(file1).add(photos);

console.log("resume.pdf size:", file1.getSize());
console.log("Photos folder size:", photos.getSize());
console.log("Documents folder size:", documents.getSize());`,
      Python: `class File:
    def __init__(self, name, size):
        self.name = name
        self.size = size
    def get_size(self):
        return self.size  # simple item: just its own answer

class Folder:
    def __init__(self, name):
        self.name = name
        self.children = []
    def add(self, child):
        self.children.append(child)
        return self
    def get_size(self):
        total = 0
        for child in self.children:
            total += child.get_size()  # same method, file or folder
        return total

file1 = File("resume.pdf", 200)
file2 = File("photo.jpg", 500)
photos = Folder("Photos")
photos.add(file2)
documents = Folder("Documents")
documents.add(file1).add(photos)

print("resume.pdf size:", file1.get_size())
print("Photos folder size:", photos.get_size())
print("Documents folder size:", documents.get_size())`,
    },
    output: `resume.pdf size: 200
Photos folder size: 500
Documents folder size: 700`,
  },
  {
    id: "proxy",
    pillar: "Design Patterns",
    name: "Proxy",
    easy: "A proxy is a security guard standing in front of an office. Anyone who wants to go in has to go through the guard first — the guard checks your badge, and only if you pass does the guard let you through to the real office. In code, a proxy object stands in front of the real object and controls access to it: checking permissions, caching results, or logging calls before letting the real thing run.",
    how: [
      "Create a proxy object with the exact same method names as the real object.",
      "Have callers talk to the proxy instead of the real object directly.",
      "The proxy does its own check first (permission, cache, logging) and only forwards the call to the real object when it decides to.",
    ],
    when: "When you need to control or add a step before reaching an object — permission checks, caching expensive results, lazy-loading something heavy, or logging every access.",
    big: "The proxy's own check is O(1) extra work before (optionally) doing whatever the real object costs.",
    mistakes: [
      "Forgetting to actually forward the call to the real object when access should be allowed, so nothing happens even for valid requests.",
      "Putting so much unrelated logic in the proxy that it stops being a simple gatekeeper and becomes its own tangled system.",
    ],
    code: {
      JavaScript: `class RealOffice {
  enter() { return "Entered the office"; }
}

class SecurityProxy {
  constructor(office, hasBadge) {
    this.office = office;
    this.hasBadge = hasBadge;
  }
  enter() {
    if (!this.hasBadge) return "Access denied: no badge"; // guard blocks it
    return this.office.enter(); // guard waves them through
  }
}

const office = new RealOffice();
const guestProxy = new SecurityProxy(office, false);
const employeeProxy = new SecurityProxy(office, true);

console.log(guestProxy.enter());
console.log(employeeProxy.enter());`,
      Python: `class RealOffice:
    def enter(self):
        return "Entered the office"

class SecurityProxy:
    def __init__(self, office, has_badge):
        self.office = office
        self.has_badge = has_badge
    def enter(self):
        if not self.has_badge:
            return "Access denied: no badge"  # guard blocks it
        return self.office.enter()  # guard waves them through

office = RealOffice()
guest_proxy = SecurityProxy(office, False)
employee_proxy = SecurityProxy(office, True)

print(guest_proxy.enter())
print(employee_proxy.enter())`,
    },
    output: `Access denied: no badge
Entered the office`,
  },
];

export default lessons;
