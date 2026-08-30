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
    easy: "A singleton makes sure your app has only ONE of something. Think of a country with only one official government. No matter who you ask, you get the same one. This is handy for shared settings or one shared database connection.",
    how: [
      "The first time you create it, you build and store the one instance.",
      "Every later request gets that same stored instance. It never makes a new one.",
      "So everyone shares the exact same object and the exact same data.",
    ],
    when: "Use this for app-wide settings, a logger, or one shared connection. Use it anywhere a second copy would cause confusion or waste.",
    big: "Creating the instance and getting it both take O(1) time — that means a constant amount of time, no matter how big your app grows. The real cost here is design, not speed.",
    mistakes: [
      "Don't overuse it. A global shared object can make your code hard to test and understand.",
      "Watch your 'only one' check for bugs. A wrong check can create extra copies by accident.",
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
    easy: "A factory is one function that builds an object for you. It decides which exact kind to build. Think of ordering 'a coffee' at a counter. You don't make it yourself — you say what you want, and the barista hands you the right drink.",
    how: [
      "You call one function and tell it what kind of thing you want.",
      "That function makes the 'which type?' decision in one place.",
      "It builds and returns the right object. Your code never needs to know the details.",
    ],
    when: "Use this when building an object is complex, or the exact type depends on input. Keep that decision in one tidy spot instead of spreading it everywhere.",
    big: "Creating one object takes O(1) time (a constant amount, no matter how much you build). The real value is cleaner, centralized code.",
    mistakes: [
      "Don't let the factory grow into a giant tangle of if-statements. Split it up once it gets big.",
      "Always add a sensible default for types you don't recognize.",
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
    easy: "The observer pattern works like a newsletter. People subscribe, and whenever there's news, every subscriber gets notified automatically. The publisher doesn't need to know who the subscribers are. It just announces the news, and they all react.",
    how: [
      "A 'subject' keeps a list of subscribers — functions it can call.",
      "Anyone interested subscribes by adding themselves to that list.",
      "When something happens, the subject calls every subscriber, so they all react.",
    ],
    when: "Use this when one change should update many things at once. Examples: a UI updating when data changes, notifications, or event systems.",
    big: "Notifying everyone takes O(n) time — that grows with n, the number of subscribers.",
    mistakes: [
      "Don't forget to unsubscribe. Skipping this can cause memory leaks or updates from code that should be gone.",
      "Don't assume subscribers run in a guaranteed order.",
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
    easy: "The strategy pattern lets you swap out how something gets done, on the fly. Think of a map app choosing between driving, walking, or biking directions. The goal — getting there — stays the same, but you can pick a different method any time.",
    how: [
      "Define several methods that can swap in for each other and do the same kind of job.",
      "Store or pass in which one to use.",
      "Call it through one shared entry point. Swapping the method changes the behavior, and you don't rewrite the calling code.",
    ],
    when: "Use this when you have several ways to do one thing — sorting orders, payment methods, or pricing rules — and want to switch between them cleanly.",
    big: "Choosing and running a strategy takes O(1) time (constant time) plus whatever that strategy itself costs.",
    mistakes: [
      "Don't hardcode one behavior with if/else everywhere. Swap strategies instead.",
      "Give every strategy the same inputs and outputs, so you can truly swap them for each other.",
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
    easy: "An adapter works like a travel plug adapter. Your charger has one shape of plug, and the wall socket has another. You don't rebuild either one — you plug a small adapter in between so they fit. In code, an adapter sits between two mismatched pieces and translates one into the other.",
    how: [
      "You start with an existing object whose methods don't match what your code expects.",
      "You wrap it in an adapter object that offers the method name your code wants.",
      "Inside, the adapter calls the old object's real method and returns the result. All the translation happens in one place.",
    ],
    when: "Use this when you're plugging in an old class, a third-party library, or someone else's code that almost fits, but not quite, and you don't want to rewrite it.",
    big: "Calling through the adapter costs O(1) extra work — just one more function call.",
    mistakes: [
      "Don't try to change the original class instead of wrapping it. Sometimes you can't — it's someone else's code.",
      "Don't put extra logic inside the adapter beyond translation. That makes it confusing to follow.",
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
    easy: "A decorator works like wrapping a gift. You start with a plain box, then add wrapping paper, then a bow. Each layer adds something extra without changing what's inside. In code, a decorator wraps a simple object and adds extra behavior, one layer at a time.",
    how: [
      "Start with a simple base thing that does the core job.",
      "Wrap it in a decorator that calls the base and adds a bit extra.",
      "Wrap that result in another decorator, and so on. Each layer adds one more thing.",
    ],
    when: "Use this when you want to add features — like logging, milk in a coffee, or extra formatting — without changing the original code. You can then mix and match those extras freely.",
    big: "Each layer adds O(1) extra work (a constant amount). So n layers cost O(n) total — the total time grows along with the number of layers.",
    mistakes: [
      "Don't stack so many decorators that no one can tell what the final behavior actually is.",
      "Always call the wrapped thing inside your decorator, or the original behavior gets lost.",
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
    easy: "A facade works like a hotel front desk. Behind it are housekeeping, room service, and billing — lots of separate departments. But you just tell the front desk what you need, and it handles the rest. In code, a facade is one simple object that hides a bunch of complicated parts behind an easy front door.",
    how: [
      "You start with several smaller classes or steps that need to happen together, in the right order.",
      "You build one 'facade' object that knows how to call all of them correctly.",
      "Your code just talks to the facade's simple method, instead of juggling every part itself.",
    ],
    when: "Use this when a task needs several parts working together — like turning on lights, a screen, and music for movie night. You want one simple entry point instead of exposing every piece.",
    big: "The facade itself adds O(1) overhead (a constant, small amount). It just forwards the call to the real work underneath.",
    mistakes: [
      "Don't make the facade so 'smart' that it becomes a second complicated system instead of a simple front door.",
      "Don't hide things so well that advanced users can't reach the underlying parts when they need to.",
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
    easy: "A builder works like ordering a custom burger at a counter. You add a bun, add a patty, add cheese, then say 'build it.' You add pieces one step at a time, and only at the end do you get the finished thing. In code, a builder puts together a complex object piece by piece, instead of in one giant step.",
    how: [
      "You create a builder object that starts empty.",
      "You call methods on it, one at a time, to add each part. Each one can hand back the builder, so you can chain the next step.",
      "You call a final 'build' method to get the finished object.",
    ],
    when: "Use this when an object has many optional parts, or needs to be assembled step by step — like a burger, a form, or a complex settings object. One giant constructor call would get messy.",
    big: "Adding each part takes O(1) time (a constant amount). Building n parts takes O(n) total — the time grows with the number of parts.",
    mistakes: [
      "Always return `this` (or `self`) from each step, or you'll break the chain of calls.",
      "Don't call build() before you've added all the parts you actually need.",
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
    easy: "A command works like a restaurant order slip. The waiter writes down 'make a burger' instead of cooking it themselves. That slip can be handed to the kitchen, held in a queue, or used later to undo the order. In code, a command packages up 'do this action' as an object, so you can store it, pass it around, and even reverse it.",
    how: [
      "You wrap an action in a command object with an `execute` method that performs it.",
      "You can also give it an `undo` method that reverses the action.",
      "Instead of calling the action directly, you call `execute()` on the command. The caller never needs to know the details.",
    ],
    when: "Use this when you want to queue actions, log them, or support undo/redo. Think remote controls, menu actions, or task queues.",
    big: "Running or undoing one command takes O(1) time (a constant amount). The real cost is whatever the wrapped action itself costs.",
    mistakes: [
      "Make undo mirror execute exactly, or undo won't actually reverse things.",
      "Don't put the action's real logic outside the command. That defeats the point of wrapping it.",
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
    easy: "An iterator works like a TV remote flipping through channels. You press 'next' and get the next channel. You never see how the channels are wired up behind the screen. In code, an iterator lets you step through a collection of items, one at a time, without knowing how it's stored inside.",
    how: [
      "The collection hands you an iterator, instead of its raw internal data.",
      "The iterator tracks its own position. It offers a 'hasNext' check and a 'next' step.",
      "You loop: while there's a next item, you ask for it and use it. The collection's internal storage stays hidden.",
    ],
    when: "Use this when you want to walk through any collection — a list, a tree, or a custom data structure — the same simple way, without caring how it's stored inside.",
    big: "Walking through all n items takes O(n) time — the time grows with n. Each single step takes O(1) time (a constant amount).",
    mistakes: [
      "Always check 'hasNext' before calling 'next'. Skipping this can run you off the end of the collection.",
      "Don't share one iterator's position across code that expects to start over from the beginning.",
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
    easy: "The prototype pattern makes new objects by copying an existing one, instead of building it from scratch. It's like photocopying a filled-out form and just changing the name field, instead of drawing a brand new blank form and filling in every line again.",
    how: [
      "You start with one fully set-up object to use as the 'prototype'.",
      "You call a clone method on it. That method copies its fields into a brand new object.",
      "You tweak only the parts of the copy that need to be different. Everything else comes for free.",
    ],
    when: "Use this when making a new object from scratch is slow or repetitive, and most new objects look almost identical to one you already have. Examples: game characters, document templates, or preset settings.",
    big: "Cloning one object takes O(n) time, where n is the number of fields you copy. That's much cheaper than rebuilding everything field by field.",
    mistakes: [
      "Don't do a 'shallow' copy when you need a 'deep' copy. A shallow copy leaves both objects secretly sharing the same nested data.",
      "Keep the original prototype unchanged. Editing a clone should never affect the prototype it came from.",
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
    easy: "Chain of responsibility passes a request down a line of people until someone can handle it. Think of an expense request going to your manager first. If it's too big, it moves up to the director, then the VP. Each person either deals with it or bumps it up the chain.",
    how: [
      "You line up a series of handler objects. Each one knows which handler comes next.",
      "You hand the request to the first handler in line.",
      "Each handler asks 'can I handle this?' If yes, it deals with it. If no, it passes the request to the next handler in line.",
    ],
    when: "Use this when several objects might handle a request, but you don't know which one in advance. Examples: approval chains, event handling, or support-ticket escalation.",
    big: "In the worst case, a request travels through all n handlers. So handling one request takes O(n) time — the time can grow with the number of handlers.",
    mistakes: [
      "Always set the 'next' handler, or a request can silently get dropped instead of passing along.",
      "Don't build a chain so long that requests take forever to reach the handler that can actually deal with them.",
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
    easy: "The state pattern works like a traffic light. Each color simply knows what comes next — red knows green comes after it, and so on. The light just asks 'what's next?' and switches automatically. In code, an object's behavior changes on its own, based on what 'state' it's currently in.",
    how: [
      "You give each state — Red, Green, Yellow — its own small object. Each one only knows what state comes after it.",
      "The main object just holds 'whichever state I'm currently in', and asks that state to move things along.",
      "When a state object switches to the next state, the main object's behavior changes too, automatically. You need no giant if/else.",
    ],
    when: "Use this when an object behaves differently depending on its current mode or phase. Examples: a traffic light, an order status (placed, shipped, delivered), or a media player (playing, paused, stopped).",
    big: "Switching state takes O(1) time (a constant amount). You're just swapping which small state object is 'current'.",
    mistakes: [
      "Don't cram all the state-transition logic into one giant if/else. Let each state own its own transition.",
      "Always update the current state, or the object gets stuck repeating the same behavior forever.",
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
    easy: "A template method works like a recipe card. Some steps are fixed, and some are left blank for you to fill in. 'Boil water' and 'pour into cup' never change, but 'brew' and 'add condiments' depend on whether you're making tea or coffee. In code, a base class (a starting blueprint other classes build on) locks in the overall order of steps. Each subclass — a class built from that blueprint — fills in just the steps that differ.",
    how: [
      "You write one method in a base class that runs a fixed sequence of steps, in order.",
      "You write the steps that never change directly in the base class.",
      "You leave the steps that do change unwritten in the base class. Each subclass fills them in its own way.",
    ],
    when: "Use this when several processes share the same overall shape, but differ in a few specific steps. Examples: brewing a hot drink, running a report, or processing different file formats through the same pipeline.",
    big: "Running the template takes O(n) time, where n is the number of steps. That's the same cost as writing it out by hand, but organized instead of duplicated.",
    mistakes: [
      "Don't copy-paste the whole sequence for every variant. Pull the shared steps into one template instead.",
      "Always override every required step. Skipping one can silently fall back to base behavior that doesn't fit that subclass.",
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
    easy: "Composite works like folders on your computer. A folder can hold files, but it can also hold more folders, which hold more files and folders. Composite lets you treat one single file and a whole folder full of files the exact same way. Ask either one 'how big are you?' and each figures out its own answer.",
    how: [
      "You give both the simple items (files) and the containers (folders) the same method name, like getSize().",
      "A simple item just returns its own answer directly.",
      "A container loops over everything inside it — files or more folders — and adds up their answers. This works no matter how deeply things are nested.",
    ],
    when: "Use this when you have tree-shaped data — file systems, UI components holding other components, or org charts — and want to treat a single item and a whole group the same way.",
    big: "Working with a composite touches every item once. So it takes O(n) time, where n is the total number of items, including nested ones.",
    mistakes: [
      "Don't give containers and simple items different method names. That forces you to check 'is this a file or a folder?' everywhere, instead of calling the same method on both.",
      "Don't let a folder accidentally contain itself. That causes infinite loops when you try to add up its size.",
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
    easy: "A proxy works like a security guard standing in front of an office. Anyone who wants in has to go through the guard first. The guard checks your badge before letting you through to the real office. In code, a proxy object stands in front of the real object and controls access to it. It might check permissions, cache results, or log calls first.",
    how: [
      "You create a proxy object with the exact same method names as the real object.",
      "You have callers talk to the proxy, instead of the real object directly.",
      "The proxy does its own check first — permission, cache, or logging. It only forwards the call to the real object when it decides to.",
    ],
    when: "Use this when you need to control or add a step before reaching an object. Examples: permission checks, caching expensive results, loading something heavy only when needed, or logging every access.",
    big: "The proxy's own check adds O(1) extra work (a constant amount) before it optionally does whatever the real object costs.",
    mistakes: [
      "Always forward the call to the real object when access should be allowed, or valid requests get nothing back.",
      "Don't pack unrelated logic into the proxy. Keep it a simple gatekeeper, not its own tangled system.",
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
  {
    id: "abstract-factory",
    pillar: "Design Patterns",
    name: "Abstract Factory",
    easy: "An abstract factory is a factory that makes matching SETS of things, not just one thing. Think of a furniture showroom. Pick the 'modern' style and you get a matching modern chair AND a matching modern sofa. Pick 'classic' and you get a classic chair and classic sofa instead. You never mix a modern chair with a classic sofa by accident, because one factory hands you the whole matching set.",
    how: [
      "You define one factory 'family' per matching set — like a Light theme factory and a Dark theme factory.",
      "Each factory knows how to build every piece in its set (button, checkbox, and so on), so they all match.",
      "Your code just asks the chosen factory for each piece. It never has to check styles or mix pieces from different families by hand.",
    ],
    when: "Use this when you need groups of related objects that must match each other. Examples: UI themes (light/dark), furniture styles, or cross-platform widgets (Windows-style vs Mac-style buttons and menus).",
    big: "Building one full set takes O(k) time, where k is the number of pieces in the family (a fixed count, just like n but for a different total). The win here is consistency, not speed.",
    mistakes: [
      "Don't mix pieces from two different factories. That defeats the whole point of keeping a set matching.",
      "When you add a new piece to the family, implement it in every factory, or one theme stays incomplete.",
    ],
    code: {
      JavaScript: `class LightButton {
  render() { return "Light Button"; }
}
class LightCheckbox {
  render() { return "Light Checkbox"; }
}
class DarkButton {
  render() { return "Dark Button"; }
}
class DarkCheckbox {
  render() { return "Dark Checkbox"; }
}

class LightFactory {
  createButton() { return new LightButton(); }
  createCheckbox() { return new LightCheckbox(); } // matches the button's style
}
class DarkFactory {
  createButton() { return new DarkButton(); }
  createCheckbox() { return new DarkCheckbox(); } // matches the button's style
}

function renderUI(factory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  return button.render() + ", " + checkbox.render();
}

console.log("Light theme:", renderUI(new LightFactory()));
console.log("Dark theme:", renderUI(new DarkFactory()));`,
      Python: `class LightButton:
    def render(self):
        return "Light Button"

class LightCheckbox:
    def render(self):
        return "Light Checkbox"

class DarkButton:
    def render(self):
        return "Dark Button"

class DarkCheckbox:
    def render(self):
        return "Dark Checkbox"

class LightFactory:
    def create_button(self):
        return LightButton()
    def create_checkbox(self):
        return LightCheckbox()  # matches the button's style

class DarkFactory:
    def create_button(self):
        return DarkButton()
    def create_checkbox(self):
        return DarkCheckbox()  # matches the button's style

def render_ui(factory):
    button = factory.create_button()
    checkbox = factory.create_checkbox()
    return button.render() + ", " + checkbox.render()

print("Light theme:", render_ui(LightFactory()))
print("Dark theme:", render_ui(DarkFactory()))`,
    },
    output: `Light theme: Light Button, Light Checkbox
Dark theme: Dark Button, Dark Checkbox`,
  },
  {
    id: "mediator",
    pillar: "Design Patterns",
    name: "Mediator",
    easy: "A mediator works like an air-traffic controller. Planes don't radio each other directly to sort out who lands first — that would be chaos with dozens of planes. Instead, every plane talks only to the control tower, and the tower coordinates everyone. In code, a mediator object sits in the middle, so objects talk through it instead of directly to each other.",
    how: [
      "You give every object a reference to one shared mediator, instead of references to each other.",
      "When an object wants to 'talk', it sends its message to the mediator, not directly to another object.",
      "The mediator decides what to do with the message — like passing it along to everyone else who needs it.",
    ],
    when: "Use this when many objects need to coordinate, but wiring them all directly to each other would turn into a tangled mess. Examples: chat rooms, UI widgets that react to each other, or air traffic control.",
    big: "Sending one message through the mediator adds O(1) extra work (a constant amount) before it does its own job.",
    mistakes: [
      "Don't let objects quietly keep direct references to each other 'just in case'. That brings back the tangled mess the mediator was meant to avoid.",
      "Don't let the mediator grow so many responsibilities that it becomes an unmanageable giant class.",
    ],
    code: {
      JavaScript: `class ChatRoom {
  showMessage(user, message) {
    return user + ": " + message;
  }
}

class User {
  constructor(name, chatRoom) {
    this.name = name;
    this.chatRoom = chatRoom; // talks through the mediator, not directly
  }
  send(message) {
    return this.chatRoom.showMessage(this.name, message);
  }
}

const room = new ChatRoom();
const alice = new User("Alice", room);
const bob = new User("Bob", room);

console.log(alice.send("Hi Bob!"));
console.log(bob.send("Hey Alice!"));`,
      Python: `class ChatRoom:
    def show_message(self, user, message):
        return user + ": " + message

class User:
    def __init__(self, name, chat_room):
        self.name = name
        self.chat_room = chat_room  # talks through the mediator, not directly
    def send(self, message):
        return self.chat_room.show_message(self.name, message)

room = ChatRoom()
alice = User("Alice", room)
bob = User("Bob", room)

print(alice.send("Hi Bob!"))
print(bob.send("Hey Alice!"))`,
    },
    output: `Alice: Hi Bob!
Bob: Hey Alice!`,
  },
  {
    id: "memento",
    pillar: "Design Patterns",
    name: "Memento",
    easy: "A memento works like a save point in a video game. Before a tough boss fight, you save your progress. If things go wrong, you don't restart the whole game. You just load that save point and you're back where you were. In code, a memento is a stored snapshot of an object's data. You can restore it later — that's how undo works.",
    how: [
      "The object you want to protect can make a 'memento' — a snapshot copy of its current data.",
      "You keep that memento somewhere safe: a variable, or a stack of past snapshots for multi-step undo.",
      "To undo, you hand the memento back to the object, and it copies that old data back over its current data.",
    ],
    when: "Use this when you want undo/redo, checkpoints, or the ability to roll back to an earlier state. Examples: text editors, games, or form drafts.",
    big: "Saving or restoring one snapshot takes O(n) time, where n is the size of the data you copy.",
    mistakes: [
      "Save a real separate copy, not just a reference to the live object. Otherwise 'the snapshot' keeps changing along with the original.",
      "Don't save a snapshot after every tiny change. Save at meaningful checkpoints, or you'll waste memory on saves nobody restores.",
    ],
    code: {
      JavaScript: `class EditorMemento {
  constructor(text) {
    this.text = text; // a saved snapshot
  }
}

class Editor {
  constructor() {
    this.text = "";
  }
  type(words) {
    this.text += words;
  }
  save() {
    return new EditorMemento(this.text); // save point
  }
  restore(memento) {
    this.text = memento.text; // load point
  }
}

const editor = new Editor();
editor.type("Hello");
const checkpoint = editor.save();
editor.type(", world!");
console.log("Before undo:", editor.text);
editor.restore(checkpoint);
console.log("After undo:", editor.text);`,
      Python: `class EditorMemento:
    def __init__(self, text):
        self.text = text  # a saved snapshot

class Editor:
    def __init__(self):
        self.text = ""
    def type(self, words):
        self.text += words
    def save(self):
        return EditorMemento(self.text)  # save point
    def restore(self, memento):
        self.text = memento.text  # load point

editor = Editor()
editor.type("Hello")
checkpoint = editor.save()
editor.type(", world!")
print("Before undo:", editor.text)
editor.restore(checkpoint)
print("After undo:", editor.text)`,
    },
    output: `Before undo: Hello, world!
After undo: Hello`,
  },
  {
    id: "bridge",
    pillar: "Design Patterns",
    name: "Bridge",
    easy: "A bridge works like a universal remote control. The remote has the same buttons — power, volume, channel — no matter which TV brand you point it at: Sony, Samsung, whatever. The remote (what you use) and the TV (how it actually works inside) are built separately and connected by a bridge. Either side can change without breaking the other.",
    how: [
      "You split a feature into two separate pieces: the 'front' that people use, and the 'engine' that does the real work.",
      "You have the front hold a reference to whichever engine it's connected to.",
      "When the front is asked to do something, it calls the engine's version. Swap the engine, and the same front now works differently underneath.",
    ],
    when: "Use this when a feature needs to work with several different implementations underneath. Examples: a remote working with different TV brands, or an app supporting different payment providers behind the same checkout button.",
    big: "Calling through the bridge adds O(1) extra work (a constant amount) — one call forwarded to whichever engine is plugged in.",
    mistakes: [
      "Don't let the front peek at engine-specific details. That quietly glues them back together and defeats the point of separating them.",
      "Don't build a new front for every engine. Let one front work with any engine that fits the same shape.",
    ],
    code: {
      JavaScript: `class TVRemote {
  constructor(device) {
    this.device = device; // the front holds whichever engine it's connected to
  }
  turnOn() {
    return "Remote: " + this.device.powerOn();
  }
}

class SonyTV {
  powerOn() { return "Sony TV is on"; }
}
class SamsungTV {
  powerOn() { return "Samsung TV is on"; }
}

const remote1 = new TVRemote(new SonyTV());
const remote2 = new TVRemote(new SamsungTV());

console.log(remote1.turnOn());
console.log(remote2.turnOn());`,
      Python: `class TVRemote:
    def __init__(self, device):
        self.device = device  # the front holds whichever engine it's connected to
    def turn_on(self):
        return "Remote: " + self.device.power_on()

class SonyTV:
    def power_on(self):
        return "Sony TV is on"

class SamsungTV:
    def power_on(self):
        return "Samsung TV is on"

remote1 = TVRemote(SonyTV())
remote2 = TVRemote(SamsungTV())

print(remote1.turn_on())
print(remote2.turn_on())`,
    },
    output: `Remote: Sony TV is on
Remote: Samsung TV is on`,
  },
  {
    id: "dependency-injection",
    pillar: "Design Patterns",
    name: "Dependency Injection",
    easy: "Dependency injection means you get HANDED your tools instead of making them yourself. Picture a chef who gets today's ingredients from the kitchen, instead of growing their own vegetables. The chef can cook with whatever they're handed, so tomorrow's ingredients can be totally different, and the chef doesn't need to change at all. In code, an object receives the other objects it needs from the outside, instead of creating them itself.",
    how: [
      "Instead of a class building the things it depends on inside itself, it accepts them as inputs — usually in its constructor (the setup method that runs when you create the object).",
      "Whoever creates the object decides which exact version to hand it: a real one, a fake one for testing, or a different brand entirely.",
      "The class just uses whatever it was handed, without caring which specific version it got.",
    ],
    when: "Use this when you want to swap parts easily — a real database vs. a fake one for tests, different payment providers, or different engines — without rewriting the class that uses them.",
    big: "Handing in a dependency takes O(1) time (a constant amount) — it's just passing a reference in. The real cost is whatever that dependency does.",
    mistakes: [
      "Don't let the class create its own dependency internally 'for convenience'. That locks you back into one fixed version.",
      "Don't hand in so many small pieces that the constructor becomes a long, confusing list. Sometimes a few really do belong bundled together.",
    ],
    code: {
      JavaScript: `class GasEngine {
  start() { return "Gas engine vroom"; }
}
class ElectricEngine {
  start() { return "Electric engine hum"; }
}

class Car {
  constructor(engine) {
    this.engine = engine; // handed the tool instead of making it itself
  }
  drive() {
    return this.engine.start() + " -> car moving";
  }
}

const gasCar = new Car(new GasEngine());
const electricCar = new Car(new ElectricEngine());

console.log("Gas car:", gasCar.drive());
console.log("Electric car:", electricCar.drive());`,
      Python: `class GasEngine:
    def start(self):
        return "Gas engine vroom"

class ElectricEngine:
    def start(self):
        return "Electric engine hum"

class Car:
    def __init__(self, engine):
        self.engine = engine  # handed the tool instead of making it itself
    def drive(self):
        return self.engine.start() + " -> car moving"

gas_car = Car(GasEngine())
electric_car = Car(ElectricEngine())

print("Gas car:", gas_car.drive())
print("Electric car:", electric_car.drive())`,
    },
    output: `Gas car: Gas engine vroom -> car moving
Electric car: Electric engine hum -> car moving`,
  },
  {
    id: "flyweight",
    pillar: "Design Patterns",
    name: "Flyweight",
    easy: "Flyweight means sharing one copy of a reused thing, instead of making a fresh copy every time. Picture a forest with ten thousand trees. Every 'Oak' tree looks identical — same shape, same texture. So instead of storing that heavy picture ten thousand times, all the oak trees point to the ONE shared 'Oak' picture. Each tree only remembers its own tiny bit of unique info, like where it's planted.",
    how: [
      "You split an object's data into 'shared' parts (the same for many copies of the object) and 'unique' parts (different for each one).",
      "You keep a factory that hands out the shared part. The first time a certain kind is asked for, it gets created and stored. Every time after, you get back that same stored copy.",
      "Each individual object only keeps its own unique data, and borrows the shared part when it needs it. Nothing heavy gets duplicated.",
    ],
    when: "Use this when you need huge numbers of similar objects, and storing full data in every single one would waste a lot of memory. Examples: trees in a game world, characters in a text editor, or icons in a big list.",
    big: "Reusing a shared instance takes O(1) time to look up (a constant amount). The memory you save grows with however many objects would otherwise have duplicated the same data.",
    mistakes: [
      "Don't store unique, per-object data (like position) inside the shared object. That breaks the sharing, since every user would overwrite it.",
      "Don't share objects that aren't actually safe to share, because something might quietly depend on each copy staying separate.",
    ],
    code: {
      JavaScript: `class TreeType {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
  draw(x, y) {
    return this.name + "(" + this.color + ") at (" + x + "," + y + ")";
  }
}

class TreeFactory {
  constructor() {
    this.types = {};
  }
  getType(name, color) {
    const key = name + "_" + color;
    if (!this.types[key]) {
      this.types[key] = new TreeType(name, color); // create once, share after
    }
    return this.types[key];
  }
}

const factory = new TreeFactory();
const oak1 = factory.getType("Oak", "Green");
const oak2 = factory.getType("Oak", "Green");
const pine1 = factory.getType("Pine", "DarkGreen");

console.log(oak1.draw(1, 2));
console.log(oak2.draw(5, 6));
console.log(pine1.draw(9, 1));
console.log("Same oak type object?", oak1 === oak2 ? "yes" : "no");
console.log("Shared types stored:", Object.keys(factory.types).length);`,
      Python: `class TreeType:
    def __init__(self, name, color):
        self.name = name
        self.color = color
    def draw(self, x, y):
        return self.name + "(" + self.color + ") at (" + str(x) + "," + str(y) + ")"

class TreeFactory:
    def __init__(self):
        self.types = {}
    def get_type(self, name, color):
        key = name + "_" + color
        if key not in self.types:
            self.types[key] = TreeType(name, color)  # create once, share after
        return self.types[key]

factory = TreeFactory()
oak1 = factory.get_type("Oak", "Green")
oak2 = factory.get_type("Oak", "Green")
pine1 = factory.get_type("Pine", "DarkGreen")

print(oak1.draw(1, 2))
print(oak2.draw(5, 6))
print(pine1.draw(9, 1))
print("Same oak type object?", "yes" if oak1 is oak2 else "no")
print("Shared types stored:", len(factory.types))`,
    },
    output: `Oak(Green) at (1,2)
Oak(Green) at (5,6)
Pine(DarkGreen) at (9,1)
Same oak type object? yes
Shared types stored: 2`,
  },
  {
    id: "visitor",
    pillar: "Design Patterns",
    name: "Visitor",
    easy: "A visitor works like a museum tour guide who knows how to talk about many different exhibits. The paintings and statues don't need to know how to describe themselves. The guide 'visits' each one and knows exactly what to say about it. In code, a visitor object carries a new operation. Each object just lets the visitor look at it, instead of implementing every possible operation itself.",
    how: [
      "You give each kind of object an `accept(visitor)` method. It just calls the matching method on the visitor, like `visitor.visitCircle(this)`.",
      "You write a visitor class with one method for each kind of object it knows how to handle.",
      "To add a brand-new operation, you write a whole new visitor class. The original objects never need to change.",
    ],
    when: "Use this when you need to run several different operations over a group of related objects — shapes, file types, or parts of a parsed program. You don't want to keep editing every object's class each time you add one more operation.",
    big: "Visiting all n objects takes O(n) time. Each single visit takes O(1) time (a constant amount) plus whatever that operation itself costs.",
    mistakes: [
      "When you add a new object type, add a matching method to every visitor, or that type goes silently unhandled.",
      "Don't pack unrelated logic into one visitor. Split it into several focused visitors instead.",
    ],
    code: {
      JavaScript: `class Circle {
  constructor(radius) { this.radius = radius; }
  accept(visitor) { return visitor.visitCircle(this); }
}
class Square {
  constructor(side) { this.side = side; }
  accept(visitor) { return visitor.visitSquare(this); }
}

class AreaVisitor {
  visitCircle(c) { return "Circle area (approx): " + (c.radius * c.radius * 3); }
  visitSquare(s) { return "Square area: " + (s.side * s.side); }
}

class DescribeVisitor {
  visitCircle(c) { return "A circle with radius " + c.radius; }
  visitSquare(s) { return "A square with side " + s.side; }
}

const shapes = [new Circle(2), new Square(4)];
const areaVisitor = new AreaVisitor();
const describeVisitor = new DescribeVisitor();

for (const shape of shapes) {
  console.log(shape.accept(areaVisitor));
}
for (const shape of shapes) {
  console.log(shape.accept(describeVisitor));
}`,
      Python: `class Circle:
    def __init__(self, radius):
        self.radius = radius
    def accept(self, visitor):
        return visitor.visit_circle(self)

class Square:
    def __init__(self, side):
        self.side = side
    def accept(self, visitor):
        return visitor.visit_square(self)

class AreaVisitor:
    def visit_circle(self, c):
        return "Circle area (approx): " + str(c.radius * c.radius * 3)
    def visit_square(self, s):
        return "Square area: " + str(s.side * s.side)

class DescribeVisitor:
    def visit_circle(self, c):
        return "A circle with radius " + str(c.radius)
    def visit_square(self, s):
        return "A square with side " + str(s.side)

shapes = [Circle(2), Square(4)]
area_visitor = AreaVisitor()
describe_visitor = DescribeVisitor()

for shape in shapes:
    print(shape.accept(area_visitor))
for shape in shapes:
    print(shape.accept(describe_visitor))`,
    },
    output: `Circle area (approx): 12
Square area: 16
A circle with radius 2
A square with side 4`,
  },
  {
    id: "null-object",
    pillar: "Design Patterns",
    name: "Null Object",
    easy: "A null object is a stand-in that politely does nothing, instead of leaving an empty gap. Think of a hotel giving a guest with no special requests a blank preference card that just says 'no requests'. Staff can still read it like any other card, instead of getting confused by a missing card. In code, instead of returning nothing (called null) and forcing everyone to check for it, you return a harmless stand-in object. It safely does nothing when used.",
    how: [
      "You design a 'null' version of your object with the exact same methods as the real one.",
      "Instead of doing real work, those methods return a safe, harmless default.",
      "Any code that was going to check 'is this null before I use it?' can skip that check completely, and just call the methods normally.",
    ],
    when: "Use this when something might not be found — a missing user, an unset logger, an empty cart — and you're tired of sprinkling null checks everywhere before using it.",
    big: "Using a null object costs the same O(1) time (a constant amount) as using a real one. The win is fewer scattered checks, not speed.",
    mistakes: [
      "Give the null object every method the real object has, or it can still crash on the one method nobody thought to add.",
      "Don't use a null object where you actually need to know 'this was missing' for an important decision. That silently hides the fact.",
    ],
    code: {
      JavaScript: `class RealUser {
  constructor(name) { this.name = name; }
  greet() { return "Hello, " + this.name + "!"; }
  isNull() { return false; }
}

class NullUser {
  greet() { return "Hello, guest!"; } // safe default, no crash
  isNull() { return true; }
}

function findUser(id) {
  const users = { 1: "Alice", 2: "Bob" };
  const name = users[id];
  return name ? new RealUser(name) : new NullUser(); // never returns null
}

const user1 = findUser(1);
const user2 = findUser(99);

console.log(user1.greet());
console.log(user2.greet());
console.log("Is user2 null object?", user2.isNull() ? "yes" : "no");`,
      Python: `class RealUser:
    def __init__(self, name):
        self.name = name
    def greet(self):
        return "Hello, " + self.name + "!"
    def is_null(self):
        return False

class NullUser:
    def greet(self):
        return "Hello, guest!"  # safe default, no crash
    def is_null(self):
        return True

def find_user(user_id):
    users = {1: "Alice", 2: "Bob"}
    name = users.get(user_id)
    return RealUser(name) if name else NullUser()  # never returns None

user1 = find_user(1)
user2 = find_user(99)

print(user1.greet())
print(user2.greet())
print("Is user2 null object?", "yes" if user2.is_null() else "no")`,
    },
    output: `Hello, Alice!
Hello, guest!
Is user2 null object? yes`,
  },
  {
    id: "repository",
    pillar: "Design Patterns",
    name: "Repository",
    easy: "A repository works like a librarian who fetches books for you, no matter where they're actually kept: on the main shelves, in the back room, or in another building. You just ask the librarian for a book by name. You never need to know the storage details. In code, a repository sits between your app and wherever the data really lives. It offers simple methods like 'add' and 'find', so the rest of your code never touches storage details directly.",
    how: [
      "You build one repository object that owns talking to the real data store. Here it's a list, but it could be a database or an API.",
      "You give it simple methods like `add`, `findByName`, and `all` that hide exactly how the data is stored.",
      "The rest of your code only ever calls those simple methods. Swap the storage underneath, and nothing else has to change.",
    ],
    when: "Use this when you want the rest of your app to stop caring whether data lives in a database, a file, or a plain list in memory. It also makes swapping that storage, or faking it in tests, easy.",
    big: "Adding takes O(1) time (a constant amount). Finding by scanning takes O(n) time, where n is the number of stored items (a real database could do better with an index — a lookup shortcut).",
    mistakes: [
      "Don't let storage details, like raw database queries, leak out past the repository into the rest of the app. That defeats the point of hiding them.",
      "Pick one clear rule for 'not found' — always null, or always an error — instead of mixing them.",
    ],
    code: {
      JavaScript: `class UserRepository {
  constructor() {
    this.users = []; // pretend this is a database table
  }
  add(user) {
    this.users.push(user);
  }
  findByName(name) {
    return this.users.find((u) => u.name === name) || null;
  }
  all() {
    return this.users;
  }
}

const repo = new UserRepository();
repo.add({ name: "Alice", age: 30 });
repo.add({ name: "Bob", age: 25 });

const found = repo.findByName("Bob");
console.log("Found:", found.name + ", age " + found.age);
console.log("Total users:", repo.all().length);
console.log("Missing user:", repo.findByName("Zoe") === null ? "yes" : "no");`,
      Python: `class UserRepository:
    def __init__(self):
        self.users = []  # pretend this is a database table
    def add(self, user):
        self.users.append(user)
    def find_by_name(self, name):
        for u in self.users:
            if u["name"] == name:
                return u
        return None
    def all(self):
        return self.users

repo = UserRepository()
repo.add({"name": "Alice", "age": 30})
repo.add({"name": "Bob", "age": 25})

found = repo.find_by_name("Bob")
print("Found:", found["name"] + ", age " + str(found["age"]))
print("Total users:", len(repo.all()))
print("Missing user:", "yes" if repo.find_by_name("Zoe") is None else "no")`,
    },
    output: `Found: Bob, age 25
Total users: 2
Missing user: yes`,
  },
  {
    id: "object-pool",
    pillar: "Design Patterns",
    name: "Object Pool",
    easy: "An object pool works like a library lending out books. The library doesn't print a brand-new book for every visitor. It keeps a fixed set of copies, lends one out when you ask, and takes it back onto the shelf when you're done. Then the next person can borrow that same copy. In code, a pool keeps a set of costly-to-create objects ready to reuse, instead of constantly building and throwing them away.",
    how: [
      "You create a fixed batch of objects up front and keep them in an 'available' list.",
      "When someone needs one, you hand out an object from that list and move it to an 'in use' list.",
      "When they're done, you put it back in the 'available' list. The next request reuses that very same object, instead of building a new one.",
    ],
    when: "Use this when creating an object is costly — database connections, network sockets, or big buffers — and you'd rather reuse a small set of them than keep creating and destroying new ones.",
    big: "Getting or returning one object takes O(1) time (a constant amount). The savings come from skipping repeated, costly creation.",
    mistakes: [
      "Always release an object back to the pool, or the pool slowly runs out, even though nothing still uses them.",
      "Reset an object before lending it out again, so it doesn't still hold old data from its last use.",
    ],
    code: {
      JavaScript: `class Connection {
  constructor(num) { this.num = num; }
  use() { return "Using connection #" + this.num; }
}

class ConnectionPool {
  constructor(size) {
    this.available = [];
    for (let i = 1; i <= size; i++) this.available.push(new Connection(i)); // pre-built, ready to lend
    this.inUse = [];
  }
  acquire() {
    if (this.available.length === 0) return null; // none left to lend
    const conn = this.available.shift();
    this.inUse.push(conn);
    return conn;
  }
  release(conn) {
    this.inUse = this.inUse.filter((c) => c !== conn);
    this.available.push(conn); // returned, ready to lend again
  }
}

const pool = new ConnectionPool(2);
const a = pool.acquire();
const b = pool.acquire();
console.log(a.use());
console.log(b.use());
console.log("Third request while both are out:", pool.acquire() === null ? "none available" : "got one");

pool.release(a);
const c = pool.acquire();
console.log("After releasing one:", c.use());
console.log("Same connection object reused?", c === a ? "yes" : "no");`,
      Python: `class Connection:
    def __init__(self, num):
        self.num = num
    def use(self):
        return "Using connection #" + str(self.num)

class ConnectionPool:
    def __init__(self, size):
        self.available = [Connection(i) for i in range(1, size + 1)]  # pre-built, ready to lend
        self.in_use = []
    def acquire(self):
        if len(self.available) == 0:
            return None  # none left to lend
        conn = self.available.pop(0)
        self.in_use.append(conn)
        return conn
    def release(self, conn):
        self.in_use = [c for c in self.in_use if c is not conn]
        self.available.append(conn)  # returned, ready to lend again

pool = ConnectionPool(2)
a = pool.acquire()
b = pool.acquire()
print(a.use())
print(b.use())
print("Third request while both are out:", "none available" if pool.acquire() is None else "got one")

pool.release(a)
c = pool.acquire()
print("After releasing one:", c.use())
print("Same connection object reused?", "yes" if c is a else "no")`,
    },
    output: `Using connection #1
Using connection #2
Third request while both are out: none available
After releasing one: Using connection #1
Same connection object reused? yes`,
  },
];

export default lessons;
