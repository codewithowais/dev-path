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
    easy: "A database table is like a spreadsheet. Each row is one record. Each column is one field. WHERE works like a filter button. It hides every row that does not match your condition. It shows you only the rows that match.",
    how: [
      "Look at each row, one at a time.",
      "Check the row against your condition, such as age > 30. Keep the row if it passes. Skip it if it does not.",
      "Collect only the rows that passed. This is your filtered result set.",
    ],
    when: "Use WHERE any time you want part of your data, not all of it. For example: 'find all users over 30' or 'find orders over $100'. It is the most-used part of SQL.",
    big: "O(n) time — the database checks every row once. This is much faster with an index (see the Indexes lesson). O(1) extra space if you filter in place.",
    mistakes: [
      "WHERE compares one row at a time. It cannot see a total computed across many rows. Use HAVING for that, after GROUP BY.",
      "Do not assume = ignores upper and lower case in text. 'Ana' and 'ana' often do not match.",
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
    easy: "ORDER BY is like handing a librarian a stack of books and asking for them back sorted by year. The table's rows do not change. You are only choosing the order you read the results in.",
    how: [
      "Pick the column or columns to sort by, such as age.",
      "Decide the direction. ASC means ascending: smallest first. DESC means descending: biggest first.",
      "The database reorders the result rows by comparing that column. It does not change the stored table.",
    ],
    when: "Use ORDER BY whenever the order of results matters. For example: newest posts first, cheapest products first, or names in alphabetical order.",
    big: "O(n log n) time for a general sort. A database can often use an index to make ORDER BY cheaper on that column.",
    mistakes: [
      "Do not assume rows come back in a 'natural' order without ORDER BY. SQL makes no such promise unless you ask for one.",
      "If you forget DESC, you get smallest-first when you wanted biggest-first.",
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
    easy: "GROUP BY is like sorting a pile of receipts into one envelope per customer, then writing a total on each envelope. Instead of one row per receipt, you get one row per customer, with a count and a sum.",
    how: [
      "Decide what to group by, such as 'customer'. Every row with the same customer goes in the same bucket.",
      "For each bucket, run an aggregate function. COUNT(*) counts how many rows landed there. SUM(amount) adds up a column.",
      "Output one summary row per bucket, for example 'Ana: 2 orders, $70 total'.",
    ],
    when: "Use GROUP BY any time you want a total, average, or count per category. For example: total sales per customer, orders per day, or average score per student.",
    big: "O(n) time — the database scans every row once and adds it to a bucket. O(k) space for k distinct groups.",
    mistakes: [
      "Do not select a plain column that is not in GROUP BY and not wrapped in an aggregate function. SQL rejects this. Some lenient databases instead pick an arbitrary value without warning you.",
      "Do not assume groups come back in a predictable order. Sort them yourself, as we do below, if the order matters to you.",
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
    easy: "Real data usually lives in separate tables, to avoid repeating itself. For example, one table for users and one for orders. A JOIN is like matching two stacks of index cards by a shared ID number. This lets you read 'Ana bought a Book' instead of a lonely user_id next to an item.",
    how: [
      "Pick the shared column that connects the two tables, such as users.id and orders.user_id.",
      "For each row in one table, find the matching row or rows in the other table, where the shared column matches.",
      "Combine each matched pair into one wider row, with columns from both tables.",
    ],
    when: "Use JOIN whenever the data you need is spread across more than one table. For example: showing a customer's name next to their order, or a product's name next to a sale.",
    big: "O(n × m) time with a simple nested-loop match. O(n + m) if you build an index (a hash map) on the join key first. This is what real databases do.",
    mistakes: [
      "If you join on the wrong column, you can silently get garbage matches or far too many rows.",
      "A plain JOIN drops any row with no match on either side. A LEFT JOIN keeps the unmatched rows too.",
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
    easy: "A database index works just like the index at the back of a textbook. Without it, finding 'photosynthesis' means checking every page one by one. This is a slow scan. With an index, you jump straight to the page number, because the index already knows where everything is.",
    how: [
      "Without an index, WHERE id = 105 checks every row until it finds a match, or reaches the end. This is a linear scan.",
      "CREATE INDEX builds a fast lookup structure ahead of time, like a hash map that points straight from a key to a row. It is built on the column you search most.",
      "With the index, WHERE id = 105 jumps straight to the matching row in about one step, instead of checking every row.",
    ],
    when: "Add an index to any column you filter or join on often, especially in big tables. Primary keys get an index automatically. You add more yourself for columns you search a lot.",
    big: "Without an index: O(n) per lookup. With an index (a hash map): O(1) average per lookup. The tradeoff: indexes use extra memory and slow down writes a little, because the index itself must stay updated.",
    mistakes: [
      "Do not add an index to every column 'just in case'. Each index makes INSERT and UPDATE slower and uses more storage.",
      "Do not expect an index to help when you are not filtering or joining on that column. Also, a plain index cannot match a column wrapped in a function, such as LOWER(name).",
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
    easy: "A transaction is like an ATM transfer between two bank accounts. The money must leave one account and arrive in the other, or neither must happen. You would never accept '$30 vanished from account A but never showed up in B'. A transaction guarantees that cannot happen.",
    how: [
      "BEGIN TRANSACTION marks the start. Every change after this point is provisional. It is not yet permanent.",
      "Make your changes, such as subtracting from one account and adding to another. If everything succeeds, COMMIT makes the changes permanent.",
      "If anything goes wrong partway through, such as insufficient funds, ROLLBACK undoes every change made since BEGIN. The database ends up exactly as if nothing had happened.",
    ],
    when: "Use a transaction any time multiple changes must succeed or fail together. For example: moving money between accounts, or placing an order that both charges a customer and reduces stock.",
    big: "There is no extra Big-O cost from the logic itself. The guarantee is about correctness (all-or-nothing), not speed. Real databases pay a small bookkeeping cost so they can roll back if needed.",
    mistakes: [
      "Do not commit changes one at a time instead of wrapping them in one transaction. That is exactly how you get a 'money left but never arrived' bug.",
      "If you forget to roll back on error, you can leave the data half-changed and inconsistent.",
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
    easy: "A primary key is like a national ID number. Every person has exactly one, and no two people can share the same one. It is how a table guarantees that each row can be told apart from every other row. The database itself refuses to let a duplicate in.",
    how: [
      "When you create a table, you mark one column, often called 'id', as the PRIMARY KEY.",
      "Every time you INSERT a new row, the database checks whether any existing row already has this same key value.",
      "If the value is already taken, the insert is rejected, with a 'UNIQUE constraint failed' error. The table never ends up with two rows sharing a primary key.",
    ],
    when: "Every table should have a primary key. It lets other tables refer back to a row reliably (see the Joining Tables lesson). It also lets the database tell rows apart, even if every other column is identical.",
    big: "O(n) to check uniqueness with a plain scan. In practice it is O(1) average, because primary keys are automatically indexed. The check is really a fast lookup, not a full scan.",
    mistakes: [
      "Do not use a column that is not truly unique, such as 'name', as a primary key. Two people can both be named Ana.",
      "Do not assume the database will quietly ignore a duplicate insert. It errors out instead, and your code needs to handle that.",
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
    easy: "A plain JOIN (see the Joining Tables lesson) keeps only rows that find a match on both sides. LEFT JOIN is like a class attendance sheet. You list every student (the 'left' table), even one who never submitted an assignment (the 'right' table). A student with no submission still shows up, with blanks (NULL) where the assignment details would be.",
    how: [
      "Start from every row in the 'left' table, such as all users. None of them get dropped, no matter what.",
      "For each left row, look for a matching row or rows in the right table, using the shared key. This works the same as a normal join.",
      "If a match exists, combine both rows as usual. If no match exists, keep the left row anyway, and fill the right side's columns with NULL. NULL is SQL's way of saying 'no value here'.",
    ],
    when: "Use LEFT JOIN whenever you need 'everyone from the main list, plus whatever extra information exists'. For example: every user, even one who never placed an order; or every product, even one nobody has reviewed yet.",
    big: "O(n + m) with a hash index on the join key, the same as a normal join. O(n × m) with a simple nested-loop match.",
    mistakes: [
      "Do not mix up the direction. LEFT JOIN keeps every row from the left (first-named) table. RIGHT JOIN is the mirror image: it keeps every row from the right table instead.",
      "A row with no match comes back with NULL in the joined columns. Code that does math on it, such as amount + tax, can crash unless you check for NULL first.",
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
    easy: "WHERE filters rows before they are bundled up, like sorting mail before you tie it into bundles. HAVING filters the bundles themselves, after grouping. This is like weighing each finished bundle and keeping only the heavy ones. Use it for 'customers whose total spend is over $50', because that total does not exist until after GROUP BY has run.",
    how: [
      "First, GROUP BY as usual. Bucket rows by some column, such as customer, and compute aggregates like COUNT(*) and SUM(amount) for each bucket.",
      "Then apply the HAVING condition to each bucket's aggregate result, not to the original rows. For example: 'keep this bucket only if its total is over 50'.",
      "Drop any bucket that fails the condition. What is left is your final result: one row per surviving group.",
    ],
    when: "Use HAVING any time your filter depends on an aggregate, not a raw column. For example: 'customers who ordered more than 3 times', or 'days with total sales over $1000'. A plain WHERE cannot do this, because SUM() and COUNT() do not exist yet when WHERE runs.",
    big: "O(n) to build the groups — the same scan as GROUP BY — plus O(k) to test k groups against the HAVING condition.",
    mistakes: [
      "Do not write WHERE SUM(amount) > 50. Real SQL rejects this, because WHERE runs before aggregation happens. HAVING is the clause built for filtering on aggregates.",
      "HAVING filters whole groups, not individual rows. You can still use WHERE first to filter raw rows, then GROUP BY, then HAVING to filter the resulting groups.",
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
    easy: "A subquery answers a question by first working out a smaller question. 'Which orders were above average?' needs the average first. So you compute that inner answer, then use it to answer the outer question. It is a query nested inside another query's WHERE clause.",
    how: [
      "First, think of the inner query as running on its own, such as SELECT AVG(amount) FROM orders. It produces a single number.",
      "Plug that number into the outer query's condition, such as WHERE amount > (that number).",
      "The outer query then runs like any normal filter, using the value the subquery produced.",
    ],
    when: "Use a subquery whenever a condition depends on something you must compute from the data first. For example: 'above average', 'the most expensive item', or 'customers who placed at least one order over $100'.",
    big: "O(n) to compute the subquery's value once, plus O(n) to scan for the outer filter. This is O(n) total, as long as you compute the inner value once and reuse it.",
    mistakes: [
      "Do not recompute the subquery once for every outer row. Compute it once and reuse the result. Recomputing it silently turns an O(n) job into O(n²).",
      "Do not use plain floating-point division for an average and expect it to print identically everywhere. Tiny floating-point differences can appear across languages. Here we use integer (floor) division to keep the result exactly reproducible.",
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
    easy: "UPDATE is like using an eraser and pencil on one line of a paper ledger. You find the entry and change a field, without retyping the whole page. DELETE is tearing that line out of the ledger entirely. Both rely on WHERE to say exactly which row or rows to touch. Leave off the WHERE, and you would erase or tear out every row in the table.",
    how: [
      "UPDATE table SET column = newValue WHERE condition finds every row that matches the condition. It changes only the listed column or columns on those rows, and leaves every other row untouched.",
      "DELETE FROM table WHERE condition finds every row that matches the condition and removes it from the table entirely. Rows that do not match stay exactly as they were.",
      "Both are permanent the instant they run, or the instant you COMMIT if you are inside a transaction (see that lesson). There is no automatic undo button.",
    ],
    when: "Use UPDATE whenever a fact changes, such as a user's email or a product's price. Use DELETE whenever a row should stop existing, such as a cancelled order or a discontinued product.",
    big: "O(n) to scan for matching rows. This is O(1) average with an index on the WHERE column (see the Indexes lesson). O(1) extra space either way, though this in-memory version builds a fresh array.",
    mistakes: [
      "Do not run UPDATE or DELETE with no WHERE clause. That touches every row in the table, not just the one you meant.",
      "Do not assume DELETE can be undone. Outside a transaction that has not committed yet, it cannot be undone. Run the equivalent SELECT first, to check exactly which rows WHERE will match.",
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
    easy: "A student can take many courses, and a course can have many students. Neither side can hold just one foreign key, the way an order holds one user_id. The fix is a third table in the middle, like a class roster clipboard. It lists nothing but pairs: (student_id, course_id). Each row on that roster links exactly one student to exactly one course they are taking.",
    how: [
      "Keep three tables: students, courses, and a join table, often called 'enrollments'. The join table holds just two foreign keys, student_id and course_id, with one row per pairing.",
      "To answer 'which courses does Ana take?', join students to enrollments by matching student_id, then join that result to courses by matching course_id.",
      "Adding or removing a pairing means adding or removing exactly one row in the join table. The students and courses tables themselves never have to change.",
    ],
    when: "Use a join table for any real many-to-many relationship: students and courses, actors and movies, tags and posts, users and roles. Use it anywhere each side can have several of the other side.",
    big: "O(n × m) with a simple nested-loop match through the join table twice. O(n + m) with hash indexes on both foreign keys — the same idea as a regular two-table join.",
    mistakes: [
      "Do not cram multiple course IDs into one column on the students table, such as a comma-separated list, instead of using a proper join table. This is a classic beginner mistake, and it breaks ordinary filtering and joining.",
      "A join-table row only means something as a pair. A row with just a student_id, or just a course_id, does not represent a real enrollment.",
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
