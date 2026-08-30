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
    easy: "Picture a huge pile of mail that needs sorting into 4 mailboxes instead of one overflowing box. Sharding does the same thing to your database: instead of one giant table holding every user, you split it into several smaller tables called shards, and each user's data lives in exactly one of them. To decide which shard a piece of data goes to, you turn its key (like a user ID) into a number and use that number to pick a shard — the same key always lands in the same shard.",
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
    easy: "Think of a car license plate: it packs a state code, a year, and a serial number into one plate, so no two cars ever collide — even ones made in different states at the same time. A Snowflake-style ID does the same trick for database rows. It squishes three things into one number: the current time, which server made the ID, and a small counter that ticks up if that same server makes more than one ID in the very same instant. Combine all three, and every server can hand out IDs at the same moment without ever handing out the same one twice.",
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
  {
    id: "caching-strategies",
    pillar: "System Design",
    name: "Caching Strategies (Write-Through vs Write-Back)",
    easy: "Imagine you keep a small notebook on your desk (a fast 'cache') instead of always walking to the filing cabinet in the basement (the slower real database) every time you need something. Write-through means: every time you jot something in the notebook, you ALSO walk down and update the filing cabinet right away — slower per write, but the two always agree. Write-back (also called write-behind) means: you just jot it in the notebook and keep working — the filing cabinet gets updated later, in a batch. Writes feel instant, but if your notebook page got lost before that trip to the basement, that update is gone.",
    how: [
      "Keep two stores: a fast cache and a slower real database.",
      "Write-through: on every write, update the cache AND the database immediately, before telling the caller 'done'. Reads always match between the two.",
      "Write-back: on every write, update the cache only and mark that entry 'dirty' (changed but not yet saved). A separate step later ('flush') copies all dirty entries into the database and clears the dirty marks.",
      "Reads always check the cache first — if the data isn't there, fall back to the database.",
    ],
    when: "When your app got popular enough that hitting the real database on every single write is slowing everything down. Write-through is worth the extra cost when you can never afford to lose a write (like a bank balance). Write-back is worth the risk when writes are frequent and a short window of possible data loss (if the server crashes before flushing) is acceptable, in exchange for speed (like counting 'likes' on a post).",
    big: "O(1) time per cache read or write in both strategies. Write-through pays one extra O(1) database write on every single write. Write-back defers that cost, flushing many writes to the database in one batch later — faster now, but anything still 'dirty' is lost if the cache disappears before the flush.",
    mistakes: [
      "Picking write-back for data you can never afford to lose (like 'has this user paid?') without understanding that a crash before the flush means that write never reaches the real database.",
      "Forgetting to check the cache on reads and going straight to the database anyway — that throws away the entire speed benefit of having a cache.",
    ],
    code: {
      JavaScript: `function writeThrough(cache, db, key, value) {
  cache[key] = value;
  db[key] = value; // updated together, right away
}

function writeBack(cache, dirty, key, value) {
  cache[key] = value;
  dirty[key] = true; // marked "dirty" — not saved to the real database yet
}

function flush(cache, db, dirty) {
  const keys = Object.keys(dirty).sort();
  for (const key of keys) db[key] = cache[key];
  for (const key of keys) delete dirty[key];
  return keys;
}

function formatStore(store) {
  const keys = Object.keys(store).sort();
  return keys.map((k) => \`\${k}=\${store[k]}\`).join(", ");
}

const cache = {};
const db = {};

console.log("-- Write-through: cache and database updated together --");
writeThrough(cache, db, "user:1", "Alice");
writeThrough(cache, db, "user:2", "Bob");
console.log("cache: " + formatStore(cache));
console.log("database: " + formatStore(db));

const dirty = {};
console.log("-- Write-back: cache updated now, database updated later --");
writeBack(cache, dirty, "user:3", "Carol");
writeBack(cache, dirty, "user:1", "Alicia");
console.log("cache: " + formatStore(cache));
console.log("database (not flushed yet): " + formatStore(db));

const flushedKeys = flush(cache, db, dirty);
console.log("Flushed keys: " + flushedKeys.join(", "));
console.log("database (after flush): " + formatStore(db));`,
      Python: `def write_through(cache, db, key, value):
    cache[key] = value
    db[key] = value  # updated together, right away

def write_back(cache, dirty, key, value):
    cache[key] = value
    dirty[key] = True  # marked "dirty" — not saved to the real database yet

def flush(cache, db, dirty):
    keys = sorted(dirty.keys())
    for key in keys:
        db[key] = cache[key]
    for key in keys:
        del dirty[key]
    return keys

def format_store(store):
    keys = sorted(store.keys())
    return ", ".join(f"{k}={store[k]}" for k in keys)

cache = {}
db = {}

print("-- Write-through: cache and database updated together --")
write_through(cache, db, "user:1", "Alice")
write_through(cache, db, "user:2", "Bob")
print("cache: " + format_store(cache))
print("database: " + format_store(db))

dirty = {}
print("-- Write-back: cache updated now, database updated later --")
write_back(cache, dirty, "user:3", "Carol")
write_back(cache, dirty, "user:1", "Alicia")
print("cache: " + format_store(cache))
print("database (not flushed yet): " + format_store(db))

flushed_keys = flush(cache, db, dirty)
print("Flushed keys: " + ", ".join(flushed_keys))
print("database (after flush): " + format_store(db))`,
    },
    output: `-- Write-through: cache and database updated together --
cache: user:1=Alice, user:2=Bob
database: user:1=Alice, user:2=Bob
-- Write-back: cache updated now, database updated later --
cache: user:1=Alicia, user:2=Bob, user:3=Carol
database (not flushed yet): user:1=Alice, user:2=Bob
Flushed keys: user:1, user:3
database (after flush): user:1=Alicia, user:2=Bob, user:3=Carol`,
  },
  {
    id: "idempotency-keys",
    pillar: "System Design",
    name: "Idempotency Keys",
    easy: "You've probably clicked a 'Pay Now' button twice because the page seemed frozen — and worried you just got charged twice. An idempotency key fixes that: it's a unique ticket number the app attaches to that one purchase attempt. The server keeps a log of ticket numbers it has already handled. If the same ticket number shows up again (because the click — or a network retry — got sent twice), the server doesn't charge you again; it just hands back the same result as last time, as if it never even ran the action twice.",
    how: [
      "Before sending a request that changes something (like 'charge this card'), the client generates one unique key for that specific attempt and attaches it to the request.",
      "The server checks a lookup table: has this exact key been seen before? If yes, skip doing the action again — just return the result that was saved from the first time.",
      "If the key is new, perform the action for real, save the key and its result together, then return the result.",
    ],
    when: "When your app got popular enough that flaky networks, slow pages, or retry logic start sending the same request more than once — payments, placing an order, or sending a signup email are exactly the kind of action you never want to accidentally run twice.",
    big: "O(1) time per request to check whether a key was already handled · O(n) space to remember n distinct keys (real systems expire old keys after a while so this doesn't grow forever).",
    mistakes: [
      "Generating a brand-new key every time you retry, instead of reusing the SAME key for the same logical attempt — that defeats the entire point, since the server can no longer tell it's a repeat.",
      "Only remembering 'this key was used' without saving the actual result — then a retry can't be handed back the original answer (like the order ID) it actually needs.",
    ],
    code: {
      JavaScript: `function createStore() {
  return {}; // idempotency key -> the result we gave last time
}

function chargeCustomer(store, chargeLog, idempotencyKey, amount) {
  if (Object.prototype.hasOwnProperty.call(store, idempotencyKey)) {
    return { result: store[idempotencyKey], repeated: true };
  }
  chargeLog.push(amount);
  const result = \`charged $\${amount}, charge #\${chargeLog.length}\`;
  store[idempotencyKey] = result;
  return { result, repeated: false };
}

const store = createStore();
const chargeLog = [];

const requests = [
  ["req-abc", 50],
  ["req-xyz", 20],
  ["req-abc", 50], // the customer's app retried the SAME request after a timeout
];

for (const [key, amount] of requests) {
  const { result, repeated } = chargeCustomer(store, chargeLog, key, amount);
  const repeatedLabel = repeated ? "yes" : "no";
  console.log(\`key=\${key} amount=\${amount} repeated=\${repeatedLabel} -> \${result}\`);
}
console.log(\`Total real charges made: \${chargeLog.length}\`);`,
      Python: `def create_store():
    return {}  # idempotency key -> the result we gave last time

def charge_customer(store, charge_log, idempotency_key, amount):
    if idempotency_key in store:
        return store[idempotency_key], True
    charge_log.append(amount)
    result = f"charged \${amount}, charge #{len(charge_log)}"
    store[idempotency_key] = result
    return result, False

store = create_store()
charge_log = []

requests = [
    ("req-abc", 50),
    ("req-xyz", 20),
    ("req-abc", 50),  # the customer's app retried the SAME request after a timeout
]

for key, amount in requests:
    result, repeated = charge_customer(store, charge_log, key, amount)
    repeated_label = "yes" if repeated else "no"
    print(f"key={key} amount={amount} repeated={repeated_label} -> {result}")
print(f"Total real charges made: {len(charge_log)}")`,
    },
    output: `key=req-abc amount=50 repeated=no -> charged $50, charge #1
key=req-xyz amount=20 repeated=no -> charged $20, charge #2
key=req-abc amount=50 repeated=yes -> charged $50, charge #1
Total real charges made: 2`,
  },
  {
    id: "primary-replica-replication",
    pillar: "System Design",
    name: "Primary-Replica Replication (Read Replicas)",
    easy: "Think of a teacher (the 'primary') writing notes on the whiteboard, while several students (the 'replicas') copy those notes into their own notebooks so everyone can read them without crowding around the board. Only the teacher is allowed to write new notes — students just copy. That's replication: one primary database handles all the writes, and it streams every change to one or more replica copies. Spreading reads across the replicas means way more people can read at once, but a slow-copying student's notebook might briefly lag behind what's actually on the board — that's called replication lag.",
    how: [
      "Every write goes to exactly one server, the primary. It applies the change and appends it, in order, to a running log of everything that's changed.",
      "Each replica reads that log and applies the same changes, in the same order, to its own copy of the data.",
      "Reads get spread across the replicas (instead of all hitting the primary), so read traffic doesn't overload the one server that also has to handle writes. A replica that hasn't caught up yet may return slightly stale (out-of-date) data.",
    ],
    when: "When your app got popular and now has way more reads than writes — like a blog, a product catalog, or a news feed — add several read replicas so all that read traffic doesn't pile onto the one server that's busy handling writes.",
    big: "O(1) time to append one write to the primary's log · O(k) time for a replica to catch up on k unapplied log entries.",
    mistakes: [
      "Sending a write straight to a replica — replicas are meant to be read-only copies, and writing to one breaks the whole replication setup.",
      "Assuming a replica is always instantly up to date — reading from a lagging replica right after a write can show you the old value (the 'read-your-own-writes' problem).",
    ],
    code: {
      JavaScript: `function createPrimary() {
  return { data: {}, log: [] };
}

function write(primary, key, value) {
  primary.data[key] = value;
  primary.log.push([key, value]);
}

function createReplica() {
  return { data: {}, appliedCount: 0 };
}

function replicate(replica, primaryLog, upToCount) {
  for (let i = replica.appliedCount; i < upToCount; i++) {
    const [key, value] = primaryLog[i];
    replica.data[key] = value;
  }
  replica.appliedCount = upToCount;
}

function formatStore(store) {
  const keys = Object.keys(store).sort();
  return keys.map((k) => \`\${k}=\${store[k]}\`).join(", ");
}

const primary = createPrimary();
write(primary, "title", "Hello World");
write(primary, "views", 10);
write(primary, "title", "Hello World v2");
write(primary, "views", 25);

const replicaA = createReplica();
const replicaB = createReplica();

replicate(replicaA, primary.log, primary.log.length); // fully caught up
replicate(replicaB, primary.log, 2); // only caught up to the first 2 writes — it's lagging

console.log("Primary:                " + formatStore(primary.data));
console.log("Replica A (caught up):  " + formatStore(replicaA.data));
console.log("Replica B (lagging):    " + formatStore(replicaB.data));
console.log(\`Replica B has applied \${replicaB.appliedCount} of \${primary.log.length} writes — reads from it may be stale.\`);`,
      Python: `def create_primary():
    return {"data": {}, "log": []}

def write(primary, key, value):
    primary["data"][key] = value
    primary["log"].append((key, value))

def create_replica():
    return {"data": {}, "applied_count": 0}

def replicate(replica, primary_log, up_to_count):
    for i in range(replica["applied_count"], up_to_count):
        key, value = primary_log[i]
        replica["data"][key] = value
    replica["applied_count"] = up_to_count

def format_store(store):
    keys = sorted(store.keys())
    return ", ".join(f"{k}={store[k]}" for k in keys)

primary = create_primary()
write(primary, "title", "Hello World")
write(primary, "views", 10)
write(primary, "title", "Hello World v2")
write(primary, "views", 25)

replica_a = create_replica()
replica_b = create_replica()

replicate(replica_a, primary["log"], len(primary["log"]))  # fully caught up
replicate(replica_b, primary["log"], 2)  # only caught up to the first 2 writes — it's lagging

print("Primary:                " + format_store(primary["data"]))
print("Replica A (caught up):  " + format_store(replica_a["data"]))
print("Replica B (lagging):    " + format_store(replica_b["data"]))
print(f"Replica B has applied {replica_b['applied_count']} of {len(primary['log'])} writes — reads from it may be stale.")`,
    },
    output: `Primary:                title=Hello World v2, views=25
Replica A (caught up):  title=Hello World v2, views=25
Replica B (lagging):    title=Hello World, views=10
Replica B has applied 2 of 4 writes — reads from it may be stale.`,
  },
  {
    id: "heartbeat-failure-detection",
    pillar: "System Design",
    name: "Heartbeat Failure Detection",
    easy: "Imagine calling a friend to check in every few minutes while they're doing something risky alone. As long as they keep answering, you assume they're fine. But if a few calls in a row go unanswered, you start to worry something's wrong. That's exactly how servers watch each other: every server sends a tiny 'I'm alive' ping (a 'heartbeat') on a regular schedule. A monitor keeps track of the last time it heard from each one. If too much time passes with no ping, the monitor marks that server 'down' — assumed to have failed.",
    how: [
      "Every server sends a heartbeat (just its ID and the current time) to a monitor at a steady interval.",
      "The monitor remembers, for each server, the time of the last heartbeat it received.",
      "Whenever you check a server's status, compare now to its last heartbeat time. If more time has passed than the allowed timeout, mark it 'down'; otherwise it's 'up'.",
    ],
    when: "When your app got popular enough that you're running many servers, and you need to automatically notice when one crashes — so a load balancer can stop sending it traffic, or an alert can fire. This is how real clusters (like Kubernetes watching nodes) know something has failed without a human checking by hand.",
    big: "O(1) time to record one heartbeat · O(n) time to check the status of n servers.",
    mistakes: [
      "Setting the timeout so short that a server that's just briefly slow (a network hiccup) gets wrongly marked 'down' — a good timeout allows a little slack.",
      "Trusting each server's own clock for timestamps in a real system — clocks can drift between machines, so production systems have to account for that (in these examples we always pass in a fixed, agreed-upon time so this stays predictable).",
    ],
    code: {
      JavaScript: `function createMonitor(timeout) {
  return { timeout, lastHeartbeat: {} };
}

function heartbeat(monitor, node, time) {
  monitor.lastHeartbeat[node] = time;
}

function statusAt(monitor, node, now) {
  const last = monitor.lastHeartbeat[node];
  if (last === undefined) return "unknown";
  const elapsed = now - last;
  return elapsed > monitor.timeout ? "down" : "up";
}

function checkAndPrint(monitor, nodes, now) {
  const parts = nodes.map((n) => \`\${n}=\${statusAt(monitor, n, now)}\`);
  console.log(\`t=\${now}: \${parts.join(", ")}\`);
}

const monitor = createMonitor(10); // no heartbeat for more than 10 ticks = "down"
const nodes = ["node-1", "node-2"];

heartbeat(monitor, "node-1", 0);
heartbeat(monitor, "node-2", 0);
checkAndPrint(monitor, nodes, 5);
heartbeat(monitor, "node-1", 8); // node-1 checks in again; node-2 has gone quiet
checkAndPrint(monitor, nodes, 9);
checkAndPrint(monitor, nodes, 12);
checkAndPrint(monitor, nodes, 20);`,
      Python: `def create_monitor(timeout):
    return {"timeout": timeout, "last_heartbeat": {}}

def heartbeat(monitor, node, time):
    monitor["last_heartbeat"][node] = time

def status_at(monitor, node, now):
    last = monitor["last_heartbeat"].get(node)
    if last is None:
        return "unknown"
    elapsed = now - last
    return "down" if elapsed > monitor["timeout"] else "up"

def check_and_print(monitor, nodes, now):
    parts = [f"{n}={status_at(monitor, n, now)}" for n in nodes]
    print(f"t={now}: " + ", ".join(parts))

monitor = create_monitor(10)  # no heartbeat for more than 10 ticks = "down"
nodes = ["node-1", "node-2"]

heartbeat(monitor, "node-1", 0)
heartbeat(monitor, "node-2", 0)
check_and_print(monitor, nodes, 5)
heartbeat(monitor, "node-1", 8)  # node-1 checks in again; node-2 has gone quiet
check_and_print(monitor, nodes, 9)
check_and_print(monitor, nodes, 12)
check_and_print(monitor, nodes, 20)`,
    },
    output: `t=5: node-1=up, node-2=up
t=9: node-1=up, node-2=up
t=12: node-1=up, node-2=down
t=20: node-1=down, node-2=down`,
  },
  {
    id: "leaky-bucket-rate-limiter",
    pillar: "System Design",
    name: "Leaky Bucket (Rate Limiter)",
    easy: "Picture a bucket with a small hole in the bottom that drips water out at a constant, steady rate, no matter how fast you pour water in. Requests are like water being poured in. If they arrive faster than the hole can drain them, the bucket fills up — and once it's full, any extra water you pour just spills over the top and is lost (the request gets blocked). This is different from the token bucket rate limiter: a token bucket lets you save up tokens while idle and then blow through a big burst all at once, but a leaky bucket always lets requests out at the same steady drip — no bursts allowed, ever.",
    how: [
      "Keep a queue (the bucket) with a maximum size, and a fixed 'leak rate' — how often one waiting request drains out and gets processed.",
      "When a new request arrives, first drain out any requests that should have leaked already, based on how much time has passed.",
      "If there's room left in the bucket after draining, add the new request to the back of the queue (it'll be processed in its turn). If the bucket is still full, reject the request — it spills over.",
    ],
    when: "When your app got popular and needs to call a downstream service (like a payment gateway or a partner API) that can only handle a strictly steady stream of requests and would choke on even a short burst — a leaky bucket smooths out bursty incoming traffic into one constant, predictable rate, unlike a token bucket which would let a burst straight through.",
    big: "O(1) time per request, amortized · O(capacity) space to hold the queued requests.",
    mistakes: [
      "Mixing it up with the token bucket — the token bucket is built to allow bursts, while the leaky bucket is built to flatten them out into one steady rate.",
      "Forgetting to drain old requests before checking whether there's room — that makes the bucket look fuller than it actually is and rejects requests that should have been allowed.",
    ],
    code: {
      JavaScript: `function createBucket(capacity, leakIntervalTicks) {
  return { capacity, leakIntervalTicks, queue: [], lastLeakTime: 0 };
}

function leak(bucket, now) {
  const elapsed = now - bucket.lastLeakTime;
  const leaks = Math.floor(elapsed / bucket.leakIntervalTicks);
  for (let i = 0; i < leaks && bucket.queue.length > 0; i++) {
    bucket.queue.shift(); // one request leaks out and gets processed
  }
  if (leaks > 0) bucket.lastLeakTime += leaks * bucket.leakIntervalTicks;
}

function allow(bucket, now, requestId) {
  leak(bucket, now);
  if (bucket.queue.length < bucket.capacity) {
    bucket.queue.push(requestId);
    return true;
  }
  return false; // bucket's full — this request spills over and is dropped
}

const bucket = createBucket(3, 10); // holds 3 requests, leaks 1 out every 10 ticks
console.log("Bucket: capacity 3, leaks 1 request every 10 ticks");
const requestTimes = [0, 1, 2, 3, 15, 16];
for (const t of requestTimes) {
  const wasAllowed = allow(bucket, t, \`req@\${t}\`);
  const status = wasAllowed ? "allowed" : "blocked";
  console.log(\`t=\${t}: \${status} (queue size: \${bucket.queue.length})\`);
}`,
      Python: `def create_bucket(capacity, leak_interval_ticks):
    return {
        "capacity": capacity,
        "leak_interval_ticks": leak_interval_ticks,
        "queue": [],
        "last_leak_time": 0,
    }

def leak(bucket, now):
    elapsed = now - bucket["last_leak_time"]
    leaks = elapsed // bucket["leak_interval_ticks"]
    for _ in range(leaks):
        if bucket["queue"]:
            bucket["queue"].pop(0)  # one request leaks out and gets processed
    if leaks > 0:
        bucket["last_leak_time"] += leaks * bucket["leak_interval_ticks"]

def allow(bucket, now, request_id):
    leak(bucket, now)
    if len(bucket["queue"]) < bucket["capacity"]:
        bucket["queue"].append(request_id)
        return True
    return False  # bucket's full — this request spills over and is dropped

bucket = create_bucket(3, 10)  # holds 3 requests, leaks 1 out every 10 ticks
print("Bucket: capacity 3, leaks 1 request every 10 ticks")
request_times = [0, 1, 2, 3, 15, 16]
for t in request_times:
    was_allowed = allow(bucket, t, f"req@{t}")
    status = "allowed" if was_allowed else "blocked"
    print(f"t={t}: {status} (queue size: {len(bucket['queue'])})")`,
    },
    output: `Bucket: capacity 3, leaks 1 request every 10 ticks
t=0: allowed (queue size: 1)
t=1: allowed (queue size: 2)
t=2: allowed (queue size: 3)
t=3: blocked (queue size: 3)
t=15: allowed (queue size: 3)
t=16: blocked (queue size: 3)`,
  },
];

export default lessons;
