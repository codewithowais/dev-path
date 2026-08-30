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
    easy: "The strategy pattern lets you swap out how something gets done, on the fly. Like a map app choosing between driving, walking, or biking directions: the goal (get there) stays the same, but you can pick a different method any time.",
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
    easy: "An adapter is a travel plug adapter. Your charger has one shape of plug and the wall socket has another — you don't rebuild either one, you just plug a small adapter in between so they fit. In code, an adapter sits between two mismatched pieces and translates one into the other.",
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
    easy: "A decorator is wrapping a gift. You start with a plain box, then add wrapping paper, then a bow — each layer adds something extra without changing what's inside. In code, a decorator wraps a simple object and adds extra behavior, one layer at a time.",
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
    easy: "A facade is a hotel front desk. Behind it are housekeeping, room service, and billing — lots of separate departments — but you just tell the front desk what you need, and it handles the rest. In code, a facade is one simple object that hides a bunch of complicated parts behind an easy front door.",
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
    easy: "A builder is ordering a custom burger at a counter: add a bun, add a patty, add cheese, then say 'build it.' You add pieces one step at a time, and only at the end do you get the finished thing. In code, a builder puts together a complicated object piece by piece instead of in one giant step.",
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
    easy: "A command is a restaurant order slip. The waiter writes down 'make a burger' instead of cooking it themselves — that slip can be handed to the kitchen, held in a queue, or used later to undo the order. In code, a command packages up 'do this action' as an object, so it can be stored, passed around, and even reversed.",
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
    easy: "An iterator is a TV remote flipping through channels. You press 'next' and get the next channel — you never see how the channels are wired up behind the screen. In code, an iterator lets you step through a collection one item at a time without knowing how it's stored inside.",
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
    easy: "Chain of responsibility passes a request down a line of people until someone can handle it. Like an expense request going to your manager first — if it's too big, it moves up to the director, then the VP — each person either deals with it or bumps it up the chain.",
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
    easy: "The state pattern is a traffic light. Each color simply knows what comes next — red knows green comes after it, and so on. The light just asks 'what's next?' and switches automatically. In code, an object's behavior changes on its own based on what 'state' it's currently in.",
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
    easy: "A template method is a recipe card with some steps fixed and some left blank for you to fill in. 'Boil water' and 'pour into cup' never change, but 'brew' and 'add condiments' depend on whether you're making tea or coffee. In code, a base class locks in the overall order of steps, and each subclass fills in just the steps that differ.",
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
    easy: "Composite is how folders work: a folder can hold files, but it can also hold more folders, which hold more files and folders. Composite lets you treat one single file and a whole folder full of files the exact same way — ask either one 'how big are you?' and each figures out its own answer.",
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
    easy: "A proxy is a security guard standing in front of an office. Anyone who wants in has to go through the guard first, who checks your badge before letting you through to the real office. In code, a proxy object stands in front of the real object and controls access to it — checking permissions, caching results, or logging calls first.",
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
  {
    id: "abstract-factory",
    pillar: "Design Patterns",
    name: "Abstract Factory",
    easy: "An abstract factory is a factory that makes matching SETS of things, not just one thing. Think of a furniture showroom: pick the 'modern' style and you get a matching modern chair AND a matching modern sofa. Pick 'classic' and you get a classic chair and classic sofa instead. You never mix a modern chair with a classic sofa by accident, because one factory hands you the whole matching set.",
    how: [
      "Define one factory 'family' per matching set (like a Light theme factory and a Dark theme factory).",
      "Each factory knows how to build every piece in its set (button, checkbox, and so on) so they all match.",
      "Your code just asks the chosen factory for each piece — it never has to check styles or mix pieces from different families by hand.",
    ],
    when: "When you need groups of related objects that must match each other — UI themes (light/dark), furniture styles, or cross-platform widgets (Windows-style vs Mac-style buttons and menus).",
    big: "Building one full set is O(k) for k pieces in the family — the win is consistency, not speed.",
    mistakes: [
      "Mixing pieces from two different factories, which defeats the whole point of keeping a set matching.",
      "Adding a new piece to the family but forgetting to implement it in every factory, leaving one theme incomplete.",
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
    easy: "A mediator is an air-traffic controller. Planes don't radio each other directly to sort out who lands first — that would be chaos with dozens of planes. Instead, every plane talks only to the control tower, and the tower coordinates everyone. In code, a mediator object sits in the middle so objects talk through it instead of directly to each other.",
    how: [
      "Give every object a reference to one shared mediator instead of references to each other.",
      "When an object wants to 'talk', it sends its message to the mediator, not directly to another object.",
      "The mediator decides what to do with the message — like passing it along to everyone else who needs it.",
    ],
    when: "When many objects need to coordinate but wiring them all directly to each other would turn into a tangled mess — chat rooms, UI widgets that react to each other, or air traffic control.",
    big: "Sending one message through the mediator is O(1) extra step before it does its own work.",
    mistakes: [
      "Letting objects quietly keep direct references to each other 'just in case', which brings back the same tangled mess the mediator was meant to avoid.",
      "Letting the mediator itself grow so many responsibilities that it becomes an unmanageable giant class.",
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
    easy: "A memento is a save point in a video game. Before a tough boss fight, you save your progress. If things go wrong, you don't restart the whole game — you just load that save point and you're back where you were. In code, a memento is a stored snapshot of an object's data that you can restore later, which is how undo works.",
    how: [
      "The object you want to protect can make a 'memento' — a snapshot copy of its current data.",
      "You keep that memento somewhere safe (a variable, a stack of past snapshots for multi-step undo).",
      "To undo, hand the memento back to the object and let it copy that old data back over its current data.",
    ],
    when: "When you want undo/redo, checkpoints, or the ability to roll back to an earlier state — text editors, games, or form drafts.",
    big: "Saving or restoring one snapshot is O(n) in the size of the data being copied.",
    mistakes: [
      "Saving a reference to the live object instead of a real separate copy, so 'the snapshot' keeps changing along with the original.",
      "Saving a snapshot after every tiny change instead of at meaningful checkpoints, wasting memory on saves nobody will ever restore.",
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
    easy: "A bridge is a universal remote control. The remote has the same buttons (power, volume, channel) no matter which TV brand you point it at — Sony, Samsung, whatever. The remote (what you use) and the TV (how it actually works inside) are built separately and connected by a bridge, so either side can change without breaking the other.",
    how: [
      "Split a feature into two separate pieces: the 'front' that people use, and the 'engine' that actually does the work.",
      "Have the front hold a reference to whichever engine it's connected to.",
      "When the front is asked to do something, it just calls the engine's version — swap the engine, and the same front now works differently underneath.",
    ],
    when: "When you have a feature that needs to work with several different underlying implementations — a remote working with different TV brands, or an app supporting different payment providers behind the same checkout button.",
    big: "Calling through the bridge is O(1) extra work — one call forwarded to whichever engine is plugged in.",
    mistakes: [
      "Letting the front peek at engine-specific details, which quietly glues them back together and defeats the point of separating them.",
      "Building a new front for every engine instead of letting one front work with any engine that fits the same shape.",
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
    easy: "Dependency injection means being HANDED your tools instead of making them yourself. Imagine a chef who is given today's ingredients by the kitchen instead of growing their own vegetables — the chef can cook with whatever they're handed, so tomorrow's ingredients can be totally different without the chef needing to change at all. In code, an object receives the other objects it needs from the outside instead of creating them itself.",
    how: [
      "Instead of a class building the things it depends on inside itself, it accepts them as parameters (usually in its constructor).",
      "Whoever creates the object decides which exact version to hand it — a real one, a fake one for testing, a different brand entirely.",
      "The class just uses whatever it was handed, without caring which specific version it got.",
    ],
    when: "When you want to swap parts easily (a real database vs. a fake one for tests, different payment providers, different engines) without rewriting the class that uses them.",
    big: "Injecting a dependency is O(1) — it's just passing a reference in; the real cost is whatever that dependency does.",
    mistakes: [
      "Having the class create its own dependency internally 'for convenience', which locks you back into one fixed version.",
      "Injecting so many small pieces that the constructor becomes a long, confusing list — sometimes a few really do belong bundled together.",
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
];

export default lessons;
