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
];

export default lessons;
