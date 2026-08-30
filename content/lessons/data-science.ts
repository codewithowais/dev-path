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
    easy: "Picture a seesaw with all your numbers sitting on it. The mean (the 'average') is the exact spot where the seesaw balances — big numbers pull it one way, small numbers pull it the other. The median is different: line everyone up in order from smallest to largest, and the median is just the one standing in the middle. The mode is the simplest of all — it's whichever number shows up the most, like the most popular answer in a room.",
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
    easy: "Think of a classroom full of kids' heights. The mean is just the average height. Standard deviation tells you how spread out everyone is around that average. A small standard deviation means most kids are close to average — similar heights. A large one means heights are all over the place, short to tall. Variance is the same idea, one step earlier: it's the 'squared spread'. Take its square root and you get the standard deviation, back in normal units (like centimeters, not centimeters-squared).",
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
    easy: "Say one test is graded out of 50 and another out of 500 — you can't compare the raw scores fairly. Normalization fixes this by putting every score on the same 0-to-1 scale. Min-max normalization does exactly that: the smallest value in your data becomes 0, the largest becomes 1, and everything else lands proportionally in between.",
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
    easy: "Linear regression finds the single straightest line through a scatter of dots. Think of stretching a rubber band across a cloud of points until it settles right through the middle of them. Once you have that line, you can predict a value you haven't seen yet — just read it off the line.",
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
    easy: "Imagine sorting a pile of mixed candy into a few bowls by color — but you don't know the colors ahead of time. You start by guessing where a few 'bowl centers' are. Each piece of candy goes into the bowl with the closest center. Then you move each center to the middle of the candy that landed in its bowl. Repeat this until the bowls stop changing.",
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
    easy: "Computers understand numbers, not words. So if a feature is a category — like 'red', 'green', or 'blue' — you can't just hand it to a model as text. One-hot encoding turns each category into its own on/off light switch. Line up every possible category in a row. Flip on exactly one switch — the one matching this item's category — and leave every other switch off, like a row of bulbs where only one is ever lit.",
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
    easy: "Correlation answers one question: when one thing goes up, does the other tend to go up too? Picture two friends' moods through the week. If they're cheerful or grumpy on the same days, that's a strong positive correlation. Pearson's correlation turns that relationship into a single number: -1 means perfectly opposite, 0 means no relationship at all, and +1 means perfectly together.",
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
    easy: "K-nearest neighbors works like peer pressure: 'you are like the people standing closest to you.' To label a new point, measure its distance to every point you already know the label for. Look at the k closest ones. Let them vote — whichever label is most common among those neighbors becomes your prediction.",
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
  {
    id: "z-score-standardization",
    pillar: "Data Science",
    name: "Z-Score Standardization",
    easy: "Say you scored 90 on a hard test where the average was 70, and also 90 on an easy test where the average was 85. Which 90 is more impressive? Raw scores can't tell you — but z-scores can. A z-score answers one question: how many standard deviations away from the average is this value? A z-score of 0 means exactly average. A z-score of +2 means solidly above average. A z-score of -1 means a bit below average. Once every value is turned into a z-score, you can fairly compare numbers that come from completely different scales.",
    how: [
      "Find the mean and the standard deviation of the whole dataset.",
      "For each value, subtract the mean — that tells you how far it is from average, in the original units.",
      "Divide that difference by the standard deviation — that rescales the distance into 'number of standard deviations', which is the z-score.",
    ],
    when: "Use z-scores whenever you need to compare values from different scales or different distributions — like comparing a student's math score to their reading score, or flagging unusually large transactions in fraud detection. It's also a common step before feeding data into models that expect roughly centered, evenly-scaled features.",
    big: "One pass to compute the mean, one more for the standard deviation, one more to compute every z-score — O(n) time, O(n) space for the output.",
    mistakes: [
      "Computing the mean and standard deviation on the wrong dataset — always compute them from the training data, then reuse those same two numbers to standardize the test data.",
      "Mixing up z-score standardization (mean 0, spread measured in standard deviations) with min-max normalization (a fixed 0-to-1 range) — they solve a similar problem in different ways.",
    ],
    code: {
      JavaScript: `function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stdDev(arr) {
  const m = mean(arr);
  const variance = arr.reduce((a, x) => a + (x - m) * (x - m), 0) / arr.length;
  return Math.sqrt(variance);
}
function zScores(arr) {
  const m = mean(arr);
  const s = stdDev(arr);
  return arr.map((x) => (x - m) / s);
}

const data = [2, 4, 4, 4, 5, 5, 7, 9];
const scores = zScores(data);
console.log("Data:", data.join(" "));
console.log("Mean:", mean(data).toFixed(2));
console.log("Standard deviation:", stdDev(data).toFixed(2));
console.log("Z-scores:", scores.map((z) => z.toFixed(2)).join(" "));`,
      Python: `import math

def mean(arr):
    return sum(arr) / len(arr)

def std_dev(arr):
    m = mean(arr)
    variance = sum((x - m) ** 2 for x in arr) / len(arr)
    return math.sqrt(variance)

def z_scores(arr):
    m = mean(arr)
    s = std_dev(arr)
    return [(x - m) / s for x in arr]

data = [2, 4, 4, 4, 5, 5, 7, 9]
scores = z_scores(data)
print("Data:", " ".join(str(v) for v in data))
print("Mean:", f"{mean(data):.2f}")
print("Standard deviation:", f"{std_dev(data):.2f}")
print("Z-scores:", " ".join(f"{z:.2f}" for z in scores))`,
    },
    output: `Data: 2 4 4 4 5 5 7 9
Mean: 5.00
Standard deviation: 2.00
Z-scores: -1.50 -0.50 -0.50 -0.50 0.00 0.00 1.00 2.00`,
  },
  {
    id: "train-test-split",
    pillar: "Data Science",
    name: "Train/Test Split",
    easy: "Before trusting a model, you need to check its homework on questions it has never seen. That's why we split data into two piles: a training set the model learns from, and a test set we hold back to grade it honestly afterward. Here we use a simple, deterministic split — always taking the same first chunk as training and the rest as testing — so it's exactly reproducible every time you run it. (In real projects, you'd usually shuffle first with a fixed random seed, so the training set isn't just 'whatever came first' in the file.)",
    how: [
      "Decide how many examples should go into the training set — for example, 7 out of 10.",
      "Take that many examples from the front of the data, in the order they appear, as the training set.",
      "Everything left over becomes the test set.",
    ],
    when: "Every time you build a predictive model. Without a held-out test set, you have no honest way to know if the model actually learned the pattern or just memorized the training data.",
    big: "O(1) time to slice — cutting a list into two pieces just copies each element once, no extra scanning needed.",
    mistakes: [
      "Testing on the same data you trained on — that always looks great and tells you nothing about how the model handles new data.",
      "Using a plain first-chunk split on data that's sorted or grouped by category — you could end up with a training set that never sees an entire category. Shuffle first (with a fixed seed) unless the data is already in random order.",
    ],
    code: {
      JavaScript: `function trainTestSplit(data, trainCount) {
  return {
    train: data.slice(0, trainCount),
    test: data.slice(trainCount),
  };
}

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const { train, test } = trainTestSplit(data, 7);
console.log("Data:", data.join(" "));
console.log("Train size:", train.length);
console.log("Test size:", test.length);
console.log("Train:", train.join(" "));
console.log("Test:", test.join(" "));`,
      Python: `def train_test_split(data, train_count):
    return data[:train_count], data[train_count:]

data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
train, test = train_test_split(data, 7)
print("Data:", " ".join(str(v) for v in data))
print("Train size:", len(train))
print("Test size:", len(test))
print("Train:", " ".join(str(v) for v in train))
print("Test:", " ".join(str(v) for v in test))`,
    },
    output: `Data: 1 2 3 4 5 6 7 8 9 10
Train size: 7
Test size: 3
Train: 1 2 3 4 5 6 7
Test: 8 9 10`,
  },
  {
    id: "accuracy-confusion-matrix",
    pillar: "Data Science",
    name: "Accuracy & Confusion Matrix",
    easy: "Say a model predicts 'yes' or 'no' for ten emails, trying to catch spam. Accuracy is the simplest score: what fraction of predictions were correct? But accuracy alone can hide the real story. A confusion matrix breaks it down into four honest buckets: true positives (correctly said yes), true negatives (correctly said no), false positives (wrongly said yes), and false negatives (wrongly said no). Looking at all four tells you what kind of mistakes the model is actually making.",
    how: [
      "Line up each prediction next to the actual answer it was supposed to match.",
      "Count four things: true positives (predicted yes, actually yes), true negatives (predicted no, actually no), false positives (predicted yes, actually no), and false negatives (predicted no, actually yes).",
      "Accuracy is (true positives + true negatives) divided by the total number of predictions.",
    ],
    when: "Use accuracy for a fast overall sense of performance, but always check the confusion matrix too — especially when one outcome is rare (like fraud or disease detection), where a model can score 99% accuracy just by always guessing 'no'.",
    big: "O(n) time — one pass over the predictions to fill in the four counts.",
    mistakes: [
      "Trusting accuracy alone on lopsided data — if 95% of emails aren't spam, a model that always guesses 'not spam' gets 95% accuracy while catching zero real spam.",
      "Mixing up false positives and false negatives — a false positive is a false alarm, a false negative is a miss. Which one is worse depends entirely on the problem.",
    ],
    code: {
      JavaScript: `function evaluate(actual, predicted) {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === "yes" && predicted[i] === "yes") tp++;
    else if (actual[i] === "no" && predicted[i] === "no") tn++;
    else if (actual[i] === "no" && predicted[i] === "yes") fp++;
    else fn++;
  }
  return { tp, tn, fp, fn };
}

const actual =    ["yes", "yes", "yes", "yes", "no", "no", "no", "no", "no", "no"];
const predicted = ["yes", "yes", "yes", "no",  "no", "no", "no", "no", "yes", "no"];

const { tp, tn, fp, fn } = evaluate(actual, predicted);
const total = actual.length;
const accuracy = ((tp + tn) * 100) / total;

console.log("Actual:", actual.join(" "));
console.log("Predicted:", predicted.join(" "));
console.log("TP:", tp);
console.log("TN:", tn);
console.log("FP:", fp);
console.log("FN:", fn);
console.log("Accuracy:", accuracy.toFixed(2) + "%");`,
      Python: `def evaluate(actual, predicted):
    tp = tn = fp = fn = 0
    for a, p in zip(actual, predicted):
        if a == "yes" and p == "yes":
            tp += 1
        elif a == "no" and p == "no":
            tn += 1
        elif a == "no" and p == "yes":
            fp += 1
        else:
            fn += 1
    return tp, tn, fp, fn

actual =    ["yes", "yes", "yes", "yes", "no", "no", "no", "no", "no", "no"]
predicted = ["yes", "yes", "yes", "no",  "no", "no", "no", "no", "yes", "no"]

tp, tn, fp, fn = evaluate(actual, predicted)
total = len(actual)
accuracy = (tp + tn) * 100 / total

print("Actual:", " ".join(actual))
print("Predicted:", " ".join(predicted))
print("TP:", tp)
print("TN:", tn)
print("FP:", fp)
print("FN:", fn)
print("Accuracy:", f"{accuracy:.2f}%")`,
    },
    output: `Actual: yes yes yes yes no no no no no no
Predicted: yes yes yes no no no no no yes no
TP: 3
TN: 5
FP: 1
FN: 1
Accuracy: 80.00%`,
  },
  {
    id: "moving-average",
    pillar: "Data Science",
    name: "Moving Average",
    easy: "A moving average smooths out noisy data by averaging a small sliding window of nearby values — like judging a runner's pace using their last 3 laps instead of just the latest one, so one unusually fast or slow lap doesn't throw off the whole picture. As the window slides forward one step at a time, you get a fresh average at each position.",
    how: [
      "Pick a window size — how many consecutive values to average at once (for example, 3).",
      "Take the first window-size values and average them — that's the first moving average.",
      "Slide the window forward by one position and average again. Repeat until the window reaches the end of the data.",
    ],
    when: "Smoothing out short-term noise in a sequence of numbers over time — daily stock prices, sensor readings, website traffic — so you can see the underlying trend instead of every small bump.",
    big: "O(n) time overall if you reuse a running sum (drop the oldest value, add the new one) instead of re-summing the whole window each time; O(n * k) if you recompute the sum from scratch for each window of size k.",
    mistakes: [
      "Recomputing the full sum for every window from scratch on large data — wasteful when you could just subtract the value leaving the window and add the value entering it.",
      "Picking a window so large it smooths away the real signal along with the noise, or so small it barely smooths anything.",
    ],
    code: {
      JavaScript: `function movingAverage(arr, windowSize) {
  const result = [];
  for (let i = 0; i + windowSize <= arr.length; i++) {
    const window = arr.slice(i, i + windowSize);
    const sum = window.reduce((a, b) => a + b, 0);
    result.push(sum / windowSize);
  }
  return result;
}

const data = [10, 20, 30, 40, 50, 60];
const windowSize = 3;
const averages = movingAverage(data, windowSize);
console.log("Data:", data.join(" "));
console.log("Window size:", windowSize);
console.log("Moving averages:", averages.map((a) => a.toFixed(2)).join(" "));`,
      Python: `def moving_average(arr, window_size):
    result = []
    for i in range(len(arr) - window_size + 1):
        window = arr[i:i + window_size]
        result.append(sum(window) / window_size)
    return result

data = [10, 20, 30, 40, 50, 60]
window_size = 3
averages = moving_average(data, window_size)
print("Data:", " ".join(str(v) for v in data))
print("Window size:", window_size)
print("Moving averages:", " ".join(f"{a:.2f}" for a in averages))`,
    },
    output: `Data: 10 20 30 40 50 60
Window size: 3
Moving averages: 20.00 30.00 40.00 50.00`,
  },
  {
    id: "gradient-descent",
    pillar: "Data Science",
    name: "Gradient Descent",
    easy: "Imagine standing on a hillside in thick fog, trying to reach the lowest point in the valley by feel alone. You can't see the bottom, but you can feel which way the ground slopes down right where you're standing — so you take a small step that way, feel the slope again, and repeat. Gradient descent does exactly this for a math function: it repeatedly nudges a number in the direction that makes a 'cost' smaller, a fixed number of times, until it settles near the lowest point.",
    how: [
      "Start with an initial guess for x, and pick a learning rate — how big a step to take each time.",
      "Compute the gradient at the current x — a number that tells you which direction is 'uphill' and how steep it is.",
      "Update x by moving a small step opposite the gradient: x = x - learning_rate * gradient.",
      "Repeat the last two steps a fixed number of times — each step should land a little closer to the minimum.",
    ],
    when: "This is the engine behind training most machine learning models, including linear regression and neural networks — anywhere you need to find the input that minimizes some 'error' or 'cost', and there's no simple formula to jump straight to the answer.",
    big: "O(steps) time — each step does a small, fixed amount of work (compute the gradient, update x), repeated a fixed number of times.",
    mistakes: [
      "Picking a learning rate that's too large — the steps overshoot the minimum and can bounce around or fly off to infinity instead of settling down.",
      "Picking a learning rate that's too small — the steps crawl toward the minimum so slowly it barely makes progress in a reasonable number of steps.",
    ],
    code: {
      JavaScript: `function gradient(x) {
  return 2 * x;
}

function gradientDescent(start, learningRate, steps) {
  let x = start;
  const history = [];
  for (let i = 0; i < steps; i++) {
    x = x - learningRate * gradient(x);
    history.push(x);
  }
  return { x, history };
}

const start = 8;
const learningRate = 0.25;
const steps = 4;
const { x, history } = gradientDescent(start, learningRate, steps);
const cost = x * x;

console.log("Start x:", start.toFixed(2));
console.log("Learning rate:", learningRate.toFixed(2));
history.forEach((h, i) => {
  console.log(\`Step \${i + 1}: x = \${h.toFixed(2)}\`);
});
console.log("Final cost (x^2):", cost.toFixed(2));`,
      Python: `def gradient(x):
    return 2 * x

def gradient_descent(start, learning_rate, steps):
    x = start
    history = []
    for _ in range(steps):
        x = x - learning_rate * gradient(x)
        history.append(x)
    return x, history

start = 8
learning_rate = 0.25
steps = 4
x, history = gradient_descent(start, learning_rate, steps)
cost = x * x

print("Start x:", f"{start:.2f}")
print("Learning rate:", f"{learning_rate:.2f}")
for i, h in enumerate(history):
    print(f"Step {i + 1}: x = {h:.2f}")
print("Final cost (x^2):", f"{cost:.2f}")`,
    },
    output: `Start x: 8.00
Learning rate: 0.25
Step 1: x = 4.00
Step 2: x = 2.00
Step 3: x = 1.00
Step 4: x = 0.50
Final cost (x^2): 0.25`,
  },
];

export default lessons;
