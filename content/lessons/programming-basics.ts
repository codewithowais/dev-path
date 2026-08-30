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
    easy: "A variable is a labeled box. You can put something inside it. Think of a box labeled 'Snacks'. It holds chips today and cookies tomorrow. The label — the variable's name — stays the same. What's inside — the value — can change. A 'data type' is the KIND of thing inside the box. It could be a number, a piece of text (called a 'string'), or a yes/no answer (called a 'boolean').",
    how: [
      "Pick a name for your box, like `age`. Put something inside it using `=`. This is called 'assigning' a value.",
      "Type numbers with no quotes, like `12`. Put quotes around text to make it a 'string', like `\"Ava\"`. Yes/no values are called 'booleans'. They are just `true` or `false`.",
      "Use the variable later by writing its name. The computer looks inside the box. It hands you back whatever is stored there.",
    ],
    when: "Use a variable anytime you need to remember something for later. This could be a user's name, a score, or whether a checkbox is ticked. Almost every line of code you write uses a variable.",
    mistakes: [
      "Forgetting quotes around text. `age = Ava` confuses the computer. It needs `age = \"Ava\"`.",
      "Mixing up types, like doing math on text. `\"12\" + 1` does not add numbers the way you expect in every language.",
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
    easy: "An if/else is a fork in the road for your code. Picture a bouncer at a door. IF you are old enough, they let you in. ELSE, they turn you away. The computer checks a yes/no question, called a 'condition'. Then it runs different code depending on the answer.",
    how: [
      "Write `if` followed by a question that is true or false, like 'is the temperature below 0?'.",
      "If the answer is true, the code inside that block runs. If it's false, the computer skips to the next check.",
      "Add `else if` for more questions. Add a final `else` to catch 'none of the above'.",
    ],
    when: "Use if/else whenever your program needs to make a decision. It can do different things depending on the situation. For example, show an error if a field is empty, or give a discount if a cart total is high enough.",
    mistakes: [
      "Using `=` (which sets a value) instead of `==` or `===` (which checks if two values are equal) inside a condition.",
      "Writing conditions in the wrong order. If you check the broad case before the narrow one, the narrow one never runs.",
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
    easy: "A loop tells the computer 'do this again' without typing the same instruction over and over. Use a 'for' loop when you know how many times to repeat, like counting to 5. Use a 'while' loop when you want to keep going UNTIL something becomes true, like pouring water until the cup is full — however many pours that takes.",
    how: [
      "A `for` loop sets a counter, says how far to count, and says how much to add each time. It then repeats its body once per count.",
      "A `while` loop checks a condition before every repeat. As long as it's true, the body runs again.",
      "Every loop needs something that eventually stops it. The counter must run out, or the condition must become false. Otherwise the loop repeats forever.",
    ],
    when: "Use a loop anytime you need to repeat an action. Use `for` when you know the number of times to repeat, and `while` when you repeat until a condition changes. Examples: going through every item in a list, retrying until something succeeds, or counting down to zero.",
    mistakes: [
      "Forgetting to change the thing the loop checks, like forgetting to lower the countdown. This makes the loop run forever — called an 'infinite loop'.",
      "Off-by-one mistakes. The loop runs one time too many or too few, because of how the start and end points are counted.",
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
    easy: "A function is a recipe card. You write the steps once and give the recipe a name. From then on, you just say the name whenever you want those steps done. You don't have to rewrite them every time. You can also hand it different ingredients, called 'arguments', so it makes something a little different each time.",
    how: [
      "Define the function once. Give it a name and list the inputs it needs, called 'parameters', in parentheses.",
      "Write the steps inside it. Use `return` to send back an answer.",
      "'Call' the function anywhere by writing its name with actual values in parentheses. The computer runs those steps and hands you back whatever it returned.",
    ],
    when: "Use a function any time you find yourself writing the same steps more than once. You can also use one just to give a chunk of logic a clear name, so your code reads like plain English.",
    mistakes: [
      "Forgetting `return`. The function does the work but never hands back an answer. Calling it gives you nothing usable.",
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
    easy: "A string is just text. It's called a 'string' because characters are strung together like beads on a thread, one letter after another. `\"Hello\"` is a string. You can measure how long one is, glue two together (called 'concatenation'), change its case, or grab a piece out of the middle.",
    how: [
      "Write text between quotes to make a string. Either `\"double\"` or `'single'` quotes usually work.",
      "Join strings together with `+`. Measure their length, or change case with built-in tools like 'uppercase'.",
      "Pull out part of a string by position. The very first character sits at position 0, called an 'index', not 1.",
    ],
    when: "Use strings anywhere you work with words: names, messages, file paths, or anything typed by a user or shown on screen.",
    mistakes: [
      "Forgetting that strings start counting positions at 0, not 1. The first letter is at index 0.",
      "Trying to change a string in place. In many languages, you can't edit a string directly. You build a new one instead.",
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
    easy: "A list, also called an 'array', is a numbered row of lockers, all lined up. Each locker holds one item. You find something by its locker number, called an 'index'. The very first locker is always number 0, not 1.",
    how: [
      "Create a list by putting items between square brackets, separated by commas: `[\"apple\", \"banana\"]`.",
      "Read or change an item using its index in square brackets, like `fruits[0]` for the first one.",
      "Add items to the end, remove them, or ask for the list's length — how many lockers are filled.",
    ],
    when: "Use a list any time you have a bunch of similar things to keep together and work with as a group — a shopping list, a set of scores, or all the comments on a post.",
    mistakes: [
      "Assuming the first item is at index 1. It's actually index 0, which trips up almost everyone at first.",
      "Asking for an index that doesn't exist, like the 10th item in a 3-item list. This crashes the program or gives an error.",
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
    easy: "A dictionary is like a phone contacts list. Instead of finding things by a locker NUMBER like a list does, you find them by a NAME, called a 'key'. Look up the key 'phone', and you instantly get back its matching value. You don't need to check every entry one by one.",
    how: [
      "Create a dictionary with curly braces. Pair each key to a value with a colon: `{ \"name\": \"Ravi\" }`.",
      "Read a value by its key. In JavaScript, use a dot (`student.name`) or brackets (`student[\"name\"]`). In Python, always use brackets (`student[\"name\"]`).",
      "Add a new key any time by assigning a value to it. The dictionary just grows to fit.",
    ],
    when: "Use a dictionary whenever your data naturally comes in named pairs. Examples: a person's details (name, age, email), app settings, or any 'lookup table' where you want to find things by name instead of position.",
    mistakes: [
      "Looking up a key that doesn't exist. This errors out or gives back nothing useful. Check that the key exists first if you're not sure.",
      "Confusing a dictionary's keys (the names, like 'age') with a list's indexes (the positions, like 0). They are looked up in completely different ways.",
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
    easy: "A boolean is just a yes/no, true/false light switch. Boolean LOGIC is how you combine switches. AND needs BOTH switches on to be true. OR needs AT LEAST ONE switch on. NOT just flips a switch to its opposite.",
    how: [
      "`and` (written `&&` in JavaScript) is true only when both sides are true — like needing both a ticket AND being old enough.",
      "`or` (written `||` in JavaScript) is true when at least one side is true — like being let in for being a member OR being a kid.",
      "`not` (written `!` in JavaScript) flips a true into false, or a false into true.",
    ],
    when: "Use boolean logic any time a decision depends on combining more than one yes/no condition. Examples: checking permissions, validating a form, or deciding whether a game character can move.",
    mistakes: [
      "Mixing up `and` and `or`. 'And' is stricter — it needs everything true. 'Or' is looser — it needs just one true.",
      "Printing a raw `true`/`false` value straight into a sentence. It usually reads better to turn it into a word like 'yes' or 'no' first.",
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
  {
    id: "operators-arithmetic-comparison",
    pillar: "Programming Basics",
    name: "Operators (Arithmetic & Comparison)",
    easy: "Operators are the little symbols that DO something with your values, like the +, -, x, and / buttons on a calculator. 'Arithmetic' operators do math: add, subtract, multiply, divide. 'Comparison' operators work like a balance scale. They weigh two values against each other and answer with a yes/no, called a 'boolean'. Is this side bigger, smaller, or exactly equal?",
    how: [
      "Arithmetic operators are `+` (add), `-` (subtract), `*` (multiply), and division. Division comes in two flavors: regular division, and 'whole number' division that throws away any leftover. The leftover itself is called the 'remainder', found with `%`.",
      "Comparison operators are `==`/`===` (is equal), `>` (greater than), `<` (less than), and `<=`/`>=` (less/greater than OR equal). Every one of these hands back a boolean, `true` or `false`.",
      "You can mix operators together, like checking `a > b`. The computer works out the math or comparison the same way you would with pen and paper, left to right.",
    ],
    when: "Use these operators anytime you do math on numbers, or anytime your code needs to decide 'is this bigger?' or 'is this the same?'. Examples: splitting a bill evenly, checking if someone's old enough, or scoring a quiz.",
    mistakes: [
      "Using a single `=` (which SETS a value) when you meant `==` or `===` (which CHECKS if two values are equal). This is a very common beginner slip.",
      "Forgetting that regular division can leave a fraction. If you only want whole numbers, you need a specific 'whole number division' tool, not just `/`.",
    ],
    code: {
      JavaScript: `const a = 17;
const b = 5;

console.log("Add:", a + b);
console.log("Subtract:", a - b);
console.log("Multiply:", a * b);
console.log("Divide (whole):", Math.floor(a / b));
console.log("Remainder:", a % b);
console.log("Is equal:", a === b ? "yes" : "no");
console.log("Is greater:", a > b ? "yes" : "no");
console.log("Is less or equal:", a <= b ? "yes" : "no");`,
      Python: `a = 17
b = 5

print("Add:", a + b)
print("Subtract:", a - b)
print("Multiply:", a * b)
print("Divide (whole):", a // b)
print("Remainder:", a % b)
print("Is equal:", "yes" if a == b else "no")
print("Is greater:", "yes" if a > b else "no")
print("Is less or equal:", "yes" if a <= b else "no")`,
    },
    output: `Add: 22
Subtract: 12
Multiply: 85
Divide (whole): 3
Remainder: 2
Is equal: no
Is greater: yes
Is less or equal: no`,
  },
  {
    id: "type-conversion",
    pillar: "Programming Basics",
    name: "Type Conversion (Casting)",
    easy: "Type conversion, also called 'casting', is like exchanging currency. The value stays meaningfully the same, but you change the FORM it's in so it works where you need it. For example, you can turn the text \"9.5\" into the actual number 9.5. Or you can turn the number 42 into the text \"42\" so you can glue it onto a sentence.",
    how: [
      "Text that looks like a number, like `\"9.5\"`, can be converted into a real number so you can do math with it. In JavaScript, use `parseFloat`. In Python, use `float`.",
      "A number can be converted into text so you can join it with other text. In JavaScript, use `String(...)`. In Python, use `str(...)`.",
      "A number with a decimal point can be converted down to a whole number by cutting off everything after the decimal. This is called 'truncating', not rounding.",
    ],
    when: "Use type conversion whenever data arrives in the 'wrong' form for what you want to do with it. For example, a price typed into a form arrives as text, but you need it as a number to multiply. A score is a number, but you need it as text to display in a sentence.",
    mistakes: [
      "Trying to do math directly on text without converting it first. Most languages will either error, or glue the text together instead of adding numbers.",
      "Assuming converting a decimal to a whole number rounds it. It actually just chops off the decimal part, so `9.8` becomes `9`, not `10`.",
    ],
    code: {
      JavaScript: `const priceText = "9.5";
const price = parseFloat(priceText);
const quantity = 3;
const total = price * quantity;

console.log("Price text:", priceText);
console.log("Price number:", price);
console.log("Total:", total.toFixed(2));

const count = 42;
const countText = String(count);
console.log("Count as text:", "Item #" + countText);

console.log("Whole number from float:", Math.floor(9.8));`,
      Python: `price_text = "9.5"
price = float(price_text)
quantity = 3
total = price * quantity

print("Price text:", price_text)
print("Price number:", price)
print("Total:", f"{total:.2f}")

count = 42
count_text = str(count)
print("Count as text:", "Item #" + count_text)

print("Whole number from float:", int(9.8))`,
    },
    output: `Price text: 9.5
Price number: 9.5
Total: 28.50
Count as text: Item #42
Whole number from float: 9`,
  },
  {
    id: "error-handling-try-catch",
    pillar: "Programming Basics",
    name: "Error Handling (try/catch)",
    easy: "Error handling is a safety net under a tightrope walker. If the walker (your code) slips — say, you try to divide by zero — the net, called `try`/`catch`, catches the fall. The whole show doesn't shut down. Instead of the program crashing, you get a chance to say 'something went wrong, here's what to do instead.'",
    how: [
      "Put risky code — code that might fail — inside a `try` block.",
      "If something goes wrong inside `try`, the computer immediately jumps to the matching `catch` block instead of crashing. It hands you details about what went wrong.",
      "A `finally` block, if you add one, runs no matter what happened — whether `try` succeeded or `catch` caught a problem. It's useful for cleanup steps you never want to skip.",
    ],
    when: "Use error handling anytime something might fail in a way you can predict but not prevent. Examples: reading a file that might not exist, dividing by a number that might be zero, or asking a website for data when the internet might be down.",
    mistakes: [
      "Wrapping your ENTIRE program in one giant `try`. This hides exactly where something went wrong. Keep `try` blocks small and focused.",
      "Catching an error and then doing nothing with it (an empty `catch`). This silently hides bugs instead of fixing or reporting them.",
    ],
    code: {
      JavaScript: `function safeDivide(a, b) {
  try {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return "Result: " + (a / b).toFixed(2);
  } catch (err) {
    return "Error: " + err.message;
  } finally {
    console.log("Attempted:", a + " / " + b);
  }
}

console.log(safeDivide(10, 2));
console.log(safeDivide(10, 0));`,
      Python: `def safe_divide(a, b):
    try:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return "Result: " + f"{a / b:.2f}"
    except ValueError as err:
        return "Error: " + str(err)
    finally:
        print("Attempted:", str(a) + " / " + str(b))

print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
    },
    output: `Attempted: 10 / 2
Result: 5.00
Attempted: 10 / 0
Error: Cannot divide by zero`,
  },
  {
    id: "scope-local-global",
    pillar: "Programming Basics",
    name: "Scope (Local vs Global)",
    easy: "Scope is about WHERE a variable can be seen and used. A 'global' variable is like an announcement over the school's loudspeaker — every classroom hears it. A 'local' variable is like a note passed around inside just ONE classroom. Kids in other classrooms have no idea it exists, and it disappears once that class ends.",
    how: [
      "A variable created outside of any function is 'global'. Every function in the file can read it.",
      "A variable created INSIDE a function is 'local' to that function. It's a fresh box that only exists while the function is running, then it's thrown away.",
      "If a local variable has the SAME name as a global one, the local one wins inside that function. It temporarily 'shadows', or hides, the global — without changing the global's own value at all.",
    ],
    when: "Think about scope anytime you decide where to put a variable. Keep values local to a function whenever possible, so different parts of a big program don't accidentally step on each other's data. Reach for a global only for things truly needed everywhere, like a shared setting.",
    mistakes: [
      "Trying to use a local variable outside the function it was created in. It simply doesn't exist out there, and the computer will complain it can't find it.",
      "Assuming that changing a local variable also changes a global variable with the same name. It doesn't. They are two separate boxes that just happen to have the same label.",
    ],
    code: {
      JavaScript: `let score = 100; // global: visible to every function below

function bonusRound() {
  let score = 100; // local: a brand-new, separate box for this function only
  score += 50;
  return score;
}

console.log("Bonus round result:", bonusRound());
console.log("Global score after:", score);`,
      Python: `score = 100  # global: visible to every function below

def bonus_round():
    score = 100  # local: a brand-new, separate box for this function only
    score += 50
    return score

print("Bonus round result:", bonus_round())
print("Global score after:", score)`,
    },
    output: `Bonus round result: 150
Global score after: 100`,
  },
  {
    id: "ternary-switch",
    pillar: "Programming Basics",
    name: "Ternary & Switch (Multi-Way Choice)",
    easy: "A ternary is a tiny if/else squeezed onto one line. It's a shortcut fork in the road for when you only have two paths and a quick question to pick between them, like 'old enough? then adult, else minor'. A switch is for when you have MANY paths branching from one value, like a vending machine: press button 1 for chips, button 2 for soda, button 3 for candy — and if nothing matches, a default slot.",
    how: [
      "A ternary has the shape `condition ? valueIfTrue : valueIfFalse`. It's an expression, so it hands back a value directly instead of needing a full if/else block.",
      "A switch checks one value against a list of `case`s, one after another, and runs the code under whichever `case` matches. A `break` afterward stops it from falling into the next case by accident.",
      "If none of the cases match, a `default` case, or the language's equivalent, catches everything else, just like the final `else` in an if/else chain.",
    ],
    when: "Reach for a ternary when you're picking between exactly two short values, like choosing a label or a default. Reach for a switch, or its equivalent, when one value can take on several distinct options, and each one needs its own clear branch — like matching a day number to a day name.",
    mistakes: [
      "Cramming a big, complicated decision into a ternary. If the true/false branches are long or nested, a plain if/else reads far more clearly.",
      "Forgetting `break` in a switch (in languages that need it). This lets execution 'fall through' into the next case by mistake instead of stopping.",
    ],
    code: {
      JavaScript: `const age = 20;
const status = age >= 18 ? "adult" : "minor";
console.log("Status:", status);

const day = 3;
let dayName;
switch (day) {
  case 1:
    dayName = "Monday";
    break;
  case 2:
    dayName = "Tuesday";
    break;
  case 3:
    dayName = "Wednesday";
    break;
  default:
    dayName = "Unknown";
}
console.log("Day:", dayName);`,
      Python: `age = 20
status = "adult" if age >= 18 else "minor"
print("Status:", status)

# Python has no built-in switch (on versions before 3.10's "match"),
# so an if/elif chain is the classic stand-in — same "check, then jump" idea.
day = 3
if day == 1:
    day_name = "Monday"
elif day == 2:
    day_name = "Tuesday"
elif day == 3:
    day_name = "Wednesday"
else:
    day_name = "Unknown"
print("Day:", day_name)`,
    },
    output: `Status: adult
Day: Wednesday`,
  },
];

export default lessons;
