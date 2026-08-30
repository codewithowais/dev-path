// content/lessons/system-design.ts
// Pillar: System Design — how to build big systems that stay fast and reliable as they grow.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/system-design.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "rate-limiter",
    pillar: "System Design",
    name: "Rate Limiter (Token Bucket)",
    easy: "Imagine a bucket that holds a few tokens. Every time you make a request, you spend one token. If the bucket's empty, you have to wait — you're blocked. But the bucket slowly refills over time, a token at a time, so after a little while you can make requests again. That's a rate limiter: it lets people use your app a lot for a short burst, but stops anyone from hammering it nonstop.",
    how: [
      "Give every user (or API key) a bucket with a max capacity — say, 3 tokens.",
      "When a request comes in, first refill the bucket a bit based on how much time passed since the last check (elapsed time ÷ refill rate = new tokens, capped at capacity).",
      "If there's at least 1 token in the bucket, take one and allow the request. If the bucket is empty, block the request.",
    ],
    when: "When your app gets popular and one user (or one buggy script) could hammer your server with thousands of requests a second — a rate limiter protects everyone else's experience by capping how fast any one caller can go.",
    big: "O(1) time and space per request — just a couple of number updates, no matter how many requests you've handled.",
    mistakes: [
      "Using the real system clock, which makes examples and tests unpredictable — in production you'd read the real clock, but always pass time in explicitly so your logic is testable.",
      "Forgetting to cap the bucket at its max capacity, which would let tokens pile up forever if nobody used the API for a long time.",
    ],
    code: {
      JavaScript: `function createBucket(capacity, refillIntervalPerToken) {
  return { capacity, refillIntervalPerToken, tokens: capacity, lastRefillTime: 0 };
}

function allow(bucket, now) {
  // "now" is a fixed number we pass in — never the real clock — so this is repeatable.
  const elapsed = now - bucket.lastRefillTime;
  const tokensToAdd = Math.floor(elapsed / bucket.refillIntervalPerToken);
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefillTime += tokensToAdd * bucket.refillIntervalPerToken;
  }
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }
  return false; // bucket's empty — blocked
}

const bucket = createBucket(3, 10); // holds 3 tokens, refills 1 every 10 ticks
console.log("Bucket: capacity 3, refills 1 token every 10 ticks");
const requestTimes = [0, 1, 2, 15, 16, 40];
for (const t of requestTimes) {
  const wasAllowed = allow(bucket, t);
  const status = wasAllowed ? "allowed" : "blocked";
  console.log(\`t=\${t}: \${status} (tokens left: \${bucket.tokens})\`);
}`,
      Python: `def create_bucket(capacity, refill_interval_per_token):
    return {
        "capacity": capacity,
        "refill_interval_per_token": refill_interval_per_token,
        "tokens": capacity,
        "last_refill_time": 0,
    }

def allow(bucket, now):
    # "now" is a fixed number we pass in — never the real clock — so this is repeatable.
    elapsed = now - bucket["last_refill_time"]
    tokens_to_add = elapsed // bucket["refill_interval_per_token"]
    if tokens_to_add > 0:
        bucket["tokens"] = min(bucket["capacity"], bucket["tokens"] + tokens_to_add)
        bucket["last_refill_time"] += tokens_to_add * bucket["refill_interval_per_token"]
    if bucket["tokens"] > 0:
        bucket["tokens"] -= 1
        return True
    return False  # bucket's empty — blocked

bucket = create_bucket(3, 10)  # holds 3 tokens, refills 1 every 10 ticks
print("Bucket: capacity 3, refills 1 token every 10 ticks")
request_times = [0, 1, 2, 15, 16, 40]
for t in request_times:
    was_allowed = allow(bucket, t)
    status = "allowed" if was_allowed else "blocked"
    print(f"t={t}: {status} (tokens left: {bucket['tokens']})")`,
    },
    output: `Bucket: capacity 3, refills 1 token every 10 ticks
t=0: allowed (tokens left: 2)
t=1: allowed (tokens left: 1)
t=2: allowed (tokens left: 0)
t=15: allowed (tokens left: 0)
t=16: blocked (tokens left: 0)
t=40: allowed (tokens left: 2)`,
  },
  {
    id: "consistent-hashing",
    pillar: "System Design",
    name: "Consistent Hashing",
    easy: "Picture seats arranged in a big circle. Each server gets a seat somewhere on the circle, and so does every piece of data (a 'key'). To find out which server owns a piece of data, you start at the key's spot and walk clockwise until you bump into the first server seat. The clever part: if you add or remove a server, only the keys near that one seat have to move — everyone else stays exactly where they were.",
    how: [
      "Turn each server's name into a number (a position on the circle) using a hash function.",
      "Sort the servers by their position, so they form a ring going around the circle.",
      "For any key, hash it to a position too, then walk clockwise to find the first server at or after that position — that server owns the key (wrapping back to the first server if you reach the end).",
    ],
    when: "When you're spreading data or traffic across many servers and you want adding/removing a server to be cheap — like a distributed cache (think Redis/Memcached clusters) where you don't want to reshuffle almost everything every time you scale up or down.",
    big: "O(n) to build the ring (n = number of servers) · O(n) per lookup in this simple version (real systems use a sorted structure for O(log n) lookups). The big win isn't speed — it's that scaling the cluster only moves a small slice of keys.",
    mistakes: [
      "Using a hash function so weak that server names cluster together on the ring instead of spreading out, which piles most keys onto just one server.",
      "Forgetting to wrap around the circle — if a key's position is past every server, it belongs to the very first server, not nowhere.",
    ],
    code: {
      JavaScript: `const RING_SIZE = 360; // think of it like 360 degrees on a clock face

function hashPos(str) {
  // A simple, deterministic hash: add up the character codes, wrap into the ring.
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return sum % RING_SIZE;
}

function buildRing(names) {
  return names
    .map((name) => ({ name, pos: hashPos(name) }))
    .sort((a, b) => a.pos - b.pos);
}

function assign(ring, key) {
  const pos = hashPos(key);
  for (const server of ring) {
    if (server.pos >= pos) return server.name; // first seat clockwise from the key
  }
  return ring[0].name; // walked past the end — wrap back to the first seat
}

const servers = ["borealis", "delta", "atlas", "cascade"];
const keys = ["alice", "bob", "carol", "dave", "erin", "frank"];

let ring = buildRing(servers);
console.log("Ring:", ring.map((s) => \`\${s.name}@\${s.pos}\`).join(", "));

const before = {};
for (const key of keys) {
  before[key] = assign(ring, key);
  console.log(\`\${key} -> \${before[key]}\`);
}

// Add a 5th server and see how few keys actually move.
ring = buildRing([...servers, "vale"]);
console.log("Added vale. Ring:", ring.map((s) => \`\${s.name}@\${s.pos}\`).join(", "));

let moved = 0;
for (const key of keys) {
  const after = assign(ring, key);
  if (after !== before[key]) moved++;
  console.log(\`\${key} -> \${after}\`);
}
console.log(\`Keys that moved: \${moved} out of \${keys.length}\`);`,
      Python: `RING_SIZE = 360  # think of it like 360 degrees on a clock face

def hash_pos(s):
    # A simple, deterministic hash: add up the character codes, wrap into the ring.
    total = 0
    for ch in s:
        total += ord(ch)
    return total % RING_SIZE

def build_ring(names):
    ring = [{"name": name, "pos": hash_pos(name)} for name in names]
    ring.sort(key=lambda s: s["pos"])
    return ring

def assign(ring, key):
    pos = hash_pos(key)
    for server in ring:
        if server["pos"] >= pos:
            return server["name"]  # first seat clockwise from the key
    return ring[0]["name"]  # walked past the end — wrap back to the first seat

servers = ["borealis", "delta", "atlas", "cascade"]
keys = ["alice", "bob", "carol", "dave", "erin", "frank"]

ring = build_ring(servers)
print("Ring:", ", ".join(f'{s["name"]}@{s["pos"]}' for s in ring))

before = {}
for key in keys:
    before[key] = assign(ring, key)
    print(f"{key} -> {before[key]}")

# Add a 5th server and see how few keys actually move.
ring = build_ring(servers + ["vale"])
print("Added vale. Ring:", ", ".join(f'{s["name"]}@{s["pos"]}' for s in ring))

moved = 0
for key in keys:
    after = assign(ring, key)
    if after != before[key]:
        moved += 1
    print(f"{key} -> {after}")
print(f"Keys that moved: {moved} out of {len(keys)}")`,
    },
    output: `Ring: borealis@129, delta@162, atlas@173, cascade@348
alice -> delta
bob -> cascade
carol -> atlas
dave -> borealis
erin -> borealis
frank -> atlas
Added vale. Ring: vale@64, borealis@129, delta@162, atlas@173, cascade@348
alice -> delta
bob -> cascade
carol -> atlas
dave -> vale
erin -> borealis
frank -> atlas
Keys that moved: 1 out of 6`,
  },
  {
    id: "sharding",
    pillar: "System Design",
    name: "Sharding (Hash-Based Key Routing)",
    easy: "A shard is just one slice of your database — instead of one giant table holding every user, you split it into, say, 4 smaller tables (shards) and each user lives in exactly one of them. Sharding is deciding which slice a piece of data belongs to, usually by hashing its key (like a user ID) and taking the remainder when divided by the number of shards.",
    how: [
      "Pick a number of shards, N (e.g. 4 database instances).",
      "For any key (like a user ID), compute a deterministic hash number from it.",
      "Take hash mod N — that remainder (0 to N-1) tells you exactly which shard owns that key.",
    ],
    when: "When one database server can't hold all your data or handle all your traffic anymore — you split the data across several servers so each one only has to deal with a fraction of it.",
    big: "O(1) time to route any key to its shard — it's just a hash and a division. The tradeoff: changing the number of shards later reshuffles most keys (unlike consistent hashing, which is designed to avoid that).",
    mistakes: [
      "Picking a shard count and then changing it casually — as this example shows, going from 4 shards to 5 moves most keys to a different shard, which means a painful data migration.",
      "Sharding by a key that isn't evenly distributed (like sharding by signup date when most users signed up in one week) — that creates a 'hot shard' that's overloaded while others sit idle.",
    ],
    code: {
      JavaScript: `function simpleHash(str) {
  // A simple, deterministic hash: add up the character codes.
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return sum;
}

function shardFor(key, numShards) {
  return simpleHash(key) % numShards;
}

const userIds = ["user-1", "user-2", "user-3", "user-4", "user-5", "user-6"];
const numShards = 4;

console.log(\`Routing \${userIds.length} users across \${numShards} shards:\`);
const counts = new Array(numShards).fill(0);
for (const id of userIds) {
  const shard = shardFor(id, numShards);
  counts[shard]++;
  console.log(\`\${id} -> shard \${shard}\`);
}
console.log("Counts: " + counts.map((c, i) => \`shard \${i}=\${c}\`).join(", "));

// Now imagine we need a 5th shard for more capacity.
const newShards = 5;
let changed = 0;
for (const id of userIds) {
  const oldShard = shardFor(id, numShards);
  const newShard = shardFor(id, newShards);
  if (oldShard !== newShard) changed++;
}
console.log(\`Resharding 4 -> 5 moves \${changed} of \${userIds.length} keys\`);`,
      Python: `def simple_hash(s):
    # A simple, deterministic hash: add up the character codes.
    total = 0
    for ch in s:
        total += ord(ch)
    return total

def shard_for(key, num_shards):
    return simple_hash(key) % num_shards

user_ids = ["user-1", "user-2", "user-3", "user-4", "user-5", "user-6"]
num_shards = 4

print(f"Routing {len(user_ids)} users across {num_shards} shards:")
counts = [0] * num_shards
for uid in user_ids:
    shard = shard_for(uid, num_shards)
    counts[shard] += 1
    print(f"{uid} -> shard {shard}")
print("Counts: " + ", ".join(f"shard {i}={c}" for i, c in enumerate(counts)))

# Now imagine we need a 5th shard for more capacity.
new_shards = 5
changed = 0
for uid in user_ids:
    old_shard = shard_for(uid, num_shards)
    new_shard = shard_for(uid, new_shards)
    if old_shard != new_shard:
        changed += 1
print(f"Resharding 4 -> 5 moves {changed} of {len(user_ids)} keys")`,
    },
    output: `Routing 6 users across 4 shards:
user-1 -> shard 1
user-2 -> shard 2
user-3 -> shard 3
user-4 -> shard 0
user-5 -> shard 1
user-6 -> shard 2
Counts: shard 0=1, shard 1=2, shard 2=2, shard 3=1
Resharding 4 -> 5 moves 3 of 6 keys`,
  },
  {
    id: "load-balancer",
    pillar: "System Design",
    name: "Load Balancer (Round Robin & Weighted)",
    easy: "A load balancer is like a host seating guests at tables. The simplest version — round robin — just seats guests at table 1, then table 2, then table 3, then back to table 1, over and over, spreading people out evenly. The weighted version knows some tables are bigger, so it seats more guests at the big tables before coming back around — a server with more capacity gets more requests.",
    how: [
      "Round robin: keep a list of servers and a counter. Each request goes to servers[counter % numberOfServers], then the counter increases by one.",
      "Weighted round robin: give each server a weight (how many requests it should get per cycle). Build one expanded list where a server appears as many times as its weight, then round-robin over THAT list.",
      "Either way, every incoming request gets handed to whichever server the pattern points to next — no server has to know anything about the others.",
    ],
    when: "When you have more traffic than one server can handle, so you run several copies of your app behind one address, and something needs to decide which copy handles each incoming request.",
    big: "O(1) time per request for both versions — just an index lookup, no matter how many servers you have.",
    mistakes: [
      "Forgetting the modulo (%) wraparound, so the counter runs off the end of the server list instead of looping back to the start.",
      "Giving every server equal weight even though some machines are far more powerful — plain round robin then overloads your weakest server just as much as your strongest one.",
    ],
    code: {
      JavaScript: `function roundRobin(servers, count) {
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(servers[i % servers.length]);
  }
  return picks;
}

function weightedRoundRobin(serverWeights, count) {
  // Expand into a flat list: a server with weight 3 appears 3 times.
  const expanded = [];
  for (const [name, weight] of serverWeights) {
    for (let i = 0; i < weight; i++) expanded.push(name);
  }
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(expanded[i % expanded.length]);
  }
  return picks;
}

const servers = ["server-A", "server-B", "server-C"];
console.log("Plain round robin (9 requests):", roundRobin(servers, 9).join(" "));

const weighted = [
  ["server-A", 3],
  ["server-B", 1],
  ["server-C", 1],
];
console.log("Weighted round robin (10 requests, A gets 3x):", weightedRoundRobin(weighted, 10).join(" "));`,
      Python: `def round_robin(servers, count):
    picks = []
    for i in range(count):
        picks.append(servers[i % len(servers)])
    return picks

def weighted_round_robin(server_weights, count):
    # Expand into a flat list: a server with weight 3 appears 3 times.
    expanded = []
    for name, weight in server_weights:
        for _ in range(weight):
            expanded.append(name)
    picks = []
    for i in range(count):
        picks.append(expanded[i % len(expanded)])
    return picks

servers = ["server-A", "server-B", "server-C"]
print("Plain round robin (9 requests):", " ".join(round_robin(servers, 9)))

weighted = [
    ("server-A", 3),
    ("server-B", 1),
    ("server-C", 1),
]
print("Weighted round robin (10 requests, A gets 3x):", " ".join(weighted_round_robin(weighted, 10)))`,
    },
    output: `Plain round robin (9 requests): server-A server-B server-C server-A server-B server-C server-A server-B server-C
Weighted round robin (10 requests, A gets 3x): server-A server-A server-A server-B server-C server-A server-A server-A server-B server-C`,
  },
  {
    id: "pub-sub",
    pillar: "System Design",
    name: "Pub/Sub (Publish–Subscribe)",
    easy: "Pub/Sub is like a radio station. The station (publisher) broadcasts on a channel (a 'topic') without knowing or caring who's listening. Anyone who's tuned in (a subscriber) hears the broadcast. The publisher never talks directly to the listeners — a middleman (the 'broker') handles delivering the message to everyone who subscribed to that channel.",
    how: [
      "Subscribers register interest in a topic by name (e.g. 'orders').",
      "A publisher sends a message to a topic — it doesn't know or care who (or how many services) are subscribed.",
      "The broker looks up every subscriber for that topic and delivers a copy of the message to each one.",
    ],
    when: "When one event needs to trigger several unrelated things without those things knowing about each other — e.g. a new order should notify billing AND email AND shipping, but the order-placing code shouldn't have to know the details of all three.",
    big: "O(s) time per publish, where s is the number of subscribers on that topic — every subscriber gets one delivery.",
    mistakes: [
      "Having the publisher call each subscriber directly instead of going through a topic — that tightly couples services together, which is exactly what pub/sub is meant to avoid.",
      "Assuming a topic with no subscribers is an error — often it's completely fine for nobody to be listening yet.",
    ],
    code: {
      JavaScript: `function createBroker() {
  return { topics: {} }; // topic name -> list of subscriber names
}

function subscribe(broker, topic, subscriberName) {
  if (!broker.topics[topic]) broker.topics[topic] = [];
  broker.topics[topic].push(subscriberName);
}

function publish(broker, topic, message, inboxes) {
  const subs = broker.topics[topic] || [];
  for (const sub of subs) {
    if (!inboxes[sub]) inboxes[sub] = [];
    inboxes[sub].push(\`[\${topic}] \${message}\`);
  }
}

const broker = createBroker();
const inboxes = {}; // subscriber name -> messages they received

subscribe(broker, "orders", "billing-service");
subscribe(broker, "orders", "email-service");
subscribe(broker, "shipping", "email-service");

publish(broker, "orders", "Order #101 placed", inboxes);
publish(broker, "shipping", "Order #101 shipped", inboxes);
publish(broker, "orders", "Order #102 placed", inboxes);

const subscribers = Object.keys(inboxes).sort(); // sort so output order is fixed
for (const sub of subscribers) {
  console.log(\`\${sub}: \${inboxes[sub].join(" | ")}\`);
}`,
      Python: `def create_broker():
    return {"topics": {}}  # topic name -> list of subscriber names

def subscribe(broker, topic, subscriber_name):
    broker["topics"].setdefault(topic, []).append(subscriber_name)

def publish(broker, topic, message, inboxes):
    subs = broker["topics"].get(topic, [])
    for sub in subs:
        inboxes.setdefault(sub, []).append(f"[{topic}] {message}")

broker = create_broker()
inboxes = {}  # subscriber name -> messages they received

subscribe(broker, "orders", "billing-service")
subscribe(broker, "orders", "email-service")
subscribe(broker, "shipping", "email-service")

publish(broker, "orders", "Order #101 placed", inboxes)
publish(broker, "shipping", "Order #101 shipped", inboxes)
publish(broker, "orders", "Order #102 placed", inboxes)

for sub in sorted(inboxes.keys()):  # sort so output order is fixed
    print(f"{sub}: " + " | ".join(inboxes[sub]))`,
    },
    output: `billing-service: [orders] Order #101 placed | [orders] Order #102 placed
email-service: [orders] Order #101 placed | [shipping] Order #101 shipped | [orders] Order #102 placed`,
  },
  {
    id: "leaderboard-ranking",
    pillar: "System Design",
    name: "Leaderboard / Ranking",
    easy: "A leaderboard is a scoreboard: everyone's score is tracked, and it's always shown ranked from highest to lowest. The trick is what happens when scores tie — you need a consistent tie-breaker (here, alphabetical by name) so the order never wobbles. And whenever someone's score changes, the ranking has to be recomputed.",
    how: [
      "Keep a running score for every player in a lookup table (name -> total score).",
      "To show the leaderboard, sort all the names: primarily by score (highest first), and by name alphabetically to break ties.",
      "When a player earns more points, just add to their running score, then re-sort to get the fresh ranking.",
    ],
    when: "Any 'top players', 'most active users', or 'trending posts' feature — anywhere you need to show things ranked by a number that keeps changing.",
    big: "O(n log n) time to produce a full ranking (n = number of players), because of the sort · O(n) space to hold the scores. Real large-scale leaderboards use smarter data structures (like sorted sets) to update a single score in O(log n) instead of re-sorting everything.",
    mistakes: [
      "Sorting only by score and leaving ties in random/unstable order — two players with the same score should always land in the same order, or the leaderboard looks like it's glitching.",
      "Recomputing everyone's rank by re-fetching all data from scratch on every single point scored, instead of just updating the one player who changed.",
    ],
    code: {
      JavaScript: `function addScore(scores, name, points) {
  scores[name] = (scores[name] || 0) + points;
}

function ranked(scores) {
  const names = Object.keys(scores);
  names.sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a]; // higher score first
    return a < b ? -1 : a > b ? 1 : 0; // tie-break alphabetically
  });
  return names;
}

const scores = {};
addScore(scores, "alice", 50);
addScore(scores, "bob", 80);
addScore(scores, "carol", 80);
addScore(scores, "dave", 65);

console.log("Leaderboard:");
ranked(scores).forEach((name, i) => console.log(\`\${i + 1}. \${name} - \${scores[name]}\`));

addScore(scores, "alice", 40); // alice scores again
console.log("After alice scores 40 more points:");
ranked(scores).forEach((name, i) => console.log(\`\${i + 1}. \${name} - \${scores[name]}\`));`,
      Python: `def add_score(scores, name, points):
    scores[name] = scores.get(name, 0) + points

def ranked(scores):
    names = list(scores.keys())
    names.sort(key=lambda n: (-scores[n], n))  # higher score first, then alphabetical
    return names

scores = {}
add_score(scores, "alice", 50)
add_score(scores, "bob", 80)
add_score(scores, "carol", 80)
add_score(scores, "dave", 65)

print("Leaderboard:")
for i, name in enumerate(ranked(scores)):
    print(f"{i + 1}. {name} - {scores[name]}")

add_score(scores, "alice", 40)  # alice scores again
print("After alice scores 40 more points:")
for i, name in enumerate(ranked(scores)):
    print(f"{i + 1}. {name} - {scores[name]}")`,
    },
    output: `Leaderboard:
1. bob - 80
2. carol - 80
3. dave - 65
4. alice - 50
After alice scores 40 more points:
1. alice - 90
2. bob - 80
3. carol - 80
4. dave - 65`,
  },
  {
    id: "unique-id-generator",
    pillar: "System Design",
    name: "Unique ID Generator (Snowflake-Style)",
    easy: "Think of a car license plate: it packs a state code, a year, and a serial number into one plate so no two cars ever collide — even ones made in different states at the same time. A Snowflake-style ID does the same trick for database rows: it squishes a timestamp, a machine ID, and a per-millisecond counter into one number, so multiple servers can each hand out IDs at the same moment without ever generating the same one.",
    how: [
      "Reserve some bits of the final number for a timestamp, some for a machine ID (which server generated it), and some for a sequence counter.",
      "Shift the timestamp left past the machine-ID and sequence bits, shift the machine ID left past the sequence bits, then combine all three with bitwise OR into one number.",
      "If two IDs are requested at the exact same timestamp, bump the sequence counter so they still come out different; when the timestamp changes, reset the counter back to 0.",
    ],
    when: "Generating IDs across many servers at once (so you can't just use an auto-incrementing database column), while still wanting IDs that sort roughly by creation time — common in large-scale systems like chat messages, orders, or analytics events.",
    big: "O(1) time and space per ID generated — just a few shifts and an OR.",
    mistakes: [
      "Reading the real system clock inside the core logic, which makes it untestable and can even go backwards if the server's clock gets adjusted — pass the timestamp in as a value instead, exactly like this example does.",
      "Forgetting to reset the sequence counter when the timestamp moves forward, which would keep incrementing it forever instead of starting fresh each 'tick'.",
    ],
    code: {
      JavaScript: `const MACHINE_BITS = 5;
const SEQUENCE_BITS = 10;

function createGenerator(machineId) {
  return { machineId, lastTimestamp: -1, sequence: 0 };
}

function nextId(gen, timestamp) {
  // "timestamp" is a fixed number we pass in — never the real clock — so this is repeatable.
  if (timestamp === gen.lastTimestamp) {
    gen.sequence += 1; // same tick as last time — bump the counter
  } else {
    gen.sequence = 0; // new tick — start counting over
    gen.lastTimestamp = timestamp;
  }
  return (timestamp << (MACHINE_BITS + SEQUENCE_BITS)) | (gen.machineId << SEQUENCE_BITS) | gen.sequence;
}

const gen = createGenerator(3);
const fixedTimestamps = [100, 100, 100, 101, 101, 205];
const ids = [];
for (const ts of fixedTimestamps) {
  const id = nextId(gen, ts);
  ids.push(id);
  console.log(\`t=\${ts}: id=\${id}\`);
}
const uniqueCount = new Set(ids).size;
const allUnique = uniqueCount === ids.length;
console.log("All IDs unique:", allUnique ? "yes" : "no");`,
      Python: `MACHINE_BITS = 5
SEQUENCE_BITS = 10

def create_generator(machine_id):
    return {"machine_id": machine_id, "last_timestamp": -1, "sequence": 0}

def next_id(gen, timestamp):
    # "timestamp" is a fixed number we pass in — never the real clock — so this is repeatable.
    if timestamp == gen["last_timestamp"]:
        gen["sequence"] += 1  # same tick as last time — bump the counter
    else:
        gen["sequence"] = 0  # new tick — start counting over
        gen["last_timestamp"] = timestamp
    return (timestamp << (MACHINE_BITS + SEQUENCE_BITS)) | (gen["machine_id"] << SEQUENCE_BITS) | gen["sequence"]

gen = create_generator(3)
fixed_timestamps = [100, 100, 100, 101, 101, 205]
ids = []
for ts in fixed_timestamps:
    id_ = next_id(gen, ts)
    ids.append(id_)
    print(f"t={ts}: id={id_}")
unique_count = len(set(ids))
all_unique = unique_count == len(ids)
print("All IDs unique:", "yes" if all_unique else "no")`,
    },
    output: `t=100: id=3279872
t=100: id=3279873
t=100: id=3279874
t=101: id=3312640
t=101: id=3312641
t=205: id=6720512
All IDs unique: yes`,
  },
];

export default lessons;
