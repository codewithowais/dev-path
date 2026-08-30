// content/lessons/cloud.ts
// Pillar: Cloud — how real apps run on rented computers.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/cloud.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "circuit-breaker",
    pillar: "Cloud",
    name: "Circuit Breaker",
    easy: "A circuit breaker here works just like the electrical one in your house: if something downstream (a fuse, a struggling service) starts drawing too many failures, the breaker 'trips' and cuts the connection so the damage doesn't spread. Instead of your app hammering a broken service over and over and getting stuck waiting, it gives up fast and gives the service room to recover.",
    how: [
      "Closed (normal): requests flow through as usual, and the breaker quietly counts how many fail in a row.",
      "Open (tripped): once failures hit a threshold, the breaker flips open. Every request is rejected immediately — no waiting on a doomed call — for a cooldown period.",
      "Half-open (testing the water): after the cooldown, the breaker lets exactly one trial request through. If it succeeds, the breaker closes again (back to normal). If it fails, the breaker snaps back open and the cooldown restarts.",
    ],
    when: "Whenever your app calls another service over a network — an API, a database, a payment processor — that might be slow or down. Without a breaker, every caller keeps retrying a dead service, piling up wasted time and making the outage worse for everyone.",
    big: "Checking the breaker's state is O(1) — trivial. The real payoff is avoiding minutes of wasted timeouts across every caller during an outage.",
    mistakes: [
      "Setting the cooldown too short, so the breaker keeps flapping open-closed-open ('flapping') on a service that hasn't really recovered yet.",
      "Skipping the half-open test and jumping straight back to fully trusting the service — one lucky request doesn't mean it's healthy.",
      "Counting every kind of error as a breaker-worthy failure, even ones that are the caller's fault (like a bad request), not the dependency's.",
    ],
    code: {
      JavaScript: `class CircuitBreaker {
  constructor(failureThreshold, cooldownTicks) {
    this.failureThreshold = failureThreshold; // trips open after this many failures in a row
    this.cooldownTicks = cooldownTicks;       // how long to wait before testing again
    this.state = "closed";
    this.failureCount = 0;
    this.tick = 0;
    this.openedAtTick = null;
  }

  call(willSucceed) {
    this.tick++;

    // If we're open, check whether it's time to test the water again.
    if (this.state === "open") {
      if (this.tick - this.openedAtTick >= this.cooldownTicks) {
        this.state = "half-open"; // let exactly one trial call through
      } else {
        return "rejected"; // still cooling down: fail fast, don't even try
      }
    }

    const wasHalfOpen = this.state === "half-open";

    if (willSucceed) {
      this.state = "closed";
      this.failureCount = 0;
      return wasHalfOpen ? "recovered" : "success";
    }

    this.failureCount++;
    if (wasHalfOpen) {
      this.state = "open";
      this.openedAtTick = this.tick;
      return "half-open-failed";
    }
    if (this.failureCount >= this.failureThreshold) {
      this.state = "open";
      this.openedAtTick = this.tick;
      return "tripped";
    }
    return "failure";
  }
}

function describe(callNumber, result, breaker) {
  if (result === "rejected") return "Call " + callNumber + ": rejected -> circuit open, call skipped";
  if (result === "success") return "Call " + callNumber + ": succeeded -> state closed";
  if (result === "recovered") return "Call " + callNumber + ": half-open trial succeeded -> state closed (breaker recovered)";
  if (result === "half-open-failed") return "Call " + callNumber + ": half-open trial failed -> state open (breaker re-tripped)";
  if (result === "tripped") return "Call " + callNumber + ": failed -> state open (" + breaker.failureCount + "/" + breaker.failureThreshold + " failures, breaker tripped)";
  return "Call " + callNumber + ": failed -> state closed (" + breaker.failureCount + "/" + breaker.failureThreshold + " failures)";
}

const breaker = new CircuitBreaker(3, 2);
const attempts = [false, false, false, false, true];
const lines = [];
for (let i = 0; i < attempts.length; i++) {
  const result = breaker.call(attempts[i]);
  lines.push(describe(i + 1, result, breaker));
}
console.log(lines.join("\\n"));`,
      Python: `class CircuitBreaker:
    def __init__(self, failure_threshold, cooldown_ticks):
        self.failure_threshold = failure_threshold  # trips open after this many failures in a row
        self.cooldown_ticks = cooldown_ticks         # how long to wait before testing again
        self.state = "closed"
        self.failure_count = 0
        self.tick = 0
        self.opened_at_tick = None

    def call(self, will_succeed):
        self.tick += 1

        if self.state == "open":
            if self.tick - self.opened_at_tick >= self.cooldown_ticks:
                self.state = "half-open"  # let exactly one trial call through
            else:
                return "rejected"  # still cooling down: fail fast, don't even try

        was_half_open = self.state == "half-open"

        if will_succeed:
            self.state = "closed"
            self.failure_count = 0
            return "recovered" if was_half_open else "success"

        self.failure_count += 1
        if was_half_open:
            self.state = "open"
            self.opened_at_tick = self.tick
            return "half-open-failed"
        if self.failure_count >= self.failure_threshold:
            self.state = "open"
            self.opened_at_tick = self.tick
            return "tripped"
        return "failure"


def describe(call_number, result, breaker):
    if result == "rejected":
        return f"Call {call_number}: rejected -> circuit open, call skipped"
    if result == "success":
        return f"Call {call_number}: succeeded -> state closed"
    if result == "recovered":
        return f"Call {call_number}: half-open trial succeeded -> state closed (breaker recovered)"
    if result == "half-open-failed":
        return f"Call {call_number}: half-open trial failed -> state open (breaker re-tripped)"
    if result == "tripped":
        return f"Call {call_number}: failed -> state open ({breaker.failure_count}/{breaker.failure_threshold} failures, breaker tripped)"
    return f"Call {call_number}: failed -> state closed ({breaker.failure_count}/{breaker.failure_threshold} failures)"


breaker = CircuitBreaker(3, 2)
attempts = [False, False, False, False, True]
lines = []
for i in range(len(attempts)):
    result = breaker.call(attempts[i])
    lines.append(describe(i + 1, result, breaker))

print("\\n".join(lines))`,
    },
    output: `Call 1: failed -> state closed (1/3 failures)
Call 2: failed -> state closed (2/3 failures)
Call 3: failed -> state open (3/3 failures, breaker tripped)
Call 4: rejected -> circuit open, call skipped
Call 5: half-open trial succeeded -> state closed (breaker recovered)`,
  },
  {
    id: "auto-scaling",
    pillar: "Cloud",
    name: "Auto-scaling",
    easy: "Auto-scaling is like a shop manager calling in more cashiers when the checkout line gets long, and sending some home when the shop's quiet. The 'shop' is your app, the 'cashiers' are servers, and the 'line length' is how much load (traffic) each server is handling. Nobody has to watch it by hand — rules do the calling.",
    how: [
      "Keep measuring the load (like average CPU usage or requests per server) on a regular schedule.",
      "If load climbs above an upper threshold, add another server — up to some maximum — so the work spreads out and things stay fast.",
      "If load drops below a lower threshold, remove a server — down to some minimum — so you're not paying for idle machines. Between the two thresholds, leave things alone.",
    ],
    when: "Any app with traffic that goes up and down — a shopping site busiest in the evening, a homework app busiest the night before it's due. You want enough servers when it's busy and not too many (wasted money) when it's quiet.",
    big: "Each check is O(1) — just compare a number to two thresholds. The value isn't computational speed, it's turning a manual 3am 'add more servers!' page into an automatic rule.",
    mistakes: [
      "Setting the thresholds too close together, causing the system to add and remove servers back and forth on every small wiggle in traffic ('thrashing').",
      "Forgetting the minimum and maximum caps — no floor means you could scale to zero and go fully offline; no ceiling means a traffic spike (or a bug) could scale your bill to the moon.",
      "Reacting to a single instant reading instead of a trend — one noisy spike shouldn't trigger a scale-up.",
    ],
    code: {
      JavaScript: `function autoScale(loadReadings, startServers, minServers, maxServers, scaleUpAt, scaleDownAt) {
  let servers = startServers;
  const lines = [];

  for (const load of loadReadings) {
    let action;
    if (load > scaleUpAt) {
      if (servers < maxServers) {
        servers++;
        action = "scaling up, servers now " + servers;
      } else {
        action = "already at max servers (" + maxServers + "), can't scale up further";
      }
    } else if (load < scaleDownAt) {
      if (servers > minServers) {
        servers--;
        action = "scaling down, servers now " + servers;
      } else {
        action = "already at min servers (" + minServers + "), can't scale down further";
      }
    } else {
      action = "steady, servers stay at " + servers;
    }
    lines.push("load " + load + " -> " + action);
  }
  return lines;
}

const readings = [45, 85, 92, 35, 15, 10, 10];
const lines = autoScale(readings, 2, 1, 3, 80, 20);
console.log(lines.join("\\n"));`,
      Python: `def auto_scale(load_readings, start_servers, min_servers, max_servers, scale_up_at, scale_down_at):
    servers = start_servers
    lines = []

    for load in load_readings:
        if load > scale_up_at:
            if servers < max_servers:
                servers += 1
                action = f"scaling up, servers now {servers}"
            else:
                action = f"already at max servers ({max_servers}), can't scale up further"
        elif load < scale_down_at:
            if servers > min_servers:
                servers -= 1
                action = f"scaling down, servers now {servers}"
            else:
                action = f"already at min servers ({min_servers}), can't scale down further"
        else:
            action = f"steady, servers stay at {servers}"
        lines.append(f"load {load} -> {action}")
    return lines


readings = [45, 85, 92, 35, 15, 10, 10]
lines = auto_scale(readings, 2, 1, 3, 80, 20)
print("\\n".join(lines))`,
    },
    output: `load 45 -> steady, servers stay at 2
load 85 -> scaling up, servers now 3
load 92 -> already at max servers (3), can't scale up further
load 35 -> steady, servers stay at 3
load 15 -> scaling down, servers now 2
load 10 -> scaling down, servers now 1
load 10 -> already at min servers (1), can't scale down further`,
  },
  {
    id: "blue-green-canary-deployment",
    pillar: "Cloud",
    name: "Blue-Green / Canary Deployment",
    easy: "Imagine a restaurant testing a new recipe: instead of serving it to every customer at once, they quietly give it to 1 in every 5 tables first. If those tables are happy, more tables get the new dish; if there's a complaint, they stop before everyone's affected. A 'canary' release does the same thing with software — a small slice of real traffic gets routed to the new version (v2) while everyone else keeps using the old, proven version (v1).",
    how: [
      "Deploy the new version (v2) alongside the old one (v1) — both are running at the same time, nothing is switched off yet.",
      "Route only a small percentage of incoming requests to v2 (the 'canary'); send the rest to v1 (the 'stable' version).",
      "Watch v2's slice for errors. If it looks healthy, gradually route more traffic to it; if something's wrong, send 100% of traffic back to v1 — most users never even noticed.",
    ],
    when: "Shipping a risky change (a new payment flow, a rewritten checkout page) to a live app where you can't afford to break things for every user at once — you want a small, safe blast radius if something's wrong.",
    big: "Routing a request is O(1) — one quick check per request. The benefit isn't speed, it's limiting how many users a bad deploy can reach before you notice.",
    mistakes: [
      "Watching the canary for only a few seconds — some bugs (a memory leak, a slow database query) only show up after sustained traffic.",
      "Sending the same users to v1 then v2 on different requests, so their experience flips back and forth instead of staying consistent.",
      "Forgetting that 'blue-green' (an instant full switch between two complete environments) and 'canary' (a gradual percentage ramp-up) are two different strategies — this lesson's code demonstrates the canary style.",
    ],
    code: {
      JavaScript: `function routeRequest(requestId, canaryEvery) {
  return requestId % canaryEvery === 0 ? "v2 (canary)" : "v1 (stable)";
}

const requestIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const canaryEvery = 5; // 1 in 5 requests = 20% canary traffic
const lines = [];
let v1Count = 0;
let v2Count = 0;

for (const id of requestIds) {
  const route = routeRequest(id, canaryEvery);
  if (route.startsWith("v2")) v2Count++;
  else v1Count++;
  lines.push("Request " + id + " -> " + route);
}

console.log(lines.join("\\n"));
console.log("Summary: " + v1Count + " requests to v1, " + v2Count + " requests to v2 (20% canary)");`,
      Python: `def route_request(request_id, canary_every):
    return "v2 (canary)" if request_id % canary_every == 0 else "v1 (stable)"


request_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
canary_every = 5  # 1 in 5 requests = 20% canary traffic
lines = []
v1_count = 0
v2_count = 0

for request_id in request_ids:
    route = route_request(request_id, canary_every)
    if route.startswith("v2"):
        v2_count += 1
    else:
        v1_count += 1
    lines.append(f"Request {request_id} -> {route}")

print("\\n".join(lines))
print(f"Summary: {v1_count} requests to v1, {v2_count} requests to v2 (20% canary)")`,
    },
    output: `Request 1 -> v1 (stable)
Request 2 -> v1 (stable)
Request 3 -> v1 (stable)
Request 4 -> v1 (stable)
Request 5 -> v2 (canary)
Request 6 -> v1 (stable)
Request 7 -> v1 (stable)
Request 8 -> v1 (stable)
Request 9 -> v1 (stable)
Request 10 -> v2 (canary)
Summary: 8 requests to v1, 2 requests to v2 (20% canary)`,
  },
  {
    id: "retry-exponential-backoff",
    pillar: "Cloud",
    name: "Retry with Exponential Backoff",
    easy: "If you call a friend and they don't pick up, you don't redial instantly ten times in a row — you wait a bit, try again, and if that fails, wait even longer next time. 'Exponential backoff' is that same idea for computers: after a failed call to another service, wait a little before retrying, and double the wait each time it fails again, so you don't flood an already-struggling service with retries.",
    how: [
      "Try the operation. If it succeeds, you're done.",
      "If it fails, compute how long to wait before the next attempt: start with a base delay, and double it on every subsequent failure (1s, 2s, 4s, 8s, ...).",
      "Retry after that computed delay, up to some maximum number of attempts — if you still haven't succeeded by then, give up and report the failure.",
    ],
    when: "Calling something over a network that fails occasionally for temporary reasons — a brief network hiccup, a service that's momentarily overloaded. Backing off gives it time to recover instead of piling on more load right when it's struggling.",
    big: "O(1) work to compute each delay — it's just doubling a number. The delays themselves grow exponentially (1, 2, 4, 8, ...), which is the whole point: spread retries out fast.",
    mistakes: [
      "Retrying instantly with no delay at all, which can make an overloaded service even worse (a 'retry storm').",
      "Forgetting a maximum number of attempts, so a permanently broken dependency gets retried forever.",
      "Actually pausing execution (sleeping) inside example code just to prove the delay works — in real systems you compute the delay and schedule the retry, you don't freeze the whole program waiting.",
    ],
    code: {
      JavaScript: `function computeDelay(baseDelay, attemptNumber) {
  let delay = baseDelay;
  for (let i = 1; i < attemptNumber; i++) {
    delay *= 2; // double the wait after every failed attempt
  }
  return delay;
}

const outcomes = [false, false, false, true]; // simulate 3 failures then a success
const baseDelay = 1;
const lines = [];

for (let i = 0; i < outcomes.length; i++) {
  const attemptNumber = i + 1;
  const succeeded = outcomes[i];
  if (succeeded) {
    lines.push("Attempt " + attemptNumber + ": succeeded");
  } else {
    const delay = computeDelay(baseDelay, attemptNumber);
    lines.push("Attempt " + attemptNumber + ": failed, waiting " + delay + "s before retry");
  }
}

console.log(lines.join("\\n"));`,
      Python: `def compute_delay(base_delay, attempt_number):
    delay = base_delay
    for _ in range(1, attempt_number):
        delay *= 2  # double the wait after every failed attempt
    return delay


outcomes = [False, False, False, True]  # simulate 3 failures then a success
base_delay = 1
lines = []

for i in range(len(outcomes)):
    attempt_number = i + 1
    succeeded = outcomes[i]
    if succeeded:
        lines.append(f"Attempt {attempt_number}: succeeded")
    else:
        delay = compute_delay(base_delay, attempt_number)
        lines.append(f"Attempt {attempt_number}: failed, waiting {delay}s before retry")

print("\\n".join(lines))`,
    },
    output: `Attempt 1: failed, waiting 1s before retry
Attempt 2: failed, waiting 2s before retry
Attempt 3: failed, waiting 4s before retry
Attempt 4: succeeded`,
  },
  {
    id: "cdn-cache-ttl",
    pillar: "Cloud",
    name: "CDN Cache with TTL",
    easy: "A CDN (content delivery network) is like keeping popular snacks at the corner shop instead of making every customer travel to the far-away warehouse. It's a cache — a copy of your content kept close to the user so it loads fast. But snacks go stale, so each copy gets a TTL (time to live): how long it's allowed to sit on the shelf before the shop has to fetch a fresh one from the warehouse (the 'origin server').",
    how: [
      "The first time something is requested, there's nothing on the shelf yet — that's a cache MISS. Fetch it from the origin and put a copy on the shelf, stamped with an expiry time (now plus the TTL).",
      "Later requests before the expiry time check the shelf and find it there — a cache HIT — and get served instantly without bothering the origin.",
      "Once the expiry time passes, the copy is stale. The next request is a MISS again: fetch a fresh copy from the origin and reset the expiry.",
    ],
    when: "Serving content that doesn't change every second — images, videos, articles, even API responses — to users spread across the world. Caching it near them (and refreshing it periodically via TTL) makes pages load faster and takes load off the origin server.",
    big: "A cache lookup is O(1) — just compare the current time to a stored expiry. The real win is skipping a slow trip to the origin server entirely on a HIT.",
    mistakes: [
      "Setting the TTL too long, so users see stale content long after it's changed (like an old price on a product page).",
      "Setting the TTL too short, so you barely benefit from caching at all and the origin server gets hit almost every time anyway.",
      "Using real wall-clock time in examples or tests instead of a fixed, passed-in time — that makes the behavior non-deterministic and hard to verify.",
    ],
    code: {
      JavaScript: `class TtlCache {
  constructor(ttl) {
    this.ttl = ttl; // time-to-live: how many "seconds" an entry stays valid
    this.value = null;
    this.expiresAt = null; // null means nothing cached yet
  }

  get(key, now) {
    const isCached = this.expiresAt !== null && now < this.expiresAt;
    if (isCached) {
      return { hit: true, expiresAt: this.expiresAt };
    }
    // Cache miss (either never set or expired): pretend we fetch from the origin server.
    this.value = "content-for-" + key;
    this.expiresAt = now + this.ttl;
    return { hit: false, expiresAt: this.expiresAt };
  }
}

const cache = new TtlCache(10);
const requestTimes = [0, 5, 12, 20, 25];
const lines = [];

for (const now of requestTimes) {
  const result = cache.get("homepage", now);
  if (result.hit) {
    lines.push("t=" + now + ": HIT (served from cache, expires at t=" + result.expiresAt + ")");
  } else {
    lines.push("t=" + now + ": MISS (fetched from origin, cached until t=" + result.expiresAt + ")");
  }
}

console.log(lines.join("\\n"));`,
      Python: `class TtlCache:
    def __init__(self, ttl):
        self.ttl = ttl  # time-to-live: how many "seconds" an entry stays valid
        self.value = None
        self.expires_at = None  # None means nothing cached yet

    def get(self, key, now):
        is_cached = self.expires_at is not None and now < self.expires_at
        if is_cached:
            return {"hit": True, "expires_at": self.expires_at}
        # Cache miss (either never set or expired): pretend we fetch from the origin server.
        self.value = f"content-for-{key}"
        self.expires_at = now + self.ttl
        return {"hit": False, "expires_at": self.expires_at}


cache = TtlCache(10)
request_times = [0, 5, 12, 20, 25]
lines = []

for now in request_times:
    result = cache.get("homepage", now)
    if result["hit"]:
        lines.append(f"t={now}: HIT (served from cache, expires at t={result['expires_at']})")
    else:
        lines.append(f"t={now}: MISS (fetched from origin, cached until t={result['expires_at']})")

print("\\n".join(lines))`,
    },
    output: `t=0: MISS (fetched from origin, cached until t=10)
t=5: HIT (served from cache, expires at t=10)
t=12: MISS (fetched from origin, cached until t=22)
t=20: HIT (served from cache, expires at t=22)
t=25: MISS (fetched from origin, cached until t=35)`,
  },
  {
    id: "message-queue-decoupling",
    pillar: "Cloud",
    name: "Message Queue Decoupling",
    easy: "Think of a restaurant kitchen's order tickets. The waiter (the 'producer') clips a new ticket to the rail and immediately goes back to serving tables — they don't stand around waiting for the cook to finish. The cook (the 'worker') pulls tickets off the rail one at a time, in the order they arrived, and cooks each dish. The order rail is the 'message queue' — it decouples the waiter from the cook so neither has to wait on the other.",
    how: [
      "The producer adds a job to the back of the queue and moves on immediately — it doesn't wait for the job to be handled.",
      "The queue holds jobs in order, first in, first out (FIFO): the first job added is the first one a worker will pick up.",
      "The worker takes a job off the front of the queue, processes it, then takes the next one — repeating until the queue is empty.",
    ],
    when: "Any time one part of your system produces work faster or at different moments than another part can handle it — sending emails, resizing uploaded images, generating reports. Decoupling them means a slow or temporarily overwhelmed worker doesn't block whoever's producing the jobs.",
    big: "Enqueue and dequeue are both O(1) with a proper queue. The architectural win is that producer and worker can run at their own pace, or even be scaled independently.",
    mistakes: [
      "Having the producer wait for the worker to finish before moving on — that defeats the entire point of decoupling them.",
      "Losing track of order when it matters (like applying database updates out of sequence) — a plain queue is FIFO precisely to avoid that.",
      "Not handling a job that fails partway through — a real queue needs a plan for retries or a 'dead letter' pile for jobs that keep failing.",
    ],
    code: {
      JavaScript: `class JobQueue {
  constructor() {
    this.jobs = [];
  }

  enqueue(job) {
    this.jobs.push(job); // producer drops work at the back of the line
  }

  dequeue() {
    if (this.jobs.length === 0) return null;
    return this.jobs.shift(); // worker picks up from the front: first in, first out
  }

  size() {
    return this.jobs.length;
  }
}

const queue = new JobQueue();
const incomingJobs = ["send-email:alice", "resize-image:cat.png", "send-email:bob", "generate-report:q3"];

for (const job of incomingJobs) {
  queue.enqueue(job);
}
console.log("Producer enqueued " + incomingJobs.length + " jobs. Queue size: " + queue.size());

const lines = [];
let jobNumber = 0;
let processed = queue.dequeue();
while (processed !== null) {
  jobNumber++;
  lines.push("Worker processed job " + jobNumber + ": " + processed);
  processed = queue.dequeue();
}
console.log(lines.join("\\n"));
console.log("Queue size after processing: " + queue.size());`,
      Python: `class JobQueue:
    def __init__(self):
        self.jobs = []

    def enqueue(self, job):
        self.jobs.append(job)  # producer drops work at the back of the line

    def dequeue(self):
        if len(self.jobs) == 0:
            return None
        return self.jobs.pop(0)  # worker picks up from the front: first in, first out

    def size(self):
        return len(self.jobs)


queue = JobQueue()
incoming_jobs = ["send-email:alice", "resize-image:cat.png", "send-email:bob", "generate-report:q3"]

for job in incoming_jobs:
    queue.enqueue(job)
print(f"Producer enqueued {len(incoming_jobs)} jobs. Queue size: {queue.size()}")

lines = []
job_number = 0
processed = queue.dequeue()
while processed is not None:
    job_number += 1
    lines.append(f"Worker processed job {job_number}: {processed}")
    processed = queue.dequeue()
print("\\n".join(lines))
print(f"Queue size after processing: {queue.size()}")`,
    },
    output: `Producer enqueued 4 jobs. Queue size: 4
Worker processed job 1: send-email:alice
Worker processed job 2: resize-image:cat.png
Worker processed job 3: send-email:bob
Worker processed job 4: generate-report:q3
Queue size after processing: 0`,
  },
];

export default lessons;
