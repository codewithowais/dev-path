// content/lessons/data-science.ts
// Pillar: Data Science — how to find the story hidden in data.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/data-science.ts`.
//
// Because this pillar involves math, JS and Python outputs are hand-picked to land
// on clean values (no .xx5 rounding boundaries) so both languages print identically.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "mean-median-mode",
    pillar: "Data Science",
    name: "Mean, Median, and Mode",
    easy: "Imagine a seesaw with all your numbers sitting on it — the mean (the 'average') is the exact point where the seesaw balances perfectly, with big numbers pulling it one way and small numbers the other. The median is simply the middle value once everyone lines up in order from smallest to largest. And the mode is just whichever value shows up most often — the most popular answer in the room.",
    how: [
      "Add every number together and divide by how many numbers there are — that gives you the mean.",
      "Sort the numbers from smallest to largest, then pick the one sitting exactly in the middle — that's the median (if there are two middle numbers, average them).",
      "Count how many times each number appears — whichever number appears most often is the mode.",
    ],
    when: "Use the mean for a quick overall average, but reach for the median when a few extreme values (like one billionaire's income) would badly skew the mean. Use the mode when you care about the single most common category, like the most popular shoe size.",
    big: "The mean and mode take a single pass through the data — O(n) time. The median needs the data sorted first, so it's O(n log n) unless the data is already sorted.",
    mistakes: [
      "Trusting the mean on data with outliers — one huge or tiny value can drag it far from what feels 'typical'.",
      "Forgetting to sort before finding the median — an unsorted 'middle' value means nothing.",
    ],
    code: {
      JavaScript: `function mean(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}
function mode(arr) {
  const counts = {};
  for (const n of arr) counts[n] = (counts[n] || 0) + 1;
  let best = arr[0];
  let bestCount = 0;
  for (const n of arr) {
    if (counts[n] > bestCount) {
      bestCount = counts[n];
      best = n;
    }
  }
  return best;
}

const scores = [12, 7, 7, 15, 9];
console.log("Scores:", scores.join(" "));
console.log("Mean:", mean(scores).toFixed(2));
console.log("Median:", median(scores));
console.log("Mode:", mode(scores));`,
      Python: `def mean(arr):
    return sum(arr) / len(arr)

def median(arr):
    sorted_arr = sorted(arr)
    n = len(sorted_arr)
    mid = n // 2
    if n % 2 == 0:
        return (sorted_arr[mid - 1] + sorted_arr[mid]) / 2
    return sorted_arr[mid]

def mode(arr):
    counts = {}
    for n in arr:
        counts[n] = counts.get(n, 0) + 1
    best = arr[0]
    best_count = 0
    for n in arr:
        if counts[n] > best_count:
            best_count = counts[n]
            best = n
    return best

scores = [12, 7, 7, 15, 9]
print("Scores:", " ".join(str(v) for v in scores))
print("Mean:", f"{mean(scores):.2f}")
print("Median:", median(scores))
print("Mode:", mode(scores))`,
    },
    output: `Scores: 12 7 7 15 9
Mean: 10.00
Median: 9
Mode: 7`,
  },
  {
    id: "standard-deviation-variance",
    pillar: "Data Science",
    name: "Standard Deviation & Variance",
    easy: "If the mean tells you the average height of a class, standard deviation tells you how spread out everyone's heights actually are around that average — a small standard deviation means everyone's close to average (like a class of similar-height kids), a big one means heights are all over the place. Variance is just standard deviation before you take the square root — it's the 'squared spread', which is why the units look odd until you square-root it back to normal.",
    how: [
      "Find the mean of all the numbers.",
      "For each number, find how far it is from the mean, then square that difference (squaring makes every difference positive, so distances above and below the mean don't cancel out).",
      "Average all those squared differences — that's the variance. Take the square root of the variance to get the standard deviation, back in the original units.",
    ],
    when: "Use it to describe how consistent or volatile something is — exam scores, stock returns, manufacturing tolerances. A weather forecaster comparing two cities' temperatures uses standard deviation to say which one has more unpredictable weather.",
    big: "One pass to find the mean, one more pass for the squared differences — O(n) time, O(1) extra space.",
    mistakes: [
      "Forgetting to square the differences — without squaring, the positive and negative differences would just cancel out to zero.",
      "Confusing variance (squared units, hard to interpret directly) with standard deviation (the square root, back in original units) — they're easy to mix up.",
    ],
    code: {
      JavaScript: `function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function variance(arr) {
  const m = mean(arr);
  const squaredDiffs = arr.map((x) => (x - m) * (x - m));
  return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
}
function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

const data = [2, 4, 4, 4, 5, 5, 7, 9];
console.log("Data:", data.join(" "));
console.log("Mean:", mean(data).toFixed(2));
console.log("Variance:", variance(data).toFixed(2));
console.log("Standard deviation:", stdDev(data).toFixed(2));`,
      Python: `import math

def mean(arr):
    return sum(arr) / len(arr)

def variance(arr):
    m = mean(arr)
    squared_diffs = [(x - m) ** 2 for x in arr]
    return sum(squared_diffs) / len(arr)

def std_dev(arr):
    return math.sqrt(variance(arr))

data = [2, 4, 4, 4, 5, 5, 7, 9]
print("Data:", " ".join(str(v) for v in data))
print("Mean:", f"{mean(data):.2f}")
print("Variance:", f"{variance(data):.2f}")
print("Standard deviation:", f"{std_dev(data):.2f}")`,
    },
    output: `Data: 2 4 4 4 5 5 7 9
Mean: 5.00
Variance: 4.00
Standard deviation: 2.00`,
  },
  {
    id: "min-max-normalization",
    pillar: "Data Science",
    name: "Min-Max Normalization",
    easy: "Normalization is like putting everyone's test scores on the same 0-to-1 scale so you can compare a score from a test out of 50 with one out of 500. Min-max normalization specifically squishes every value into that 0-to-1 range: the smallest value in your data becomes 0, the largest becomes 1, and everything else lands proportionally in between.",
    how: [
      "Find the smallest (min) and largest (max) values in your data.",
      "For each value, subtract the min, then divide by the range (max minus min).",
      "The smallest value becomes exactly 0, the largest becomes exactly 1, and everything else falls proportionally between them.",
    ],
    when: "Use it before feeding numeric features into machine learning models that are sensitive to scale (like k-nearest neighbors or gradient descent) — so a feature measured in the thousands (like salary) doesn't drown out one measured in single digits (like age).",
    big: "One pass to find min and max, one more pass to normalize — O(n) time, O(n) space for the output.",
    mistakes: [
      "Normalizing before splitting into training and test data, which leaks information about the test set into training.",
      "Dividing by zero when every value in the data is identical (max equals min) — that needs a special case.",
    ],
    code: {
      JavaScript: `function normalize(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  return arr.map((x) => (x - min) / (max - min));
}

const data = [10, 20, 30, 40, 50];
const normalized = normalize(data);
console.log("Data:", data.join(" "));
console.log("Normalized:", normalized.map((x) => x.toFixed(2)).join(" "));`,
      Python: `def normalize(arr):
    lo = min(arr)
    hi = max(arr)
    return [(x - lo) / (hi - lo) for x in arr]

data = [10, 20, 30, 40, 50]
normalized = normalize(data)
print("Data:", " ".join(str(v) for v in data))
print("Normalized:", " ".join(f"{x:.2f}" for x in normalized))`,
    },
    output: `Data: 10 20 30 40 50
Normalized: 0.00 0.25 0.50 0.75 1.00`,
  },
  {
    id: "linear-regression",
    pillar: "Data Science",
    name: "Linear Regression",
    easy: "Linear regression is about drawing the single straightest line through a scatter of points that fits them as closely as possible — like stretching a rubber band across a cloud of dots so it sits right through the middle of them. Once you have that line, you can use it to predict a value you haven't seen yet, just by reading it off the line.",
    how: [
      "Take your (x, y) data points — for example, hours studied (x) versus test score (y).",
      "Use the least-squares formula to compute the line's slope (how steep it is) and intercept (where it crosses the y-axis) — the formula picks the line that minimizes the total squared distance from every point to the line.",
      "To predict a new y for any x, just plug x into the line's equation: y = slope * x + intercept.",
    ],
    when: "Whenever you want to predict a numeric outcome from a numeric input and the relationship looks roughly like a straight line — predicting house prices from square footage, or sales from ad spend.",
    big: "O(n) time to compute the sums needed for slope and intercept — a single pass over the data.",
    mistakes: [
      "Trusting the line far outside the range of your original data ('extrapolating') — the real relationship might curve or break down out there.",
      "Using linear regression on data that isn't actually linear — check with a scatter plot first, or the line will fit poorly no matter what.",
    ],
    code: {
      JavaScript: `function linearRegression(xs, ys) {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

const xs = [1, 2, 3, 4];
const ys = [3, 5, 7, 9];
const { slope, intercept } = linearRegression(xs, ys);
console.log("Points:", xs.map((x, i) => \`(\${x},\${ys[i]})\`).join(" "));
console.log("Slope:", slope.toFixed(2));
console.log("Intercept:", intercept.toFixed(2));
console.log("Prediction at x=5:", (slope * 5 + intercept).toFixed(2));`,
      Python: `def linear_regression(xs, ys):
    n = len(xs)
    sum_x = sum(xs)
    sum_y = sum(ys)
    sum_xy = sum(x * y for x, y in zip(xs, ys))
    sum_xx = sum(x * x for x in xs)

    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x)
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept

xs = [1, 2, 3, 4]
ys = [3, 5, 7, 9]
slope, intercept = linear_regression(xs, ys)
print("Points:", " ".join(f"({x},{y})" for x, y in zip(xs, ys)))
print("Slope:", f"{slope:.2f}")
print("Intercept:", f"{intercept:.2f}")
print("Prediction at x=5:", f"{slope * 5 + intercept:.2f}")`,
    },
    output: `Points: (1,3) (2,5) (3,7) (4,9)
Slope: 2.00
Intercept: 1.00
Prediction at x=5: 11.00`,
  },
  {
    id: "k-means-clustering",
    pillar: "Data Science",
    name: "K-Means Clustering",
    easy: "K-means clustering is like sorting a pile of mixed candy into a fixed number of bowls by color, when you don't even know the color groups ahead of time. You start by guessing a few 'bowl centers', put each candy in the bowl with the closest center, then move each bowl's center to the middle of the candy that ended up in it — and repeat until the bowls stop changing.",
    how: [
      "Pick k starting center points (here we fix them ahead of time so the result is the same every run).",
      "Assign every data point to whichever center is closest to it — that creates k clusters.",
      "Move each center to the average position of the points now assigned to it, then repeat the assign-and-move steps until the centers stop moving.",
    ],
    when: "Grouping similar things when you don't have labels for them — customer segmentation, grouping similar images, or finding natural clusters in sensor readings.",
    big: "Each round is O(n * k) to compare every point against every center — repeated for a fixed number of rounds until the centers settle.",
    mistakes: [
      "Picking random starting centers without fixing them — different runs can land on different (and sometimes worse) groupings.",
      "Choosing the wrong number of clusters (k) — too few lumps unrelated things together, too many splits a real group apart.",
    ],
    code: {
      JavaScript: `function distance(a, b) {
  return Math.abs(a - b);
}

function kMeans(points, initialCenters, maxIterations) {
  let centers = [...initialCenters];
  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign each point to its closest center.
    for (let i = 0; i < points.length; i++) {
      let best = 0;
      let bestDist = distance(points[i], centers[0]);
      for (let c = 1; c < centers.length; c++) {
        const d = distance(points[i], centers[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      assignments[i] = best;
    }

    // Recompute each center as the mean of its assigned points.
    const newCenters = centers.map((_, c) => {
      const members = points.filter((_, i) => assignments[i] === c);
      const sum = members.reduce((a, b) => a + b, 0);
      return sum / members.length;
    });

    // Stop early once the centers settle.
    if (newCenters.every((c, i) => c === centers[i])) {
      centers = newCenters;
      break;
    }
    centers = newCenters;
  }

  return { centers, assignments };
}

const points = [1, 2, 3, 10, 11, 12];
const { centers, assignments } = kMeans(points, [1, 10], 10);

const cluster1 = points.filter((_, i) => assignments[i] === 0);
const cluster2 = points.filter((_, i) => assignments[i] === 1);

console.log("Points:", points.join(" "));
console.log("Initial centers:", [1, 10].join(" "));
console.log("Final centers:", centers.map((c) => c.toFixed(2)).join(" "));
console.log("Cluster 1:", cluster1.join(" "));
console.log("Cluster 2:", cluster2.join(" "));`,
      Python: `def distance(a, b):
    return abs(a - b)

def k_means(points, initial_centers, max_iterations):
    centers = initial_centers[:]
    assignments = [0] * len(points)

    for _ in range(max_iterations):
        # Assign each point to its closest center.
        for i, p in enumerate(points):
            best = 0
            best_dist = distance(p, centers[0])
            for c in range(1, len(centers)):
                d = distance(p, centers[c])
                if d < best_dist:
                    best_dist = d
                    best = c
            assignments[i] = best

        # Recompute each center as the mean of its assigned points.
        new_centers = []
        for c in range(len(centers)):
            members = [points[i] for i in range(len(points)) if assignments[i] == c]
            new_centers.append(sum(members) / len(members))

        # Stop early once the centers settle.
        if new_centers == centers:
            centers = new_centers
            break
        centers = new_centers

    return centers, assignments

points = [1, 2, 3, 10, 11, 12]
centers, assignments = k_means(points, [1, 10], 10)

cluster1 = [points[i] for i in range(len(points)) if assignments[i] == 0]
cluster2 = [points[i] for i in range(len(points)) if assignments[i] == 1]

print("Points:", " ".join(str(v) for v in points))
print("Initial centers:", " ".join(str(v) for v in [1, 10]))
print("Final centers:", " ".join(f"{c:.2f}" for c in centers))
print("Cluster 1:", " ".join(str(v) for v in cluster1))
print("Cluster 2:", " ".join(str(v) for v in cluster2))`,
    },
    output: `Points: 1 2 3 10 11 12
Initial centers: 1 10
Final centers: 2.00 11.00
Cluster 1: 1 2 3
Cluster 2: 10 11 12`,
  },
  {
    id: "one-hot-encoding",
    pillar: "Data Science",
    name: "One-Hot Encoding",
    easy: "Computers do math, not words, so if a feature is a category like 'red', 'green', or 'blue', you can't just hand it to a model as text. One-hot encoding turns each category into its own on/off switch: you list every possible category, then flip exactly one switch to 1 (for whichever category this item is) and leave every other switch at 0 — like a row of light switches where only one bulb is ever lit at a time.",
    how: [
      "List every possible category once, in a fixed order — that fixed order becomes the position of each switch.",
      "For a given item, create a list of 0s the same length as the category list.",
      "Set the 1 at the position matching this item's category, leaving every other position 0.",
    ],
    when: "Preparing categorical data (colors, countries, product types) for machine learning models that expect numbers, not text, and that shouldn't assume any category is 'bigger' or 'closer' to another.",
    big: "O(1) to encode a single item once you know the category list (just a length-k list of 0s and one 1) · O(n * k) to encode n items across k categories.",
    mistakes: [
      "Using plain numbers instead (red=1, green=2, blue=3) — that accidentally tells the model blue is 'more' than red, which makes no sense for categories.",
      "Using a different category order for different items — the same category must always land in the same switch position.",
    ],
    code: {
      JavaScript: `function oneHotEncode(categories, item) {
  return categories.map((c) => (c === item ? 1 : 0));
}

const categories = ["blue", "green", "red"];
const items = ["red", "blue", "green", "red"];

console.log("Categories:", categories.join(" "));
for (const item of items) {
  const vector = oneHotEncode(categories, item);
  console.log(item + " ->", vector.join(" "));
}`,
      Python: `def one_hot_encode(categories, item):
    return [1 if c == item else 0 for c in categories]

categories = ["blue", "green", "red"]
items = ["red", "blue", "green", "red"]

print("Categories:", " ".join(categories))
for item in items:
    vector = one_hot_encode(categories, item)
    print(item + " ->", " ".join(str(v) for v in vector))`,
    },
    output: `Categories: blue green red
red -> 0 0 1
blue -> 1 0 0
green -> 0 1 0
red -> 0 0 1`,
  },
  {
    id: "correlation-pearson",
    pillar: "Data Science",
    name: "Correlation (Pearson)",
    easy: "Correlation answers: when one thing goes up, does the other tend to go up too (or down, or just do its own thing)? Picture two friends' moods throughout the week — if they're almost always cheerful or grumpy on the same days, that's a strong positive correlation. Pearson's correlation squeezes that relationship into a single number from -1 (perfectly opposite) through 0 (no relationship at all) to +1 (perfectly together).",
    how: [
      "Find how far each x-value is from the average x, and each y-value is from the average y.",
      "Multiply those two differences together for each pair and add them all up — this rewards pairs that move together and penalizes pairs that move oppositely.",
      "Divide that sum by a measure of how spread out x and y each are on their own, which squeezes the final result into the -1 to +1 range.",
    ],
    when: "Checking whether two measurements are related before assuming one causes the other — like ice cream sales and temperature (correlated, but neither directly causes the other; both follow from summer heat).",
    big: "O(n) time — a single pass to gather the sums the formula needs.",
    mistakes: [
      "Treating correlation as proof of causation — two things can move together without one causing the other.",
      "Assuming a correlation near 0 means 'no relationship' — Pearson only catches straight-line relationships, and can miss a strong curved one.",
    ],
    code: {
      JavaScript: `function correlation(xs, ys) {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
  const sumYY = ys.reduce((acc, y) => acc + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  return numerator / denominator;
}

const xs = [1, 2, 3, 4, 5];
const ys = [4, 3, 5, 7, 6];
console.log("X:", xs.join(" "));
console.log("Y:", ys.join(" "));
console.log("Correlation:", correlation(xs, ys).toFixed(2));`,
      Python: `import math

def correlation(xs, ys):
    n = len(xs)
    sum_x = sum(xs)
    sum_y = sum(ys)
    sum_xy = sum(x * y for x, y in zip(xs, ys))
    sum_xx = sum(x * x for x in xs)
    sum_yy = sum(y * y for y in ys)

    numerator = n * sum_xy - sum_x * sum_y
    denominator = math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y))
    return numerator / denominator

xs = [1, 2, 3, 4, 5]
ys = [4, 3, 5, 7, 6]
print("X:", " ".join(str(v) for v in xs))
print("Y:", " ".join(str(v) for v in ys))
print("Correlation:", f"{correlation(xs, ys):.2f}")`,
    },
    output: `X: 1 2 3 4 5
Y: 4 3 5 7 6
Correlation: 0.80`,
  },
  {
    id: "k-nearest-neighbors",
    pillar: "Data Science",
    name: "K-Nearest Neighbors",
    easy: "K-nearest neighbors classifies a new point by peer pressure: 'you are like the people standing closest to you.' To label a new point, you measure its distance to every point you already have labels for, look at the k closest ones, and let them vote — whichever label is most common among those neighbors becomes the prediction.",
    how: [
      "Measure the distance from the new point to every labeled point you have.",
      "Sort those distances and keep the k closest labeled points — these are the 'nearest neighbors'.",
      "Count up the labels among those k neighbors and predict whichever label appears most often.",
    ],
    when: "Simple classification tasks with a reasonably small, well-labeled dataset — like recommending a product category based on similar past customers, or classifying a flower species from its measurements.",
    big: "O(n) time per prediction to check the distance to every existing point — no separate training step, but predictions get slower as the dataset grows.",
    mistakes: [
      "Picking an even k in a two-class problem, which can produce ties in the vote.",
      "Not scaling features first — a feature measured in the thousands (like income) can dominate the distance calculation over one measured in single digits (like age).",
    ],
    code: {
      JavaScript: `function squaredDistance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function knnClassify(points, labels, query, k) {
  const distances = points.map((p, i) => ({ dist: squaredDistance(p, query), label: labels[i] }));
  distances.sort((a, b) => a.dist - b.dist);
  const nearest = distances.slice(0, k);

  const votes = {};
  for (const n of nearest) {
    votes[n.label] = (votes[n.label] || 0) + 1;
  }

  let bestLabel = nearest[0].label;
  let bestCount = 0;
  for (const label in votes) {
    if (votes[label] > bestCount) {
      bestCount = votes[label];
      bestLabel = label;
    }
  }
  return bestLabel;
}

const points = [[1, 1], [1, 2], [2, 1], [6, 5], [7, 5], [6, 6]];
const labels = ["A", "A", "A", "B", "B", "B"];
const query = [2, 2];

console.log("Query point:", query.join(","));
console.log("Predicted label:", knnClassify(points, labels, query, 3));`,
      Python: `def squared_distance(a, b):
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    return dx * dx + dy * dy

def knn_classify(points, labels, query, k):
    distances = [(squared_distance(p, query), labels[i]) for i, p in enumerate(points)]
    distances.sort(key=lambda d: d[0])
    nearest = distances[:k]

    votes = {}
    for _, label in nearest:
        votes[label] = votes.get(label, 0) + 1

    best_label = nearest[0][1]
    best_count = 0
    for label, count in votes.items():
        if count > best_count:
            best_count = count
            best_label = label
    return best_label

points = [[1, 1], [1, 2], [2, 1], [6, 5], [7, 5], [6, 6]]
labels = ["A", "A", "A", "B", "B", "B"]
query = [2, 2]

print("Query point:", ",".join(str(v) for v in query))
print("Predicted label:", knn_classify(points, labels, query, 3))`,
    },
    output: `Query point: 2,2
Predicted label: A`,
  },
];

export default lessons;
