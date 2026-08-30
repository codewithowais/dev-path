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
    easy: "Think of the circuit breaker in your house. If something plugged in starts drawing too much power, the breaker flips off ('trips') to stop a fire. This circuit breaker does the same job for code. It sits between your app and another service it depends on, like a database or a payment API. If that service keeps failing, the breaker trips and stops sending it requests for a while. That gives the service room to recover, and it stops your app from getting stuck waiting on calls that were never going to work anyway.",
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
    easy: "Picture a shop manager calling in more cashiers when the checkout line gets long, and sending some home when the shop is quiet. Auto-scaling does the same thing for a website. The 'cashiers' are servers — computers running your app. The 'line length' is the load: how much traffic is hitting each server. A watching process checks the load on a schedule and adds or removes servers automatically, so nobody has to sit there watching it by hand.",
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
    easy: "Imagine a restaurant testing a new recipe. Instead of serving it to every table at once, the kitchen quietly gives it to just 1 in every 5 tables first. If those diners are happy, more tables get the new dish. If someone complains, the kitchen stops before anyone else is affected. That's a 'canary' release. A small slice of real users get the new version of your app (called v2), while everyone else keeps using the old, proven version (v1) — so you can watch the small slice closely before trusting it with everyone.",
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
    easy: "If you call a friend and they don't pick up, you don't redial ten times in a row right away. You wait a bit, try again, and if that fails too, you wait even longer next time. That's 'exponential backoff,' and computers use the same trick. After a failed call to another service, wait a short time before retrying. Then double that wait every time it fails again — 1 second, 2 seconds, 4 seconds, and so on. This stops you from flooding an already-struggling service with retries.",
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
    easy: "A CDN (content delivery network) is like a corner shop that keeps popular snacks nearby, instead of making every customer travel to a warehouse across town. The warehouse is the 'origin server' — the one true copy of your content. The corner shop is a 'cache' — a copy kept close to the user so it loads fast. But snacks go stale, so every copy on the shelf gets a TTL (time to live): a timer for how long it's allowed to sit there before the shop has to fetch a fresh one from the warehouse.",
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
    easy: "Think of a restaurant kitchen's order tickets. The waiter — the 'producer,' the part that creates work — clips a new ticket to the rail and goes straight back to serving tables. No standing around waiting for the cook. The cook — the 'worker,' the part that does the work — takes tickets off the rail one at a time, in the order they arrived, and cooks each dish. The order rail is the 'message queue.' It lets the waiter and the cook each work at their own pace, instead of one blocking the other.",
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
  {
    id: "health-check-failover",
    pillar: "Cloud",
    name: "Health Check & Failover",
    easy: "A health check is like a manager doing a quick knock on an employee's door every few minutes, just to see if they're still there. Failover is what happens if nobody answers: the manager hands the work to the backup person instead, until the first one shows back up. In cloud systems, a small watcher process 'knocks' on a server (sends it a health check) on a regular schedule. If the main server (the 'primary') doesn't answer, the app switches ('fails over') to a backup server so users don't notice anything went wrong. When the primary answers again, the app can switch back — that's called 'failing back.'",
    how: [
      "On every tick (a fixed check-in point, standing in for a moment in time — not a real clock), ask the primary server: are you healthy?",
      "If it answers healthy, keep serving traffic from the primary. Nothing changes.",
      "If it doesn't answer (it's down), fail over right away: start serving traffic from the backup server instead.",
      "Keep checking the primary in the background. As soon as it's healthy again, fail back: switch traffic back to the primary.",
    ],
    when: "Any service where downtime is costly — checkout pages, login systems, anything users expect to 'just work.' A single server can crash, lose its network connection, or need a restart at any moment. Health checks catch that fast, and failover means users barely notice it happened.",
    big: "Each health check is O(1) — one quick status read. The value here isn't speed, it's availability: a system with failover can survive a server dying; one without it just goes down along with that server.",
    mistakes: [
      "Checking too rarely, so a dead server keeps getting real traffic for a long time before anyone notices.",
      "Failing back to the primary the instant it answers once — like a circuit breaker's half-open test, one lucky reply doesn't prove it's stable again.",
      "Having no real backup at all — failover only helps if the backup can actually handle the traffic being sent to it.",
    ],
    code: {
      JavaScript: `function checkHealth(isUp) {
  return isUp ? "healthy" : "down";
}

function runFailover(primarySchedule) {
  let active = "primary";
  const lines = [];
  let backupTicks = 0;

  for (let i = 0; i < primarySchedule.length; i++) {
    const tick = i + 1;
    const status = checkHealth(primarySchedule[i]);

    if (status === "healthy") {
      if (active === "backup") {
        lines.push("Tick " + tick + ": primary check -> healthy, failing back to primary (serving from primary)");
        active = "primary";
      } else {
        lines.push("Tick " + tick + ": primary check -> healthy (serving from primary)");
      }
    } else {
      if (active === "primary") {
        lines.push("Tick " + tick + ": primary check -> down, failing over to backup (serving from backup)");
        active = "backup";
      } else {
        lines.push("Tick " + tick + ": primary check -> down (serving from backup)");
      }
    }

    if (active === "backup") backupTicks++;
  }

  return { lines, backupTicks };
}

const primarySchedule = [true, true, false, false, true, true];
const result = runFailover(primarySchedule);
console.log(result.lines.join("\\n"));
console.log("Summary: " + result.backupTicks + " of " + primarySchedule.length + " ticks served by backup (failover working)");`,
      Python: `def check_health(is_up):
    return "healthy" if is_up else "down"


def run_failover(primary_schedule):
    active = "primary"
    lines = []
    backup_ticks = 0

    for i in range(len(primary_schedule)):
        tick = i + 1
        status = check_health(primary_schedule[i])

        if status == "healthy":
            if active == "backup":
                lines.append(f"Tick {tick}: primary check -> healthy, failing back to primary (serving from primary)")
                active = "primary"
            else:
                lines.append(f"Tick {tick}: primary check -> healthy (serving from primary)")
        else:
            if active == "primary":
                lines.append(f"Tick {tick}: primary check -> down, failing over to backup (serving from backup)")
                active = "backup"
            else:
                lines.append(f"Tick {tick}: primary check -> down (serving from backup)")

        if active == "backup":
            backup_ticks += 1

    return lines, backup_ticks


primary_schedule = [True, True, False, False, True, True]
lines, backup_ticks = run_failover(primary_schedule)
print("\\n".join(lines))
print(f"Summary: {backup_ticks} of {len(primary_schedule)} ticks served by backup (failover working)")`,
    },
    output: `Tick 1: primary check -> healthy (serving from primary)
Tick 2: primary check -> healthy (serving from primary)
Tick 3: primary check -> down, failing over to backup (serving from backup)
Tick 4: primary check -> down (serving from backup)
Tick 5: primary check -> healthy, failing back to primary (serving from primary)
Tick 6: primary check -> healthy (serving from primary)
Summary: 2 of 6 ticks served by backup (failover working)`,
  },
  {
    id: "rolling-deployment",
    pillar: "Cloud",
    name: "Rolling Deployment",
    easy: "Imagine repainting a long fence. You don't strip every plank bare at once — the whole yard would sit unprotected. Instead you repaint a few planks, check they look right, then move to the next few. A rolling deployment updates a group of servers the same way. Instead of replacing every server with the new version at once, it updates a few at a time (a 'batch'), checks each one is healthy, and only then moves on to the next batch. At every moment, most of the fence — most of your servers — is still standing and serving traffic.",
    how: [
      "Split all the servers into small batches (say, 2 at a time) instead of touching everyone at once.",
      "Update one batch: take those servers off the old version (v1) and put them on the new version (v2).",
      "Run a health check on each just-updated server. If it's healthy, move on to the next batch.",
      "If a server fails its health check, roll it back and retry before continuing — never leave a broken server serving real traffic.",
    ],
    when: "Deploying a new version of an app that runs on many servers, where you can't afford to take everything down at once. Rolling deployment keeps the app up the whole time — some servers are always still on the old, working version while others get updated.",
    big: "Updating N servers in batches of size B takes roughly N/B rounds — still O(N) total work, just spread out safely over time instead of one giant all-at-once switch.",
    mistakes: [
      "Using a batch size so large it's basically 'update everything at once' — that brings back the exact all-or-nothing risk a rolling deployment is meant to avoid.",
      "Skipping the health check after each batch, so a broken update quietly spreads to every server before anyone notices.",
      "Having no rollback plan for a server that fails its check — 'push forward and hope' isn't a strategy.",
    ],
    code: {
      JavaScript: `function healthCheck(server, attempt) {
  if (server === "s4" && attempt === 1) return false;
  return true;
}

function rollingDeploy(servers, batchSize) {
  const lines = [];
  let batchNumber = 0;

  for (let i = 0; i < servers.length; i += batchSize) {
    batchNumber++;
    const batch = servers.slice(i, i + batchSize);
    for (const server of batch) {
      lines.push("Updating " + server + ": v1 -> v2 (batch " + batchNumber + ")");
      let attempt = 1;
      let healthy = healthCheck(server, attempt);
      if (healthy) {
        lines.push("Health check " + server + ": healthy");
      } else {
        lines.push("Health check " + server + ": down, rolling back and retrying");
        attempt = 2;
        healthy = healthCheck(server, attempt);
        lines.push("Health check " + server + " (retry): " + (healthy ? "healthy" : "down"));
      }
    }
  }

  return lines;
}

const servers = ["s1", "s2", "s3", "s4", "s5"];
const lines = rollingDeploy(servers, 2);
console.log(lines.join("\\n"));
console.log("Rolling deployment complete: " + servers.length + "/" + servers.length + " servers on v2");`,
      Python: `def health_check(server, attempt):
    if server == "s4" and attempt == 1:
        return False
    return True


def rolling_deploy(servers, batch_size):
    lines = []
    batch_number = 0

    for i in range(0, len(servers), batch_size):
        batch_number += 1
        batch = servers[i:i + batch_size]
        for server in batch:
            lines.append(f"Updating {server}: v1 -> v2 (batch {batch_number})")
            attempt = 1
            healthy = health_check(server, attempt)
            if healthy:
                lines.append(f"Health check {server}: healthy")
            else:
                lines.append(f"Health check {server}: down, rolling back and retrying")
                attempt = 2
                healthy = health_check(server, attempt)
                lines.append(f"Health check {server} (retry): {'healthy' if healthy else 'down'}")

    return lines


servers = ["s1", "s2", "s3", "s4", "s5"]
lines = rolling_deploy(servers, 2)
print("\\n".join(lines))
print(f"Rolling deployment complete: {len(servers)}/{len(servers)} servers on v2")`,
    },
    output: `Updating s1: v1 -> v2 (batch 1)
Health check s1: healthy
Updating s2: v1 -> v2 (batch 1)
Health check s2: healthy
Updating s3: v1 -> v2 (batch 2)
Health check s3: healthy
Updating s4: v1 -> v2 (batch 2)
Health check s4: down, rolling back and retrying
Health check s4 (retry): healthy
Updating s5: v1 -> v2 (batch 3)
Health check s5: healthy
Rolling deployment complete: 5/5 servers on v2`,
  },
  {
    id: "feature-flags",
    pillar: "Cloud",
    name: "Feature Flags",
    easy: "A feature flag is a light switch for a piece of code. Flip it on, and users see the new feature; flip it off, and they don't — instantly, without deploying any new code. Some flags are plain on/off switches for everyone. Others are more like a dimmer switch: they turn a feature on for only a percentage of users first (a 'rollout'), so you can try it on a small group before flipping it on for everyone else.",
    how: [
      "Store each flag's setting somewhere the running app can read — not baked directly into the code.",
      "For a simple flag, just check: is it on or off? Show the feature only if it's on.",
      "For a percentage rollout, use something stable about the user (like their user ID) to decide if they're in the rolled-out group, so the same user always gets the same answer.",
      "To change behavior, flip the flag's stored value. Every running copy of the app picks up the new setting right away — no redeploying, no restart.",
    ],
    when: "Launching a risky or half-finished feature, running an A/B test, or needing an instant 'off switch' for something misbehaving in production. Flags separate 'deploying code' from 'turning a feature on' — you can ship the code dark, then flip it on later with zero downtime.",
    big: "Checking a flag is O(1): a single lookup, plus one modulo calculation for a rollout flag. The real value is speed of change — flipping a stored value is instant, versus a full build-and-deploy cycle to change behavior.",
    mistakes: [
      "Leaving old, unused flags in the code forever — each one is a fork in the logic that someone still has to remember exists.",
      "Using something unstable (like the current time) to decide rollout membership, so the same user flips between 'in' and 'out' on different requests.",
      "Forgetting that a flag is still code that needs testing — both the on path and the off path have to actually work.",
    ],
    code: {
      JavaScript: `function isEnabled(flag, userId, booleanFlags, rolloutFlags) {
  if (Object.prototype.hasOwnProperty.call(booleanFlags, flag)) {
    return booleanFlags[flag];
  }
  if (Object.prototype.hasOwnProperty.call(rolloutFlags, flag)) {
    return (userId % 100) < rolloutFlags[flag];
  }
  return false;
}

function onOff(value) {
  return value ? "on" : "off";
}

const booleanFlags = { "dark-mode": true, "beta-banner": false };
const rolloutFlags = { "new-search": 30 };

const checks = [
  ["dark-mode", 7],
  ["beta-banner", 7],
  ["new-search", 7],
  ["new-search", 42],
];

const lines = [];
for (const [flag, userId] of checks) {
  const enabled = isEnabled(flag, userId, booleanFlags, rolloutFlags);
  lines.push("Flag '" + flag + "' for user " + userId + ": " + onOff(enabled));
}

console.log(lines.join("\\n"));

// Flip the switch at runtime -- no redeploy needed.
booleanFlags["dark-mode"] = false;
const after = isEnabled("dark-mode", 7, booleanFlags, rolloutFlags);
console.log("After flipping the switch, flag 'dark-mode' for user 7: " + onOff(after));`,
      Python: `def is_enabled(flag, user_id, boolean_flags, rollout_flags):
    if flag in boolean_flags:
        return boolean_flags[flag]
    if flag in rollout_flags:
        return (user_id % 100) < rollout_flags[flag]
    return False


def on_off(value):
    return "on" if value else "off"


boolean_flags = {"dark-mode": True, "beta-banner": False}
rollout_flags = {"new-search": 30}

checks = [
    ("dark-mode", 7),
    ("beta-banner", 7),
    ("new-search", 7),
    ("new-search", 42),
]

lines = []
for flag, user_id in checks:
    enabled = is_enabled(flag, user_id, boolean_flags, rollout_flags)
    lines.append(f"Flag '{flag}' for user {user_id}: {on_off(enabled)}")

print("\\n".join(lines))

# Flip the switch at runtime -- no redeploy needed.
boolean_flags["dark-mode"] = False
after = is_enabled("dark-mode", 7, boolean_flags, rollout_flags)
print(f"After flipping the switch, flag 'dark-mode' for user 7: {on_off(after)}")`,
    },
    output: `Flag 'dark-mode' for user 7: on
Flag 'beta-banner' for user 7: off
Flag 'new-search' for user 7: on
Flag 'new-search' for user 42: off
After flipping the switch, flag 'dark-mode' for user 7: off`,
  },
  {
    id: "load-shedding",
    pillar: "Cloud",
    name: "Load Shedding",
    easy: "Think of a busy hospital emergency room on a chaotic night. The ER doesn't treat people in the order they walked in — it treats the most critical cases first, and if it's completely overwhelmed, patients with minor issues have to wait or go elsewhere. Load shedding is the same idea for a computer system. When too many requests arrive at once, the system doesn't try to handle every single one and risk crashing. It sorts them by priority and deliberately drops ('sheds') the low-priority ones, so the truly important work still gets done.",
    how: [
      "Give every incoming request a priority — for example, critical, normal, or low.",
      "Compare how many requests just arrived to how much the system can actually handle at once (its capacity).",
      "If there's room for everyone, serve them all. No shedding needed.",
      "If there isn't enough room, sort by priority and serve only as many as fit, starting with the most critical. Drop the rest instead of letting everyone slow down or the whole system crash.",
    ],
    when: "Any system that can get hit with more traffic than it can safely process — a ticket site during a big on-sale moment, a search backend during a traffic spike. It's better to fully serve the most important requests and reject the rest than to accept everything and serve every request badly, or crash entirely.",
    big: "Sorting the current batch of requests by priority is O(n log n) for n requests; deciding what to keep is then a simple O(n) scan. The payoff is stability — a system that sheds load stays responsive, one that doesn't can fall over completely.",
    mistakes: [
      "Treating every request as equal priority — then shedding is basically random, and you might drop a checkout request while keeping a background image load.",
      "Never shedding anything, hoping the system can 'just handle it' — an overloaded system with no shedding often ends up serving nobody well, or crashing outright.",
      "Shedding too aggressively and dropping requests the system actually had capacity for.",
    ],
    code: {
      JavaScript: `function priorityRank(priority) {
  if (priority === "critical") return 3;
  if (priority === "normal") return 2;
  return 1; // low
}

function processTick(tickNumber, requests, capacity) {
  const total = requests.length;
  let served = requests;
  let shed = [];

  if (total > capacity) {
    const ranked = requests
      .map((request, index) => ({ request, index, rank: priorityRank(request[1]) }))
      .sort((a, b) => b.rank - a.rank || a.index - b.index);
    served = ranked.slice(0, capacity).map((entry) => entry.request);
    shed = ranked.slice(capacity).map((entry) => entry.request);
  }

  const servedIds = served.map((request) => request[0]);
  const shedIds = shed.map((request) => request[0]);
  const servedText = servedIds.length > 0 ? servedIds.join(", ") : "none";
  const shedText = shedIds.length > 0 ? shedIds.join(", ") : "none";

  return {
    line: "Tick " + tickNumber + ": " + total + " requests in, capacity " + capacity + " -> served: " + servedText + "; shed (dropped): " + shedText,
    servedCount: served.length,
    shedCount: shed.length,
  };
}

const capacity = 3;
const ticks = [
  [["r1", "critical"], ["r2", "normal"], ["r3", "low"]],
  [["r4", "low"], ["r5", "critical"], ["r6", "normal"], ["r7", "low"]],
  [["r8", "low"], ["r9", "low"], ["r10", "low"], ["r11", "low"]],
];

const lines = [];
let totalServed = 0;
let totalShed = 0;

for (let i = 0; i < ticks.length; i++) {
  const result = processTick(i + 1, ticks[i], capacity);
  lines.push(result.line);
  totalServed += result.servedCount;
  totalShed += result.shedCount;
}

console.log(lines.join("\\n"));
console.log("Summary: " + totalServed + " requests served, " + totalShed + " requests shed across " + ticks.length + " ticks");`,
      Python: `def priority_rank(priority):
    if priority == "critical":
        return 3
    if priority == "normal":
        return 2
    return 1  # low


def process_tick(tick_number, requests, capacity):
    total = len(requests)
    served = requests
    shed = []

    if total > capacity:
        ranked = sorted(
            enumerate(requests),
            key=lambda item: (-priority_rank(item[1][1]), item[0]),
        )
        served = [request for _, request in ranked[:capacity]]
        shed = [request for _, request in ranked[capacity:]]

    served_ids = [request[0] for request in served]
    shed_ids = [request[0] for request in shed]
    served_text = ", ".join(served_ids) if served_ids else "none"
    shed_text = ", ".join(shed_ids) if shed_ids else "none"

    line = f"Tick {tick_number}: {total} requests in, capacity {capacity} -> served: {served_text}; shed (dropped): {shed_text}"
    return line, len(served), len(shed)


capacity = 3
ticks = [
    [("r1", "critical"), ("r2", "normal"), ("r3", "low")],
    [("r4", "low"), ("r5", "critical"), ("r6", "normal"), ("r7", "low")],
    [("r8", "low"), ("r9", "low"), ("r10", "low"), ("r11", "low")],
]

lines = []
total_served = 0
total_shed = 0

for i in range(len(ticks)):
    line, served_count, shed_count = process_tick(i + 1, ticks[i], capacity)
    lines.append(line)
    total_served += served_count
    total_shed += shed_count

print("\\n".join(lines))
print(f"Summary: {total_served} requests served, {total_shed} requests shed across {len(ticks)} ticks")`,
    },
    output: `Tick 1: 3 requests in, capacity 3 -> served: r1, r2, r3; shed (dropped): none
Tick 2: 4 requests in, capacity 3 -> served: r5, r6, r4; shed (dropped): r7
Tick 3: 4 requests in, capacity 3 -> served: r8, r9, r10; shed (dropped): r11
Summary: 9 requests served, 2 requests shed across 3 ticks`,
  },
  {
    id: "serverless-cold-starts",
    pillar: "Cloud",
    name: "Serverless & Cold Starts",
    easy: "Think of a pop-up food stall that packs up and goes home if nobody's ordering for a while, then has to unfold the tent, light the grill, and set everything up again before it can serve the next customer. That slow reopening is a 'cold start.' Serverless computing works the same way: your code doesn't run on a server that's always on. It runs in a container that starts up on demand, then shuts down after sitting idle for a while. If a request arrives while the container is already up and running (it's 'warm'), it's served right away. If the container had shut down (it's 'cold'), there's extra delay to start it back up before your code can even run. This lesson uses fixed numbers to stand in for time, not a real clock or timer, so it gives the same result every time.",
    how: [
      "Track the tick (a fixed point in a sequence, standing in for a moment in time) of the last request that was served.",
      "When a new request arrives, check the gap since that last request. If the gap is bigger than the idle timeout, the container has shut down.",
      "If the container is gone, this call is a COLD start: pay a fixed startup cost first, then do the actual work.",
      "If the container is still around (the gap is small), this call is WARM: skip the startup cost and go straight to the work.",
    ],
    when: "Any 'serverless' function (AWS Lambda, Cloud Functions, and similar) that only runs when it's called, instead of sitting on all the time. Understanding cold starts matters whenever you need consistently fast responses — the first request after a quiet stretch will always be slower than the ones right after it.",
    big: "Each call is O(1) to classify — one subtraction and a comparison. The real-world cost is the cold-start penalty itself, which can be many times the actual work time. That's why keeping functions 'warm' is a common optimization.",
    mistakes: [
      "Assuming every call is equally fast — capacity planning and latency budgets both need to account for the slower, occasional cold ones.",
      "Setting the idle timeout so short that a function barely stays warm between real, spaced-out requests.",
      "Using a real timer or sleep in an example just to simulate time passing — that makes it slow and non-deterministic. Use a fixed number to stand in for time instead.",
    ],
    code: {
      JavaScript: `function classifyCall(currentTick, lastTick, idleTimeout) {
  if (lastTick === null || currentTick - lastTick > idleTimeout) {
    return "cold";
  }
  return "warm";
}

function runCalls(callTicks, idleTimeout, coldStartCost, executionCost) {
  const lines = [];
  let lastTick = null;
  let coldCount = 0;
  let warmCount = 0;
  let totalTime = 0;

  for (const tick of callTicks) {
    const kind = classifyCall(tick, lastTick, idleTimeout);
    if (kind === "cold") {
      const time = coldStartCost + executionCost;
      lines.push("Call at tick " + tick + ": COLD start (container was down) -> startup " + coldStartCost + " + work " + executionCost + " = " + time + "ms");
      coldCount++;
      totalTime += time;
    } else {
      lines.push("Call at tick " + tick + ": WARM (container already running) -> work " + executionCost + " = " + executionCost + "ms");
      warmCount++;
      totalTime += executionCost;
    }
    lastTick = tick;
  }

  return { lines, coldCount, warmCount, totalTime };
}

const callTicks = [1, 2, 3, 10, 11, 20];
const result = runCalls(callTicks, 3, 100, 20);

console.log(result.lines.join("\\n"));
console.log("Summary: " + result.coldCount + " cold starts, " + result.warmCount + " warm calls, total time " + result.totalTime + "ms");`,
      Python: `def classify_call(current_tick, last_tick, idle_timeout):
    if last_tick is None or current_tick - last_tick > idle_timeout:
        return "cold"
    return "warm"


def run_calls(call_ticks, idle_timeout, cold_start_cost, execution_cost):
    lines = []
    last_tick = None
    cold_count = 0
    warm_count = 0
    total_time = 0

    for tick in call_ticks:
        kind = classify_call(tick, last_tick, idle_timeout)
        if kind == "cold":
            time = cold_start_cost + execution_cost
            lines.append(f"Call at tick {tick}: COLD start (container was down) -> startup {cold_start_cost} + work {execution_cost} = {time}ms")
            cold_count += 1
            total_time += time
        else:
            lines.append(f"Call at tick {tick}: WARM (container already running) -> work {execution_cost} = {execution_cost}ms")
            warm_count += 1
            total_time += execution_cost
        last_tick = tick

    return lines, cold_count, warm_count, total_time


call_ticks = [1, 2, 3, 10, 11, 20]
lines, cold_count, warm_count, total_time = run_calls(call_ticks, 3, 100, 20)

print("\\n".join(lines))
print(f"Summary: {cold_count} cold starts, {warm_count} warm calls, total time {total_time}ms")`,
    },
    output: `Call at tick 1: COLD start (container was down) -> startup 100 + work 20 = 120ms
Call at tick 2: WARM (container already running) -> work 20 = 20ms
Call at tick 3: WARM (container already running) -> work 20 = 20ms
Call at tick 10: COLD start (container was down) -> startup 100 + work 20 = 120ms
Call at tick 11: WARM (container already running) -> work 20 = 20ms
Call at tick 20: COLD start (container was down) -> startup 100 + work 20 = 120ms
Summary: 3 cold starts, 3 warm calls, total time 420ms`,
  },
  {
    id: "object-storage-buckets-keys",
    pillar: "Cloud",
    name: "Object Storage (Buckets & Keys)",
    easy: "Picture a self-storage facility with an endless number of rooms, and every room has an endless number of lockers. Each locker has a unique label taped to the front — not a folder path, just one long label like '2024/jan/sunset.png'. That's object storage. The room is a 'bucket' — a named container you create once. The label on each locker is its 'key' — a unique name (no two lockers in the same room share a label). What's inside the locker — the actual file, like a photo or a video — is the 'object'. Even though keys often look like folder paths with slashes in them, there are no real subfolders here; it's genuinely one flat room of infinitely many labeled lockers, and every locker is reachable directly by its label without walking through any folders to find it.",
    how: [
      "Create a bucket first — a named container that will hold your objects (like naming the storage room before renting lockers in it).",
      "Store something with 'put': give it a bucket, a unique key (the label), and the object itself. If that exact key already exists in that bucket, this simply overwrites it.",
      "Fetch something with 'get': give the bucket and key. If a locker with that exact label exists, you get its contents back (a HIT); if not, you get nothing (a MISS) — there's no partial match.",
      "Browse what's in a bucket with 'list', optionally filtering by prefix (everything whose key starts with a given string) — the closest thing to 'listing a folder', even though it's really just a string match over flat labels.",
    ],
    when: "Storing files that don't need a database's structure — user-uploaded photos, video files, PDFs, backups, log archives. Anything from a few kilobytes to many gigabytes, that you mostly write once and read many times, is a natural fit for object storage instead of trying to cram it into a regular database.",
    big: "Put and get are O(1) — a direct lookup by key, regardless of how many other objects exist in the bucket. Listing by prefix costs O(n) in the number of matching keys, since every match has to be found and returned.",
    mistakes: [
      "Expecting real folders and subfolder operations (like renaming a 'folder') — a key with slashes in it is still just one flat string; renaming a 'folder' means rewriting every key that starts with that prefix, one by one.",
      "Assuming 'get' does partial or fuzzy matching on the key — it's an exact match only; even one different character is a MISS, not a close hit.",
      "Reusing the same key for different content without meaning to — 'put' silently overwrites, so a naming collision quietly destroys the previous object with no built-in warning.",
    ],
    code: {
      JavaScript: `class ObjectStore {
  constructor() {
    this.buckets = {}; // bucket name -> { key: sizeInBytes }
  }

  createBucket(name) {
    this.buckets[name] = {};
  }

  put(bucket, key, sizeBytes) {
    this.buckets[bucket][key] = sizeBytes;
  }

  get(bucket, key) {
    const objects = this.buckets[bucket];
    if (Object.prototype.hasOwnProperty.call(objects, key)) {
      return { hit: true, size: objects[key] };
    }
    return { hit: false, size: null };
  }

  list(bucket, prefix) {
    const objects = this.buckets[bucket];
    const keys = Object.keys(objects).filter((key) => key.startsWith(prefix));
    keys.sort();
    return keys;
  }
}

const store = new ObjectStore();
const lines = [];

store.createBucket("photos");
lines.push("Created bucket 'photos'");

const uploads = [
  ["2024/jan/sunset.png", 612],
  ["2024/jan/party.png", 305],
  ["2024/feb/cat.png", 802],
  ["2023/dec/fireworks.png", 1200],
];

for (const [key, size] of uploads) {
  store.put("photos", key, size);
  lines.push("Uploaded photos/" + key + " (" + size + " bytes)");
}

const listed = store.list("photos", "2024/jan/");
lines.push("Listing photos/2024/jan/* -> " + listed.join(", "));

const hit = store.get("photos", "2024/jan/sunset.png");
lines.push("GET photos/2024/jan/sunset.png -> HIT (" + hit.size + " bytes)");

const miss = store.get("photos", "2024/jan/notfound.png");
lines.push("GET photos/2024/jan/notfound.png -> MISS (no such key)");

console.log(lines.join("\\n"));`,
      Python: `class ObjectStore:
    def __init__(self):
        self.buckets = {}  # bucket name -> {key: size_in_bytes}

    def create_bucket(self, name):
        self.buckets[name] = {}

    def put(self, bucket, key, size_bytes):
        self.buckets[bucket][key] = size_bytes

    def get(self, bucket, key):
        objects = self.buckets[bucket]
        if key in objects:
            return {"hit": True, "size": objects[key]}
        return {"hit": False, "size": None}

    def list(self, bucket, prefix):
        objects = self.buckets[bucket]
        keys = [key for key in objects.keys() if key.startswith(prefix)]
        keys.sort()
        return keys


store = ObjectStore()
lines = []

store.create_bucket("photos")
lines.append("Created bucket 'photos'")

uploads = [
    ("2024/jan/sunset.png", 612),
    ("2024/jan/party.png", 305),
    ("2024/feb/cat.png", 802),
    ("2023/dec/fireworks.png", 1200),
]

for key, size in uploads:
    store.put("photos", key, size)
    lines.append(f"Uploaded photos/{key} ({size} bytes)")

listed = store.list("photos", "2024/jan/")
lines.append(f"Listing photos/2024/jan/* -> {', '.join(listed)}")

hit = store.get("photos", "2024/jan/sunset.png")
lines.append(f"GET photos/2024/jan/sunset.png -> HIT ({hit['size']} bytes)")

miss = store.get("photos", "2024/jan/notfound.png")
lines.append("GET photos/2024/jan/notfound.png -> MISS (no such key)")

print("\\n".join(lines))`,
    },
    output: `Created bucket 'photos'
Uploaded photos/2024/jan/sunset.png (612 bytes)
Uploaded photos/2024/jan/party.png (305 bytes)
Uploaded photos/2024/feb/cat.png (802 bytes)
Uploaded photos/2023/dec/fireworks.png (1200 bytes)
Listing photos/2024/jan/* -> 2024/jan/party.png, 2024/jan/sunset.png
GET photos/2024/jan/sunset.png -> HIT (612 bytes)
GET photos/2024/jan/notfound.png -> MISS (no such key)`,
  },
  {
    id: "iam-access-control",
    pillar: "Cloud",
    name: "Access Control (IAM Roles & Permissions)",
    easy: "Think of a big office building where every employee carries a keycard. Not every keycard opens every door — a keycard is programmed to open only the doors that employee actually needs, like their own floor and the break room, but not the server room or the vault. IAM (Identity and Access Management) works the same way in the cloud. Instead of doors, you have actions like 'read a file' or 'delete a database'. Instead of one keycard per door, you define 'roles' — reusable bundles of permissions, like a job title. You then hand a role (or several) to each user, the same way you'd hand someone a keycard programmed for their job.",
    how: [
      "Define each role once, as a list of permissions it grants — for example, a 'viewer' role might only grant 'read'.",
      "Assign one or more roles to each user — a person can carry more than one keycard, and they get the combined permissions of every role they hold.",
      "When a user tries to do something, collect every permission from every role they have, and check whether the attempted action is in that combined set.",
      "If it's in the set, allow the action. If it isn't — or the user has no roles at all — deny it.",
    ],
    when: "Any system with more than one type of user — regular users, support staff, admins — where you need to make sure people can only do what their job requires. This is the backbone of 'least privilege': give each person exactly the access they need, and nothing more, so a mistake or a stolen account can't do more damage than necessary.",
    big: "Checking access is O(r × p) in the worst case for a user with r roles averaging p permissions each — trivially fast in practice, since real permission sets are small. The value isn't speed, it's safety: a clear, centralized rule for who can do what.",
    mistakes: [
      "Giving everyone the admin role 'just to be safe' — that defeats the entire point of roles and means one compromised account can do anything.",
      "Forgetting that a user with zero roles assigned should be denied everything by default, not accidentally allowed because there's nothing there to deny.",
      "Piling up one-off permissions per user instead of reusable roles — it works at first, but becomes impossible to audit ('wait, why does this one user have delete access?') as the team grows.",
    ],
    code: {
      JavaScript: `const roles = {
  viewer: ["read"],
  editor: ["read", "write"],
  admin: ["read", "write", "delete"],
};

const users = {
  alice: ["viewer"],
  bob: ["editor"],
  carol: ["admin", "viewer"],
  dave: [],
};

function permissionsFor(userRoles) {
  const perms = new Set();
  for (const role of userRoles) {
    for (const perm of roles[role]) {
      perms.add(perm);
    }
  }
  return Array.from(perms).sort();
}

function checkAccess(username, action) {
  const userRoles = users[username];
  if (!userRoles || userRoles.length === 0) {
    return "denied (no roles assigned)";
  }
  const perms = permissionsFor(userRoles);
  return perms.indexOf(action) !== -1 ? "allowed" : "denied";
}

const lines = [];

for (const role of Object.keys(roles)) {
  lines.push("Role '" + role + "' grants: " + roles[role].join(", "));
}

for (const username of Object.keys(users)) {
  const userRoles = users[username];
  const roleText = userRoles.length > 0 ? userRoles.join(", ") : "none";
  lines.push("User '" + username + "' has role(s): " + roleText);
}

const checks = [
  ["alice", "read"],
  ["alice", "delete"],
  ["bob", "write"],
  ["carol", "delete"],
  ["dave", "read"],
];

for (const [username, action] of checks) {
  const result = checkAccess(username, action);
  lines.push("Access check: " + username + " -> " + action + ": " + result);
}

console.log(lines.join("\\n"));`,
      Python: `roles = {
    "viewer": ["read"],
    "editor": ["read", "write"],
    "admin": ["read", "write", "delete"],
}

users = {
    "alice": ["viewer"],
    "bob": ["editor"],
    "carol": ["admin", "viewer"],
    "dave": [],
}


def permissions_for(user_roles):
    perms = set()
    for role in user_roles:
        for perm in roles[role]:
            perms.add(perm)
    return sorted(perms)


def check_access(username, action):
    user_roles = users.get(username)
    if not user_roles:
        return "denied (no roles assigned)"
    perms = permissions_for(user_roles)
    return "allowed" if action in perms else "denied"


lines = []

for role in roles:
    lines.append(f"Role '{role}' grants: {', '.join(roles[role])}")

for username in users:
    user_roles = users[username]
    role_text = ", ".join(user_roles) if len(user_roles) > 0 else "none"
    lines.append(f"User '{username}' has role(s): {role_text}")

checks = [
    ("alice", "read"),
    ("alice", "delete"),
    ("bob", "write"),
    ("carol", "delete"),
    ("dave", "read"),
]

for username, action in checks:
    result = check_access(username, action)
    lines.append(f"Access check: {username} -> {action}: {result}")

print("\\n".join(lines))`,
    },
    output: `Role 'viewer' grants: read
Role 'editor' grants: read, write
Role 'admin' grants: read, write, delete
User 'alice' has role(s): viewer
User 'bob' has role(s): editor
User 'carol' has role(s): admin, viewer
User 'dave' has role(s): none
Access check: alice -> read: allowed
Access check: alice -> delete: denied
Access check: bob -> write: allowed
Access check: carol -> delete: allowed
Access check: dave -> read: denied (no roles assigned)`,
  },
  {
    id: "per-tenant-quotas",
    pillar: "Cloud",
    name: "Per-Tenant Quotas",
    easy: "Imagine an apartment building where every unit has its own water meter and its own monthly cap. If one tenant runs the tap all day, it only counts against their own meter — it doesn't use up water that belongs to the tenant next door, and it doesn't get shut off because someone else went over. A 'tenant' in cloud software means the same thing as in the building: one customer (or one company's account) using a shared system. A 'quota' is that customer's personal cap — a fixed amount of some resource (storage, API calls, uploaded minutes of video) they're allowed to use before the system says no more, at least until the cap resets.",
    how: [
      "Give every tenant their own running usage counter, starting at zero, and their own quota (the cap they're allowed to reach).",
      "When a tenant makes a request that consumes some amount of the resource, check: would adding this amount push them over their quota?",
      "If there's room, allow it and add the amount to that tenant's counter — only that tenant's counter changes.",
      "If it would go over, deny the request and leave their counter untouched — one tenant hammering the system can't eat into anyone else's allowance.",
    ],
    when: "Any system serving multiple customers off shared infrastructure — a SaaS product, a multi-tenant API, cloud storage sold by the gigabyte. Per-tenant quotas keep one customer's traffic spike or runaway script from starving everyone else, and they're also just how usage-based billing tiers get enforced.",
    big: "Checking and updating a tenant's quota is O(1) — one lookup, one comparison, maybe one addition. The design value is isolation: no matter how many tenants share the system, one tenant's usage can never be read as another's.",
    mistakes: [
      "Tracking one shared counter for everyone instead of one per tenant — that turns a single noisy customer into an outage for every other customer sharing the pool.",
      "Letting a request partially succeed when it would go over quota (using up whatever room is left) instead of cleanly allowing it in full or denying it in full — partial writes get confusing fast.",
      "Forgetting to handle a tenant that doesn't exist in the system at all — that should be denied outright, not silently treated as having unlimited quota.",
    ],
    code: {
      JavaScript: `const quotas = {
  tenantA: 100,
  tenantB: 50,
};

const usage = {
  tenantA: 0,
  tenantB: 0,
};

function requestUsage(tenant, amount) {
  if (!Object.prototype.hasOwnProperty.call(quotas, tenant)) {
    return "denied, unknown tenant";
  }
  const wouldBe = usage[tenant] + amount;
  if (wouldBe > quotas[tenant]) {
    return "denied, quota exceeded (usage " + usage[tenant] + "/" + quotas[tenant] + ", would be " + wouldBe + ")";
  }
  usage[tenant] = wouldBe;
  return "allowed (usage " + usage[tenant] + "/" + quotas[tenant] + ")";
}

const events = [
  ["tenantA", 40],
  ["tenantB", 30],
  ["tenantA", 50],
  ["tenantB", 25],
  ["tenantA", 20],
  ["tenantC", 10],
];

const lines = [];
for (const [tenant, amount] of events) {
  const result = requestUsage(tenant, amount);
  lines.push(tenant + " requests " + amount + " units -> " + result);
}

lines.push("Final usage: tenantA " + usage.tenantA + "/" + quotas.tenantA + ", tenantB " + usage.tenantB + "/" + quotas.tenantB);

console.log(lines.join("\\n"));`,
      Python: `quotas = {
    "tenantA": 100,
    "tenantB": 50,
}

usage = {
    "tenantA": 0,
    "tenantB": 0,
}


def request_usage(tenant, amount):
    if tenant not in quotas:
        return "denied, unknown tenant"
    would_be = usage[tenant] + amount
    if would_be > quotas[tenant]:
        return f"denied, quota exceeded (usage {usage[tenant]}/{quotas[tenant]}, would be {would_be})"
    usage[tenant] = would_be
    return f"allowed (usage {usage[tenant]}/{quotas[tenant]})"


events = [
    ("tenantA", 40),
    ("tenantB", 30),
    ("tenantA", 50),
    ("tenantB", 25),
    ("tenantA", 20),
    ("tenantC", 10),
]

lines = []
for tenant, amount in events:
    result = request_usage(tenant, amount)
    lines.append(f"{tenant} requests {amount} units -> {result}")

lines.append(f"Final usage: tenantA {usage['tenantA']}/{quotas['tenantA']}, tenantB {usage['tenantB']}/{quotas['tenantB']}")

print("\\n".join(lines))`,
    },
    output: `tenantA requests 40 units -> allowed (usage 40/100)
tenantB requests 30 units -> allowed (usage 30/50)
tenantA requests 50 units -> allowed (usage 90/100)
tenantB requests 25 units -> denied, quota exceeded (usage 30/50, would be 55)
tenantA requests 20 units -> denied, quota exceeded (usage 90/100, would be 110)
tenantC requests 10 units -> denied, unknown tenant
Final usage: tenantA 90/100, tenantB 30/50`,
  },
  {
    id: "multi-region-failover",
    pillar: "Cloud",
    name: "Multi-Region Failover",
    easy: "Imagine a company with three regional warehouses — one in the east, one in the west, one overseas — and a standing rule: always ship from the east warehouse if it's open, otherwise the west one, otherwise the overseas one, otherwise nothing goes out at all. Multi-region failover applies that same standing rule to cloud regions — separate copies of your infrastructure running in different geographic data centers. Instead of just one primary and one backup, you keep an ordered priority list of regions. Traffic goes to the highest-priority region that's currently healthy, and automatically shifts down the list the moment something above it goes down — then shifts back up once it recovers.",
    how: [
      "Keep an ordered priority list of regions, from most preferred to least — this order is your failover plan, decided ahead of time.",
      "On each check, walk the list in order and pick the first region that's currently healthy — that's who serves traffic right now.",
      "If a higher-priority region that was down comes back healthy, traffic moves back up to it automatically ('failback') — you don't have to manually undo anything.",
      "If every single region in the list is down at once, there's nowhere left to send traffic — that's a full outage, not just a failover.",
    ],
    when: "Running a service that truly cannot go down even if an entire data center — or an entire geographic region — has a bad day (power outage, natural disaster, a cloud provider's regional failure). A single backup server only survives a server failing; multi-region failover survives a whole region failing.",
    big: "Picking a region is O(k) for k regions in the priority list — just walk the list until you find a healthy one. The real cost being managed is blast radius: this contains an entire region's outage instead of taking your whole service down with it.",
    mistakes: [
      "Putting all regions physically close together (like three data centers in the same city) — that defeats the purpose if a single regional event (a storm, a power grid failure) can take all of them out together.",
      "Failing back to a recovering region the instant it answers once — the same trap as a circuit breaker's half-open test, one healthy check doesn't prove it's stable, not flapping.",
      "Not testing what actually happens when every region is down — 'that'll never happen' is exactly the assumption that turns a bad day into a total outage with no plan.",
    ],
    code: {
      JavaScript: `function chooseRegion(health, priority) {
  for (const region of priority) {
    if (health[region]) {
      return region;
    }
  }
  return null;
}

const priority = ["us-east", "us-west", "eu-west"];

const healthSchedule = [
  { "us-east": true, "us-west": true, "eu-west": true },
  { "us-east": false, "us-west": true, "eu-west": true },
  { "us-east": false, "us-west": false, "eu-west": true },
  { "us-east": false, "us-west": false, "eu-west": false },
  { "us-east": true, "us-west": true, "eu-west": true },
];

const lines = [];
let lastServing = null;
let failovers = 0;
let failbacks = 0;
let outages = 0;

for (let i = 0; i < healthSchedule.length; i++) {
  const health = healthSchedule[i];
  const chosen = chooseRegion(health, priority);
  const downRegions = priority.filter((region) => !health[region]);

  let desc;
  if (chosen === null) {
    desc = "all regions down -> OUTAGE, no region available";
    outages++;
  } else if (downRegions.length === 0) {
    desc = "all regions healthy -> serving from " + chosen;
  } else {
    desc = "down: " + downRegions.join(", ") + " -> serving from " + chosen;
  }

  let transition = "";
  if (chosen !== null && lastServing !== null && chosen !== lastServing) {
    if (priority.indexOf(chosen) > priority.indexOf(lastServing)) {
      transition = " (failover)";
      failovers++;
    } else {
      transition = " (failback)";
      failbacks++;
    }
  }

  if (chosen !== null) {
    lastServing = chosen;
  }

  lines.push("Tick " + (i + 1) + ": " + desc + transition);
}

console.log(lines.join("\\n"));
console.log("Summary: " + failovers + " failovers, " + failbacks + " failback, " + outages + " outage tick out of " + healthSchedule.length + " total ticks");`,
      Python: `def choose_region(health, priority):
    for region in priority:
        if health[region]:
            return region
    return None


priority = ["us-east", "us-west", "eu-west"]

health_schedule = [
    {"us-east": True, "us-west": True, "eu-west": True},
    {"us-east": False, "us-west": True, "eu-west": True},
    {"us-east": False, "us-west": False, "eu-west": True},
    {"us-east": False, "us-west": False, "eu-west": False},
    {"us-east": True, "us-west": True, "eu-west": True},
]

lines = []
last_serving = None
failovers = 0
failbacks = 0
outages = 0

for i in range(len(health_schedule)):
    health = health_schedule[i]
    chosen = choose_region(health, priority)
    down_regions = [region for region in priority if not health[region]]

    if chosen is None:
        desc = "all regions down -> OUTAGE, no region available"
        outages += 1
    elif len(down_regions) == 0:
        desc = f"all regions healthy -> serving from {chosen}"
    else:
        desc = f"down: {', '.join(down_regions)} -> serving from {chosen}"

    transition = ""
    if chosen is not None and last_serving is not None and chosen != last_serving:
        if priority.index(chosen) > priority.index(last_serving):
            transition = " (failover)"
            failovers += 1
        else:
            transition = " (failback)"
            failbacks += 1

    if chosen is not None:
        last_serving = chosen

    lines.append(f"Tick {i + 1}: {desc}{transition}")

print("\\n".join(lines))
print(f"Summary: {failovers} failovers, {failbacks} failback, {outages} outage tick out of {len(health_schedule)} total ticks")`,
    },
    output: `Tick 1: all regions healthy -> serving from us-east
Tick 2: down: us-east -> serving from us-west (failover)
Tick 3: down: us-east, us-west -> serving from eu-west (failover)
Tick 4: all regions down -> OUTAGE, no region available
Tick 5: all regions healthy -> serving from us-east (failback)
Summary: 2 failovers, 1 failback, 1 outage tick out of 5 total ticks`,
  },
  {
    id: "secrets-management",
    pillar: "Cloud",
    name: "Secrets Management",
    easy: "Picture a workplace where passwords used to live on sticky notes stuck to monitors — anyone walking by could read them, and when a password changed, someone had to remember to peel off the old note and write a new one. A secrets manager replaces every sticky note with a vault. Passwords, API keys, and other 'secrets' (sensitive values your app needs but humans shouldn't casually see) live inside it instead of sitting in code or config files in plain view. The vault decides who's allowed to open it, hands out the current value only to those with permission, and keeps a version history so you can rotate — replace a secret with a fresh one — without instantly breaking whatever was still using the old one.",
    how: [
      "Store each secret under a name, along with the list of roles allowed to read it — like storing something in the vault along with the list of people who know the combination.",
      "When something asks for a secret, first check whether its role is on the allowed list. No match, no value — reject it before ever touching the vault contents.",
      "If the role is allowed, hand back the current (latest) version by default. Never print or log the raw secret in full — mask it, showing just enough to confirm which secret it is.",
      "To rotate a secret, store a new value under the same name as a new version, keeping the old version around (rather than deleting it instantly) so anything still mid-flight with the old value doesn't break immediately.",
    ],
    when: "Any time your code needs a password, API key, certificate, or token to talk to something else. Secrets management keeps those values out of source code and config files (where they'd get committed to history forever), controls exactly who and what can read them, and makes rotating a leaked or expiring secret a routine operation instead of a scramble.",
    big: "Storing and fetching a secret are both O(1) lookups. The real value isn't computational — it's reducing exposure: fewer places a secret sits in plain text, and a fast, controlled way to rotate one out.",
    mistakes: [
      "Hardcoding a secret directly in source code 'just for now' — 'for now' becomes forever the moment it's committed, since it stays in the project's history even after you remove it.",
      "Printing or logging a secret's full value anywhere, even for debugging — logs get copied, forwarded, and stored longer than anyone expects.",
      "Deleting the old version the instant you rotate a secret — anything still using the old value (a slow-restarting server, a cached config) breaks immediately instead of getting a grace period to pick up the new one.",
    ],
    code: {
      JavaScript: `function mask(value) {
  if (value.length < 2) {
    return "*".repeat(value.length);
  }
  const middle = "*".repeat(value.length - 2);
  return value[0] + middle + value[value.length - 1];
}

class SecretsManager {
  constructor() {
    this.secrets = {}; // name -> { allowedRoles, versions: [value, value, ...] }
  }

  store(name, value, allowedRoles) {
    this.secrets[name] = { allowedRoles: allowedRoles.slice().sort(), versions: [value] };
  }

  rotate(name, newValue) {
    this.secrets[name].versions.push(newValue);
    return this.secrets[name].versions.length;
  }

  get(name, role, version) {
    const secret = this.secrets[name];
    if (secret.allowedRoles.indexOf(role) === -1) {
      return { allowed: false, message: "denied (role not permitted)" };
    }
    const latestVersion = secret.versions.length;
    const useVersion = version === undefined ? latestVersion : version;
    const value = secret.versions[useVersion - 1];
    const maskedValue = mask(value);
    if (useVersion < latestVersion) {
      return { allowed: true, message: "allowed but OUTDATED (v" + useVersion + ", value " + maskedValue + ") - rotate callers off old versions" };
    }
    return { allowed: true, message: "allowed (v" + useVersion + ", value " + maskedValue + ")" };
  }
}

const manager = new SecretsManager();
const lines = [];

manager.store("db-password", "p@ss1", ["backend", "admin"]);
lines.push("Stored secret 'db-password' (v1), allowed roles: " + manager.secrets["db-password"].allowedRoles.join(", "));

manager.store("api-key", "key1", ["admin"]);
lines.push("Stored secret 'api-key' (v1), allowed roles: " + manager.secrets["api-key"].allowedRoles.join(", "));

let result = manager.get("db-password", "backend");
lines.push("GET db-password as 'backend' -> " + result.message);

result = manager.get("db-password", "frontend");
lines.push("GET db-password as 'frontend' -> " + result.message);

result = manager.get("api-key", "backend");
lines.push("GET api-key as 'backend' -> " + result.message);

const newVersion = manager.rotate("db-password", "p@ss2");
lines.push("Rotated 'db-password' -> now v" + newVersion);

result = manager.get("db-password", "backend");
lines.push("GET db-password as 'backend' (latest) -> " + result.message);

result = manager.get("db-password", "backend", 1);
lines.push("GET db-password as 'backend' (v1 explicitly) -> " + result.message);

console.log(lines.join("\\n"));`,
      Python: `def mask(value):
    if len(value) < 2:
        return "*" * len(value)
    middle = "*" * (len(value) - 2)
    return value[0] + middle + value[-1]


class SecretsManager:
    def __init__(self):
        self.secrets = {}  # name -> {"allowed_roles": [...], "versions": [value, ...]}

    def store(self, name, value, allowed_roles):
        self.secrets[name] = {"allowed_roles": sorted(allowed_roles), "versions": [value]}

    def rotate(self, name, new_value):
        self.secrets[name]["versions"].append(new_value)
        return len(self.secrets[name]["versions"])

    def get(self, name, role, version=None):
        secret = self.secrets[name]
        if role not in secret["allowed_roles"]:
            return {"allowed": False, "message": "denied (role not permitted)"}
        latest_version = len(secret["versions"])
        use_version = latest_version if version is None else version
        value = secret["versions"][use_version - 1]
        masked_value = mask(value)
        if use_version < latest_version:
            return {"allowed": True, "message": f"allowed but OUTDATED (v{use_version}, value {masked_value}) - rotate callers off old versions"}
        return {"allowed": True, "message": f"allowed (v{use_version}, value {masked_value})"}


manager = SecretsManager()
lines = []

manager.store("db-password", "p@ss1", ["backend", "admin"])
lines.append(f"Stored secret 'db-password' (v1), allowed roles: {', '.join(manager.secrets['db-password']['allowed_roles'])}")

manager.store("api-key", "key1", ["admin"])
lines.append(f"Stored secret 'api-key' (v1), allowed roles: {', '.join(manager.secrets['api-key']['allowed_roles'])}")

result = manager.get("db-password", "backend")
lines.append(f"GET db-password as 'backend' -> {result['message']}")

result = manager.get("db-password", "frontend")
lines.append(f"GET db-password as 'frontend' -> {result['message']}")

result = manager.get("api-key", "backend")
lines.append(f"GET api-key as 'backend' -> {result['message']}")

new_version = manager.rotate("db-password", "p@ss2")
lines.append(f"Rotated 'db-password' -> now v{new_version}")

result = manager.get("db-password", "backend")
lines.append(f"GET db-password as 'backend' (latest) -> {result['message']}")

result = manager.get("db-password", "backend", 1)
lines.append(f"GET db-password as 'backend' (v1 explicitly) -> {result['message']}")

print("\\n".join(lines))`,
    },
    output: `Stored secret 'db-password' (v1), allowed roles: admin, backend
Stored secret 'api-key' (v1), allowed roles: admin
GET db-password as 'backend' -> allowed (v1, value p***1)
GET db-password as 'frontend' -> denied (role not permitted)
GET api-key as 'backend' -> denied (role not permitted)
Rotated 'db-password' -> now v2
GET db-password as 'backend' (latest) -> allowed (v2, value p***2)
GET db-password as 'backend' (v1 explicitly) -> allowed but OUTDATED (v1, value p***1) - rotate callers off old versions`,
  },
];

export default lessons;
