// content/lessons/databases.ts
// Pillar: Databases — how apps remember things.
//
// No real database engine is installed, so every lesson demonstrates the SQL
// concept by doing the equivalent operation on plain in-memory data (an array
// of record objects in JS, a list of dicts in Python) and printing the
// result. The actual SQL is shown as a comment/string alongside the code.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/databases.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "filtering-rows",
    pillar: "Databases",
    name: "Filtering Rows (WHERE)",
    easy: "A database table is just a spreadsheet: each row is one record, each column is one field. WHERE is the spreadsheet's filter button — it hides every row that doesn't match your condition and only shows you the ones that do.",
    how: [
      "Look at each row one at a time.",
      "Check the row against your condition (like age > 30). If it passes, keep it; if not, skip it.",
      "Collect only the rows that passed — that's your filtered result set.",
    ],
    when: "Any time you want a slice of your data instead of everything — 'find me all users over 30', 'find me orders over $100'. It's the single most-used piece of SQL.",
    big: "O(n) time to scan every row once (much faster with an index — see the Indexes lesson) · O(1) extra space if you filter in place.",
    mistakes: [
      "Forgetting that WHERE compares row-by-row — it can't see a computed total across rows (that's what HAVING is for, after GROUP BY).",
      "Comparing text with = and assuming it's case-insensitive — 'Ana' and 'ana' often don't match.",
    ],
    code: {
      JavaScript: `function whereAgeGreaterThan(users, minAge) {
  // SQL: SELECT * FROM users WHERE age > 30
  return users.filter((u) => u.age > minAge);
}

function formatUser(u) {
  return u.id + " " + u.name + " " + u.age + " " + u.city;
}

const users = [
  { id: 1, name: "Ana", age: 28, city: "Lahore" },
  { id: 2, name: "Bilal", age: 35, city: "Karachi" },
  { id: 3, name: "Cara", age: 41, city: "Lahore" },
  { id: 4, name: "Dan", age: 22, city: "Multan" },
];

console.log("All users:");
for (const u of users) console.log(formatUser(u));

console.log("SQL: SELECT * FROM users WHERE age > 30");
console.log("Matching rows:");
for (const u of whereAgeGreaterThan(users, 30)) console.log(formatUser(u));`,
      Python: `def where_age_greater_than(users, min_age):
    # SQL: SELECT * FROM users WHERE age > 30
    return [u for u in users if u["age"] > min_age]

def format_user(u):
    return str(u["id"]) + " " + u["name"] + " " + str(u["age"]) + " " + u["city"]

users = [
    {"id": 1, "name": "Ana", "age": 28, "city": "Lahore"},
    {"id": 2, "name": "Bilal", "age": 35, "city": "Karachi"},
    {"id": 3, "name": "Cara", "age": 41, "city": "Lahore"},
    {"id": 4, "name": "Dan", "age": 22, "city": "Multan"},
]

print("All users:")
for u in users:
    print(format_user(u))

print("SQL: SELECT * FROM users WHERE age > 30")
print("Matching rows:")
for u in where_age_greater_than(users, 30):
    print(format_user(u))`,
    },
    output: `All users:
1 Ana 28 Lahore
2 Bilal 35 Karachi
3 Cara 41 Lahore
4 Dan 22 Multan
SQL: SELECT * FROM users WHERE age > 30
Matching rows:
2 Bilal 35 Karachi
3 Cara 41 Lahore`,
  },
  {
    id: "sorting-order-by",
    pillar: "Databases",
    name: "Sorting (ORDER BY)",
    easy: "ORDER BY is like handing a librarian a stack of books and asking for them back arranged by publication year. The table's rows don't actually change — you're just choosing what order to read the results back in.",
    how: [
      "Pick the column (or columns) to sort by, like age.",
      "Decide the direction: ASC (ascending, smallest first) or DESC (descending, biggest first).",
      "The database reorders the RESULT rows by comparing that column — the stored table itself is untouched.",
    ],
    when: "Whenever the order results appear in matters — newest posts first, cheapest products first, alphabetical names.",
    big: "O(n log n) time for a general-purpose sort · a database can often use an index to make ORDER BY on that column much cheaper.",
    mistakes: [
      "Assuming rows come back in some 'natural' order without ORDER BY — SQL makes no such promise unless you ask for one.",
      "Forgetting DESC and getting smallest-first when you actually wanted biggest-first.",
    ],
    code: {
      JavaScript: `function orderByAgeAsc(users) {
  // SQL: SELECT * FROM users ORDER BY age ASC
  return [...users].sort((a, b) => a.age - b.age);
}

function orderByAgeDesc(users) {
  // SQL: SELECT * FROM users ORDER BY age DESC
  return [...users].sort((a, b) => b.age - a.age);
}

function formatUser(u) {
  return u.id + " " + u.name + " " + u.age + " " + u.city;
}

const users = [
  { id: 1, name: "Ana", age: 28, city: "Lahore" },
  { id: 2, name: "Bilal", age: 35, city: "Karachi" },
  { id: 3, name: "Cara", age: 41, city: "Lahore" },
  { id: 4, name: "Dan", age: 22, city: "Multan" },
];

console.log("SQL: SELECT * FROM users ORDER BY age ASC");
for (const u of orderByAgeAsc(users)) console.log(formatUser(u));

console.log("SQL: SELECT * FROM users ORDER BY age DESC");
for (const u of orderByAgeDesc(users)) console.log(formatUser(u));`,
      Python: `def order_by_age_asc(users):
    # SQL: SELECT * FROM users ORDER BY age ASC
    return sorted(users, key=lambda u: u["age"])

def order_by_age_desc(users):
    # SQL: SELECT * FROM users ORDER BY age DESC
    return sorted(users, key=lambda u: u["age"], reverse=True)

def format_user(u):
    return str(u["id"]) + " " + u["name"] + " " + str(u["age"]) + " " + u["city"]

users = [
    {"id": 1, "name": "Ana", "age": 28, "city": "Lahore"},
    {"id": 2, "name": "Bilal", "age": 35, "city": "Karachi"},
    {"id": 3, "name": "Cara", "age": 41, "city": "Lahore"},
    {"id": 4, "name": "Dan", "age": 22, "city": "Multan"},
]

print("SQL: SELECT * FROM users ORDER BY age ASC")
for u in order_by_age_asc(users):
    print(format_user(u))

print("SQL: SELECT * FROM users ORDER BY age DESC")
for u in order_by_age_desc(users):
    print(format_user(u))`,
    },
    output: `SQL: SELECT * FROM users ORDER BY age ASC
4 Dan 22 Multan
1 Ana 28 Lahore
2 Bilal 35 Karachi
3 Cara 41 Lahore
SQL: SELECT * FROM users ORDER BY age DESC
3 Cara 41 Lahore
2 Bilal 35 Karachi
1 Ana 28 Lahore
4 Dan 22 Multan`,
  },
  {
    id: "aggregation-group-by",
    pillar: "Databases",
    name: "Aggregation (GROUP BY / COUNT / SUM)",
    easy: "GROUP BY is like sorting a pile of receipts into one envelope per customer, then writing a total on the outside of each envelope. Instead of one row per receipt, you get back one row per customer with a count and a sum.",
    how: [
      "Decide what to group by — like 'customer'. Every row with the same customer goes in the same bucket.",
      "For each bucket, run an aggregate function: COUNT(*) counts how many rows landed there, SUM(amount) adds up a column.",
      "Output one summary row per bucket, e.g. 'Ana: 2 orders, $70 total'.",
    ],
    when: "Any time you want a total, average, or count per category — total sales per customer, orders per day, average score per student.",
    big: "O(n) time to scan every row once and accumulate into buckets · O(k) space for k distinct groups.",
    mistakes: [
      "Selecting a plain column that isn't in GROUP BY or wrapped in an aggregate — SQL rejects this (or, in lenient databases, silently picks an arbitrary value).",
      "Assuming groups come back in a predictable order — sort explicitly (like we do below) if the order matters to you.",
    ],
    code: {
      JavaScript: `function groupByCustomer(orders) {
  // SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total
  //      FROM orders GROUP BY customer
  const groups = {};
  for (const o of orders) {
    if (!(o.customer in groups)) groups[o.customer] = { count: 0, total: 0 };
    groups[o.customer].count += 1;
    groups[o.customer].total += o.amount;
  }
  return groups;
}

const orders = [
  { customer: "Ana", amount: 50 },
  { customer: "Bilal", amount: 30 },
  { customer: "Ana", amount: 20 },
  { customer: "Cara", amount: 70 },
  { customer: "Bilal", amount: 10 },
];

const groups = groupByCustomer(orders);
console.log("SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total FROM orders GROUP BY customer");

// Sort the bucket names — group/dict iteration order isn't guaranteed to
// line up between languages (or even between runs), so we fix it ourselves.
const names = Object.keys(groups).sort();
for (const name of names) {
  const g = groups[name];
  console.log(name + " orders=" + g.count + " total=" + g.total);
}`,
      Python: `def group_by_customer(orders):
    # SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total
    #      FROM orders GROUP BY customer
    groups = {}
    for o in orders:
        if o["customer"] not in groups:
            groups[o["customer"]] = {"count": 0, "total": 0}
        groups[o["customer"]]["count"] += 1
        groups[o["customer"]]["total"] += o["amount"]
    return groups

orders = [
    {"customer": "Ana", "amount": 50},
    {"customer": "Bilal", "amount": 30},
    {"customer": "Ana", "amount": 20},
    {"customer": "Cara", "amount": 70},
    {"customer": "Bilal", "amount": 10},
]

groups = group_by_customer(orders)
print("SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total FROM orders GROUP BY customer")

# Sort the bucket names — group/dict iteration order isn't guaranteed to
# line up between languages (or even between runs), so we fix it ourselves.
names = sorted(groups.keys())
for name in names:
    g = groups[name]
    print(name + " orders=" + str(g["count"]) + " total=" + str(g["total"]))`,
    },
    output: `SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total FROM orders GROUP BY customer
Ana orders=2 total=70
Bilal orders=2 total=40
Cara orders=1 total=70`,
  },
  {
    id: "joining-tables",
    pillar: "Databases",
    name: "Joining Tables (JOIN)",
    easy: "Real data usually lives in separate tables to avoid repeating itself — one table of users, one table of orders. A JOIN is like matching up two stacks of index cards by a shared ID number, so you can read 'Ana bought a Book' instead of a lonely user_id sitting next to an item.",
    how: [
      "Pick the shared column that connects the two tables — like users.id and orders.user_id.",
      "For each row in one table, find the row(s) in the other table where that shared column matches.",
      "Combine the matched rows into one wider row with columns from both tables.",
    ],
    when: "Whenever the data you need is spread across more than one table — showing a customer's name next to their order, or a product's name next to a sale.",
    big: "O(n × m) time with a naive nested-loop match · O(n + m) if you build an index (a hash map) on the join key first, which is what real databases do.",
    mistakes: [
      "Joining on the wrong column, which silently produces garbage matches or far too many rows.",
      "Forgetting that a plain JOIN drops rows with no match on either side — a LEFT JOIN keeps the unmatched ones too.",
    ],
    code: {
      JavaScript: `function innerJoin(users, orders) {
  // SQL: SELECT users.name, orders.item, orders.amount
  //      FROM users JOIN orders ON users.id = orders.user_id
  const userById = {};
  for (const u of users) userById[u.id] = u.name;

  const rows = [];
  for (const o of orders) {
    if (o.user_id in userById) {
      rows.push({ name: userById[o.user_id], item: o.item, amount: o.amount });
    }
  }
  return rows;
}

const users = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Bilal" },
  { id: 3, name: "Cara" },
];

const orders = [
  { user_id: 1, item: "Book", amount: 15 },
  { user_id: 2, item: "Pen", amount: 2 },
  { user_id: 1, item: "Lamp", amount: 25 },
  { user_id: 3, item: "Chair", amount: 40 },
];

console.log("SQL: SELECT users.name, orders.item, orders.amount FROM users JOIN orders ON users.id = orders.user_id");
for (const row of innerJoin(users, orders)) {
  console.log(row.name + " " + row.item + " " + row.amount);
}`,
      Python: `def inner_join(users, orders):
    # SQL: SELECT users.name, orders.item, orders.amount
    #      FROM users JOIN orders ON users.id = orders.user_id
    user_by_id = {}
    for u in users:
        user_by_id[u["id"]] = u["name"]

    rows = []
    for o in orders:
        if o["user_id"] in user_by_id:
            rows.append({
                "name": user_by_id[o["user_id"]],
                "item": o["item"],
                "amount": o["amount"],
            })
    return rows

users = [
    {"id": 1, "name": "Ana"},
    {"id": 2, "name": "Bilal"},
    {"id": 3, "name": "Cara"},
]

orders = [
    {"user_id": 1, "item": "Book", "amount": 15},
    {"user_id": 2, "item": "Pen", "amount": 2},
    {"user_id": 1, "item": "Lamp", "amount": 25},
    {"user_id": 3, "item": "Chair", "amount": 40},
]

print("SQL: SELECT users.name, orders.item, orders.amount FROM users JOIN orders ON users.id = orders.user_id")
for row in inner_join(users, orders):
    print(row["name"] + " " + row["item"] + " " + str(row["amount"]))`,
    },
    output: `SQL: SELECT users.name, orders.item, orders.amount FROM users JOIN orders ON users.id = orders.user_id
Ana Book 15
Bilal Pen 2
Ana Lamp 25
Cara Chair 40`,
  },
  {
    id: "database-indexes",
    pillar: "Databases",
    name: "Indexes (why lookups get fast)",
    easy: "A database index is exactly like the index at the back of a textbook. Without it, finding 'photosynthesis' means flipping through every page one by one (a slow scan). With it, you jump straight to the page number — because the index already knows where everything is.",
    how: [
      "Without an index, WHERE id = 105 checks every single row until it finds a match (or reaches the end) — a linear scan.",
      "CREATE INDEX builds a fast lookup structure ahead of time — like a hash map from key straight to row — based on the column you search on most.",
      "With the index, WHERE id = 105 jumps straight to the matching row in roughly one step, instead of checking every row.",
    ],
    when: "Any column you filter or join on often, especially in big tables — primary keys get an index automatically, and you add more yourself for columns you search a lot.",
    big: "Without an index: O(n) per lookup. With an index (hash map): O(1) average per lookup. The tradeoff: indexes cost extra memory and slow down writes slightly, since the index itself has to stay updated.",
    mistakes: [
      "Adding an index to every column 'just in case' — each one makes INSERT/UPDATE slower and uses more storage.",
      "Expecting an index to help when you're not actually filtering/joining on that column, or when you wrap it in a function (like LOWER(name)) a plain index can't match.",
    ],
    code: {
      JavaScript: `function linearFind(products, targetId) {
  // Without an index, the database checks row by row until it finds a match.
  let checks = 0;
  for (const p of products) {
    checks += 1;
    if (p.id === targetId) return { product: p, checks: checks };
  }
  return { product: null, checks: checks };
}

function buildIndex(products) {
  // SQL: CREATE INDEX idx_products_id ON products(id);
  const index = {};
  for (const p of products) index[p.id] = p;
  return index;
}

function indexFind(index, targetId) {
  // SQL: SELECT * FROM products WHERE id = 105
  // With the index, this is a direct lookup — one step, not a scan.
  const checks = 1;
  const product = targetId in index ? index[targetId] : null;
  return { product: product, checks: checks };
}

const products = [
  { id: 104, name: "Mug" },
  { id: 101, name: "Pen" },
  { id: 106, name: "Widget" },
  { id: 102, name: "Lamp" },
  { id: 105, name: "Chair" },
  { id: 103, name: "Book" },
];

const targetId = 105;

console.log("SQL: SELECT * FROM products WHERE id = 105 (no index)");
const linear = linearFind(products, targetId);
console.log("Found: " + linear.product.name + ", checks: " + linear.checks);

console.log("SQL: CREATE INDEX idx_products_id ON products(id);");
const index = buildIndex(products);
console.log("SQL: SELECT * FROM products WHERE id = 105 (with index)");
const indexed = indexFind(index, targetId);
console.log("Found: " + indexed.product.name + ", checks: " + indexed.checks);`,
      Python: `def linear_find(products, target_id):
    # Without an index, the database checks row by row until it finds a match.
    checks = 0
    for p in products:
        checks += 1
        if p["id"] == target_id:
            return {"product": p, "checks": checks}
    return {"product": None, "checks": checks}

def build_index(products):
    # SQL: CREATE INDEX idx_products_id ON products(id);
    index = {}
    for p in products:
        index[p["id"]] = p
    return index

def index_find(index, target_id):
    # SQL: SELECT * FROM products WHERE id = 105
    # With the index, this is a direct lookup — one step, not a scan.
    checks = 1
    product = index[target_id] if target_id in index else None
    return {"product": product, "checks": checks}

products = [
    {"id": 104, "name": "Mug"},
    {"id": 101, "name": "Pen"},
    {"id": 106, "name": "Widget"},
    {"id": 102, "name": "Lamp"},
    {"id": 105, "name": "Chair"},
    {"id": 103, "name": "Book"},
]

target_id = 105

print("SQL: SELECT * FROM products WHERE id = 105 (no index)")
linear = linear_find(products, target_id)
print("Found: " + linear["product"]["name"] + ", checks: " + str(linear["checks"]))

print("SQL: CREATE INDEX idx_products_id ON products(id);")
index = build_index(products)
print("SQL: SELECT * FROM products WHERE id = 105 (with index)")
indexed = index_find(index, target_id)
print("Found: " + indexed["product"]["name"] + ", checks: " + str(indexed["checks"]))`,
    },
    output: `SQL: SELECT * FROM products WHERE id = 105 (no index)
Found: Chair, checks: 5
SQL: CREATE INDEX idx_products_id ON products(id);
SQL: SELECT * FROM products WHERE id = 105 (with index)
Found: Chair, checks: 1`,
  },
  {
    id: "transactions",
    pillar: "Databases",
    name: "Transactions (all-or-nothing)",
    easy: "A transaction is like an ATM transfer between two bank accounts: the money must leave one account AND arrive in the other, or neither happens at all. You'd never accept 'the $30 vanished from A but never showed up in B' — a transaction guarantees that can't happen.",
    how: [
      "BEGIN TRANSACTION marks the start — every change from here is provisional, not yet permanent.",
      "Make your changes (like subtracting from one account and adding to another). If everything succeeds, COMMIT makes them permanent.",
      "If anything goes wrong partway through (like insufficient funds), ROLLBACK undoes every change made since BEGIN — the database ends up exactly as if nothing had happened.",
    ],
    when: "Any time multiple changes must succeed or fail together — moving money between accounts, placing an order that both charges a customer and reduces stock, or any 'update several things consistently' operation.",
    big: "No extra Big-O cost from the logic itself — the guarantee is about correctness (all-or-nothing), not speed. Real databases pay a small bookkeeping overhead so they can roll back if needed.",
    mistakes: [
      "Committing changes one at a time instead of wrapping them in one transaction — that's exactly how you get a 'money left but never arrived' bug.",
      "Forgetting to roll back on error and leaving the data in a half-changed, inconsistent state.",
    ],
    code: {
      JavaScript: `function transfer(accounts, frm, to, amount) {
  // SQL: BEGIN TRANSACTION;
  //      UPDATE accounts SET balance = balance - amount WHERE name = frm;
  //      UPDATE accounts SET balance = balance + amount WHERE name = to;
  //      COMMIT;
  const copy = Object.assign({}, accounts);
  if (copy[frm] < amount) {
    // SQL: ROLLBACK; — undo everything, act as if nothing happened
    return { accounts: accounts, ok: false };
  }
  copy[frm] -= amount;
  copy[to] += amount;
  return { accounts: copy, ok: true };
}

function formatAccounts(accounts) {
  const names = Object.keys(accounts).sort();
  const parts = [];
  for (const n of names) parts.push(n + ":" + accounts[n]);
  return parts.join(" ");
}

let accounts = { A: 100, B: 50 };
console.log("Before:", formatAccounts(accounts));

console.log("SQL: BEGIN TRANSACTION ... COMMIT");
let result = transfer(accounts, "A", "B", 30);
accounts = result.accounts;
console.log("Transfer 30 from A to B:", result.ok ? "success" : "failed (insufficient funds) - rolled back");
console.log("After transfer 1:", formatAccounts(accounts));

console.log("SQL: BEGIN TRANSACTION ... ROLLBACK");
result = transfer(accounts, "B", "A", 200);
accounts = result.accounts;
console.log("Transfer 200 from B to A:", result.ok ? "success" : "failed (insufficient funds) - rolled back");
console.log("After transfer 2 attempt:", formatAccounts(accounts));`,
      Python: `def transfer(accounts, frm, to, amount):
    # SQL: BEGIN TRANSACTION;
    #      UPDATE accounts SET balance = balance - amount WHERE name = frm;
    #      UPDATE accounts SET balance = balance + amount WHERE name = to;
    #      COMMIT;
    copy = dict(accounts)
    if copy[frm] < amount:
        # SQL: ROLLBACK; — undo everything, act as if nothing happened
        return {"accounts": accounts, "ok": False}
    copy[frm] -= amount
    copy[to] += amount
    return {"accounts": copy, "ok": True}

def format_accounts(accounts):
    names = sorted(accounts.keys())
    parts = []
    for n in names:
        parts.append(n + ":" + str(accounts[n]))
    return " ".join(parts)

accounts = {"A": 100, "B": 50}
print("Before:", format_accounts(accounts))

print("SQL: BEGIN TRANSACTION ... COMMIT")
result = transfer(accounts, "A", "B", 30)
accounts = result["accounts"]
print("Transfer 30 from A to B:", "success" if result["ok"] else "failed (insufficient funds) - rolled back")
print("After transfer 1:", format_accounts(accounts))

print("SQL: BEGIN TRANSACTION ... ROLLBACK")
result = transfer(accounts, "B", "A", 200)
accounts = result["accounts"]
print("Transfer 200 from B to A:", "success" if result["ok"] else "failed (insufficient funds) - rolled back")
print("After transfer 2 attempt:", format_accounts(accounts))`,
    },
    output: `Before: A:100 B:50
SQL: BEGIN TRANSACTION ... COMMIT
Transfer 30 from A to B: success
After transfer 1: A:70 B:80
SQL: BEGIN TRANSACTION ... ROLLBACK
Transfer 200 from B to A: failed (insufficient funds) - rolled back
After transfer 2 attempt: A:70 B:80`,
  },
  {
    id: "primary-keys-uniqueness",
    pillar: "Databases",
    name: "Primary Keys & Uniqueness",
    easy: "A primary key is like a national ID number: every person has exactly one, and no two people are allowed to share the same one. It's how a table guarantees each row can be told apart from every other row — the database itself refuses to let a duplicate in.",
    how: [
      "When you create a table, you mark one column (often 'id') as the PRIMARY KEY.",
      "Every time you INSERT a new row, the database checks: does any existing row already have this same key value?",
      "If it's already taken, the insert is rejected (a 'UNIQUE constraint failed' error) — the table never ends up with two rows sharing a primary key.",
    ],
    when: "Every table should have one — it's how other tables refer back to a row reliably (see the Joining Tables lesson), and how the database tells rows apart even if every other column is identical.",
    big: "O(n) to check uniqueness with a plain scan · O(1) average in practice, because primary keys are automatically indexed, so the check is really a fast lookup, not a full scan.",
    mistakes: [
      "Trying to use a column that isn't actually unique (like 'name' — two people can both be named Ana) as a primary key.",
      "Assuming the database will quietly ignore a duplicate insert — it errors out instead, and your code needs to handle that.",
    ],
    code: {
      JavaScript: `function insertUser(table, id, name) {
  // SQL: INSERT INTO users (id, name) VALUES (id, name);
  // id is PRIMARY KEY, so the database rejects duplicates automatically.
  for (const row of table) {
    if (row.id === id) {
      return { ok: false, reason: "UNIQUE constraint failed: users.id" };
    }
  }
  table.push({ id: id, name: name });
  return { ok: true, reason: "inserted" };
}

function formatTable(table) {
  const parts = [];
  for (const r of table) parts.push(r.id + ":" + r.name);
  return parts.join(" ");
}

console.log("SQL: CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);");
const table = [];

const attempts = [
  [1, "Ana"],
  [2, "Bilal"],
  [3, "Cara"],
  [2, "Duplicate"],
];

for (const attempt of attempts) {
  const id = attempt[0];
  const name = attempt[1];
  const result = insertUser(table, id, name);
  console.log("INSERT id=" + id + " name=" + name + ":", result.ok ? "ok" : "rejected (" + result.reason + ")");
}

console.log("Final table:", formatTable(table));`,
      Python: `def insert_user(table, id_, name):
    # SQL: INSERT INTO users (id, name) VALUES (id, name);
    # id is PRIMARY KEY, so the database rejects duplicates automatically.
    for row in table:
        if row["id"] == id_:
            return {"ok": False, "reason": "UNIQUE constraint failed: users.id"}
    table.append({"id": id_, "name": name})
    return {"ok": True, "reason": "inserted"}

def format_table(table):
    parts = []
    for r in table:
        parts.append(str(r["id"]) + ":" + r["name"])
    return " ".join(parts)

print("SQL: CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);")
table = []

attempts = [
    (1, "Ana"),
    (2, "Bilal"),
    (3, "Cara"),
    (2, "Duplicate"),
]

for id_, name in attempts:
    result = insert_user(table, id_, name)
    print("INSERT id=" + str(id_) + " name=" + name + ":", "ok" if result["ok"] else "rejected (" + result["reason"] + ")")

print("Final table:", format_table(table))`,
    },
    output: `SQL: CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
INSERT id=1 name=Ana: ok
INSERT id=2 name=Bilal: ok
INSERT id=3 name=Cara: ok
INSERT id=2 name=Duplicate: rejected (UNIQUE constraint failed: users.id)
Final table: 1:Ana 2:Bilal 3:Cara`,
  },
  {
    id: "left-outer-join",
    pillar: "Databases",
    name: "LEFT JOIN (keep the unmatched rows too)",
    easy: "A plain JOIN (see the Joining Tables lesson) only keeps rows that find a match on both sides. LEFT JOIN is like a class attendance sheet: you list every student (the 'left' table) even if they never submitted an assignment (the 'right' table) — students with no submission still show up, just with blanks (NULL) where the assignment info would be.",
    how: [
      "Start from every row in the 'left' table — like all users. None of them get dropped, no matter what.",
      "For each left row, look for matching row(s) in the right table on the shared key, same as a normal join.",
      "If a match exists, combine both rows like usual. If no match exists, keep the left row anyway and fill the right side's columns with NULL — SQL's way of saying 'no value here'.",
    ],
    when: "Whenever you need 'everyone from the main list, plus whatever extra info exists' — every user even if they never placed an order, every product even if nobody's reviewed it yet.",
    big: "O(n + m) with a hash index on the join key, same as a normal join · O(n × m) with a naive nested-loop match.",
    mistakes: [
      "Mixing up the direction — LEFT JOIN keeps every row from the left (first-named) table; RIGHT JOIN is the mirror image and keeps every row from the right table instead.",
      "Forgetting a row with no match comes back with NULL in the joined columns — code that does math on it (like amount + tax) can crash unless you check for NULL first.",
    ],
    code: {
      JavaScript: `function leftJoin(users, orders) {
  // SQL: SELECT users.name, orders.item, orders.amount
  //      FROM users LEFT JOIN orders ON users.id = orders.user_id
  const rows = [];
  for (const u of users) {
    const matches = orders.filter((o) => o.user_id === u.id);
    if (matches.length === 0) {
      // No matching order — keep the user anyway, with NULLs for the order columns.
      rows.push({ name: u.name, item: null, amount: null });
    } else {
      for (const o of matches) {
        rows.push({ name: u.name, item: o.item, amount: o.amount });
      }
    }
  }
  return rows;
}

function formatRow(row) {
  const item = row.item === null ? "NULL" : row.item;
  const amount = row.amount === null ? "NULL" : String(row.amount);
  return row.name + " " + item + " " + amount;
}

const users = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Bilal" },
  { id: 3, name: "Cara" },
  { id: 4, name: "Dan" },
];

const orders = [
  { user_id: 1, item: "Book", amount: 15 },
  { user_id: 2, item: "Pen", amount: 2 },
  { user_id: 1, item: "Lamp", amount: 25 },
];

console.log("SQL: SELECT users.name, orders.item, orders.amount FROM users LEFT JOIN orders ON users.id = orders.user_id");
for (const row of leftJoin(users, orders)) console.log(formatRow(row));`,
      Python: `def left_join(users, orders):
    # SQL: SELECT users.name, orders.item, orders.amount
    #      FROM users LEFT JOIN orders ON users.id = orders.user_id
    rows = []
    for u in users:
        matches = [o for o in orders if o["user_id"] == u["id"]]
        if len(matches) == 0:
            # No matching order — keep the user anyway, with NULLs for the order columns.
            rows.append({"name": u["name"], "item": None, "amount": None})
        else:
            for o in matches:
                rows.append({"name": u["name"], "item": o["item"], "amount": o["amount"]})
    return rows

def format_row(row):
    item = "NULL" if row["item"] is None else row["item"]
    amount = "NULL" if row["amount"] is None else str(row["amount"])
    return row["name"] + " " + item + " " + amount

users = [
    {"id": 1, "name": "Ana"},
    {"id": 2, "name": "Bilal"},
    {"id": 3, "name": "Cara"},
    {"id": 4, "name": "Dan"},
]

orders = [
    {"user_id": 1, "item": "Book", "amount": 15},
    {"user_id": 2, "item": "Pen", "amount": 2},
    {"user_id": 1, "item": "Lamp", "amount": 25},
]

print("SQL: SELECT users.name, orders.item, orders.amount FROM users LEFT JOIN orders ON users.id = orders.user_id")
for row in left_join(users, orders):
    print(format_row(row))`,
    },
    output: `SQL: SELECT users.name, orders.item, orders.amount FROM users LEFT JOIN orders ON users.id = orders.user_id
Ana Book 15
Ana Lamp 25
Bilal Pen 2
Cara NULL NULL
Dan NULL NULL`,
  },
  {
    id: "having-filter-groups",
    pillar: "Databases",
    name: "HAVING (filter groups, after GROUP BY)",
    easy: "WHERE filters rows before they're bundled up — like sorting mail before you tie it into bundles. HAVING filters the bundles themselves, after grouping — like weighing each finished bundle and only keeping the heavy ones. You'd use it for 'customers whose total spend is over $50', because that total doesn't exist until after GROUP BY has already run.",
    how: [
      "First GROUP BY as usual — bucket rows by some column (like customer) and compute aggregates like COUNT(*) and SUM(amount) per bucket.",
      "Then apply the HAVING condition to each bucket's aggregate result, not to the original rows — like 'keep this bucket only if its total is > 50'.",
      "Drop any bucket that fails the condition; what's left is your final result — one row per surviving group.",
    ],
    when: "Any time your filter depends on an aggregate instead of a raw column — 'customers who ordered more than 3 times', 'days with total sales over $1000'. A plain WHERE can't do this because SUM()/COUNT() don't exist yet when WHERE runs.",
    big: "O(n) to build the groups (same scan as GROUP BY) plus O(k) to test k groups against the HAVING condition.",
    mistakes: [
      "Writing WHERE SUM(amount) > 50 — real SQL rejects this, since WHERE runs before aggregation happens; HAVING is the clause built for filtering on aggregates.",
      "Forgetting HAVING filters whole groups, not individual rows — you can still use WHERE beforehand to filter raw rows, then GROUP BY, then HAVING to filter the resulting groups.",
    ],
    code: {
      JavaScript: `function groupByCustomer(orders) {
  // SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total
  //      FROM orders GROUP BY customer
  const groups = {};
  for (const o of orders) {
    if (!(o.customer in groups)) groups[o.customer] = { count: 0, total: 0 };
    groups[o.customer].count += 1;
    groups[o.customer].total += o.amount;
  }
  return groups;
}

function havingTotalOver(groups, minTotal) {
  // SQL: ... GROUP BY customer HAVING SUM(amount) > 50
  const kept = {};
  for (const name of Object.keys(groups)) {
    if (groups[name].total > minTotal) kept[name] = groups[name];
  }
  return kept;
}

function printGroups(groups) {
  // Sort the bucket names — group/dict iteration order isn't guaranteed to
  // line up between languages, so we fix it ourselves.
  const names = Object.keys(groups).sort();
  for (const name of names) {
    const g = groups[name];
    console.log(name + " orders=" + g.count + " total=" + g.total);
  }
}

const orders = [
  { customer: "Ana", amount: 50 },
  { customer: "Bilal", amount: 30 },
  { customer: "Ana", amount: 20 },
  { customer: "Cara", amount: 70 },
  { customer: "Bilal", amount: 10 },
];

const groups = groupByCustomer(orders);
console.log("All groups (before HAVING):");
printGroups(groups);

console.log("SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total FROM orders GROUP BY customer HAVING SUM(amount) > 50");
console.log("Groups after HAVING SUM(amount) > 50:");
printGroups(havingTotalOver(groups, 50));`,
      Python: `def group_by_customer(orders):
    # SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total
    #      FROM orders GROUP BY customer
    groups = {}
    for o in orders:
        if o["customer"] not in groups:
            groups[o["customer"]] = {"count": 0, "total": 0}
        groups[o["customer"]]["count"] += 1
        groups[o["customer"]]["total"] += o["amount"]
    return groups

def having_total_over(groups, min_total):
    # SQL: ... GROUP BY customer HAVING SUM(amount) > 50
    kept = {}
    for name in groups:
        if groups[name]["total"] > min_total:
            kept[name] = groups[name]
    return kept

def print_groups(groups):
    # Sort the bucket names — group/dict iteration order isn't guaranteed to
    # line up between languages, so we fix it ourselves.
    names = sorted(groups.keys())
    for name in names:
        g = groups[name]
        print(name + " orders=" + str(g["count"]) + " total=" + str(g["total"]))

orders = [
    {"customer": "Ana", "amount": 50},
    {"customer": "Bilal", "amount": 30},
    {"customer": "Ana", "amount": 20},
    {"customer": "Cara", "amount": 70},
    {"customer": "Bilal", "amount": 10},
]

groups = group_by_customer(orders)
print("All groups (before HAVING):")
print_groups(groups)

print("SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total FROM orders GROUP BY customer HAVING SUM(amount) > 50")
print("Groups after HAVING SUM(amount) > 50:")
print_groups(having_total_over(groups, 50))`,
    },
    output: `All groups (before HAVING):
Ana orders=2 total=70
Bilal orders=2 total=40
Cara orders=1 total=70
SQL: SELECT customer, COUNT(*) AS orders, SUM(amount) AS total FROM orders GROUP BY customer HAVING SUM(amount) > 50
Groups after HAVING SUM(amount) > 50:
Ana orders=2 total=70
Cara orders=1 total=70`,
  },
  {
    id: "subqueries",
    pillar: "Databases",
    name: "Subqueries (a query inside a query)",
    easy: "A subquery is like answering a question by first working out a smaller question. 'Which orders were above average?' needs the average first — so you compute that inner answer, then use it to answer the outer question. It's literally a query nested inside another query's WHERE clause.",
    how: [
      "Run the inner query first, conceptually — like SELECT AVG(amount) FROM orders, which produces a single number.",
      "Plug that number into the outer query's condition — like WHERE amount > (that number).",
      "The outer query then runs like any normal filter, using the value the subquery produced.",
    ],
    when: "Whenever a condition depends on something you have to compute from the data first — 'above average', 'the most expensive item', 'customers who placed at least one order over $100'.",
    big: "O(n) to compute the subquery's value once, plus O(n) to scan for the outer filter — O(n) total, as long as you compute the inner value once and reuse it.",
    mistakes: [
      "Recomputing the subquery once per outer row instead of computing it a single time and reusing the result — that silently turns an O(n) job into O(n²).",
      "Using plain floating-point division for an average and expecting it to print identically everywhere — tiny floating-point differences can creep in across languages, so here we use integer (floor) division to keep the result exactly reproducible.",
    ],
    code: {
      JavaScript: `function averageAmount(orders) {
  // SQL: SELECT AVG(amount) FROM orders   <- this is the "inner" subquery
  let total = 0;
  for (const o of orders) total += o.amount;
  // Integer (floor) division keeps this exactly reproducible across languages.
  return Math.floor(total / orders.length);
}

function aboveAverage(orders) {
  // SQL: SELECT item, amount FROM orders
  //      WHERE amount > (SELECT AVG(amount) FROM orders)
  const avg = averageAmount(orders);
  return orders.filter((o) => o.amount > avg);
}

const orders = [
  { item: "Book", amount: 15 },
  { item: "Pen", amount: 2 },
  { item: "Lamp", amount: 25 },
  { item: "Chair", amount: 40 },
];

console.log("SQL: SELECT AVG(amount) FROM orders");
console.log("Average amount: " + averageAmount(orders));

console.log("SQL: SELECT item, amount FROM orders WHERE amount > (SELECT AVG(amount) FROM orders)");
for (const o of aboveAverage(orders)) console.log(o.item + " " + o.amount);`,
      Python: `def average_amount(orders):
    # SQL: SELECT AVG(amount) FROM orders   <- this is the "inner" subquery
    total = 0
    for o in orders:
        total += o["amount"]
    # Integer (floor) division keeps this exactly reproducible across languages.
    return total // len(orders)

def above_average(orders):
    # SQL: SELECT item, amount FROM orders
    #      WHERE amount > (SELECT AVG(amount) FROM orders)
    avg = average_amount(orders)
    return [o for o in orders if o["amount"] > avg]

orders = [
    {"item": "Book", "amount": 15},
    {"item": "Pen", "amount": 2},
    {"item": "Lamp", "amount": 25},
    {"item": "Chair", "amount": 40},
]

print("SQL: SELECT AVG(amount) FROM orders")
print("Average amount: " + str(average_amount(orders)))

print("SQL: SELECT item, amount FROM orders WHERE amount > (SELECT AVG(amount) FROM orders)")
for o in above_average(orders):
    print(o["item"] + " " + str(o["amount"]))`,
    },
    output: `SQL: SELECT AVG(amount) FROM orders
Average amount: 20
SQL: SELECT item, amount FROM orders WHERE amount > (SELECT AVG(amount) FROM orders)
Lamp 25
Chair 40`,
  },
  {
    id: "update-and-delete",
    pillar: "Databases",
    name: "UPDATE & DELETE (changing and removing rows)",
    easy: "UPDATE is like using an eraser and pencil on one line of a paper ledger — you find the entry and change a field without retyping the whole page. DELETE is tearing that line out of the ledger entirely. Both rely on WHERE to say exactly which row(s) to touch — leave off the WHERE and you'd erase or tear out every single row in the table.",
    how: [
      "UPDATE table SET column = newValue WHERE condition — find every row matching the condition, change just the listed column(s) on those rows, and leave every other row untouched.",
      "DELETE FROM table WHERE condition — find every row matching the condition and remove it from the table entirely; non-matching rows stay exactly as they were.",
      "Both are permanent the instant they run (or the instant you COMMIT, if you're inside a transaction — see that lesson) — there's no automatic undo button.",
    ],
    when: "UPDATE whenever a fact changes, like a user's email or a product's price. DELETE whenever a row should stop existing, like a cancelled order or a discontinued product.",
    big: "O(n) to scan for matching rows (O(1) average with an index on the WHERE column, see the Indexes lesson) · O(1) extra space either way, though this in-memory version builds a fresh array.",
    mistakes: [
      "Running UPDATE or DELETE with no WHERE clause at all — that touches every single row in the table, not just the one you meant.",
      "Assuming DELETE can be undone — outside a transaction that hasn't committed yet, it can't. Run the equivalent SELECT first to double-check exactly which rows WHERE will match.",
    ],
    code: {
      JavaScript: `function updatePrice(products, id, newPrice) {
  // SQL: UPDATE products SET price = 10 WHERE id = 1
  return products.map((p) => (p.id === id ? { id: p.id, name: p.name, price: newPrice } : p));
}

function deleteProduct(products, id) {
  // SQL: DELETE FROM products WHERE id = 2
  return products.filter((p) => p.id !== id);
}

function formatProduct(p) {
  return p.id + " " + p.name + " " + p.price;
}

let products = [
  { id: 1, name: "Mug", price: 8 },
  { id: 2, name: "Pen", price: 2 },
  { id: 3, name: "Lamp", price: 25 },
  { id: 4, name: "Chair", price: 40 },
];

console.log("Before:");
for (const p of products) console.log(formatProduct(p));

console.log("SQL: UPDATE products SET price = 10 WHERE id = 1");
products = updatePrice(products, 1, 10);
console.log("After UPDATE:");
for (const p of products) console.log(formatProduct(p));

console.log("SQL: DELETE FROM products WHERE id = 2");
products = deleteProduct(products, 2);
console.log("After DELETE:");
for (const p of products) console.log(formatProduct(p));`,
      Python: `def update_price(products, id_, new_price):
    # SQL: UPDATE products SET price = 10 WHERE id = 1
    return [
        {"id": p["id"], "name": p["name"], "price": new_price} if p["id"] == id_ else p
        for p in products
    ]

def delete_product(products, id_):
    # SQL: DELETE FROM products WHERE id = 2
    return [p for p in products if p["id"] != id_]

def format_product(p):
    return str(p["id"]) + " " + p["name"] + " " + str(p["price"])

products = [
    {"id": 1, "name": "Mug", "price": 8},
    {"id": 2, "name": "Pen", "price": 2},
    {"id": 3, "name": "Lamp", "price": 25},
    {"id": 4, "name": "Chair", "price": 40},
]

print("Before:")
for p in products:
    print(format_product(p))

print("SQL: UPDATE products SET price = 10 WHERE id = 1")
products = update_price(products, 1, 10)
print("After UPDATE:")
for p in products:
    print(format_product(p))

print("SQL: DELETE FROM products WHERE id = 2")
products = delete_product(products, 2)
print("After DELETE:")
for p in products:
    print(format_product(p))`,
    },
    output: `Before:
1 Mug 8
2 Pen 2
3 Lamp 25
4 Chair 40
SQL: UPDATE products SET price = 10 WHERE id = 1
After UPDATE:
1 Mug 10
2 Pen 2
3 Lamp 25
4 Chair 40
SQL: DELETE FROM products WHERE id = 2
After DELETE:
1 Mug 10
3 Lamp 25
4 Chair 40`,
  },
  {
    id: "many-to-many-join-table",
    pillar: "Databases",
    name: "Many-to-Many (a join table in the middle)",
    easy: "A student can take many courses, and a course can have many students — neither side can hold just one foreign key the way an order holds one user_id. The fix is a third table sitting in the middle, like a class roster clipboard, that lists nothing but pairs: (student_id, course_id). Each row on that roster links exactly one student to exactly one course they're taking.",
    how: [
      "Keep three tables: students, courses, and a join table (often called 'enrollments') holding just two foreign keys — student_id and course_id — one row per pairing.",
      "To answer 'which courses does Ana take?', join students to enrollments (matching student_id), then join that to courses (matching course_id).",
      "Adding or removing a pairing means adding or removing exactly one row in the join table — the students and courses tables themselves never have to change.",
    ],
    when: "Any real many-to-many relationship: students & courses, actors & movies, tags & posts, users & roles — anywhere 'each side can have several of the other side' is true.",
    big: "O(n × m) with a naive nested-loop match through the join table twice · O(n + m) with hash indexes on both foreign keys, the same idea as a regular two-table join.",
    mistakes: [
      "Cramming multiple course IDs into one column on the students table (like a comma-separated list) instead of using a proper join table — this is a classic beginner anti-pattern that breaks ordinary filtering and joining.",
      "Forgetting a join-table row only means something as a pair — a row with just a student_id or just a course_id doesn't represent a real enrollment.",
    ],
    code: {
      JavaScript: `function joinStudentsCourses(students, enrollments, courses) {
  // SQL: SELECT students.name, courses.title
  //      FROM students
  //      JOIN enrollments ON students.id = enrollments.student_id
  //      JOIN courses ON enrollments.course_id = courses.id
  const courseById = {};
  for (const c of courses) courseById[c.id] = c.title;
  const studentById = {};
  for (const s of students) studentById[s.id] = s.name;

  const rows = [];
  for (const e of enrollments) {
    rows.push({ name: studentById[e.student_id], title: courseById[e.course_id] });
  }
  return rows;
}

function coursesByStudent(rows) {
  const grouped = {};
  for (const r of rows) {
    if (!(r.name in grouped)) grouped[r.name] = [];
    grouped[r.name].push(r.title);
  }
  return grouped;
}

const students = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Bilal" },
  { id: 3, name: "Cara" },
];

const courses = [
  { id: 1, title: "Math" },
  { id: 2, title: "History" },
  { id: 3, title: "Art" },
];

const enrollments = [
  { student_id: 1, course_id: 1 },
  { student_id: 1, course_id: 2 },
  { student_id: 2, course_id: 2 },
  { student_id: 3, course_id: 3 },
  { student_id: 3, course_id: 1 },
];

console.log("SQL: SELECT students.name, courses.title FROM students JOIN enrollments ON students.id = enrollments.student_id JOIN courses ON enrollments.course_id = courses.id");
const rows = joinStudentsCourses(students, enrollments, courses);
for (const r of rows) console.log(r.name + " " + r.title);

console.log("Courses per student:");
const grouped = coursesByStudent(rows);
// Sort names, and sort each student's course list — dict/group order and
// insertion order aren't something we want the output to depend on.
const names = Object.keys(grouped).sort();
for (const name of names) {
  const titles = [...grouped[name]].sort();
  console.log(name + ": " + titles.join(", "));
}`,
      Python: `def join_students_courses(students, enrollments, courses):
    # SQL: SELECT students.name, courses.title
    #      FROM students
    #      JOIN enrollments ON students.id = enrollments.student_id
    #      JOIN courses ON enrollments.course_id = courses.id
    course_by_id = {}
    for c in courses:
        course_by_id[c["id"]] = c["title"]
    student_by_id = {}
    for s in students:
        student_by_id[s["id"]] = s["name"]

    rows = []
    for e in enrollments:
        rows.append({"name": student_by_id[e["student_id"]], "title": course_by_id[e["course_id"]]})
    return rows

def courses_by_student(rows):
    grouped = {}
    for r in rows:
        if r["name"] not in grouped:
            grouped[r["name"]] = []
        grouped[r["name"]].append(r["title"])
    return grouped

students = [
    {"id": 1, "name": "Ana"},
    {"id": 2, "name": "Bilal"},
    {"id": 3, "name": "Cara"},
]

courses = [
    {"id": 1, "title": "Math"},
    {"id": 2, "title": "History"},
    {"id": 3, "title": "Art"},
]

enrollments = [
    {"student_id": 1, "course_id": 1},
    {"student_id": 1, "course_id": 2},
    {"student_id": 2, "course_id": 2},
    {"student_id": 3, "course_id": 3},
    {"student_id": 3, "course_id": 1},
]

print("SQL: SELECT students.name, courses.title FROM students JOIN enrollments ON students.id = enrollments.student_id JOIN courses ON enrollments.course_id = courses.id")
rows = join_students_courses(students, enrollments, courses)
for r in rows:
    print(r["name"] + " " + r["title"])

print("Courses per student:")
grouped = courses_by_student(rows)
# Sort names, and sort each student's course list — dict/group order and
# insertion order aren't something we want the output to depend on.
names = sorted(grouped.keys())
for name in names:
    titles = sorted(grouped[name])
    print(name + ": " + ", ".join(titles))`,
    },
    output: `SQL: SELECT students.name, courses.title FROM students JOIN enrollments ON students.id = enrollments.student_id JOIN courses ON enrollments.course_id = courses.id
Ana Math
Ana History
Bilal History
Cara Art
Cara Math
Courses per student:
Ana: History, Math
Bilal: History
Cara: Art, Math`,
  },
];

export default lessons;
