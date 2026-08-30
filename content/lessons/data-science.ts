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
    easy: "Picture a seesaw with all your numbers sitting on it. The mean, or 'average', is the exact spot where the seesaw balances. Big numbers pull it one way. Small numbers pull it the other way. The median works differently. Line up your numbers from smallest to largest. The median is just the number standing in the middle. The mode is the simplest of the three. It is whichever number shows up the most, like the most popular answer in a room.",
    how: [
      "Add up every number, then divide the total by how many numbers you have. This gives you the mean.",
      "Sort your numbers from smallest to largest. Pick the number sitting exactly in the middle. That is the median. If there are two middle numbers, average them.",
      "Count how many times each number appears. The number that appears most often is the mode.",
    ],
    when: "Use the mean for a quick overall average. Use the median instead when a few extreme values, like one billionaire's income, would badly skew the mean. Use the mode when you care about the single most common category, like the most popular shoe size.",
    big: "Finding the mean or mode takes one pass through the data — O(n) time. Finding the median needs the data sorted first, so it takes O(n log n) time, unless the data is already sorted.",
    mistakes: [
      "Do not trust the mean when your data has outliers. One huge or tiny value can drag it far from what feels 'typical'.",
      "Do not forget to sort your numbers before finding the median. A 'middle' value from unsorted data means nothing.",
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
    easy: "Think of a classroom full of kids' heights. The mean is just the average height. Standard deviation tells you how spread out everyone is around that average. A small standard deviation means most kids are close to average, with similar heights. A large one means heights vary a lot, from short to tall. Variance measures the same thing, one step earlier. It is the 'squared spread'. Take its square root and you get the standard deviation, back in normal units, like centimeters instead of centimeters-squared.",
    how: [
      "Find the mean of all the numbers.",
      "For each number, find how far it is from the mean, then square that difference. Squaring makes every difference positive, so distances above and below the mean do not cancel out.",
      "Average all those squared differences. This is the variance. Take the square root of the variance to get the standard deviation, back in the original units.",
    ],
    when: "Use standard deviation to describe how consistent or volatile something is, such as exam scores, stock returns, or manufacturing tolerances. A weather forecaster comparing two cities' temperatures uses standard deviation to see which city has more unpredictable weather.",
    big: "You take one pass to find the mean, then one more pass for the squared differences — O(n) time, O(1) extra space.",
    mistakes: [
      "Do not forget to square the differences. Without squaring, the positive and negative differences would just cancel out to zero.",
      "Do not confuse variance (squared units, hard to interpret directly) with standard deviation (the square root, back in original units). They are easy to mix up.",
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
    easy: "Say one test is graded out of 50 and another out of 500. You cannot compare the raw scores fairly. Normalization fixes this by putting every score on the same 0-to-1 scale. Min-max normalization does exactly that. The smallest value in your data becomes 0. The largest becomes 1. Everything else lands proportionally in between.",
    how: [
      "Find the smallest (min) and largest (max) values in your data.",
      "For each value, subtract the min, then divide by the range (max minus min).",
      "The smallest value becomes exactly 0, and the largest becomes exactly 1. Everything else falls proportionally between them.",
    ],
    when: "Use this before feeding numeric features into machine learning models that are sensitive to scale, like k-nearest neighbors or gradient descent. This way, a feature measured in the thousands (like salary) does not drown out one measured in single digits (like age).",
    big: "You take one pass to find the min and max, then one more pass to normalize — O(n) time, O(n) space for the output.",
    mistakes: [
      "Do not normalize before splitting into training and test data. Doing so leaks information about the test set into training.",
      "Watch out for dividing by zero when every value in the data is identical (max equals min). That case needs special handling.",
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
    easy: "Linear regression finds the single straightest line through a scatter of dots. Think of stretching a rubber band across a cloud of points until it settles right through the middle of them. Once you have that line, you can predict a value you have not seen yet. Just read it off the line.",
    how: [
      "Take your (x, y) data points — for example, hours studied (x) versus test score (y).",
      "Use the least-squares formula to compute the line's slope (how steep it is) and intercept (where it crosses the y-axis). This formula picks the line that keeps the total squared distance from every point to the line as small as possible.",
      "To predict a new y for any x, plug x into the line's equation: y = slope * x + intercept.",
    ],
    when: "Use this whenever you want to predict a numeric outcome from a numeric input, and the relationship looks roughly like a straight line. Examples include predicting house prices from square footage, or sales from ad spend.",
    big: "It takes O(n) time to compute the sums needed for slope and intercept — a single pass over the data.",
    mistakes: [
      "Do not trust the line far outside the range of your original data (this is called 'extrapolating'). The real relationship might curve or break down out there.",
      "Do not use linear regression on data that is not actually linear. Check with a scatter plot first, or the line will fit poorly no matter what.",
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
    easy: "Imagine sorting a pile of mixed candy into a few bowls by color, but you do not know the colors ahead of time. You start by guessing where a few 'bowl centers' are. Each piece of candy goes into the bowl with the closest center. Then you move each center to the middle of the candy that landed in its bowl. You repeat this until the bowls stop changing.",
    how: [
      "Pick k starting center points (here we fix them ahead of time so the result is the same every run).",
      "Assign every data point to whichever center is closest to it. This creates k clusters.",
      "Move each center to the average position of the points now assigned to it. Repeat the assign-and-move steps until the centers stop moving.",
    ],
    when: "Use this to group similar things when you do not have labels for them, such as customer segmentation, grouping similar images, or finding natural clusters in sensor readings.",
    big: "Each round takes O(n * k) time to compare every point against every center. This repeats for a fixed number of rounds until the centers settle.",
    mistakes: [
      "Do not pick random starting centers without fixing them. Different runs can land on different, and sometimes worse, groupings.",
      "Do not choose the wrong number of clusters (k). Too few lumps unrelated things together. Too many splits a real group apart.",
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
    easy: "Computers understand numbers, not words. So if a feature is a category, like 'red', 'green', or 'blue', you cannot just hand it to a model as text. One-hot encoding turns each category into its own on/off light switch. Line up every possible category in a row. Flip on exactly one switch: the one matching this item's category. Leave every other switch off, like a row of bulbs where only one is ever lit.",
    how: [
      "List every possible category once, in a fixed order. That fixed order becomes the position of each switch.",
      "For a given item, create a list of 0s the same length as the category list.",
      "Set a 1 at the position matching this item's category. Leave every other position at 0.",
    ],
    when: "Use this when preparing categorical data (colors, countries, product types) for machine learning models that expect numbers, not text, and that should not assume one category is 'bigger' or 'closer' to another.",
    big: "It takes O(1) time to encode a single item once you know the category list, since that is just a length-k list of 0s and one 1. It takes O(n * k) time to encode n items across k categories.",
    mistakes: [
      "Do not use plain numbers instead (red=1, green=2, blue=3). That accidentally tells the model blue is 'more' than red, which makes no sense for categories.",
      "Do not use a different category order for different items. The same category must always land in the same switch position.",
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
    easy: "Correlation answers one question: when one thing goes up, does the other tend to go up too? Picture two friends' moods through the week. If they are cheerful or grumpy on the same days, that is a strong positive correlation. Pearson's correlation turns that relationship into a single number. A value of -1 means perfectly opposite. A value of 0 means no relationship at all. A value of +1 means perfectly together.",
    how: [
      "Find how far each x-value is from the average x, and each y-value is from the average y.",
      "Multiply those two differences together for each pair, then add them all up. This rewards pairs that move together and penalizes pairs that move oppositely.",
      "Divide that sum by a measure of how spread out x and y each are on their own. This squeezes the final result into the -1 to +1 range.",
    ],
    when: "Use this to check whether two measurements are related before assuming one causes the other. For example, ice cream sales and temperature are correlated, but neither directly causes the other; both follow from summer heat.",
    big: "This takes O(n) time — a single pass to gather the sums the formula needs.",
    mistakes: [
      "Do not treat correlation as proof of causation. Two things can move together without one causing the other.",
      "Do not assume a correlation near 0 means 'no relationship'. Pearson only catches straight-line relationships, and can miss a strong curved one.",
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
    easy: "K-nearest neighbors works like peer pressure: 'you are like the people standing closest to you.' To label a new point, measure its distance to every point you already know the label for. Look at the k closest ones. Let them vote. Whichever label is most common among those neighbors becomes your prediction.",
    how: [
      "Measure the distance from the new point to every labeled point you have.",
      "Sort those distances and keep the k closest labeled points. These are the 'nearest neighbors'.",
      "Count up the labels among those k neighbors and predict whichever label appears most often.",
    ],
    when: "Use this for simple classification tasks with a reasonably small, well-labeled dataset. Examples include recommending a product category based on similar past customers, or classifying a flower species from its measurements.",
    big: "This takes O(n) time per prediction, since you check the distance to every existing point. There is no separate training step, but predictions get slower as the dataset grows.",
    mistakes: [
      "Do not pick an even k in a two-class problem. This can produce ties in the vote.",
      "Do not skip scaling your features first. A feature measured in the thousands (like income) can dominate the distance calculation over one measured in single digits (like age).",
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
    easy: "Say you scored 90 on a hard test where the average was 70, and also 90 on an easy test where the average was 85. Which 90 is more impressive? Raw scores cannot tell you, but z-scores can. A z-score answers one question: how many standard deviations away from the average is this value? A z-score of 0 means exactly average. A z-score of +2 means solidly above average. A z-score of -1 means a bit below average. Once you turn every value into a z-score, you can fairly compare numbers that come from completely different scales.",
    how: [
      "Find the mean and the standard deviation of the whole dataset.",
      "For each value, subtract the mean. This tells you how far it is from average, in the original units.",
      "Divide that difference by the standard deviation. This rescales the distance into 'number of standard deviations', which is the z-score.",
    ],
    when: "Use z-scores whenever you need to compare values from different scales or different distributions, like comparing a student's math score to their reading score, or flagging unusually large transactions in fraud detection. This is also a common step before feeding data into models that expect roughly centered, evenly-scaled features.",
    big: "You take one pass to compute the mean, one more for the standard deviation, and one more to compute every z-score — O(n) time, O(n) space for the output.",
    mistakes: [
      "Do not compute the mean and standard deviation on the wrong dataset. Always compute them from the training data, then reuse those same two numbers to standardize the test data.",
      "Do not mix up z-score standardization (mean 0, spread measured in standard deviations) with min-max normalization (a fixed 0-to-1 range). They solve a similar problem in different ways.",
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
    easy: "Before trusting a model, you need to check its homework on questions it has never seen. That is why you split data into two piles: a training set the model learns from, and a test set you hold back to grade it honestly afterward. Here we use a simple, fixed split. We always take the same first chunk as training and the rest as testing, so the result is exactly the same every time you run it. In real projects, you would usually shuffle first with a fixed random seed, so the training set is not just 'whatever came first' in the file.",
    how: [
      "Decide how many examples should go into the training set — for example, 7 out of 10.",
      "Take that many examples from the front of the data, in the order they appear, as the training set.",
      "Everything left over becomes the test set.",
    ],
    when: "Do this every time you build a predictive model. Without a held-out test set, you have no honest way to know if the model actually learned the pattern or just memorized the training data.",
    big: "Slicing takes O(1) time, since cutting a list into two pieces just copies each element once, with no extra scanning needed.",
    mistakes: [
      "Do not test on the same data you trained on. That always looks great and tells you nothing about how the model handles new data.",
      "Do not use a plain first-chunk split on data that is sorted or grouped by category. You could end up with a training set that never sees an entire category. Shuffle first, with a fixed seed, unless the data is already in random order.",
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
    easy: "Say a model predicts 'yes' or 'no' for ten emails, trying to catch spam. Accuracy is the simplest score. It tells you what fraction of predictions were correct. But accuracy alone can hide the real story. A confusion matrix breaks it down into four honest buckets: true positives (correctly said yes), true negatives (correctly said no), false positives (wrongly said yes), and false negatives (wrongly said no). Looking at all four tells you what kind of mistakes the model is actually making.",
    how: [
      "Line up each prediction next to the actual answer it was supposed to match.",
      "Count four things: true positives (predicted yes, actually yes), true negatives (predicted no, actually no), false positives (predicted yes, actually no), and false negatives (predicted no, actually yes).",
      "Accuracy is the number of true positives plus true negatives, divided by the total number of predictions.",
    ],
    when: "Use accuracy for a fast overall sense of performance, but always check the confusion matrix too. This matters especially when one outcome is rare, like fraud or disease detection, where a model can score 99% accuracy just by always guessing 'no'.",
    big: "This takes O(n) time — one pass over the predictions to fill in the four counts.",
    mistakes: [
      "Do not trust accuracy alone on lopsided data. If 95% of emails are not spam, a model that always guesses 'not spam' gets 95% accuracy while catching zero real spam.",
      "Do not mix up false positives and false negatives. A false positive is a false alarm. A false negative is a miss. Which one is worse depends entirely on the problem.",
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
    easy: "A moving average smooths out noisy data by averaging a small sliding window of nearby values. This is like judging a runner's pace using their last 3 laps instead of just the latest one, so one unusually fast or slow lap does not throw off the whole picture. As the window slides forward one step at a time, you get a fresh average at each position.",
    how: [
      "Pick a window size — how many consecutive values to average at once (for example, 3).",
      "Take the first window-size values and average them. That is the first moving average.",
      "Slide the window forward by one position and average again. Repeat until the window reaches the end of the data.",
    ],
    when: "Use this to smooth out short-term noise in a sequence of numbers over time, such as daily stock prices, sensor readings, or website traffic. This lets you see the underlying trend instead of every small bump.",
    big: "This takes O(n) time overall if you reuse a running sum, dropping the oldest value and adding the new one, instead of re-summing the whole window each time. It takes O(n * k) time if you recompute the sum from scratch for each window of size k.",
    mistakes: [
      "Do not recompute the full sum for every window from scratch on large data. That is wasteful when you could just subtract the value leaving the window and add the value entering it.",
      "Do not pick a window so large it smooths away the real signal along with the noise, or so small it barely smooths anything.",
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
    easy: "Imagine standing on a hillside in thick fog, trying to reach the lowest point in the valley by feel alone. You cannot see the bottom, but you can feel which way the ground slopes down right where you are standing. So you take a small step that way, feel the slope again, and repeat. Gradient descent does exactly this for a math function. It repeatedly nudges a number in the direction that makes a 'cost' smaller, a fixed number of times, until it settles near the lowest point.",
    how: [
      "Start with an initial guess for x, and pick a learning rate — how big a step to take each time.",
      "Compute the gradient at the current x. This is a number that tells you which direction is 'uphill' and how steep it is.",
      "Update x by moving a small step opposite the gradient: x = x - learning_rate * gradient.",
      "Repeat the last two steps a fixed number of times. Each step should land a little closer to the minimum.",
    ],
    when: "This is the engine behind training most machine learning models, including linear regression and neural networks. Use it anywhere you need to find the input that minimizes some 'error' or 'cost', and there is no simple formula to jump straight to the answer.",
    big: "This takes O(steps) time. Each step does a small, fixed amount of work (compute the gradient, update x), repeated a fixed number of times.",
    mistakes: [
      "Do not pick a learning rate that is too large. The steps overshoot the minimum and can bounce around or fly off to infinity instead of settling down.",
      "Do not pick a learning rate that is too small. The steps crawl toward the minimum so slowly that progress barely happens in a reasonable number of steps.",
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
  {
    id: "percentiles-quartiles",
    pillar: "Data Science",
    name: "Percentiles & Quartiles",
    easy: "Imagine every runner in a marathon lined up from slowest to fastest, and someone tells you 'you finished in the 90th percentile.' That means 90% of runners were slower than you. You beat 90 out of every 100 people. A percentile just tells you where one value sits compared to everyone else, once everything is sorted. Quartiles are just percentiles cut into quarters. Q1 is the 25th percentile (a quarter of the way through). Q2 is the 50th percentile (the median, halfway through). Q3 is the 75th percentile (three-quarters of the way through).",
    how: [
      "Sort all the values from smallest to largest.",
      "To find the value at percentile p, work out its 'rank' first. The rank is the position that is p percent of the way through the sorted list, counting from the first item.",
      "If that rank falls exactly on an item, that item is your answer. If it falls between two items, blend them proportionally (this is called interpolation) to get a value in between.",
      "Q1, Q2 (the median), and Q3 are just this same percentile calculation run at p = 25, 50, and 75.",
    ],
    when: "Use percentiles whenever 'average' does not tell the whole story. For example, when reporting website load times, the 95th percentile shows how bad the worst experiences get, which the mean would hide. Percentiles are also useful for grading on a curve. Quartiles specifically are the backbone of the box plot and the interquartile range (IQR), a robust way to measure spread that ignores extreme outliers.",
    big: "Sorting the data dominates the cost — O(n log n) time. Once sorted, computing any single percentile takes O(1) time.",
    mistakes: [
      "Do not forget to sort first. Percentiles and quartiles are meaningless on unsorted data.",
      "Do not assume every percentile lands exactly on a data point. It often falls between two values, and you need to interpolate rather than just round to the nearest one.",
    ],
    code: {
      JavaScript: `function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const rank = (p / 100) * (n - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const weight = rank - lower;
  if (lower === upper) return sorted[lower];
  return sorted[lower] + weight * (sorted[upper] - sorted[lower]);
}

function quartiles(arr) {
  return {
    q1: percentile(arr, 25),
    q2: percentile(arr, 50),
    q3: percentile(arr, 75),
  };
}

const data = [8, 21, 5, 14, 7, 18, 3, 13, 12];
const sorted = [...data].sort((a, b) => a - b);
const { q1, q2, q3 } = quartiles(data);
const iqr = q3 - q1;
const p90 = percentile(data, 90);

console.log("Data:", data.join(" "));
console.log("Sorted:", sorted.join(" "));
console.log("Q1 (25th pct):", q1.toFixed(2));
console.log("Q2 / Median (50th pct):", q2.toFixed(2));
console.log("Q3 (75th pct):", q3.toFixed(2));
console.log("IQR (Q3 - Q1):", iqr.toFixed(2));
console.log("90th percentile:", p90.toFixed(2));`,
      Python: `import math

def percentile(arr, p):
    sorted_arr = sorted(arr)
    n = len(sorted_arr)
    rank = (p / 100) * (n - 1)
    lower = math.floor(rank)
    upper = math.ceil(rank)
    weight = rank - lower
    if lower == upper:
        return sorted_arr[lower]
    return sorted_arr[lower] + weight * (sorted_arr[upper] - sorted_arr[lower])

def quartiles(arr):
    return percentile(arr, 25), percentile(arr, 50), percentile(arr, 75)

data = [8, 21, 5, 14, 7, 18, 3, 13, 12]
sorted_data = sorted(data)
q1, q2, q3 = quartiles(data)
iqr = q3 - q1
p90 = percentile(data, 90)

print("Data:", " ".join(str(v) for v in data))
print("Sorted:", " ".join(str(v) for v in sorted_data))
print("Q1 (25th pct):", f"{q1:.2f}")
print("Q2 / Median (50th pct):", f"{q2:.2f}")
print("Q3 (75th pct):", f"{q3:.2f}")
print("IQR (Q3 - Q1):", f"{iqr:.2f}")
print("90th percentile:", f"{p90:.2f}")`,
    },
    output: `Data: 8 21 5 14 7 18 3 13 12
Sorted: 3 5 7 8 12 13 14 18 21
Q1 (25th pct): 7.00
Q2 / Median (50th pct): 12.00
Q3 (75th pct): 14.00
IQR (Q3 - Q1): 7.00
90th percentile: 18.60`,
  },
  {
    id: "naive-bayes-classifier",
    pillar: "Data Science",
    name: "Naive Bayes (tiny classifier)",
    easy: "Imagine a mail sorter who has read thousands of letters. They learned that words like 'win' and 'free' show up a lot in junk mail, while words like 'lunch' and 'meeting' show up a lot in real messages. When a new letter arrives, the sorter does not read it deeply. They just ask, for each word in it, 'how often did I see this word in spam versus real mail?' and multiply those odds together. Naive Bayes is that mail sorter turned into math. It is called 'naive' because it assumes every word's presence is independent of every other word. This assumption is wrong, but it makes the math simple, and the method still works well in practice.",
    how: [
      "Count how often every word appears in each class of training document (here: 'spam' and 'ham'), plus how many documents belong to each class.",
      "For a new message, start with the 'prior' — how common each class is overall. Then multiply in the probability of seeing each of the message's words in that class.",
      "Add 1 to every word count before dividing. This is called Laplace smoothing, and it stops a word the model has never seen from zeroing out the whole calculation.",
      "Whichever class ends up with the higher score after this multiplication is the prediction. Normalize the scores so they add up to 100% and read them as a probability.",
    ],
    when: "This is the classic go-to for text classification with small-to-medium data — spam filtering, sentiment tagging, or routing support tickets by topic. Use it anywhere 'which words appear' is a strong enough signal on its own, without needing word order or grammar.",
    big: "Training takes O(n) time, where n is the total number of words across all training documents — just counting. Classifying a new message with m words takes O(m) time, since each word needs one lookup.",
    mistakes: [
      "Do not skip Laplace smoothing. Without it, a single word the model has never seen in a class multiplies that class's score down to exactly zero, no matter how well every other word matched.",
      "Do not treat Naive Bayes' 'independence' assumption as literally true. Words in real language depend on each other, but the model works well anyway because it only needs to get the ranking between classes right, not the exact probabilities.",
    ],
    code: {
      JavaScript: `function tokenize(text) {
  return text.toLowerCase().split(" ");
}

function trainNB(docsByClass) {
  const wordCounts = {};
  const totalWords = {};
  const vocab = new Set();
  for (const cls in docsByClass) {
    wordCounts[cls] = {};
    totalWords[cls] = 0;
    for (const doc of docsByClass[cls]) {
      for (const word of tokenize(doc)) {
        wordCounts[cls][word] = (wordCounts[cls][word] || 0) + 1;
        totalWords[cls] += 1;
        vocab.add(word);
      }
    }
  }
  return { wordCounts, totalWords, vocab };
}

function classify(model, docsByClass, text) {
  const words = tokenize(text);
  const classes = Object.keys(docsByClass);
  const totalDocs = classes.reduce((sum, c) => sum + docsByClass[c].length, 0);
  const V = model.vocab.size;

  const scores = {};
  for (const cls of classes) {
    const prior = docsByClass[cls].length / totalDocs;
    let likelihood = 1;
    for (const word of words) {
      const count = model.wordCounts[cls][word] || 0;
      likelihood *= (count + 1) / (model.totalWords[cls] + V);
    }
    scores[cls] = prior * likelihood;
  }

  const total = classes.reduce((sum, c) => sum + scores[c], 0);
  const posterior = {};
  for (const cls of classes) posterior[cls] = scores[cls] / total;
  return posterior;
}

const docsByClass = {
  spam: ["win money now", "win a free prize", "free money for you"],
  ham: ["let us meet for lunch", "are we still on for the meeting", "lunch and a meeting tomorrow"],
};

const model = trainNB(docsByClass);
const testMessage = "win a free lunch";
const posterior = classify(model, docsByClass, testMessage);
const prediction = posterior.spam > posterior.ham ? "spam" : "ham";

console.log("Test message:", testMessage);
console.log("Vocabulary size:", model.vocab.size);
console.log("P(spam):", posterior.spam.toFixed(2));
console.log("P(ham):", posterior.ham.toFixed(2));
console.log("Prediction:", prediction);`,
      Python: `def tokenize(text):
    return text.lower().split(" ")

def train_nb(docs_by_class):
    word_counts = {}
    total_words = {}
    vocab = set()
    for cls in docs_by_class:
        word_counts[cls] = {}
        total_words[cls] = 0
        for doc in docs_by_class[cls]:
            for word in tokenize(doc):
                word_counts[cls][word] = word_counts[cls].get(word, 0) + 1
                total_words[cls] += 1
                vocab.add(word)
    return word_counts, total_words, vocab

def classify(word_counts, total_words, vocab, docs_by_class, text):
    words = tokenize(text)
    classes = list(docs_by_class.keys())
    total_docs = sum(len(docs_by_class[c]) for c in classes)
    v = len(vocab)

    scores = {}
    for cls in classes:
        prior = len(docs_by_class[cls]) / total_docs
        likelihood = 1
        for word in words:
            count = word_counts[cls].get(word, 0)
            likelihood *= (count + 1) / (total_words[cls] + v)
        scores[cls] = prior * likelihood

    total = sum(scores[c] for c in classes)
    return {cls: scores[cls] / total for cls in classes}

docs_by_class = {
    "spam": ["win money now", "win a free prize", "free money for you"],
    "ham": ["let us meet for lunch", "are we still on for the meeting", "lunch and a meeting tomorrow"],
}

word_counts, total_words, vocab = train_nb(docs_by_class)
test_message = "win a free lunch"
posterior = classify(word_counts, total_words, vocab, docs_by_class, test_message)
prediction = "spam" if posterior["spam"] > posterior["ham"] else "ham"

print("Test message:", test_message)
print("Vocabulary size:", len(vocab))
print("P(spam):", f"{posterior['spam']:.2f}")
print("P(ham):", f"{posterior['ham']:.2f}")
print("Prediction:", prediction)`,
    },
    output: `Test message: win a free lunch
Vocabulary size: 20
P(spam): 0.86
P(ham): 0.14
Prediction: spam`,
  },
  {
    id: "precision-recall-f1",
    pillar: "Data Science",
    name: "Precision / Recall / F1",
    easy: "Picture an airport security scanner flagging bags for a manual search. Precision asks: 'of all the bags you flagged, how many actually had something dangerous?' It punishes false alarms. Recall asks a different question: 'of all the actually dangerous bags, how many did you catch?' It punishes misses. You can game either one alone. You could flag every single bag for perfect recall, or flag almost nothing for perfect precision. F1 combines both into one number, called the harmonic mean, that only stays high when precision and recall are both reasonably good.",
    how: [
      "Start from the same counts as a confusion matrix: true positives (TP), false positives (FP), and false negatives (FN).",
      "Precision = TP / (TP + FP). Out of everything you predicted positive, this shows what fraction was actually positive.",
      "Recall = TP / (TP + FN). Out of everything that was actually positive, this shows what fraction you predicted positive.",
      "F1 = 2 * precision * recall / (precision + recall). This is the harmonic mean, and it stays low if either precision or recall is low, unlike a plain average would.",
    ],
    when: "Reach for these whenever accuracy alone would be misleading, especially with imbalanced data like fraud detection or disease screening. There, missing a rare positive (low recall) or crying wolf too often (low precision) matters far more than the overall percentage correct. Which of precision or recall matters more depends on whether false alarms or missed cases cost you more.",
    big: "This takes O(n) time — one pass over the predictions to count TP, FP, and FN, then a handful of arithmetic operations.",
    mistakes: [
      "Do not optimize only for accuracy on imbalanced data. A model that always predicts 'no' can still have terrible recall while looking fine on accuracy.",
      "Do not report precision or recall alone without the other. A model can reach 100% recall by predicting positive for everything, which tanks its precision, and vice versa. F1 catches that trade-off; either number alone can hide it.",
    ],
    code: {
      JavaScript: `function evaluate(actual, predicted) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === "yes" && predicted[i] === "yes") tp++;
    else if (actual[i] === "no" && predicted[i] === "yes") fp++;
    else if (actual[i] === "yes" && predicted[i] === "no") fn++;
    else tn++;
  }
  return { tp, fp, fn, tn };
}

const actual = [...Array(12).fill("yes"), ...Array(8).fill("no")];
const predicted = [
  ...Array(9).fill("yes"),
  ...Array(3).fill("no"),
  ...Array(1).fill("yes"),
  ...Array(7).fill("no"),
];

const { tp, fp, fn, tn } = evaluate(actual, predicted);
const precision = tp / (tp + fp);
const recall = tp / (tp + fn);
const f1 = (2 * precision * recall) / (precision + recall);

console.log("Total examples:", actual.length);
console.log("TP:", tp);
console.log("FP:", fp);
console.log("FN:", fn);
console.log("TN:", tn);
console.log("Precision:", precision.toFixed(2));
console.log("Recall:", recall.toFixed(2));
console.log("F1 score:", f1.toFixed(2));`,
      Python: `def evaluate(actual, predicted):
    tp = fp = fn = tn = 0
    for a, p in zip(actual, predicted):
        if a == "yes" and p == "yes":
            tp += 1
        elif a == "no" and p == "yes":
            fp += 1
        elif a == "yes" and p == "no":
            fn += 1
        else:
            tn += 1
    return tp, fp, fn, tn

actual = ["yes"] * 12 + ["no"] * 8
predicted = ["yes"] * 9 + ["no"] * 3 + ["yes"] * 1 + ["no"] * 7

tp, fp, fn, tn = evaluate(actual, predicted)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = (2 * precision * recall) / (precision + recall)

print("Total examples:", len(actual))
print("TP:", tp)
print("FP:", fp)
print("FN:", fn)
print("TN:", tn)
print("Precision:", f"{precision:.2f}")
print("Recall:", f"{recall:.2f}")
print("F1 score:", f"{f1:.2f}")`,
    },
    output: `Total examples: 20
TP: 9
FP: 1
FN: 3
TN: 7
Precision: 0.90
Recall: 0.75
F1 score: 0.82`,
  },
  {
    id: "sigmoid-logistic-function",
    pillar: "Data Science",
    name: "Sigmoid & Logistic function",
    easy: "Say you want a model to output not just 'yes' or 'no', but 'how confident' — a number between 0 and 1, like a probability. The sigmoid function is the tool for that job. Feed it any real number, huge or tiny, positive or negative, and it always squashes the result into that 0-to-1 range, shaped like a smooth 'S'. Feed it a very negative number, and it creeps toward 0. Feed it a very positive number, and it creeps toward 1. Feed it exactly 0, and it lands right in the middle, at 0.5.",
    how: [
      "Take any real number z (often the weighted sum of a model's inputs, like in logistic regression).",
      "Compute e raised to the power of negative z (e^-z). This is what does the actual squashing.",
      "Plug that into the formula: sigmoid(z) = 1 / (1 + e^-z). The result always lands strictly between 0 and 1.",
      "To turn that probability into a yes/no decision, pick a threshold (usually 0.5). A sigmoid(z) at or above the threshold predicts 'yes'; below it predicts 'no'.",
    ],
    when: "This is the engine inside logistic regression (predicting a yes/no outcome from numeric inputs) and the final layer of a neural network doing binary classification. Use it anywhere you need to turn a raw, unbounded number into something that behaves like a probability.",
    big: "This takes O(1) time per input — just one exponent and a couple of arithmetic operations.",
    mistakes: [
      "Do not forget the negative sign in e^-z. That flips the curve and reverses which direction counts as 'more confident'.",
      "Do not treat sigmoid's output as a perfectly calibrated real-world probability. It is the model's confidence given what it learned, which can still be miscalibrated or just plain wrong.",
      "Do not expect the output to keep changing when you feed in a very large positive or negative z. Sigmoid saturates near 0 and 1, so extreme inputs barely move the result, and barely move the gradient during training either.",
    ],
    code: {
      JavaScript: `function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

const zs = [-2, -1, 0, 1, 2];
const probabilities = zs.map(sigmoid);
const predictions = probabilities.map((p) => (p >= 0.5 ? "yes" : "no"));

console.log("z:", zs.join(" "));
console.log("Sigmoid:", probabilities.map((p) => p.toFixed(2)).join(" "));
console.log("Predictions:", predictions.join(" "));`,
      Python: `import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

zs = [-2, -1, 0, 1, 2]
probabilities = [sigmoid(z) for z in zs]
predictions = ["yes" if p >= 0.5 else "no" for p in probabilities]

print("z:", " ".join(str(v) for v in zs))
print("Sigmoid:", " ".join(f"{p:.2f}" for p in probabilities))
print("Predictions:", " ".join(predictions))`,
    },
    output: `z: -2 -1 0 1 2
Sigmoid: 0.12 0.27 0.50 0.73 0.88
Predictions: no no yes yes yes`,
  },
  {
    id: "decision-stump-gini",
    pillar: "Data Science",
    name: "Decision Stump (one split via Gini impurity)",
    easy: "A decision stump is the simplest possible decision tree. It is just one yes/no question that splits your data into two groups. Think of it like the single best sorting question you could ask to separate a mixed bag of marbles into two piles that are each as 'pure' (mostly one color) as possible. Gini impurity measures how 'mixed' a pile is. A value of 0 means a pile is perfectly pure (all one label). The value climbs higher the more evenly mixed the pile is. A decision stump tries every possible splitting question and picks whichever one leaves the two resulting piles least mixed, on average.",
    how: [
      "Sort the data by its numeric feature, and consider a candidate threshold exactly halfway between every pair of neighboring values.",
      "For each candidate threshold, split the data into a 'left' group (feature at or below the threshold) and a 'right' group (feature above it).",
      "Compute the Gini impurity of each group: 1 minus the sum of the squared proportion of each label present in that group. A group with only one label present has Gini impurity 0.",
      "Combine the two groups' impurities into one score, weighted by how many points fall in each group. Keep whichever threshold gives the lowest weighted impurity — that is the stump's one split.",
    ],
    when: "On its own, a stump is a fast, easy-to-read baseline classifier — one simple rule, like 'studied more than 2.5 hours? predict pass.' Its bigger role is as a building block. Boosting algorithms like AdaBoost combine hundreds of weak stumps, each fixing the last one's mistakes, into one strong classifier.",
    big: "With n points there are roughly n candidate thresholds, and scoring each one takes O(n) work to split and measure impurity. That makes O(n^2) time for a single stump. Real implementations sort once and sweep through in O(n log n) instead of rechecking everything from scratch.",
    mistakes: [
      "Do not pick the split that maximizes plain accuracy instead of minimizing impurity. Gini impurity generalizes more smoothly to more than two classes and to deeper trees built the same way.",
      "Do not expect one stump to be a full decision tree. It is a single split, a 'weak learner' on its own, not a complete model.",
    ],
    code: {
      JavaScript: `function gini(labels) {
  const counts = {};
  for (const l of labels) counts[l] = (counts[l] || 0) + 1;
  const n = labels.length;
  let sumSq = 0;
  for (const l in counts) {
    const p = counts[l] / n;
    sumSq += p * p;
  }
  return 1 - sumSq;
}

function majorityLabel(labels) {
  const counts = {};
  for (const l of labels) counts[l] = (counts[l] || 0) + 1;
  let best = labels[0];
  let bestCount = 0;
  for (const l of labels) {
    if (counts[l] > bestCount) {
      bestCount = counts[l];
      best = l;
    }
  }
  return best;
}

function bestSplit(points) {
  const xs = points.map((p) => p.x);
  const uniqueXs = [...new Set(xs)].sort((a, b) => a - b);
  const thresholds = [];
  for (let i = 0; i < uniqueXs.length - 1; i++) {
    thresholds.push((uniqueXs[i] + uniqueXs[i + 1]) / 2);
  }

  let bestThreshold = thresholds[0];
  let bestGini = Infinity;
  for (const t of thresholds) {
    const left = points.filter((p) => p.x <= t);
    const right = points.filter((p) => p.x > t);
    const weighted =
      (left.length / points.length) * gini(left.map((p) => p.label)) +
      (right.length / points.length) * gini(right.map((p) => p.label));
    if (weighted < bestGini) {
      bestGini = weighted;
      bestThreshold = t;
    }
  }
  return { bestThreshold, bestGini };
}

const points = [
  { x: 1, label: "no" },
  { x: 2, label: "no" },
  { x: 3, label: "yes" },
  { x: 4, label: "no" },
  { x: 5, label: "yes" },
  { x: 6, label: "yes" },
];

const rootGini = gini(points.map((p) => p.label));
const { bestThreshold, bestGini } = bestSplit(points);

const left = points.filter((p) => p.x <= bestThreshold);
const right = points.filter((p) => p.x > bestThreshold);
const leftPrediction = majorityLabel(left.map((p) => p.label));
const rightPrediction = majorityLabel(right.map((p) => p.label));

console.log("Points (x,label):", points.map((p) => "(" + p.x + "," + p.label + ")").join(" "));
console.log("Root Gini impurity:", rootGini.toFixed(2));
console.log("Best split threshold: x <=", bestThreshold.toFixed(2));
console.log("Weighted Gini after split:", bestGini.toFixed(2));
console.log("Left group predicts:", leftPrediction);
console.log("Right group predicts:", rightPrediction);`,
      Python: `def gini(labels):
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    n = len(labels)
    sum_sq = 0
    for l in counts:
        p = counts[l] / n
        sum_sq += p * p
    return 1 - sum_sq

def majority_label(labels):
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    best = labels[0]
    best_count = 0
    for l in labels:
        if counts[l] > best_count:
            best_count = counts[l]
            best = l
    return best

def best_split(points):
    xs = [p[0] for p in points]
    unique_xs = sorted(set(xs))
    thresholds = [(unique_xs[i] + unique_xs[i + 1]) / 2 for i in range(len(unique_xs) - 1)]

    best_threshold = thresholds[0]
    best_gini = float("inf")
    for t in thresholds:
        left = [p for p in points if p[0] <= t]
        right = [p for p in points if p[0] > t]
        weighted = (len(left) / len(points)) * gini([p[1] for p in left]) + \\
                   (len(right) / len(points)) * gini([p[1] for p in right])
        if weighted < best_gini:
            best_gini = weighted
            best_threshold = t
    return best_threshold, best_gini

points = [(1, "no"), (2, "no"), (3, "yes"), (4, "no"), (5, "yes"), (6, "yes")]

root_gini = gini([p[1] for p in points])
best_threshold, best_gini = best_split(points)

left = [p for p in points if p[0] <= best_threshold]
right = [p for p in points if p[0] > best_threshold]
left_prediction = majority_label([p[1] for p in left])
right_prediction = majority_label([p[1] for p in right])

print("Points (x,label):", " ".join("(" + str(x) + "," + label + ")" for x, label in points))
print("Root Gini impurity:", f"{root_gini:.2f}")
print("Best split threshold: x <=", f"{best_threshold:.2f}")
print("Weighted Gini after split:", f"{best_gini:.2f}")
print("Left group predicts:", left_prediction)
print("Right group predicts:", right_prediction)`,
    },
    output: `Points (x,label): (1,no) (2,no) (3,yes) (4,no) (5,yes) (6,yes)
Root Gini impurity: 0.50
Best split threshold: x <= 2.50
Weighted Gini after split: 0.25
Left group predicts: no
Right group predicts: yes`,
  },
];

export default lessons;
