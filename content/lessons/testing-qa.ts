// content/lessons/testing-qa.ts
// Pillar: Testing & QA — how we prove our code actually works, and keep it working.
//
// Teacher voice, every entry: easy → how → when → (big) → (mistakes) → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/testing-qa.ts`.
//
// Some real testing tools (Cypress, Playwright, Selenium) drive a real browser
// and can't run in a plain JS/Python sandbox. Those lessons TEACH THE CONCEPT
// with a tiny runnable stand-in and describe the real tools in prose.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "what-is-a-test",
    pillar: "Testing & QA",
    name: "What a Test Is (and Why We Write Them)",
    easy: "A test is a second, tiny program whose only job is to check that your real program does what you promised. Think of a smoke detector. You don't wait for a fire to find out it works — you press the button and listen for the beep. A test presses the button on your code: it feeds in a known input, checks the output is what you expected, and beeps 'PASS' or 'FAIL'. If someone later breaks that code by accident, the test starts failing, and you find out in seconds instead of from an angry user.",
    how: [
      "Pick one thing your code should do, like 'adding 2 and 3 gives 5'.",
      "Run the real code with that known input and capture what it actually returned.",
      "Compare the actual result to the result you expected ahead of time.",
      "If they match, the test passes. If they don't, it fails and points at exactly what went wrong.",
    ],
    when: "Write tests for any code whose correctness matters and that you'll change again later — which is almost all real code. They pay off most on logic that's easy to break by accident: money math, dates, permissions, and anything many other parts depend on.",
    mistakes: [
      "Thinking 'it ran without crashing' means it's correct. A function can run fine and still return the wrong answer — a test checks the answer, not just that nothing exploded.",
      "Only testing the cases you know work. The valuable tests cover the tricky edges: zero, empty input, negatives, and the 'that could never happen' case that happens in week two.",
    ],
    code: {
      JavaScript: `function add(a, b) {
  return a + b;
}

// A test feeds in a known input and checks the result matches what we expect.
function check(label, actual, expected) {
  const status = actual === expected ? "PASS" : "FAIL";
  console.log(status + ": " + label + " (expected " + expected + ", got " + actual + ")");
}

check("2 + 3", add(2, 3), 5);
check("10 + 5", add(10, 5), 15);
check("0 + 0", add(0, 0), 1); // deliberately wrong expectation`,
      Python: `def add(a, b):
    return a + b

# A test feeds in a known input and checks the result matches what we expect.
def check(label, actual, expected):
    status = "PASS" if actual == expected else "FAIL"
    print(status + ": " + label + " (expected " + str(expected) + ", got " + str(actual) + ")")

check("2 + 3", add(2, 3), 5)
check("10 + 5", add(10, 5), 15)
check("0 + 0", add(0, 0), 1)  # deliberately wrong expectation`,
    },
    output: `PASS: 2 + 3 (expected 5, got 5)
PASS: 10 + 5 (expected 15, got 15)
FAIL: 0 + 0 (expected 1, got 0)`,
  },
  {
    id: "assertions",
    pillar: "Testing & QA",
    name: "Assertions (Building Your Own assertEqual)",
    easy: "An assertion is a line that says 'this MUST be true — if it isn't, stop and shout'. It's like the bouncer at the door of your test: if reality doesn't match the claim, it refuses to let the test quietly pass. Real testing libraries give you ready-made assertions like `assertEqual`, but underneath they're just a simple check: compare two values, and if they differ, throw an error with a helpful message.",
    how: [
      "Write a function that takes the actual value, the expected value, and a short message.",
      "Compare them. If they're equal, all is well — the assertion passes quietly.",
      "If they differ, 'throw' an error (raise an alarm) that carries the message plus both values, so you can see exactly what was off.",
      "Wrap each test in a try/catch so one failing assertion is reported as a FAIL instead of crashing the whole run.",
    ],
    when: "You reach for assertions inside every test you write — they are the sentence that actually does the checking. Understanding that they're just 'compare and throw' demystifies every testing library you'll ever use.",
    mistakes: [
      "Writing an assertion with no message. When it fails six months later, 'AssertionError' alone tells you nothing — a message like 'hi becomes HI' tells you exactly what broke.",
      "Asserting several unrelated things in one test. When it fails you can't tell which claim broke; keep each test focused on one clear expectation.",
    ],
    code: {
      JavaScript: `function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error("Assertion failed: " + message + " (expected " + expected + ", got " + actual + ")");
  }
  console.log("OK: " + message);
}

// A tiny test runner: run the function, report PASS, or catch the alarm as FAIL.
function runTest(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (err) {
    console.log("FAIL " + name + " -> " + err.message);
  }
}

runTest("uppercase works", () => {
  assertEqual("hi".toUpperCase(), "HI", "hi becomes HI");
});
runTest("broken expectation", () => {
  assertEqual(2 + 2, 5, "2 + 2 is 5");
});`,
      Python: `def assert_equal(actual, expected, message):
    if actual != expected:
        raise AssertionError("Assertion failed: " + message + " (expected " + str(expected) + ", got " + str(actual) + ")")
    print("OK: " + message)

# A tiny test runner: run the function, report PASS, or catch the alarm as FAIL.
def run_test(name, fn):
    try:
        fn()
        print("PASS " + name)
    except AssertionError as err:
        print("FAIL " + name + " -> " + str(err))

run_test("uppercase works", lambda: assert_equal("hi".upper(), "HI", "hi becomes HI"))
run_test("broken expectation", lambda: assert_equal(2 + 2, 5, "2 + 2 is 5"))`,
    },
    output: `OK: hi becomes HI
PASS uppercase works
FAIL broken expectation -> Assertion failed: 2 + 2 is 5 (expected 5, got 4)`,
  },
  {
    id: "arrange-act-assert",
    pillar: "Testing & QA",
    name: "Arrange–Act–Assert",
    easy: "Arrange–Act–Assert is a three-step shape that keeps every test easy to read. Think of a science experiment: first you set up the beakers (Arrange), then you mix the chemicals (Act), then you check what happened (Assert). Keeping those three steps in that order, with nothing tangled together, means anyone can glance at a test and instantly see the setup, the single action being tested, and the expectation.",
    how: [
      "Arrange: build the world the test needs — create objects, set starting values, prepare inputs.",
      "Act: perform the one action you're actually testing. Just one, so a failure has a single obvious cause.",
      "Assert: check the result against what you expected. This is where PASS or FAIL is decided.",
      "Keep the three visually separate. A reader should see 'set up, do the thing, check the thing' without hunting.",
    ],
    when: "Use this shape for essentially every test you write. It's the default structure testing guides teach because it makes tests read like a short, honest story instead of a puzzle.",
    mistakes: [
      "Doing several actions in the Act step. If a test both adds AND removes AND updates before asserting, a failure could come from any of them.",
      "Sneaking assertions into the middle. Save the checking for the end so the 'what am I actually testing?' stays crystal clear.",
    ],
    code: {
      JavaScript: `function makeCart() {
  return { items: [] };
}
function addItem(cart, price) {
  cart.items.push(price);
}
function total(cart) {
  return cart.items.reduce((sum, p) => sum + p, 0);
}

// Arrange: set up the world the test needs.
const cart = makeCart();
// Act: do the one thing under test.
addItem(cart, 30);
addItem(cart, 12);
// Assert: check the result is what we expect.
const expected = 42;
const actual = total(cart);

console.log("Arrange: empty cart created");
console.log("Act: added items 30 and 12");
console.log("Assert: total is " + actual + " (expected " + expected + ")");
console.log(actual === expected ? "PASS" : "FAIL");`,
      Python: `def make_cart():
    return {"items": []}

def add_item(cart, price):
    cart["items"].append(price)

def total(cart):
    return sum(cart["items"])

# Arrange: set up the world the test needs.
cart = make_cart()
# Act: do the one thing under test.
add_item(cart, 30)
add_item(cart, 12)
# Assert: check the result is what we expect.
expected = 42
actual = total(cart)

print("Arrange: empty cart created")
print("Act: added items 30 and 12")
print("Assert: total is " + str(actual) + " (expected " + str(expected) + ")")
print("PASS" if actual == expected else "FAIL")`,
    },
    output: `Arrange: empty cart created
Act: added items 30 and 12
Assert: total is 42 (expected 42)
PASS`,
  },
  {
    id: "unit-tests",
    pillar: "Testing & QA",
    name: "Unit Tests (One Piece in Isolation)",
    easy: "A unit test checks one small piece of code — usually a single function — all by itself, with nothing else attached. Think of testing one light bulb by screwing it into a lamp you know works, rather than flipping the whole house's breaker and guessing. Because a unit test touches only one function, when it fails you know precisely where the problem is. Unit tests are tiny, fast, and you write lots of them.",
    how: [
      "Pick one function that takes inputs and returns a result, with no hidden dependencies.",
      "Write several cases: normal inputs, edge cases, and the boundaries where behavior changes.",
      "For each case, call the function and compare its output to the expected value.",
      "Count passes. A green run means that one unit behaves correctly across every case you thought of.",
    ],
    when: "Use unit tests for pure logic: calculations, formatting, validation, parsing — anything that takes inputs and returns outputs without reaching out to a database or network. They're the broad base of most test suites because they're cheap and fast.",
    big: "O(number of cases) to run — each case is one quick function call, so hundreds of unit tests still finish in a blink.",
    mistakes: [
      "Testing only one 'happy' input. The bugs hide at the edges — zero percent, one hundred percent, empty, negative — so cover those explicitly.",
      "Letting the unit secretly depend on the outside world (a clock, a database). If it does, it isn't really a unit test anymore, and it'll fail for reasons unrelated to your logic.",
    ],
    code: {
      JavaScript: `// The single unit under test: a pure function, no outside dependencies.
function applyDiscount(price, percent) {
  return price - (price * percent) / 100;
}

const cases = [
  { price: 100, percent: 10, expected: 90 },
  { price: 50, percent: 50, expected: 25 },
  { price: 80, percent: 0, expected: 80 },
];

let passed = 0;
for (const c of cases) {
  const result = applyDiscount(c.price, c.percent);
  const ok = result === c.expected;
  if (ok) passed++;
  console.log(c.percent + "% off " + c.price + " = " + result + " -> " + (ok ? "PASS" : "FAIL"));
}
console.log(passed + "/" + cases.length + " unit tests passed");`,
      Python: `# The single unit under test: a pure function, no outside dependencies.
def apply_discount(price, percent):
    # integer division (//) keeps these whole-number examples clean
    return price - (price * percent) // 100

cases = [
    {"price": 100, "percent": 10, "expected": 90},
    {"price": 50, "percent": 50, "expected": 25},
    {"price": 80, "percent": 0, "expected": 80},
]

passed = 0
for c in cases:
    result = apply_discount(c["price"], c["percent"])
    ok = result == c["expected"]
    if ok:
        passed += 1
    print(str(c["percent"]) + "% off " + str(c["price"]) + " = " + str(result) + " -> " + ("PASS" if ok else "FAIL"))
print(str(passed) + "/" + str(len(cases)) + " unit tests passed")`,
    },
    output: `10% off 100 = 90 -> PASS
50% off 50 = 25 -> PASS
0% off 80 = 80 -> PASS
3/3 unit tests passed`,
  },
  {
    id: "integration-tests",
    pillar: "Testing & QA",
    name: "Integration Tests (Pieces Working Together)",
    easy: "An integration test checks that two or more pieces of your code work correctly TOGETHER, not just alone. Each guitar string can be perfectly in tune on its own, but you only know the chord sounds right when you strum them together. Unit tests prove each part works; integration tests prove the parts connect properly — that the data one piece hands to the next is the shape the next one expects.",
    how: [
      "Pick two or more real pieces that must cooperate, like a service and the store it saves to.",
      "Wire the actual pieces together — no faking the seam you're trying to test.",
      "Run an action that flows through all of them, from the first piece to the last.",
      "Assert on the end result AND on the state left behind, to confirm the handoff between pieces worked.",
    ],
    when: "Use integration tests where separate parts meet: code plus its database, one service calling another, a parser feeding a validator. They catch the bugs that live in the gaps between units, which unit tests can't see.",
    mistakes: [
      "Faking the very connection you meant to test. If you stub out the store, you're back to a unit test and you never checked the real handoff.",
      "Testing everything only through slow, wide integration tests. They're valuable but slower — keep a big base of fast unit tests and use integration tests for the seams.",
    ],
    code: {
      JavaScript: `// Two real units that must cooperate: a store, and a service that uses it.
function createStore() {
  const rows = {};
  return {
    save(id, value) { rows[id] = value; },
    get(id) { return rows[id]; },
  };
}

function registerUser(store, id, name) {
  store.save(id, { name: name, active: true });
  return "registered " + name;
}

// Integration test: does registerUser correctly talk to the real store?
const store = createStore();
console.log(registerUser(store, 1, "Ada"));

const saved = store.get(1);
console.log("Store now has: " + saved.name + " (active: " + (saved.active ? "yes" : "no") + ")");
console.log(saved.name === "Ada" && saved.active ? "PASS: pieces work together" : "FAIL");`,
      Python: `# Two real units that must cooperate: a store, and a service that uses it.
def create_store():
    rows = {}
    def save(id, value):
        rows[id] = value
    def get(id):
        return rows.get(id)
    return {"save": save, "get": get}

def register_user(store, id, name):
    store["save"](id, {"name": name, "active": True})
    return "registered " + name

# Integration test: does register_user correctly talk to the real store?
store = create_store()
print(register_user(store, 1, "Ada"))

saved = store["get"](1)
print("Store now has: " + saved["name"] + " (active: " + ("yes" if saved["active"] else "no") + ")")
print("PASS: pieces work together" if saved["name"] == "Ada" and saved["active"] else "FAIL")`,
    },
    output: `registered Ada
Store now has: Ada (active: yes)
PASS: pieces work together`,
  },
  {
    id: "e2e-tests",
    pillar: "Testing & QA",
    name: "End-to-End (E2E) Tests",
    easy: "An end-to-end test acts like a real user clicking through your whole app from start to finish. Instead of checking one function, it checks a complete journey: open the site, log in, add something to the cart, check out — and confirms the goal was reached. It's the dress rehearsal with the full cast, costumes, and lights, not just one actor practicing a line. Because it exercises everything at once, it catches problems that only appear when the whole system runs together.",
    how: [
      "Describe a real user goal as a sequence of steps: visit, log in, add to cart, check out.",
      "Drive the app through those steps in order, exactly as a person would, one action after another.",
      "At the end, assert the user reached the goal — the order was placed, the confirmation appeared.",
      "In the real world, a tool automates an actual browser to do all this. Below we simulate the flow in plain code so it can run here.",
    ],
    when: "Use E2E tests for your most important user journeys — sign-up, login, checkout — the flows that must never break. Real E2E tools drive a live browser, so they aren't shown running here: Cypress and Playwright are modern favorites that open a real browser and click through your app, and Selenium is the long-standing tool that pioneered browser automation across many browsers and languages. Keep E2E tests few, because they're slower and more fragile than unit tests.",
    mistakes: [
      "Trying to cover every tiny case with E2E tests. They're slow and brittle — test the critical journeys end-to-end, and push detailed edge cases down to fast unit tests.",
      "Forgetting they need a running app and real data set up. An E2E test failing often means the environment was wrong, not that your feature is broken.",
    ],
    code: {
      JavaScript: `// A stand-in for a real browser E2E test. Real tools (Cypress, Playwright,
// Selenium) drive an actual browser; here we simulate the user's whole flow.
function newApp() {
  return { loggedIn: false, cart: [] };
}
const steps = [];

function visit(app, page) { steps.push("visit " + page); }
function login(app) { app.loggedIn = true; steps.push("login"); }
function addToCart(app, item) { app.cart.push(item); steps.push("add " + item); }
function checkout(app) {
  if (!app.loggedIn) { steps.push("checkout blocked: not logged in"); return "blocked"; }
  if (app.cart.length === 0) { steps.push("checkout blocked: empty cart"); return "blocked"; }
  steps.push("order placed");
  return "success";
}

const app = newApp();
visit(app, "home");
login(app);
addToCart(app, "book");
const result = checkout(app);

for (const s of steps) console.log(s);
console.log("Flow result: " + result);
console.log(result === "success" ? "PASS: user completed checkout" : "FAIL");`,
      Python: `# A stand-in for a real browser E2E test. Real tools (Cypress, Playwright,
# Selenium) drive an actual browser; here we simulate the user's whole flow.
def new_app():
    return {"logged_in": False, "cart": []}

steps = []

def visit(app, page):
    steps.append("visit " + page)

def login(app):
    app["logged_in"] = True
    steps.append("login")

def add_to_cart(app, item):
    app["cart"].append(item)
    steps.append("add " + item)

def checkout(app):
    if not app["logged_in"]:
        steps.append("checkout blocked: not logged in")
        return "blocked"
    if len(app["cart"]) == 0:
        steps.append("checkout blocked: empty cart")
        return "blocked"
    steps.append("order placed")
    return "success"

app = new_app()
visit(app, "home")
login(app)
add_to_cart(app, "book")
result = checkout(app)

for s in steps:
    print(s)
print("Flow result: " + result)
print("PASS: user completed checkout" if result == "success" else "FAIL")`,
    },
    output: `visit home
login
add book
order placed
Flow result: success
PASS: user completed checkout`,
  },
  {
    id: "test-doubles",
    pillar: "Testing & QA",
    name: "Test Doubles (Mocks, Stubs, Spies, Fakes)",
    easy: "A test double is a stand-in you swap in for a real dependency during a test — like a stunt double who stands in for the actor during the dangerous scene. If your code sends real emails or charges real cards, you don't want that happening every test run. So you replace the real emailer with a lookalike. A STUB gives canned answers. A FAKE is a lightweight working version (like an in-memory store). A SPY quietly records how it was called. A MOCK is a stand-in with built-in expectations about how it should be used.",
    how: [
      "Find the real dependency you don't want to actually run — a mailer, a payment gateway, a clock.",
      "Build a stand-in with the same shape (the same function names) so your code can't tell the difference.",
      "Have the stand-in record what it was asked to do (that's the 'spy' part) instead of really doing it.",
      "After the action, inspect those recordings to assert your code called the dependency correctly.",
    ],
    when: "Use test doubles whenever the real thing is slow, costs money, is unreliable, or has side effects you don't want in a test — sending emails, calling payment APIs, hitting a network. They let you test YOUR logic without dragging the whole outside world along.",
    mistakes: [
      "Faking so much that the test only checks your fakes, not your real code. If everything is a double, you've tested nothing real.",
      "Making the double behave differently from the real thing. If your fake mailer never fails but the real one sometimes does, your tests give false confidence.",
    ],
    code: {
      JavaScript: `// Real code depends on an "email sender". In a test we swap in a fake that
// also spies (records calls) instead of actually sending anything.
function notifyUser(emailSender, user) {
  if (!user.email) return "no email on file";
  emailSender.send(user.email, "Welcome!");
  return "notified " + user.name;
}

function makeFakeSender() {
  const sent = [];
  return {
    send(to, body) { sent.push(to + ": " + body); },
    sent: sent,
  };
}

const fake = makeFakeSender();
console.log(notifyUser(fake, { name: "Ada", email: "ada@x.com" }));
console.log(notifyUser(fake, { name: "Ghost", email: "" }));
console.log("Emails the spy recorded: " + fake.sent.length);
console.log("First recorded: " + fake.sent[0]);`,
      Python: `# Real code depends on an "email sender". In a test we swap in a fake that
# also spies (records calls) instead of actually sending anything.
def notify_user(email_sender, user):
    if not user["email"]:
        return "no email on file"
    email_sender["send"](user["email"], "Welcome!")
    return "notified " + user["name"]

def make_fake_sender():
    sent = []
    def send(to, body):
        sent.append(to + ": " + body)
    return {"send": send, "sent": sent}

fake = make_fake_sender()
print(notify_user(fake, {"name": "Ada", "email": "ada@x.com"}))
print(notify_user(fake, {"name": "Ghost", "email": ""}))
print("Emails the spy recorded: " + str(len(fake["sent"])))
print("First recorded: " + fake["sent"][0])`,
    },
    output: `notified Ada
no email on file
Emails the spy recorded: 1
First recorded: ada@x.com: Welcome!`,
  },
  {
    id: "tdd-red-green-refactor",
    pillar: "Testing & QA",
    name: "TDD: Red → Green → Refactor",
    easy: "Test-Driven Development (TDD) flips the usual order: you write the test BEFORE the code. It's like writing the answer key before the exam, then filling in the exam until it scores full marks. First you write a test and watch it fail because the feature doesn't exist yet — that's RED. Then you write the simplest code that makes it pass — that's GREEN. Then you tidy the code up without breaking the test — that's REFACTOR. Repeat in tiny loops.",
    how: [
      "RED: write a test for behavior that doesn't exist yet, and run it. It fails — proving the test actually checks something.",
      "GREEN: write the smallest amount of real code needed to make that test pass. Don't gold-plate.",
      "REFACTOR: clean up names and structure now that the test guards you. The test must still pass afterward.",
      "Loop back to RED for the next small piece of behavior. Each cycle is minutes, not hours.",
    ],
    when: "TDD shines on logic with clear right-and-wrong answers — parsers, calculations, rules engines — where you can state the expected result up front. It's less natural for exploratory UI work, where you're still figuring out what you even want.",
    mistakes: [
      "Skipping the RED step. If you never saw the test fail, you don't actually know it can catch the bug — it might pass no matter what.",
      "Writing far more code than the test demands in the GREEN step. Add just enough to pass; let the next failing test drive the next bit of code.",
    ],
    code: {
      JavaScript: `// TDD in miniature. Version 1 is a stub written before the real logic (RED).
function isPalindromeV1(text) {
  return false; // not implemented yet — the test will fail
}

// Version 2 is the real implementation that makes the test pass (GREEN),
// then cleaned up with clear names (REFACTOR).
function isPalindrome(text) {
  const clean = text.toLowerCase();
  const reversed = clean.split("").reverse().join("");
  return clean === reversed;
}

function check(fn, input, expected) {
  return fn(input) === expected ? "PASS" : "FAIL";
}

console.log("RED   (stub):    " + check(isPalindromeV1, "racecar", true));
console.log("GREEN (built):   " + check(isPalindrome, "racecar", true));
console.log("GREEN (built):   " + check(isPalindrome, "hello", false));`,
      Python: `# TDD in miniature. Version 1 is a stub written before the real logic (RED).
def is_palindrome_v1(text):
    return False  # not implemented yet — the test will fail

# Version 2 is the real implementation that makes the test pass (GREEN),
# then cleaned up with clear names (REFACTOR).
def is_palindrome(text):
    clean = text.lower()
    reversed_text = clean[::-1]
    return clean == reversed_text

def check(fn, value, expected):
    return "PASS" if fn(value) == expected else "FAIL"

print("RED   (stub):    " + check(is_palindrome_v1, "racecar", True))
print("GREEN (built):   " + check(is_palindrome, "racecar", True))
print("GREEN (built):   " + check(is_palindrome, "hello", False))`,
    },
    output: `RED   (stub):    FAIL
GREEN (built):   PASS
GREEN (built):   PASS`,
  },
  {
    id: "test-coverage",
    pillar: "Testing & QA",
    name: "Test Coverage (and Its Limits)",
    easy: "Test coverage measures how much of your code your tests actually run. Picture a house inspector: coverage tells you which rooms got walked through, not whether each room passed inspection. If your tests only ever visit the living room, the coverage report shows the bedrooms were never even entered — a strong hint that bugs could hide there. But high coverage isn't proof of quality: you can walk into every room and still not check whether the lights work.",
    how: [
      "A coverage tool watches your code while the tests run and marks each line or branch that executed.",
      "It divides the parts that ran by the total parts, giving a percentage — say 80% of branches covered.",
      "The parts never marked are your blind spots: code no test ever exercised.",
      "You use the report to find untested branches, then add tests aimed straight at them.",
    ],
    when: "Use coverage to find code your tests forgot, especially error branches and rare conditions. Treat it as a flashlight for blind spots, not a grade — chasing 100% for its own sake wastes time on trivial lines while real logic stays weakly checked.",
    mistakes: [
      "Believing 100% coverage means bug-free. Coverage says a line ran, not that you asserted the right thing about it — you can run every line and check nothing meaningful.",
      "Gaming the number with tests that execute code but assert nothing. The percentage climbs while the safety net stays full of holes.",
    ],
    code: {
      JavaScript: `// classify() has 3 branches. We record which ones the tests actually reach.
const covered = [];
function classify(n) {
  if (n < 0) { covered.push("negative"); return "negative"; }
  if (n === 0) { covered.push("zero"); return "zero"; }
  covered.push("positive"); return "positive";
}
const branches = ["negative", "zero", "positive"];

// Our tests only ever try positive numbers...
classify(5);
classify(10);

const unique = branches.filter((b) => covered.includes(b));
const percent = (unique.length / branches.length) * 100;
console.log("Branches hit: " + unique.join(", "));
console.log("Coverage: " + percent.toFixed(0) + "%");
console.log("Untested branches: " + branches.filter((b) => !covered.includes(b)).join(", "));`,
      Python: `# classify() has 3 branches. We record which ones the tests actually reach.
covered = []
def classify(n):
    if n < 0:
        covered.append("negative")
        return "negative"
    if n == 0:
        covered.append("zero")
        return "zero"
    covered.append("positive")
    return "positive"

branches = ["negative", "zero", "positive"]

# Our tests only ever try positive numbers...
classify(5)
classify(10)

unique = [b for b in branches if b in covered]
percent = (len(unique) / len(branches)) * 100
print("Branches hit: " + ", ".join(unique))
print("Coverage: " + f"{percent:.0f}" + "%")
print("Untested branches: " + ", ".join([b for b in branches if b not in covered]))`,
    },
    output: `Branches hit: positive
Coverage: 33%
Untested branches: negative, zero`,
  },
  {
    id: "flaky-tests",
    pillar: "Testing & QA",
    name: "Flaky Tests (Why Tests Fail Intermittently)",
    easy: "A flaky test is one that sometimes passes and sometimes fails without the code changing at all — like a car that starts fine most mornings but stalls on random cold days. Flaky tests are dangerous because they train your team to shrug and hit 'run again', and eventually a real bug gets ignored as 'just the flaky one'. They usually come from depending on something unstable: timing, random values, test order, or shared state that leaks between tests.",
    how: [
      "Spot flakiness by running the same test several times — a truly good test gives the same answer every run.",
      "Hunt the unstable source: a real clock, a random number, a network call, or leftover data from an earlier test.",
      "Remove the dependence on luck. Wait for the real condition instead of a fixed sleep; seed randomness; reset shared state between tests.",
      "Re-run many times to confirm the result is now identical every single time.",
    ],
    when: "You deal with flakiness the moment a test fails intermittently in your pipeline. Fixing it matters even more than fixing a plainly-broken test, because a flaky suite quietly erodes everyone's trust in the tests entirely.",
    mistakes: [
      "'Fixing' flakiness by just retrying until it passes. That hides real bugs the test caught by chance instead of removing the instability.",
      "Using a fixed sleep ('wait 1 second') to dodge timing issues. It's slow AND still flaky — wait for the actual condition to be true instead.",
    ],
    code: {
      JavaScript: `// A flaky test depends on something unstable. We simulate "timing" with a seed
// so the demo is reproducible, but the point is: same test, different results.
function flakyCheck(seed) {
  const serverResponded = seed % 2 === 0; // sometimes ready in time, sometimes not
  return serverResponded ? "PASS" : "FAIL";
}

console.log("Run 1: " + flakyCheck(1));
console.log("Run 2: " + flakyCheck(2));
console.log("Run 3: " + flakyCheck(3));
console.log("Same test, different results -> flaky!");

// The fix: wait for the real condition instead of hoping the timing lines up.
function stableCheck() {
  const serverReady = true; // we explicitly waited until it was ready
  return serverReady ? "PASS" : "FAIL";
}
console.log("Stable run: " + stableCheck());`,
      Python: `# A flaky test depends on something unstable. We simulate "timing" with a seed
# so the demo is reproducible, but the point is: same test, different results.
def flaky_check(seed):
    server_responded = seed % 2 == 0  # sometimes ready in time, sometimes not
    return "PASS" if server_responded else "FAIL"

print("Run 1: " + flaky_check(1))
print("Run 2: " + flaky_check(2))
print("Run 3: " + flaky_check(3))
print("Same test, different results -> flaky!")

# The fix: wait for the real condition instead of hoping the timing lines up.
def stable_check():
    server_ready = True  # we explicitly waited until it was ready
    return "PASS" if server_ready else "FAIL"

print("Stable run: " + stable_check())`,
    },
    output: `Run 1: FAIL
Run 2: PASS
Run 3: FAIL
Same test, different results -> flaky!
Stable run: PASS`,
  },
];

export default lessons;
