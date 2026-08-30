// content/lessons/programming-basics.ts
// Pillar: Programming Basics — the very first building blocks.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/programming-basics.ts`.
//
// This pillar is for absolute first-timers who have never coded before, so
// every term is translated in the same breath it's introduced.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "variables-and-data-types",
    pillar: "Programming Basics",
    name: "Variables & Data Types",
    easy: "A variable is a labeled box you can put something in — like a box labeled 'Snacks' that holds chips today and cookies tomorrow. The label (the variable's name) stays the same, but what's inside (the value) can change. A 'data type' is just what KIND of thing is inside the box: a number, a piece of text (called a 'string'), or a yes/no answer (called a 'boolean').",
    how: [
      "Pick a name for your box, like `age`, and put something inside it using `=` — that's called 'assigning' a value.",
      "Numbers go in with no quotes (`12`). Text goes in with quotes around it, which makes it a 'string' (`\"Ava\"`). Yes/no values are called 'booleans' and are just `true` or `false`.",
      "Use the variable later by writing its name — the computer looks inside the box and hands you back whatever is stored there.",
    ],
    when: "Anytime you need to remember a piece of information to use later — a user's name, a score, whether a checkbox is ticked. Nearly every line of code you'll ever write leans on a variable.",
    mistakes: [
      "Forgetting quotes around text — `age = Ava` confuses the computer; it needs `age = \"Ava\"`.",
      "Mixing up types, like trying to do math on text — `\"12\" + 1` doesn't add numbers the way you'd expect in every language.",
    ],
    code: {
      JavaScript: `let name = "Ava";
let age = 12;
let heightMeters = 1.5;
let isStudent = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Height:", heightMeters.toFixed(2));
console.log("Is student:", isStudent ? "yes" : "no");`,
      Python: `name = "Ava"
age = 12
height_meters = 1.5
is_student = True

print("Name:", name)
print("Age:", age)
print("Height:", f"{height_meters:.2f}")
print("Is student:", "yes" if is_student else "no")`,
    },
    output: `Name: Ava
Age: 12
Height: 1.50
Is student: yes`,
  },
  {
    id: "if-else-conditionals",
    pillar: "Programming Basics",
    name: "If/Else (Conditionals)",
    easy: "An if/else is a fork in the road for your code — like a bouncer at a door: 'IF you're old enough, let them in. ELSE, turn them away.' The computer checks a yes/no question (called a 'condition') and runs different code depending on the answer.",
    how: [
      "Write `if` followed by a question that's either true or false, like 'is the temperature below 0?'.",
      "If the answer is true, the code inside that block runs. If it's false, the computer skips down to the next check.",
      "Add `else if` for more questions, and a final `else` as the catch-all for 'none of the above'.",
    ],
    when: "Whenever your program needs to make a decision and do different things depending on the situation — showing an error if a field is empty, giving a discount if a cart total is high enough, and so on.",
    mistakes: [
      "Using `=` (which means 'set this value') instead of `==` or `===` (which means 'check if these are equal') inside a condition.",
      "Writing conditions in the wrong order — checking the broad case before the narrow one means the narrow one never gets reached.",
    ],
    code: {
      JavaScript: `function describeTemp(tempC) {
  if (tempC < 0) {
    return "freezing";
  } else if (tempC < 15) {
    return "cold";
  } else if (tempC < 25) {
    return "mild";
  } else {
    return "hot";
  }
}

const temps = [-5, 10, 20, 30];
for (const t of temps) {
  console.log(t + "C is " + describeTemp(t));
}`,
      Python: `def describe_temp(temp_c):
    if temp_c < 0:
        return "freezing"
    elif temp_c < 15:
        return "cold"
    elif temp_c < 25:
        return "mild"
    else:
        return "hot"

temps = [-5, 10, 20, 30]
for t in temps:
    print(str(t) + "C is " + describe_temp(t))`,
    },
    output: `-5C is freezing
10C is cold
20C is mild
30C is hot`,
  },
  {
    id: "loops-for-and-while",
    pillar: "Programming Basics",
    name: "Loops (for & while)",
    easy: "A loop is how you tell the computer 'do this again' without typing the same instruction over and over. A 'for' loop is for when you know how many times to repeat — like counting to 5. A 'while' loop is for when you just want to keep going UNTIL something becomes true — like pouring water until the cup is full, however many pours that takes.",
    how: [
      "A `for` loop sets a counter, says how far to count, and says how much to add each time — then repeats its body once per count.",
      "A `while` loop checks a condition before every repeat; as long as it's true, the body runs again.",
      "Either loop needs something that eventually stops it — the counter runs out, or the condition becomes false — or it repeats forever.",
    ],
    when: "Anytime you need to repeat an action a set number of times (for) or repeat it until some condition changes (while) — going through every item in a list, retrying until something succeeds, counting down to zero.",
    mistakes: [
      "Forgetting to change the thing the loop is checking (like forgetting to lower the countdown), which makes it loop forever — called an 'infinite loop'.",
      "Off-by-one mistakes — looping one time too many or too few because of how the start and end points are counted.",
    ],
    code: {
      JavaScript: `let total = 0;
for (let i = 1; i <= 5; i++) {
  total += i;
}
console.log("Sum 1 to 5:", total);

let countdown = 3;
while (countdown > 0) {
  console.log("Countdown:", countdown);
  countdown--;
}
console.log("Liftoff!");`,
      Python: `total = 0
for i in range(1, 6):
    total += i
print("Sum 1 to 5:", total)

countdown = 3
while countdown > 0:
    print("Countdown:", countdown)
    countdown -= 1
print("Liftoff!")`,
    },
    output: `Sum 1 to 5: 15
Countdown: 3
Countdown: 2
Countdown: 1
Liftoff!`,
  },
  {
    id: "functions",
    pillar: "Programming Basics",
    name: "Functions",
    easy: "A function is a recipe card: you write the steps once, give the recipe a name, and from then on you just say the name whenever you want those steps done — instead of rewriting them every time. You can also hand it different ingredients (called 'arguments') so it makes something a little different each time.",
    how: [
      "Define the function once: give it a name and list the inputs (called 'parameters') it needs in parentheses.",
      "Write the steps inside it, and use `return` to send back an answer.",
      "'Call' the function anywhere by writing its name with actual values in parentheses — the computer runs those steps and hands you back whatever it returned.",
    ],
    when: "Any time you find yourself about to write the same steps more than once — or just to give a chunk of logic a clear name so your code reads like plain English.",
    mistakes: [
      "Forgetting `return`, so the function does the work but never hands back an answer — calling it gives you nothing usable.",
      "Confusing a function's parameters (the placeholders in its definition) with arguments (the actual values you pass in when calling it).",
    ],
    code: {
      JavaScript: `function greet(name) {
  return "Hello, " + name + "!";
}

function rectangleArea(width, height) {
  return width * height;
}

console.log(greet("Sam"));
console.log(greet("Mia"));
console.log("Area:", rectangleArea(4, 5));`,
      Python: `def greet(name):
    return "Hello, " + name + "!"

def rectangle_area(width, height):
    return width * height

print(greet("Sam"))
print(greet("Mia"))
print("Area:", rectangle_area(4, 5))`,
    },
    output: `Hello, Sam!
Hello, Mia!
Area: 20`,
  },
  {
    id: "strings",
    pillar: "Programming Basics",
    name: "Strings",
    easy: "A string is just text — a 'string' of characters strung together like beads on a thread, one letter after another. `\"Hello\"` is a string. You can measure how long one is, glue two together (called 'concatenation'), change its case, or grab a piece out of the middle.",
    how: [
      "Write text between quotes to make a string — either `\"double\"` or `'single'` quotes usually work.",
      "Join strings together with `+`, measure their length, or change case with built-in tools like 'uppercase'.",
      "Pull out part of a string by position — the very first character sits at position 0 (called an 'index'), not 1.",
    ],
    when: "Anywhere you're working with words: names, messages, file paths, anything typed by a user or shown on screen.",
    mistakes: [
      "Forgetting strings start counting positions at 0, not 1 — the first letter is at index 0.",
      "Trying to change a string in place — in many languages strings can't be edited directly, so you build a new one instead.",
    ],
    code: {
      JavaScript: `const first = "Hello";
const second = "World";
const combined = first + " " + second;

console.log("Combined:", combined);
console.log("Length:", combined.length);
console.log("Uppercase:", combined.toUpperCase());
console.log("First 5 chars:", combined.slice(0, 5));`,
      Python: `first = "Hello"
second = "World"
combined = first + " " + second

print("Combined:", combined)
print("Length:", len(combined))
print("Uppercase:", combined.upper())
print("First 5 chars:", combined[0:5])`,
    },
    output: `Combined: Hello World
Length: 11
Uppercase: HELLO WORLD
First 5 chars: Hello`,
  },
  {
    id: "lists-and-arrays",
    pillar: "Programming Basics",
    name: "Lists/Arrays",
    easy: "A list (also called an 'array') is a numbered row of lockers, all lined up. Each locker holds one item, and you find something by its locker number, called an 'index' — and the very first locker is always number 0, not 1.",
    how: [
      "Create a list by putting items between square brackets, separated by commas: `[\"apple\", \"banana\"]`.",
      "Read or change an item using its index in square brackets, like `fruits[0]` for the first one.",
      "Add items to the end, remove them, or ask for the list's length — how many lockers are filled.",
    ],
    when: "Any time you have a bunch of similar things to keep together and work with as a group — a shopping list, a set of scores, all the comments on a post.",
    mistakes: [
      "Assuming the first item is at index 1 — it's actually index 0, which trips up almost everyone at first.",
      "Asking for an index that doesn't exist (like the 10th item in a 3-item list), which crashes or gives an error.",
    ],
    code: {
      JavaScript: `const fruits = ["apple", "banana", "cherry"];
fruits.push("date"); // add to the end

console.log("Fruits:", fruits.join(", "));
console.log("First fruit:", fruits[0]);
console.log("Number of fruits:", fruits.length);`,
      Python: `fruits = ["apple", "banana", "cherry"]
fruits.append("date")  # add to the end

print("Fruits:", ", ".join(fruits))
print("First fruit:", fruits[0])
print("Number of fruits:", len(fruits))`,
    },
    output: `Fruits: apple, banana, cherry, date
First fruit: apple
Number of fruits: 4`,
  },
  {
    id: "dictionaries",
    pillar: "Programming Basics",
    name: "Dictionaries (key-value pairs)",
    easy: "A dictionary is like a phone contacts list: instead of finding things by a locker NUMBER like a list does, you find them by a NAME, called a 'key'. Look up the key 'phone', and you instantly get back its matching value — no need to check every entry one by one.",
    how: [
      "Create a dictionary with curly braces, pairing each key to a value with a colon: `{ \"name\": \"Ravi\" }`.",
      "Read a value by its key — in JavaScript with a dot (`student.name`) or brackets (`student[\"name\"]`); in Python always with brackets (`student[\"name\"]`).",
      "Add a new key any time by assigning a value to it — the dictionary just grows to fit.",
    ],
    when: "Whenever your data naturally comes in named pairs — a person's details (name, age, email), app settings, or any 'lookup table' where you want to find things by name instead of position.",
    mistakes: [
      "Looking up a key that doesn't exist, which errors out or gives back nothing useful — check the key exists first if you're not sure.",
      "Confusing a dictionary's keys (the names, like 'age') with a list's indexes (the positions, like 0) — they're looked up in completely different ways.",
    ],
    code: {
      JavaScript: `const student = { name: "Ravi", grade: 8, passed: true };
student.age = 13; // add a new key

console.log("Name:", student.name);
console.log("Grade:", student.grade);
console.log("Passed:", student.passed ? "yes" : "no");
console.log("Age:", student.age);`,
      Python: `student = {"name": "Ravi", "grade": 8, "passed": True}
student["age"] = 13  # add a new key

print("Name:", student["name"])
print("Grade:", student["grade"])
print("Passed:", "yes" if student["passed"] else "no")
print("Age:", student["age"])`,
    },
    output: `Name: Ravi
Grade: 8
Passed: yes
Age: 13`,
  },
  {
    id: "boolean-logic",
    pillar: "Programming Basics",
    name: "Boolean Logic (and/or/not)",
    easy: "A boolean is just a yes/no, true/false light switch. Boolean LOGIC is how you combine switches: AND needs BOTH switches on to be true, OR needs AT LEAST ONE switch on, and NOT just flips a switch to its opposite.",
    how: [
      "`and` (written `&&` in JavaScript) is true only when both sides are true — like needing both a ticket AND being old enough.",
      "`or` (written `||` in JavaScript) is true when at least one side is true — like being let in for being a member OR being a kid.",
      "`not` (written `!` in JavaScript) flips a true into false, or a false into true.",
    ],
    when: "Any time a decision depends on combining more than one yes/no condition — checking permissions, validating a form, or deciding whether a game character is allowed to move.",
    mistakes: [
      "Mixing up `and` and `or` — 'and' is stricter (needs everything true), 'or' is looser (needs just one true).",
      "Printing a raw `true`/`false` value straight into a sentence — it usually reads better to turn it into a word like 'yes' or 'no' first.",
    ],
    code: {
      JavaScript: `function canWatchMovie(age, hasTicket) {
  return age >= 13 && hasTicket; // AND: both must be true
}

function canEnterFree(isMember, isKid) {
  return isMember || isKid; // OR: at least one must be true
}

const isRaining = false;
const needUmbrella = !isRaining; // NOT: flips true/false

console.log("Can watch (14, has ticket):", canWatchMovie(14, true) ? "yes" : "no");
console.log("Can watch (10, has ticket):", canWatchMovie(10, true) ? "yes" : "no");
console.log("Can enter free (member, not kid):", canEnterFree(true, false) ? "yes" : "no");
console.log("Need umbrella:", needUmbrella ? "yes" : "no");`,
      Python: `def can_watch_movie(age, has_ticket):
    return age >= 13 and has_ticket  # AND: both must be true

def can_enter_free(is_member, is_kid):
    return is_member or is_kid  # OR: at least one must be true

is_raining = False
need_umbrella = not is_raining  # NOT: flips True/False

print("Can watch (14, has ticket):", "yes" if can_watch_movie(14, True) else "no")
print("Can watch (10, has ticket):", "yes" if can_watch_movie(10, True) else "no")
print("Can enter free (member, not kid):", "yes" if can_enter_free(True, False) else "no")
print("Need umbrella:", "yes" if need_umbrella else "no")`,
    },
    output: `Can watch (14, has ticket): yes
Can watch (10, has ticket): no
Can enter free (member, not kid): yes
Need umbrella: yes`,
  },
];

export default lessons;
