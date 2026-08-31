// content/lessons/product.ts
// Pillar: Product — how product managers decide what to build and measure whether
// it worked. Every lesson computes a real number and prints a decision, so the
// craft fits the same runnable code + verified output model as the rest of DevPath.
//
// Teacher voice, every entry: easy → how → when → (big) → (mistakes) → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/product.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "rice-prioritization",
    pillar: "Product",
    name: "RICE Prioritization",
    easy: "RICE is a recipe for turning a gut feeling of 'this feels important' into a number you can rank. It stands for Reach, Impact, Confidence, and Effort. Imagine choosing which home repair to do first: you weigh how many people it helps (Reach), how much it helps each one (Impact), how sure you are (Confidence), and how much work it is (Effort). RICE multiplies the three good things and divides by the effort, so cheap ideas that help many people rise to the top.",
    how: [
      "Estimate Reach: how many people this affects in a period, like users per month.",
      "Estimate Impact (how much it moves the needle each) and Confidence (0 to 1, how sure you are of your guesses).",
      "Estimate Effort: how much work it takes, often in person-weeks.",
      "Score = (Reach × Impact × Confidence) ÷ Effort. Sort features by score; the highest is what you build first.",
    ],
    when: "Reach for RICE when you have more ideas than time and need a fair, explainable way to order them. It's especially handy for defending a roadmap to stakeholders, because the ranking comes from stated assumptions instead of whoever argued loudest.",
    mistakes: [
      "Treating the score as objective truth. It's only as good as your estimates — garbage guesses in, confident-looking garbage out.",
      "Forgetting the Confidence term. A wildly optimistic Reach and Impact should be discounted by low confidence, or shaky ideas float to the top unfairly.",
    ],
    code: {
      JavaScript: `// RICE score = (Reach x Impact x Confidence) / Effort. Higher = do it sooner.
const features = [
  { name: "Dark mode", reach: 8000, impact: 1, confidence: 0.8, effort: 4 },
  { name: "Faster search", reach: 6000, impact: 3, confidence: 0.9, effort: 3 },
  { name: "New logo", reach: 10000, impact: 0.25, confidence: 0.5, effort: 2 },
];

function riceScore(f) {
  return (f.reach * f.impact * f.confidence) / f.effort;
}

const scored = features
  .map((f) => ({ name: f.name, score: riceScore(f) }))
  .sort((a, b) => b.score - a.score);

console.log("Ranked by RICE score:");
scored.forEach((f, i) => {
  console.log((i + 1) + ". " + f.name + " — " + f.score.toFixed(0));
});
console.log("Build first: " + scored[0].name);`,
      Python: `# RICE score = (Reach x Impact x Confidence) / Effort. Higher = do it sooner.
features = [
    {"name": "Dark mode", "reach": 8000, "impact": 1, "confidence": 0.8, "effort": 4},
    {"name": "Faster search", "reach": 6000, "impact": 3, "confidence": 0.9, "effort": 3},
    {"name": "New logo", "reach": 10000, "impact": 0.25, "confidence": 0.5, "effort": 2},
]

def rice_score(f):
    return (f["reach"] * f["impact"] * f["confidence"]) / f["effort"]

scored = sorted(
    [{"name": f["name"], "score": rice_score(f)} for f in features],
    key=lambda f: f["score"],
    reverse=True,
)

print("Ranked by RICE score:")
for i, f in enumerate(scored):
    print(str(i + 1) + ". " + f["name"] + " — " + f"{f['score']:.0f}")
print("Build first: " + scored[0]["name"])`,
    },
    output: `Ranked by RICE score:
1. Faster search — 5400
2. Dark mode — 1600
3. New logo — 625
Build first: Faster search`,
  },
  {
    id: "ab-test",
    pillar: "Product",
    name: "A/B Testing (Comparing Two Variants)",
    easy: "An A/B test is a fair race between two versions of something to see which one wins. You show version A to one random half of your users and version B to the other half, then compare how each did. It's like a taste test with two recipes: same crowd, split evenly, and you count how many people liked each. Because the split is random, any difference in the result is probably caused by the change itself, not by luck about who saw what.",
    how: [
      "Split users randomly into two groups so the only real difference is which version they see.",
      "Show group A the original and group B the change, and count a success for each — a signup, a purchase, a click.",
      "Turn each group's successes into a conversion rate: successes divided by visitors.",
      "Compare the rates. The higher one wins; the 'lift' is how much better the winner did, relative to the other.",
    ],
    when: "Use an A/B test when you can send real traffic to two versions and you have enough visitors for the result to mean something. It's the standard way to settle 'which button color / headline / flow converts better' with evidence instead of opinion.",
    mistakes: [
      "Calling a winner too early on tiny numbers. With only a handful of visitors, random noise can look like a real difference — wait for enough data.",
      "Changing several things at once between A and B. If the versions differ in three ways, a win tells you nothing about WHICH change caused it.",
    ],
    code: {
      JavaScript: `// A/B test: split traffic between two versions, compare conversion rates.
const variantA = { visitors: 1000, conversions: 50 };
const variantB = { visitors: 1000, conversions: 65 };

function rate(v) {
  return v.conversions / v.visitors;
}

const rateA = rate(variantA);
const rateB = rate(variantB);
const lift = ((rateB - rateA) / rateA) * 100;

console.log("Variant A: " + (rateA * 100).toFixed(1) + "% conversion");
console.log("Variant B: " + (rateB * 100).toFixed(1) + "% conversion");
console.log("Winner: " + (rateB > rateA ? "B" : "A"));
console.log("Relative lift: " + lift.toFixed(1) + "%");`,
      Python: `# A/B test: split traffic between two versions, compare conversion rates.
variant_a = {"visitors": 1000, "conversions": 50}
variant_b = {"visitors": 1000, "conversions": 65}

def rate(v):
    return v["conversions"] / v["visitors"]

rate_a = rate(variant_a)
rate_b = rate(variant_b)
lift = ((rate_b - rate_a) / rate_a) * 100

print("Variant A: " + f"{rate_a * 100:.1f}" + "% conversion")
print("Variant B: " + f"{rate_b * 100:.1f}" + "% conversion")
print("Winner: " + ("B" if rate_b > rate_a else "A"))
print("Relative lift: " + f"{lift:.1f}" + "%")`,
    },
    output: `Variant A: 5.0% conversion
Variant B: 6.5% conversion
Winner: B
Relative lift: 30.0%`,
  },
  {
    id: "conversion-funnel",
    pillar: "Product",
    name: "Conversion Funnel",
    easy: "A funnel is the shrinking path users walk from 'just arrived' to 'did the thing you wanted'. Picture a real funnel: wide at the top, narrow at the bottom. Lots of people visit, fewer sign up, fewer still add a payment method, and fewer actually buy. By measuring how many survive each step, you can spot the exact stair where most people trip and fall away — and that's where fixing things pays off most.",
    how: [
      "List the ordered steps a user takes toward your goal, from first visit to final action.",
      "Count how many people reach each step.",
      "For each step, compute what fraction of the PREVIOUS step made it through — that reveals where the big drop-offs are.",
      "Also compute the overall rate: how many finished versus how many started. Then attack the worst single step.",
    ],
    when: "Use a funnel whenever a goal takes several steps: signup flows, checkout, onboarding. It turns a vague 'not enough sales' into a precise 'we lose 60% at the payment step', which is something you can actually fix.",
    mistakes: [
      "Only watching the final number. Overall conversion tells you something's wrong but not where — the per-step rates point at the exact leak.",
      "Fixing a step that barely leaks. Improving a step where you already keep 95% of people moves far less than fixing the one where you lose half.",
    ],
    code: {
      JavaScript: `// A funnel tracks how many users survive each step. Big drops = problem spots.
const funnel = [
  { step: "Visited", users: 1000 },
  { step: "Signed up", users: 400 },
  { step: "Added payment", users: 200 },
  { step: "Purchased", users: 120 },
];

console.log("Funnel step-by-step:");
for (let i = 0; i < funnel.length; i++) {
  const stage = funnel[i];
  if (i === 0) {
    console.log(stage.step + ": " + stage.users + " users");
  } else {
    const pct = (stage.users / funnel[i - 1].users) * 100;
    console.log(stage.step + ": " + stage.users + " users (" + pct.toFixed(0) + "% of previous)");
  }
}

const overall = (funnel[funnel.length - 1].users / funnel[0].users) * 100;
console.log("Overall conversion: " + overall.toFixed(0) + "%");`,
      Python: `# A funnel tracks how many users survive each step. Big drops = problem spots.
funnel = [
    {"step": "Visited", "users": 1000},
    {"step": "Signed up", "users": 400},
    {"step": "Added payment", "users": 200},
    {"step": "Purchased", "users": 120},
]

print("Funnel step-by-step:")
for i in range(len(funnel)):
    stage = funnel[i]
    if i == 0:
        print(stage["step"] + ": " + str(stage["users"]) + " users")
    else:
        pct = (stage["users"] / funnel[i - 1]["users"]) * 100
        print(stage["step"] + ": " + str(stage["users"]) + " users (" + f"{pct:.0f}" + "% of previous)")

overall = (funnel[-1]["users"] / funnel[0]["users"]) * 100
print("Overall conversion: " + f"{overall:.0f}" + "%")`,
    },
    output: `Funnel step-by-step:
Visited: 1000 users
Signed up: 400 users (40% of previous)
Added payment: 200 users (50% of previous)
Purchased: 120 users (60% of previous)
Overall conversion: 12%`,
  },
  {
    id: "retention-cohort",
    pillar: "Product",
    name: "Retention & Cohorts",
    easy: "Retention measures whether people keep coming back after they first show up. A cohort is just a group who started at the same time — like everyone who joined your gym in January. Instead of one blurry average, you follow that January group week by week: how many are still active after one week, two weeks, a month? A product can look healthy because new people keep arriving, while secretly the people who join keep leaving. Cohort retention exposes that leak.",
    how: [
      "Pick a cohort: everyone who joined in the same period (say, week 0).",
      "Each later week, count how many of that SAME original group came back and were active.",
      "Divide each week's returners by the cohort's starting size to get a retention percentage.",
      "Watch the curve. A gentle flattening is healthy; a cliff means people try it once and don't return.",
    ],
    when: "Use cohort retention to judge whether your product delivers lasting value, not just first-time curiosity. It's the truth serum behind growth: if retention is leaking, pouring in more new users just fills a bucket with a hole in it.",
    mistakes: [
      "Hiding behind total-user growth. Rising totals can mask terrible retention when acquisition is simply outrunning churn for now.",
      "Comparing cohorts that aren't comparable. A holiday-signup cohort may behave very differently from a normal week — compare like with like.",
    ],
    code: {
      JavaScript: `// Retention: of the users who joined in week 0, how many return each week?
const cohortSize = 200;
const activeByWeek = [200, 120, 90, 72];

console.log("Cohort started with " + cohortSize + " users");
activeByWeek.forEach((count, week) => {
  const pct = (count / cohortSize) * 100;
  console.log("Week " + week + ": " + count + " active (" + pct.toFixed(0) + "% retained)");
});

const churned = activeByWeek[2] - activeByWeek[3];
console.log("Lost " + churned + " users from week 2 to week 3");`,
      Python: `# Retention: of the users who joined in week 0, how many return each week?
cohort_size = 200
active_by_week = [200, 120, 90, 72]

print("Cohort started with " + str(cohort_size) + " users")
for week, count in enumerate(active_by_week):
    pct = (count / cohort_size) * 100
    print("Week " + str(week) + ": " + str(count) + " active (" + f"{pct:.0f}" + "% retained)")

churned = active_by_week[2] - active_by_week[3]
print("Lost " + str(churned) + " users from week 2 to week 3")`,
    },
    output: `Cohort started with 200 users
Week 0: 200 active (100% retained)
Week 1: 120 active (60% retained)
Week 2: 90 active (45% retained)
Week 3: 72 active (36% retained)
Lost 18 users from week 2 to week 3`,
  },
  {
    id: "moscow-weighted-scoring",
    pillar: "Product",
    name: "MoSCoW & Weighted Prioritization",
    easy: "When everything feels 'important', you need a way to separate the truly essential from the nice-to-have. MoSCoW sorts work into four buckets: Must have, Should have, Could have, and Won't have (this time). Weighted scoring goes a step further with numbers: you rate each feature on a few criteria — like value, ease, and urgency — then multiply each rating by how much that criterion matters (its weight) and add them up. It's like judging a cooking contest where taste counts more than presentation, so you weight taste heavier before totaling the scores.",
    how: [
      "Choose your criteria (value, ease, urgency) and give each a weight that sums to 1, reflecting how much it matters.",
      "Rate each feature on every criterion, say from 1 to 10.",
      "Multiply each rating by its criterion's weight, then add those up for the feature's weighted score.",
      "Rank by score. The top of the list is your 'Must have'; the bottom slides toward 'Won't have this time'.",
    ],
    when: "Use MoSCoW for a quick, shared language about what's essential versus optional. Step up to weighted scoring when stakeholders disagree and you need a transparent number that shows exactly why one feature outranks another.",
    mistakes: [
      "Letting everything become a 'Must have'. If it's all essential, you haven't prioritized — MoSCoW only helps when 'Won't' is used honestly.",
      "Picking weights after seeing the scores to get the answer you wanted. Decide the weights first, then let the math tell you the order.",
    ],
    code: {
      JavaScript: `// Weighted scoring: rate each feature on criteria, weight them, then sum.
const weights = { value: 0.5, ease: 0.3, urgency: 0.2 };
const features = [
  { name: "Checkout redesign", value: 9, ease: 4, urgency: 8 },
  { name: "Profile avatars", value: 3, ease: 9, urgency: 2 },
];

function weightedScore(f) {
  return f.value * weights.value + f.ease * weights.ease + f.urgency * weights.urgency;
}

const ranked = features
  .map((f) => ({ name: f.name, score: weightedScore(f) }))
  .sort((a, b) => b.score - a.score);

ranked.forEach((f) => {
  console.log(f.name + ": " + f.score.toFixed(1));
});
console.log("Top priority (Must have): " + ranked[0].name);`,
      Python: `# Weighted scoring: rate each feature on criteria, weight them, then sum.
weights = {"value": 0.5, "ease": 0.3, "urgency": 0.2}
features = [
    {"name": "Checkout redesign", "value": 9, "ease": 4, "urgency": 8},
    {"name": "Profile avatars", "value": 3, "ease": 9, "urgency": 2},
]

def weighted_score(f):
    return f["value"] * weights["value"] + f["ease"] * weights["ease"] + f["urgency"] * weights["urgency"]

ranked = sorted(
    [{"name": f["name"], "score": weighted_score(f)} for f in features],
    key=lambda f: f["score"],
    reverse=True,
)

for f in ranked:
    print(f["name"] + ": " + f"{f['score']:.1f}")
print("Top priority (Must have): " + ranked[0]["name"])`,
    },
    output: `Checkout redesign: 7.3
Profile avatars: 4.6
Top priority (Must have): Checkout redesign`,
  },
  {
    id: "north-star-metric",
    pillar: "Product",
    name: "North-Star Metric (Activation Rate)",
    easy: "A north-star metric is the single number a whole team steers by — the one that best captures the real value your product delivers. Like a ship's navigator picking one star to hold course by instead of staring at every star at once. A common north-star for new products is the activation rate: of the people who just signed up, what fraction actually reached the 'aha' moment — the first action where they truly get the point, like sending a first message or creating a first project. If people sign up but never activate, growth is hollow.",
    how: [
      "Define your 'aha' moment: the first meaningful action that predicts a user will stick around.",
      "Count how many new users arrived in a period, and how many of them hit that moment.",
      "Divide activated users by new users to get the activation rate.",
      "Compare it to a target. Below target means onboarding is leaking people before they feel the value.",
    ],
    when: "Pick a north-star metric so everyone — design, engineering, marketing — pulls in the same direction instead of optimizing conflicting numbers. Activation rate is a great early-stage choice because it measures whether new users actually experience the product's core value.",
    mistakes: [
      "Choosing a vanity metric as your star, like total signups. It always goes up and hides whether people find real value.",
      "Chasing the metric in ways that hurt users, like calling a trivial click the 'aha' moment. If the number rises but retention doesn't, you picked the wrong star.",
    ],
    code: {
      JavaScript: `// A north-star metric captures real product value in one number.
// Here: weekly activation rate = new users who reached the "aha" moment.
const newUsers = 500;
const activatedUsers = 275; // completed the key first action

const activationRate = (activatedUsers / newUsers) * 100;
console.log("New users this week: " + newUsers);
console.log("Activated (hit the aha moment): " + activatedUsers);
console.log("Activation rate: " + activationRate.toFixed(0) + "%");

const target = 60;
console.log(activationRate >= target ? "On target" : "Below target (" + target + "%)");`,
      Python: `# A north-star metric captures real product value in one number.
# Here: weekly activation rate = new users who reached the "aha" moment.
new_users = 500
activated_users = 275  # completed the key first action

activation_rate = (activated_users / new_users) * 100
print("New users this week: " + str(new_users))
print("Activated (hit the aha moment): " + str(activated_users))
print("Activation rate: " + f"{activation_rate:.0f}" + "%")

target = 60
print("On target" if activation_rate >= target else "Below target (" + str(target) + "%)")`,
    },
    output: `New users this week: 500
Activated (hit the aha moment): 275
Activation rate: 55%
Below target (60%)`,
  },
];

export default lessons;
