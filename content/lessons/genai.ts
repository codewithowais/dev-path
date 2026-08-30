// content/lessons/genai.ts
// Pillar: Generative AI — how AI that writes, answers, and creates actually works underneath.
//
// Every sample here is a tiny TOY implementation: no real API calls, no real
// models, no external libraries. They exist to show the *mechanism* behind
// real systems (tokenizers, embeddings, retrieval, language models) using
// plain arithmetic you can trace by hand.
//
// Teacher voice, every entry: easy → how → when → big → mistakes → code + output.
// Every sample is checked by `node scripts/verify-output.mjs content/lessons/genai.ts`.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "tokenization",
    pillar: "Generative AI",
    name: "Tokenization",
    easy: "Imagine you snap a sentence apart like LEGO bricks. Each brick is one small piece of text, usually a single word. This is tokenization: breaking text into small pieces called tokens. Each token then gets its own ID number. From here on, the computer works only with these numbers. It never sees the actual words. A language model can only do math. It cannot read English directly.",
    how: [
      "First, make all the text lowercase. Then split it into tokens. In this simple version, you pull out runs of letters and digits, and drop punctuation and spacing.",
      "Go through the tokens one by one to build a vocabulary. The first time you see a new token, give it the next free ID number (0, 1, 2, and so on). If you have seen it before, reuse its existing ID.",
      "Now you can represent the sentence as a list of IDs instead of text. This list of numbers is what actually gets fed into a model.",
    ],
    when: "This is the very first step in every text-based AI system. Before embeddings, before attention, before anything else, raw text must become tokens.",
    big: "O(n) time to scan the text once, where n is the number of characters · O(v) space for a vocabulary of v unique tokens.",
    mistakes: [
      "Don't assume tokens are always whole words. Real tokenizers often split rare words into smaller pieces. For example, 'unhappiness' might become 'un' + 'happi' + 'ness'. This example uses whole words to keep things simple.",
      "Don't forget to lowercase the text first. If you skip this step, 'Dog' and 'dog' become two different tokens with two different IDs.",
    ],
    code: {
      JavaScript: `function tokenize(text) {
  // Lowercase, then pull out runs of letters/digits as tokens.
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}

function buildVocabulary(tokens) {
  const vocab = {}; // token -> id, in first-seen order
  for (const t of tokens) {
    if (!(t in vocab)) vocab[t] = Object.keys(vocab).length;
  }
  return vocab;
}

const text = "The quick brown fox jumps over the lazy dog. The dog barks!";
const tokens = tokenize(text);
const vocab = buildVocabulary(tokens);

console.log("Text:", text);
console.log("Tokens:", tokens.join(" "));
const vocabLine = Object.entries(vocab)
  .map(([word, id]) => \`\${word}:\${id}\`)
  .join(" ");
console.log("Vocabulary:", vocabLine);
console.log("Vocabulary size:", Object.keys(vocab).length);`,
      Python: `import re

def tokenize(text):
    # Lowercase, then pull out runs of letters/digits as tokens.
    return re.findall(r"[a-z0-9]+", text.lower())

def build_vocabulary(tokens):
    vocab = {}  # token -> id, in first-seen order
    for t in tokens:
        if t not in vocab:
            vocab[t] = len(vocab)
    return vocab

text = "The quick brown fox jumps over the lazy dog. The dog barks!"
tokens = tokenize(text)
vocab = build_vocabulary(tokens)

print("Text:", text)
print("Tokens:", " ".join(tokens))
vocab_line = " ".join(f"{word}:{tid}" for word, tid in vocab.items())
print("Vocabulary:", vocab_line)
print("Vocabulary size:", len(vocab))`,
    },
    output: `Text: The quick brown fox jumps over the lazy dog. The dog barks!
Tokens: the quick brown fox jumps over the lazy dog the dog barks
Vocabulary: the:0 quick:1 brown:2 fox:3 jumps:4 over:5 lazy:6 dog:7 barks:8
Vocabulary size: 9`,
    note: "Both JavaScript and Python keep dictionary keys in the order you first added them. So the vocabulary prints in the same order in both languages.",
  },
  {
    id: "bag-of-words",
    pillar: "Generative AI",
    name: "Bag-of-Words Vectors",
    easy: "Imagine you dump every word from a sentence into a bag. Then you count how many of each word landed inside. Word order no longer matters — only the totals do. This is a bag-of-words vector: a list of numbers, with one count per word. Two sentences that use a lot of the same words end up with very similar lists of numbers.",
    how: [
      "Collect every unique word across all the sentences you care about. This is your shared vocabulary.",
      "Sort the vocabulary so the word order stays fixed and predictable, for example alphabetically.",
      "For each sentence, build a vector that is the same length as the vocabulary. Slot i counts how many times vocabulary word i appears in that sentence.",
    ],
    when: "This is a simple, classic way to turn text into numbers for comparison or basic search. It is the ancestor of the embedding vectors that modern models use (see Cosine Similarity and Vector Search / RAG Retrieval).",
    big: "O(s · w) time to build one vector, where s is the sentence length and w is the vocabulary size · O(w) space per vector.",
    mistakes: [
      "Don't forget that word order is completely thrown away. 'Dog bites man' and 'man bites dog' produce the exact same bag-of-words vector.",
      "Don't build a different vocabulary for each sentence. Vectors are only comparable if you build them against the same shared vocabulary.",
    ],
    code: {
      JavaScript: `function tokenize(text) {
  return text.toLowerCase().split(" ");
}

function buildVocabulary(sentences) {
  const words = new Set();
  for (const s of sentences) {
    for (const w of tokenize(s)) words.add(w);
  }
  return [...words].sort();
}

function vectorize(sentence, vocab) {
  const tokens = tokenize(sentence);
  return vocab.map((w) => tokens.filter((t) => t === w).length);
}

const sentence1 = "the cat sat on the mat";
const sentence2 = "the dog sat on the log";
const vocab = buildVocabulary([sentence1, sentence2]);

console.log("Vocabulary:", vocab.join(" "));
console.log("Sentence 1:", sentence1);
console.log("Sentence 1 vector:", vectorize(sentence1, vocab).join(" "));
console.log("Sentence 2:", sentence2);
console.log("Sentence 2 vector:", vectorize(sentence2, vocab).join(" "));`,
      Python: `def tokenize(text):
    return text.lower().split(" ")

def build_vocabulary(sentences):
    words = set()
    for s in sentences:
        for w in tokenize(s):
            words.add(w)
    return sorted(words)

def vectorize(sentence, vocab):
    tokens = tokenize(sentence)
    return [tokens.count(w) for w in vocab]

sentence1 = "the cat sat on the mat"
sentence2 = "the dog sat on the log"
vocab = build_vocabulary([sentence1, sentence2])

print("Vocabulary:", " ".join(vocab))
print("Sentence 1:", sentence1)
print("Sentence 1 vector:", " ".join(str(v) for v in vectorize(sentence1, vocab)))
print("Sentence 2:", sentence2)
print("Sentence 2 vector:", " ".join(str(v) for v in vectorize(sentence2, vocab)))`,
    },
    output: `Vocabulary: cat dog log mat on sat the
Sentence 1: the cat sat on the mat
Sentence 1 vector: 1 0 0 1 1 1 2
Sentence 2: the dog sat on the log
Sentence 2 vector: 0 1 1 0 1 1 2`,
  },
  {
    id: "cosine-similarity",
    pillar: "Generative AI",
    name: "Cosine Similarity",
    easy: "Imagine a map where words with similar meanings sit close together. 'King' and 'queen' are near neighbors, while 'bread' sits in a different part of the map. Each word's spot on that map is called its embedding: a list of numbers that stands in for its meaning. Cosine similarity is a score for how close two spots are. But instead of measuring straight-line distance, it compares the angle between them, seen from the map's center. The score always lands between -1 and 1. A score of 1.00 means the two point in the exact same direction, so they are very similar. A score of 0.00 means they are unrelated. A negative score means they point in close to opposite directions.",
    how: [
      "Take the dot product of the two vectors. Multiply the matching positions together, then add up the results.",
      "Compute each vector's magnitude, or length. Square every number in it, add the squares together, then take the square root.",
      "Divide the dot product by the product of the two magnitudes. The result is always between -1 and 1. A bigger number means the two are more similar.",
    ],
    when: "Use this when comparing embeddings, which are number representations of meaning. It helps you find similar words, similar documents, or which stored chunk of text best matches a search query.",
    big: "O(d) time and space, where d is the number of dimensions in each vector.",
    mistakes: [
      "Don't compare raw dot products without dividing by the magnitudes. That unfairly favors longer vectors over vectors that are genuinely more similar.",
      "Don't compare vectors with different lengths, or dimensions. They must come from the same embedding space, or the comparison means nothing.",
    ],
    code: {
      JavaScript: `function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Toy 2D "embeddings" — pretend these came out of a real model.
const king = [4, 3];
const queen = [3, 4];
const bread = [0, 5];

const kingQueen = cosineSimilarity(king, queen);
const kingBread = cosineSimilarity(king, bread);

console.log("king vs queen similarity:", kingQueen.toFixed(2));
console.log("king vs bread similarity:", kingBread.toFixed(2));`,
      Python: `import math

def cosine_similarity(a, b):
    dot = sum(a[i] * b[i] for i in range(len(a)))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b)

# Toy 2D "embeddings" — pretend these came out of a real model.
king = [4, 3]
queen = [3, 4]
bread = [0, 5]

king_queen = cosine_similarity(king, queen)
king_bread = cosine_similarity(king, bread)

print("king vs queen similarity:", f"{king_queen:.2f}")
print("king vs bread similarity:", f"{king_bread:.2f}")`,
    },
    output: `king vs queen similarity: 0.96
king vs bread similarity: 0.60`,
  },
  {
    id: "vector-search-rag",
    pillar: "Generative AI",
    name: "Vector Search / RAG Retrieval",
    easy: "RAG stands for Retrieval-Augmented Generation. It is like giving an AI an open-book exam. Instead of answering purely from memory, the AI first looks up the most relevant notes, then writes its answer using them. The 'lookup' step is called vector search. Every stored chunk of text has an embedding, which is a location in meaning-space. The query gets an embedding too. You retrieve whichever stored chunk's embedding sits closest, or most similar, to the query's embedding.",
    how: [
      "Ahead of time, turn every chunk of text in your knowledge base into an embedding vector, and store them.",
      "When a query comes in, turn it into an embedding vector using the same method.",
      "Compare the query vector to every stored vector using cosine similarity. Retrieve the chunk with the highest score. This is the 'retrieval' part of Retrieval-Augmented Generation (RAG). A real system then hands that chunk to a language model, which writes the final answer.",
    ],
    when: "Use this to let an AI answer questions about your own documents, a knowledge base, or anything outside what it memorized during training, without retraining the model itself.",
    big: "O(n · d) time for a plain scan over n stored vectors of dimension d. Real systems use special vector indexes to search millions of vectors faster than checking every single one.",
    mistakes: [
      "Don't assume retrieval always finds a relevant chunk. If nothing in the knowledge base is actually related, it still returns whichever chunk scored highest, even if that is a poor match.",
      "Don't skip the generation step. Retrieval only finds supporting text. A language model still needs to turn it into a real answer.",
    ],
    code: {
      JavaScript: `function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// A tiny "knowledge base": text chunks with pre-made toy embeddings.
const chunks = [
  { text: "Cats and dogs are popular furry pets.", vector: [3, 4, 0] },
  { text: "Python is a popular programming language for data science.", vector: [0, 0, 5] },
  { text: "The sun is a star at the center of our solar system.", vector: [5, 0, 0] },
];

const query = "furry pets";
const queryVector = [4, 3, 0]; // toy embedding for the query

let best = null;
let bestScore = -Infinity;
for (const chunk of chunks) {
  const score = cosineSimilarity(queryVector, chunk.vector);
  if (score > bestScore) {
    bestScore = score;
    best = chunk;
  }
}

console.log("Query:", query);
for (const chunk of chunks) {
  const score = cosineSimilarity(queryVector, chunk.vector);
  console.log(\`Score \${score.toFixed(2)}: \${chunk.text}\`);
}
console.log("Retrieved chunk:", best.text);`,
      Python: `import math

def cosine_similarity(a, b):
    dot = sum(a[i] * b[i] for i in range(len(a)))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b)

# A tiny "knowledge base": text chunks with pre-made toy embeddings.
chunks = [
    {"text": "Cats and dogs are popular furry pets.", "vector": [3, 4, 0]},
    {"text": "Python is a popular programming language for data science.", "vector": [0, 0, 5]},
    {"text": "The sun is a star at the center of our solar system.", "vector": [5, 0, 0]},
]

query = "furry pets"
query_vector = [4, 3, 0]  # toy embedding for the query

best = None
best_score = float("-inf")
for chunk in chunks:
    score = cosine_similarity(query_vector, chunk["vector"])
    if score > best_score:
        best_score = score
        best = chunk

print("Query:", query)
for chunk in chunks:
    score = cosine_similarity(query_vector, chunk["vector"])
    print(f"Score {score:.2f}: {chunk['text']}")
print("Retrieved chunk:", best["text"])`,
    },
    output: `Query: furry pets
Score 0.96: Cats and dogs are popular furry pets.
Score 0.00: Python is a popular programming language for data science.
Score 0.80: The sun is a star at the center of our solar system.
Retrieved chunk: Cats and dogs are popular furry pets.`,
  },
  {
    id: "ngram-language-model",
    pillar: "Generative AI",
    name: "N-gram Language Model",
    easy: "When your phone keyboard suggests the next word as you type, it is doing something close to this old, simple trick: just count. Before today's huge AI models existed, you could predict the next word by reading a big pile of text. For every word, you tally which word tends to follow it directly. To predict what comes next after a word, you pick whichever follower showed up most often in your counts. This is the ancestor of your keyboard's suggestions, and of what a modern language model does, just at a much bigger scale.",
    how: [
      "Break the training text into a sequence of tokens, or words.",
      "For every word, count how often each other word directly follows it. These word pairs are called 'bigrams', or 2-grams.",
      "To predict the next word after a word W, look up W's followers and pick the one with the highest count. If there is a tie, break it alphabetically, so the result stays predictable.",
    ],
    when: "This is a lightweight, fully explainable way to model what word comes next. It is useful for teaching the core idea before you move to neural language models, or for simple autocomplete.",
    big: "O(n) time to build the counts from n training tokens · O(1) average time per prediction lookup once built.",
    mistakes: [
      "Don't rely on looking only one word back, which is called a 'bigram'. Real language depends on much more context. That is why modern models look back over huge windows of text.",
      "Watch out for words the model never saw during training. An n-gram model has no prediction for a word it has no counts for.",
    ],
    code: {
      JavaScript: `const corpus =
  "the cat sat on the mat the cat ran on the rug the dog sat on the mat";
const tokens = corpus.split(" ");

// Count, for every word, how often each word follows it.
const follows = {};
for (let i = 0; i < tokens.length - 1; i++) {
  const word = tokens[i];
  const next = tokens[i + 1];
  if (!follows[word]) follows[word] = {};
  follows[word][next] = (follows[word][next] || 0) + 1;
}

function predictNext(word) {
  const options = Object.entries(follows[word]);
  options.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return options[0][0];
}

console.log("Corpus:", corpus);
for (const word of ["the", "cat", "on", "sat"]) {
  console.log(\`Prediction after '\${word}':\`, predictNext(word));
}`,
      Python: `corpus = "the cat sat on the mat the cat ran on the rug the dog sat on the mat"
tokens = corpus.split(" ")

# Count, for every word, how often each word follows it.
follows = {}
for i in range(len(tokens) - 1):
    word = tokens[i]
    nxt = tokens[i + 1]
    follows.setdefault(word, {})
    follows[word][nxt] = follows[word].get(nxt, 0) + 1

def predict_next(word):
    options = sorted(follows[word].items(), key=lambda kv: (-kv[1], kv[0]))
    return options[0][0]

print("Corpus:", corpus)
for word in ["the", "cat", "on", "sat"]:
    print(f"Prediction after '{word}':", predict_next(word))`,
    },
    output: `Corpus: the cat sat on the mat the cat ran on the rug the dog sat on the mat
Prediction after 'the': cat
Prediction after 'cat': ran
Prediction after 'on': the
Prediction after 'sat': on`,
    note: "'The' has two equally common followers, 'cat' and 'mat', each seen twice. 'Cat' also has two equally common followers, 'ran' and 'sat', each seen once. Ties are broken alphabetically, so both languages always pick the same word.",
  },
  {
    id: "softmax-temperature",
    pillar: "Generative AI",
    name: "Softmax & Temperature",
    easy: "A language model does not just blurt out one 'next word'. First, it gives every candidate word a raw score, called a logit, for how likely it seems. Softmax is the step that turns those raw scores into real percentages that add up to 100%. Think of it like a poll of the model's confidence in each word. Temperature is a dial you turn before that happens. Turn it down, say to 0.5, and the model gets more confident and predictable, almost always picking the top word. Turn it up, say to 2.0, and the scores flatten out. This gives less-likely words a real shot at being picked, making the text more surprising and more 'creative'.",
    how: [
      "Start with raw scores, called 'logits', for each candidate. There is one number per option, and it can be any size.",
      "First, divide every score by the temperature. A smaller temperature makes the biggest scores stand out even more, giving a sharper result. A larger temperature squashes the differences, giving a flatter result.",
      "Apply softmax. Raise e to the power of each scaled score, then divide each result by the total of all of them. This turns the scores into probabilities that add up to 1.",
    ],
    when: "Use this to decide how 'creative' or how 'predictable' text generation should be. Choose a low temperature for factual, consistent answers, and a higher temperature for brainstorming or varied writing.",
    big: "O(k) time and space, where k is the number of candidate options being scored.",
    mistakes: [
      "Don't set temperature to 0 and divide directly. That causes a division by zero. Real systems instead treat temperature 0 as a special case that always picks the top score.",
      "Remember that probabilities are rounded for display. Rounding each one to 2 decimal places on its own can make them add up to 1.01 or 0.99 instead of exactly 1.00. This is normal rounding, not a bug.",
    ],
    code: {
      JavaScript: `function softmax(logits, temperature) {
  const scaled = logits.map((x) => x / temperature);
  const exps = scaled.map((x) => Math.exp(x));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

const labels = ["cat", "dog", "fish"];
const logits = [2, 1, 0];

function formatProbs(probs) {
  return labels.map((label, i) => \`\${label}=\${probs[i].toFixed(2)}\`).join(" ");
}

console.log("Scores (logits) for next word: cat=2 dog=1 fish=0");
console.log("Temperature 1.0 (normal):", formatProbs(softmax(logits, 1.0)));
console.log("Temperature 0.5 (sharper, more confident):", formatProbs(softmax(logits, 0.5)));
console.log("Temperature 2.0 (flatter, more random):", formatProbs(softmax(logits, 2.0)));`,
      Python: `import math

def softmax(logits, temperature):
    scaled = [x / temperature for x in logits]
    exps = [math.exp(x) for x in scaled]
    total = sum(exps)
    return [e / total for e in exps]

labels = ["cat", "dog", "fish"]
logits = [2, 1, 0]

def format_probs(probs):
    return " ".join(f"{label}={p:.2f}" for label, p in zip(labels, probs))

print("Scores (logits) for next word: cat=2 dog=1 fish=0")
print("Temperature 1.0 (normal):", format_probs(softmax(logits, 1.0)))
print("Temperature 0.5 (sharper, more confident):", format_probs(softmax(logits, 0.5)))
print("Temperature 2.0 (flatter, more random):", format_probs(softmax(logits, 2.0)))`,
    },
    output: `Scores (logits) for next word: cat=2 dog=1 fish=0
Temperature 1.0 (normal): cat=0.67 dog=0.24 fish=0.09
Temperature 0.5 (sharper, more confident): cat=0.87 dog=0.12 fish=0.02
Temperature 2.0 (flatter, more random): cat=0.51 dog=0.31 fish=0.19`,
  },
  {
    id: "prompt-templating",
    pillar: "Generative AI",
    name: "Prompt Templating",
    easy: "A prompt template is a fill-in-the-blank form for talking to an AI. It works like a mail-merge letter with placeholders such as '{name}' and '{date}'. You write the wording once. Then each time, you plug in different variables, such as a topic, a tone, or a user's question, instead of retyping the instructions from scratch.",
    how: [
      "Write the template text once, with placeholders marked like {topic} or {question}.",
      "Collect the real values you want to fill in. Store them as a simple key-to-value mapping, called a dictionary or object.",
      "Scan the template for every {placeholder}, and replace each one with its matching value from the mapping.",
    ],
    when: "Use this any time you send an AI the same kind of instruction repeatedly with different details, such as a support bot, a summarizer, or a code reviewer. Templating keeps the wording consistent and makes the variable parts easy to swap.",
    big: "O(n) time to scan and fill a template of length n.",
    mistakes: [
      "Don't forget to fill in a placeholder. If you do, the literal text \"{topic}\" gets sent to the model instead of a real value, which confuses it.",
      "Avoid building prompts by joining raw strings together instead of using a template. This makes it hard to see or reuse the fixed wording once you have many slightly different prompts.",
    ],
    code: {
      JavaScript: `function fillTemplate(template, vars) {
  return template.replace(/\\{(\\w+)\\}/g, (_, key) => vars[key]);
}

const template =
  "You are a helpful assistant. Answer the user's question about {topic} in a {tone} tone. User: {question}";

const filledCooking = fillTemplate(template, {
  topic: "cooking",
  tone: "friendly",
  question: "How do I boil an egg?",
});

const filledFinance = fillTemplate(template, {
  topic: "finance",
  tone: "formal",
  question: "What is compound interest?",
});

console.log("Template:", template);
console.log("Filled (cooking):", filledCooking);
console.log("Filled (finance):", filledFinance);`,
      Python: `import re

def fill_template(template, variables):
    return re.sub(r"\\{(\\w+)\\}", lambda m: variables[m.group(1)], template)

template = (
    "You are a helpful assistant. Answer the user's question about {topic} in a {tone} tone. User: {question}"
)

filled_cooking = fill_template(template, {
    "topic": "cooking",
    "tone": "friendly",
    "question": "How do I boil an egg?",
})

filled_finance = fill_template(template, {
    "topic": "finance",
    "tone": "formal",
    "question": "What is compound interest?",
})

print("Template:", template)
print("Filled (cooking):", filled_cooking)
print("Filled (finance):", filled_finance)`,
    },
    output: `Template: You are a helpful assistant. Answer the user's question about {topic} in a {tone} tone. User: {question}
Filled (cooking): You are a helpful assistant. Answer the user's question about cooking in a friendly tone. User: How do I boil an egg?
Filled (finance): You are a helpful assistant. Answer the user's question about finance in a formal tone. User: What is compound interest?`,
  },
  {
    id: "tfidf",
    pillar: "Generative AI",
    name: "TF-IDF",
    easy: "Imagine you flip through a pile of documents, looking for the words that make one of them special. Not just any word that shows up a lot, but a word that is common in this document and rare everywhere else, like a fingerprint. TF-IDF stands for Term Frequency times Inverse Document Frequency. It is a score that finds exactly those words. A word that is frequent here but also frequent in every other document, like 'the', gets a near-zero score. It is not special. A word that is frequent here but rare in the rest gets a high score. That is what makes this document distinct.",
    how: [
      "For each word in the document you are scoring, compute its Term Frequency, or TF. This is how often the word shows up in this document, divided by the document's total word count.",
      "For each word, compute its Inverse Document Frequency, or IDF. Take the total number of documents, divide it by how many of them contain that word at least once, then take the logarithm of that ratio. A word that appears in every document gets an IDF near zero. A word that appears in only one document gets a high IDF.",
      "Multiply TF by IDF for each word. That is its TF-IDF score. Sort the words by that score to see which ones best describe this particular document.",
    ],
    when: "Use this for search engines, keyword extraction, and finding the most important or distinctive words in a document compared to a larger collection. It is an old idea, from before embeddings took over, but it is still a widely used building block.",
    big: "O(n · m) time to score one document, where n is the number of unique words in it and m is the number of documents in the collection (or O(n) if document frequencies are already computed) · O(v) space for a vocabulary of v words.",
    mistakes: [
      "Don't forget the IDF half and rank words by raw frequency (TF) alone. That just surfaces filler words like 'the' and 'and', which show up everywhere and say nothing distinctive about this document.",
      "Don't compute IDF once and never update it. If you add new documents to the collection, every existing document's TF-IDF scores can shift, because IDF depends on the whole collection, not just one document.",
    ],
    code: {
      JavaScript: `function tokenize(text) {
  return text.toLowerCase().split(" ");
}

const documents = [
  "the cat sat on the mat",
  "the dog sat on the rug",
  "the cat and the dog are friends",
];

function termFrequency(term, docTokens) {
  const count = docTokens.filter((t) => t === term).length;
  return count / docTokens.length;
}

function inverseDocFrequency(term, allDocsTokens) {
  const docsWithTerm = allDocsTokens.filter((tokens) => tokens.includes(term)).length;
  return Math.log(allDocsTokens.length / docsWithTerm);
}

const allTokens = documents.map(tokenize);
const targetIndex = 2;
const targetTokens = allTokens[targetIndex];
const uniqueWords = [...new Set(targetTokens)];

const scores = uniqueWords.map((word) => {
  const tf = termFrequency(word, targetTokens);
  const idf = inverseDocFrequency(word, allTokens);
  return { word, tf, idf, tfidf: tf * idf };
});

scores.sort((a, b) => b.tfidf - a.tfidf || (a.word < b.word ? -1 : 1));

console.log("Documents:");
documents.forEach((doc, i) => console.log(\`\${i}: \${doc}\`));
console.log("");
console.log(\`Scoring document \${targetIndex}: "\${documents[targetIndex]}"\`);
for (const s of scores) {
  console.log(\`\${s.word}: tf=\${s.tf.toFixed(2)} idf=\${s.idf.toFixed(2)} tf-idf=\${s.tfidf.toFixed(2)}\`);
}
console.log("");
console.log(\`Most distinctive word: \${scores[0].word}\`);`,
      Python: `import math

def tokenize(text):
    return text.lower().split(" ")

documents = [
    "the cat sat on the mat",
    "the dog sat on the rug",
    "the cat and the dog are friends",
]

def term_frequency(term, doc_tokens):
    count = doc_tokens.count(term)
    return count / len(doc_tokens)

def inverse_doc_frequency(term, all_docs_tokens):
    docs_with_term = sum(1 for tokens in all_docs_tokens if term in tokens)
    return math.log(len(all_docs_tokens) / docs_with_term)

all_tokens = [tokenize(d) for d in documents]
target_index = 2
target_tokens = all_tokens[target_index]
unique_words = list(dict.fromkeys(target_tokens))

scores = []
for word in unique_words:
    tf = term_frequency(word, target_tokens)
    idf = inverse_doc_frequency(word, all_tokens)
    scores.append({"word": word, "tf": tf, "idf": idf, "tfidf": tf * idf})

scores.sort(key=lambda s: (-s["tfidf"], s["word"]))

print("Documents:")
for i, doc in enumerate(documents):
    print(f"{i}: {doc}")
print("")
print(f'Scoring document {target_index}: "{documents[target_index]}"')
for s in scores:
    print(f"{s['word']}: tf={s['tf']:.2f} idf={s['idf']:.2f} tf-idf={s['tfidf']:.2f}")
print("")
print(f"Most distinctive word: {scores[0]['word']}")`,
    },
    output: `Documents:
0: the cat sat on the mat
1: the dog sat on the rug
2: the cat and the dog are friends

Scoring document 2: "the cat and the dog are friends"
and: tf=0.14 idf=1.10 tf-idf=0.16
are: tf=0.14 idf=1.10 tf-idf=0.16
friends: tf=0.14 idf=1.10 tf-idf=0.16
cat: tf=0.14 idf=0.41 tf-idf=0.06
dog: tf=0.14 idf=0.41 tf-idf=0.06
the: tf=0.29 idf=0.00 tf-idf=0.00

Most distinctive word: and`,
    note: "'And', 'are', and 'friends' all tie for the highest score, since each appears in only one document. 'Cat' and 'dog' tie right behind them. Ties are broken alphabetically, so both languages always print the words in the same order.",
  },
  {
    id: "text-chunking-rag",
    pillar: "Generative AI",
    name: "Text Chunking for RAG",
    easy: "Imagine you slice a long loaf of bread into pieces small enough to eat. But instead of clean, unrelated slices, each piece overlaps a little with the next, so no bite loses its context. This is text chunking. Before an AI can search over or reason about a long document, you have to cut the document into small pieces called chunks that fit in the AI's working memory. Chunks usually overlap a little with their neighbors. That way, an idea sitting right on the cut line does not get sliced in half and lost.",
    how: [
      "Split the document into words, or another small unit of text.",
      "Decide on a chunk size, which is how many words go in each chunk, and an overlap, which is how many of the last words in one chunk also start the next chunk.",
      "Walk through the document, taking a chunk of `chunk size` words at a time. But instead of jumping forward by the full chunk size each time, jump forward by (chunk size minus overlap) words. This smaller jump is what creates the overlap between chunks that follow each other. Stop once a chunk reaches the end of the document.",
    ],
    when: "Use this in Retrieval-Augmented Generation (RAG) systems. Before you can search or embed a long document, you first have to break it into chunks small enough to embed and hand to a language model. This preparation step happens before Vector Search / RAG Retrieval.",
    big: "O(n) time and space, where n is the number of words in the document. The overlap only makes each word get visited a small, fixed number of extra times.",
    mistakes: [
      "Don't chunk by a fixed number of characters instead of something that respects meaning, like whole words or sentences. This can slice a sentence, or even a word, right in half, making both halves harder to search and understand.",
      "Don't use zero overlap. If the answer to a question spans the exact boundary between two chunks, neither chunk alone contains the full answer.",
      "Don't use an overlap that is too large compared to the chunk size. You end up storing and searching almost the same text many times over. This wastes space and lets near-duplicate chunks compete with each other during retrieval.",
    ],
    code: {
      JavaScript: `function chunkText(text, chunkSize, overlap) {
  const words = text.split(" ");
  const step = chunkSize - overlap;
  const chunks = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push({ start, end, text: words.slice(start, end).join(" ") });
    if (end === words.length) break;
    start += step;
  }
  return chunks;
}

const text = "The quick brown fox jumps over the lazy dog while the cat watches quietly from the window";
const chunkSize = 6;
const overlap = 2;
const chunks = chunkText(text, chunkSize, overlap);

console.log("Text:", text);
console.log("Total words:", text.split(" ").length);
console.log(\`Chunk size: \${chunkSize}  Overlap: \${overlap}\`);
console.log("");
chunks.forEach((c, i) => {
  console.log(\`Chunk \${i + 1} (words \${c.start}-\${c.end - 1}): \${c.text}\`);
});
console.log("");
console.log("Total chunks:", chunks.length);`,
      Python: `def chunk_text(text, chunk_size, overlap):
    words = text.split(" ")
    step = chunk_size - overlap
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append({"start": start, "end": end, "text": " ".join(words[start:end])})
        if end == len(words):
            break
        start += step
    return chunks

text = "The quick brown fox jumps over the lazy dog while the cat watches quietly from the window"
chunk_size = 6
overlap = 2
chunks = chunk_text(text, chunk_size, overlap)

print("Text:", text)
print("Total words:", len(text.split(" ")))
print(f"Chunk size: {chunk_size}  Overlap: {overlap}")
print("")
for i, c in enumerate(chunks):
    print(f"Chunk {i + 1} (words {c['start']}-{c['end'] - 1}): {c['text']}")
print("")
print("Total chunks:", len(chunks))`,
    },
    output: `Text: The quick brown fox jumps over the lazy dog while the cat watches quietly from the window
Total words: 17
Chunk size: 6  Overlap: 2

Chunk 1 (words 0-5): The quick brown fox jumps over
Chunk 2 (words 4-9): jumps over the lazy dog while
Chunk 3 (words 8-13): dog while the cat watches quietly
Chunk 4 (words 12-16): watches quietly from the window

Total chunks: 4`,
  },
  {
    id: "top-k-selection",
    pillar: "Generative AI",
    name: "Top-k Selection",
    easy: "Picture a leaderboard for 'what word comes next'. Instead of only ever crowning a single number-one word, or weighing every possible word in the language, you just keep the top handful of contenders, say the top 3, and ignore the long tail of unlikely options. This is top-k selection: a filtering step language models use before choosing the next word. You keep only the k highest-scoring candidates, then decide among just those.",
    how: [
      "Score every candidate, meaning every possible next word, with a number. A higher number means the model thinks that word is more likely to come next.",
      "Sort the candidates by score, highest first.",
      "Keep only the top k candidates and throw away the rest, no matter how good or bad they were.",
      "Turn the kept candidates' scores back into probabilities, for example with softmax (see Softmax & Temperature), using only this smaller shortlist. Then pick from among them.",
    ],
    when: "Use this to control text generation so a model cannot wander into extremely unlikely, nonsensical words. It is a common safety net used alongside temperature, often set to something like k=40 or k=50 in real systems.",
    big: "O(n log n) time to sort n candidates (or O(n) with a selection algorithm) · O(k) space for the shortlist.",
    mistakes: [
      "Don't set k too small, like k=1. That is the same as always picking the single highest-scoring word every time, which can make text repetitive and robotic.",
      "Don't set k too large, close to the whole vocabulary. Top-k then stops doing anything useful, since you are barely filtering out any of the unlikely candidates.",
      "Don't forget to re-score, or renormalize, the probabilities after cutting candidates out. The leftover scores no longer add up to 100% unless you recompute them over just the shortlist.",
    ],
    code: {
      JavaScript: `function softmax(logits) {
  const exps = logits.map((x) => Math.exp(x));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

const candidates = [
  { word: "cat", score: 5 },
  { word: "dog", score: 4 },
  { word: "fish", score: 3 },
  { word: "bird", score: 2 },
  { word: "ant", score: 1 },
  { word: "eel", score: 0 },
];

const k = 3;
const sorted = [...candidates].sort((a, b) => b.score - a.score || (a.word < b.word ? -1 : 1));
const topK = sorted.slice(0, k);
const probs = softmax(topK.map((c) => c.score));

console.log("All candidates and scores:", candidates.map((c) => \`\${c.word}=\${c.score}\`).join(" "));
console.log(\`Keeping top \${k} by score (top-k filtering):\`, topK.map((c) => c.word).join(" "));
console.log(\`Renormalized probabilities among the top \${k}:\`);
topK.forEach((c, i) => console.log(\`\${c.word}: \${probs[i].toFixed(2)}\`));
console.log("Selected token (highest probability):", topK[0].word);`,
      Python: `import math

def softmax(logits):
    exps = [math.exp(x) for x in logits]
    total = sum(exps)
    return [e / total for e in exps]

candidates = [
    {"word": "cat", "score": 5},
    {"word": "dog", "score": 4},
    {"word": "fish", "score": 3},
    {"word": "bird", "score": 2},
    {"word": "ant", "score": 1},
    {"word": "eel", "score": 0},
]

k = 3
sorted_candidates = sorted(candidates, key=lambda c: (-c["score"], c["word"]))
top_k = sorted_candidates[:k]
probs = softmax([c["score"] for c in top_k])

print("All candidates and scores:", " ".join(f"{c['word']}={c['score']}" for c in candidates))
print(f"Keeping top {k} by score (top-k filtering):", " ".join(c["word"] for c in top_k))
print(f"Renormalized probabilities among the top {k}:")
for c, p in zip(top_k, probs):
    print(f"{c['word']}: {p:.2f}")
print("Selected token (highest probability):", top_k[0]["word"])`,
    },
    output: `All candidates and scores: cat=5 dog=4 fish=3 bird=2 ant=1 eel=0
Keeping top 3 by score (top-k filtering): cat dog fish
Renormalized probabilities among the top 3:
cat: 0.67
dog: 0.24
fish: 0.09
Selected token (highest probability): cat`,
  },
  {
    id: "levenshtein-edit-distance",
    pillar: "Generative AI",
    name: "Levenshtein Edit Distance",
    easy: "Think about turning the word 'cat' into 'cot'. You only need to change one letter, so they are '1 edit' apart. Edit distance, also called Levenshtein distance, counts the fewest single-letter edits needed to turn one piece of text into another. An edit can be inserting a letter, deleting a letter, or swapping one letter for another. Two identical words are '0 edits' apart. The more edits it takes, the less alike the words are. This is the trick behind a spell-checker's 'did you mean' suggestions, and other fuzzy text matching, meaning matching that is approximate rather than exact.",
    how: [
      "Build a grid. Give it one row per letter of the first word, plus an extra row for the empty string. Give it one column per letter of the second word, plus an extra column for the empty string.",
      "Fill in the first row and column with 0, 1, 2, 3, and so on. Turning an empty string into a growing prefix costs exactly that many letter insertions.",
      "Fill in the rest of the grid cell by cell. If the current letters from both words match, copy the value from the diagonal cell up and to the left, since no edit is needed there. If they do not match, take the smallest value among the cell above, the cell to the left, and the diagonal cell, then add 1 for the edit.",
      "The number in the grid's bottom-right corner is the edit distance between the two full words.",
    ],
    when: "Use this for fuzzy string matching, such as spell-check suggestions, 'did you mean' search corrections, matching slightly misspelled names or addresses, and measuring how close a generated string is to an expected one.",
    big: "O(m · n) time and space, where m and n are the lengths of the two words being compared, which is also the size of the grid.",
    mistakes: [
      "Don't confuse edit distance with how different two words look at a glance. 'Flaw' and 'lawn' share every single letter but are still 2 edits apart, because the letters are in a different order.",
      "Remember that a lower edit distance always means the words are more similar, and 0 means identical. It is easy to read this backwards by instinct, as if it were a similarity score where higher is better.",
      "Don't use edit distance alone to compare words of very different lengths. A short word will always need at least as many edits as the length difference to reach a much longer word, no matter how related the two actually are.",
    ],
    code: {
      JavaScript: `function editDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

const pairs = [
  ["kitten", "sitting"],
  ["flaw", "lawn"],
  ["intention", "execution"],
];

console.log("Edit distance between word pairs:");
for (const [a, b] of pairs) {
  console.log(\`\${a} -> \${b}: \${editDistance(a, b)}\`);
}

console.log("");
const dictionary = ["apple", "grape", "apply", "maple"];
const query = "aple";
let best = null;
let bestDist = Infinity;
for (const word of dictionary) {
  const dist = editDistance(query, word);
  if (dist < bestDist) {
    bestDist = dist;
    best = word;
  }
}
console.log(\`Fuzzy match for "\${query}" against dictionary: \${dictionary.join(", ")}\`);
for (const word of dictionary) {
  console.log(\`\${word}: distance \${editDistance(query, word)}\`);
}
console.log(\`Closest match: \${best} (distance \${bestDist})\`);`,
      Python: `def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]

pairs = [
    ("kitten", "sitting"),
    ("flaw", "lawn"),
    ("intention", "execution"),
]

print("Edit distance between word pairs:")
for a, b in pairs:
    print(f"{a} -> {b}: {edit_distance(a, b)}")

print("")
dictionary = ["apple", "grape", "apply", "maple"]
query = "aple"
best = None
best_dist = float("inf")
for word in dictionary:
    dist = edit_distance(query, word)
    if dist < best_dist:
        best_dist = dist
        best = word

print(f"Fuzzy match for \\"{query}\\" against dictionary: {', '.join(dictionary)}")
for word in dictionary:
    print(f"{word}: distance {edit_distance(query, word)}")
print(f"Closest match: {best} (distance {best_dist})")`,
    },
    output: `Edit distance between word pairs:
kitten -> sitting: 3
flaw -> lawn: 2
intention -> execution: 5

Fuzzy match for "aple" against dictionary: apple, grape, apply, maple
apple: distance 1
grape: distance 3
apply: distance 2
maple: distance 1
Closest match: apple (distance 1)`,
    note: "'Apple' and 'maple' are tied at distance 1 from 'aple'. The code keeps the first one it finds with the lowest distance so far. Both languages check the dictionary in the same order, so both always pick 'apple'.",
  },
  {
    id: "self-attention",
    pillar: "Generative AI",
    name: "Self-Attention",
    easy: "Imagine reading the sentence: 'The trophy didn't fit in the suitcase because it was too big.' To figure out what 'it' refers to, you glance back at the earlier words and decide the trophy is more relevant than the suitcase. Self-attention is a language model doing exactly that, for every single word. It looks at all the other words, and itself, in the sentence, and decides how much to 'focus' on each one. Each word gets a weight between 0 and 1. Words that seem more relevant get a bigger weight. Blending all the words together using those weights gives the model a new, context-aware understanding of the word it is focusing from.",
    how: [
      "Give each token, or word, a vector: a small list of numbers that stands in for its meaning. This is a toy embedding.",
      "For the token you are computing attention from, take the dot product of its vector with every token's vector, including its own. Each raw number you get is the attention score for that pair.",
      "Run all of that token's scores through softmax (see Softmax & Temperature) to turn them into attention weights that add up to 1. A bigger score becomes a bigger weight.",
      "Multiply every token's vector by its attention weight, then add all the results together. This weighted sum is the context vector: a new representation of the original token, blended with whatever else in the sentence it decided to focus on.",
    ],
    when: "This is the mechanism at the heart of Transformers, the architecture behind modern language models. It is how a model figures out which other words in a sentence matter for understanding or generating any given word, instead of only ever looking at fixed nearby positions.",
    big: "O(n² · d) time and O(n²) space for a sequence of n tokens with vectors of d dimensions. Every token computes a score against every other token, which is why very long inputs get expensive fast.",
    mistakes: [
      "Don't assume a word only pays attention to its immediate neighbors. Self-attention scores every word against every other word in the sequence, no matter how far apart they are.",
      "Don't skip the softmax step. Raw dot-product scores are not weights yet. They need to become a normalized set of numbers that add up to 1 before you can use them to blend vectors together.",
      "Don't assume this toy version works exactly like real Transformers. Real self-attention uses three different learned projections of each token, called query, key, and value, instead of reusing the same raw vector for all three roles. This lets the model learn different notions of 'relevance', rather than just raw similarity.",
    ],
    code: {
      JavaScript: `function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function softmax(scores) {
  const exps = scores.map((x) => Math.exp(x));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

const tokens = ["the", "cat", "sat"];
// Toy integer "embeddings" — pretend these came out of a real model.
const vectors = {
  the: [1, 0, 1],
  cat: [0, 1, 1],
  sat: [1, 1, 0],
};

console.log("Tokens:", tokens.join(" "));
console.log("");

for (const query of tokens) {
  const scores = tokens.map((t) => dot(vectors[query], vectors[t]));
  const weights = softmax(scores);

  console.log(\`Attention from "\${query}":\`);
  tokens.forEach((t, i) => {
    console.log(\`  -> \${t}: score=\${scores[i]} weight=\${weights[i].toFixed(2)}\`);
  });

  const context = [0, 0, 0];
  tokens.forEach((t, i) => {
    for (let d = 0; d < context.length; d++) {
      context[d] += weights[i] * vectors[t][d];
    }
  });
  const contextStr = context.map((v) => v.toFixed(2)).join(", ");
  console.log(\`  context vector: [\${contextStr}]\`);
  console.log("");
}`,
      Python: `import math

def dot(a, b):
    return sum(a[i] * b[i] for i in range(len(a)))

def softmax(scores):
    exps = [math.exp(x) for x in scores]
    total = sum(exps)
    return [e / total for e in exps]

tokens = ["the", "cat", "sat"]
# Toy integer "embeddings" — pretend these came out of a real model.
vectors = {
    "the": [1, 0, 1],
    "cat": [0, 1, 1],
    "sat": [1, 1, 0],
}

print("Tokens:", " ".join(tokens))
print("")

for query in tokens:
    scores = [dot(vectors[query], vectors[t]) for t in tokens]
    weights = softmax(scores)

    print(f'Attention from "{query}":')
    for i, t in enumerate(tokens):
        print(f"  -> {t}: score={scores[i]} weight={weights[i]:.2f}")

    context = [0, 0, 0]
    for i, t in enumerate(tokens):
        for d in range(len(context)):
            context[d] += weights[i] * vectors[t][d]
    context_str = ", ".join(f"{v:.2f}" for v in context)
    print(f"  context vector: [{context_str}]")
    print("")`,
    },
    output: `Tokens: the cat sat

Attention from "the":
  -> the: score=2 weight=0.58
  -> cat: score=1 weight=0.21
  -> sat: score=1 weight=0.21
  context vector: [0.79, 0.42, 0.79]

Attention from "cat":
  -> the: score=1 weight=0.21
  -> cat: score=2 weight=0.58
  -> sat: score=1 weight=0.21
  context vector: [0.42, 0.79, 0.79]

Attention from "sat":
  -> the: score=1 weight=0.21
  -> cat: score=1 weight=0.21
  -> sat: score=2 weight=0.58
  context vector: [0.79, 0.79, 0.42]`,
  },
  {
    id: "embedding-arithmetic",
    pillar: "Generative AI",
    name: "Embedding Arithmetic",
    easy: "\"Man is to woman as king is to ___?\" Most people instantly answer queen. Embeddings, the number-list representation of a word's meaning (see Cosine Similarity), can play this exact game using plain arithmetic. Take king's numbers, subtract man's numbers, then add woman's numbers. The result vector lands almost exactly where queen's vector already sits. This is not a coincidence. It means the \"shift\" from man to woman is baked into the embedding space as a consistent direction. Adding that same shift to king slides you over to queen.",
    how: [
      "Start with three toy embeddings, which are small lists of numbers, for king, man, and woman.",
      "Do the arithmetic position by position. Subtract man's vector from king's vector, which removes 'maleness'. Then add woman's vector, which adds 'femaleness' back in. This gives you a brand-new result vector.",
      "A real system does not know in advance which word that result vector 'means'. So you search a small vocabulary of candidate word embeddings, and use cosine similarity (see Cosine Similarity) to find whichever one the result vector is closest to.",
    ],
    when: "This is a neat demonstration that embedding spaces encode relationships, such as gender, tense, or country-capital pairs, as consistent directions, not just individual word meanings. It is the classic proof-of-concept behind early embedding models like word2vec.",
    big: "O(d) time for the vector arithmetic itself, where d is the number of dimensions · O(v · d) time to search a vocabulary of v candidate words.",
    mistakes: [
      "Don't assume this works perfectly for every word pair in real embeddings. The king, man, woman example is famous specifically because it works cleanly. Many analogies come out messier in practice.",
      "Remember that the arithmetic alone does not produce a word. The result is just another point in the vector space. You still need a similarity search over real words to turn it back into something readable.",
    ],
    code: {
      JavaScript: `function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function subtract(a, b) {
  return a.map((v, i) => v - b[i]);
}

function add(a, b) {
  return a.map((v, i) => v + b[i]);
}

// Toy integer "embeddings" — pretend these came out of a real model.
const man = [1, 0, 0];
const woman = [1, 2, 0];
const king = [4, 0, 1];

const result = add(subtract(king, man), woman);

// A tiny "vocabulary" to search for the closest match to the result vector.
const candidates = {
  queen: [4, 2, 1],
  prince: [3, 0, 1],
  bread: [0, 0, 5],
};

console.log("king - man + woman = ?");
console.log("Result vector:", result.join(", "));
console.log("");
console.log("Comparing the result to candidate words:");
let best = null;
let bestScore = -Infinity;
for (const [word, vector] of Object.entries(candidates)) {
  const score = cosineSimilarity(result, vector);
  console.log(\`\${word}: similarity \${score.toFixed(2)}\`);
  if (score > bestScore) {
    bestScore = score;
    best = word;
  }
}
console.log("");
console.log("Closest match:", best);`,
      Python: `import math

def cosine_similarity(a, b):
    dot = sum(a[i] * b[i] for i in range(len(a)))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b)

def subtract(a, b):
    return [a[i] - b[i] for i in range(len(a))]

def add(a, b):
    return [a[i] + b[i] for i in range(len(a))]

# Toy integer "embeddings" — pretend these came out of a real model.
man = [1, 0, 0]
woman = [1, 2, 0]
king = [4, 0, 1]

result = add(subtract(king, man), woman)

# A tiny "vocabulary" to search for the closest match to the result vector.
candidates = {
    "queen": [4, 2, 1],
    "prince": [3, 0, 1],
    "bread": [0, 0, 5],
}

print("king - man + woman = ?")
print("Result vector:", ", ".join(str(v) for v in result))
print("")
print("Comparing the result to candidate words:")
best = None
best_score = float("-inf")
for word, vector in candidates.items():
    score = cosine_similarity(result, vector)
    print(f"{word}: similarity {score:.2f}")
    if score > best_score:
        best_score = score
        best = word

print("")
print("Closest match:", best)`,
    },
    output: `king - man + woman = ?
Result vector: 4, 2, 1

Comparing the result to candidate words:
queen: similarity 1.00
prince: similarity 0.90
bread: similarity 0.22

Closest match: queen`,
  },
  {
    id: "beam-search",
    pillar: "Generative AI",
    name: "Beam Search",
    easy: "Imagine you choose a hiking route by only ever taking whichever single trail looks best at each fork. This is called 'greedy'. Now imagine instead sending out a small search party that keeps a handful of the most promising routes alive at once, and only commits to one at the very end. Beam search is a language model's version of that search party. Instead of locking in the single best next word at every step, which can back itself into a dead end, it keeps the top few candidate sequences, called 'beams', alive at each step. It only picks the overall best one once generation is done.",
    how: [
      "Start with one empty sequence. At each step, extend every sequence you are currently tracking with every possible next word. Add each new word's score to that sequence's running total.",
      "Sort all these extended candidates by their total score. If there is a tie, break it alphabetically, so the result stays predictable. Keep only the top 'beam width' number of them, and discard the rest.",
      "Repeat for a fixed number of steps. At the very end, the highest-scoring sequence among the surviving beams is the answer.",
    ],
    when: "Use this to generate a genuinely good overall sequence, like a full translated sentence, rather than one that only ever looks good one word at a time. It is a step up from always keeping just one running sequence, and it shares an idea with Top-k Selection: keep more than one option alive.",
    big: "O(steps · beamWidth · vocabularySize) time. At every step, every surviving beam is extended by every word in the vocabulary, before being trimmed back down to the beam width.",
    mistakes: [
      "Don't assume beam search always finds the mathematically best possible sequence. It does not. It only ever keeps a small number of candidates alive, so a sequence that looked mediocre early on can get discarded before it has a chance to prove itself.",
      "Don't confuse beam search with greedy decoding, which is a beam width of 1. Greedy commits to a single best-looking choice at every step, and can end up stuck with a worse overall sequence. This example demonstrates exactly that.",
    ],
    code: {
      JavaScript: `// Toy transition scores: score(previousWord, nextWord) — pretend a real
// model produced these. "<s>" is the special start-of-sentence symbol.
const scores = {
  "<s>": { cat: 5, dog: 4, fish: 0 },
  cat: { cat: 1, dog: 2, fish: 3 },
  dog: { cat: 1, dog: 2, fish: 9 },
  fish: { cat: 5, dog: 3, fish: 1 },
};

const vocabulary = ["cat", "dog", "fish"];
const steps = 3;

function search(beamWidth) {
  let beams = [{ words: [], score: 0 }];
  const trace = [];
  for (let step = 1; step <= steps; step++) {
    const candidates = [];
    for (const beam of beams) {
      const last = beam.words.length === 0 ? "<s>" : beam.words[beam.words.length - 1];
      for (const word of vocabulary) {
        candidates.push({ words: [...beam.words, word], score: beam.score + scores[last][word] });
      }
    }
    candidates.sort((a, b) => b.score - a.score || (a.words.join(" ") < b.words.join(" ") ? -1 : 1));
    beams = candidates.slice(0, beamWidth);
    trace.push(beams);
  }
  return { beams, trace };
}

const beamWidth = 2;
const { beams, trace } = search(beamWidth);

console.log(\`Beam search with beam width \${beamWidth}:\`);
trace.forEach((beamsAtStep, i) => {
  console.log(\`Step \${i + 1} — top \${beamWidth} beams kept:\`);
  for (const beam of beamsAtStep) {
    console.log(\`  [\${beam.words.join(" ")}] score=\${beam.score}\`);
  }
});
console.log("");
console.log("Beam search result:", beams[0].words.join(" "), \`(score \${beams[0].score})\`);

const greedy = search(1).beams[0];
console.log("Greedy (beam width 1) result:", greedy.words.join(" "), \`(score \${greedy.score})\`);
console.log("");
console.log(
  beams[0].score > greedy.score
    ? "Beam search found a better overall sequence than greedy."
    : "Beam search matched greedy this time."
);`,
      Python: `# Toy transition scores: score(previousWord, nextWord) — pretend a real
# model produced these. "<s>" is the special start-of-sentence symbol.
scores = {
    "<s>": {"cat": 5, "dog": 4, "fish": 0},
    "cat": {"cat": 1, "dog": 2, "fish": 3},
    "dog": {"cat": 1, "dog": 2, "fish": 9},
    "fish": {"cat": 5, "dog": 3, "fish": 1},
}

vocabulary = ["cat", "dog", "fish"]
steps = 3

def search(beam_width):
    beams = [{"words": [], "score": 0}]
    trace = []
    for _ in range(steps):
        candidates = []
        for beam in beams:
            last = "<s>" if len(beam["words"]) == 0 else beam["words"][-1]
            for word in vocabulary:
                candidates.append({"words": beam["words"] + [word], "score": beam["score"] + scores[last][word]})
        candidates.sort(key=lambda c: (-c["score"], " ".join(c["words"])))
        beams = candidates[:beam_width]
        trace.append(beams)
    return beams, trace

beam_width = 2
beams, trace = search(beam_width)

print(f"Beam search with beam width {beam_width}:")
for i, beams_at_step in enumerate(trace):
    print(f"Step {i + 1} — top {beam_width} beams kept:")
    for beam in beams_at_step:
        print(f"  [{' '.join(beam['words'])}] score={beam['score']}")

print("")
print("Beam search result:", " ".join(beams[0]["words"]), f"(score {beams[0]['score']})")

greedy = search(1)[0][0]
print("Greedy (beam width 1) result:", " ".join(greedy["words"]), f"(score {greedy['score']})")

print("")
if beams[0]["score"] > greedy["score"]:
    print("Beam search found a better overall sequence than greedy.")
else:
    print("Beam search matched greedy this time.")`,
    },
    output: `Beam search with beam width 2:
Step 1 — top 2 beams kept:
  [cat] score=5
  [dog] score=4
Step 2 — top 2 beams kept:
  [dog fish] score=13
  [cat fish] score=8
Step 3 — top 2 beams kept:
  [dog fish cat] score=18
  [dog fish dog] score=16

Beam search result: dog fish cat (score 18)
Greedy (beam width 1) result: cat fish cat (score 13)

Beam search found a better overall sequence than greedy.`,
  },
  {
    id: "nucleus-sampling",
    pillar: "Generative AI",
    name: "Top-p / Nucleus Selection",
    easy: "Top-k Selection always keeps a fixed number of top candidates, say the top 3, no matter what. Nucleus sampling, also called top-p, does something more adaptive. You keep candidates, starting from the most likely, until their combined probability first reaches a target share, say 70%. That small group is called the 'nucleus'. When the model is very confident, the nucleus can be just one or two words. When it is genuinely unsure, the nucleus naturally grows to include more options.",
    how: [
      "Score every candidate next word. Convert those scores into probabilities that add up to 1, using softmax (see Softmax & Temperature).",
      "Sort the candidates from highest probability to lowest.",
      "Walk down the sorted list, adding one candidate at a time to the 'nucleus'. Keep a running total until it first reaches, or passes, the target cutoff p.",
      "Recompute the probabilities, or 'renormalize' them, using only the words in the nucleus. Then pick among just that shortlist.",
    ],
    when: "Use this to control text generation the same way Top-k Selection does, but adapt the size of the shortlist to how confident the model is at that specific step. A fixed k can be too wide when the model is very sure, or too narrow when it is genuinely torn between many options.",
    big: "O(n log n) time to sort n candidates · O(n) time to walk the sorted list and build the nucleus.",
    mistakes: [
      "Don't confuse p, a target cumulative probability like 0.70, with k from Top-k Selection, a fixed head-count. They solve the same problem in different ways. Mixing up which knob you are tuning gives very differently shaped shortlists.",
      "Don't set p too close to 1.0. The nucleus then ends up including almost every candidate, so top-p barely filters anything out. This is the same failure mode as setting k too large in top-k.",
      "Don't forget to renormalize probabilities after trimming down to the nucleus. The leftover probabilities from the full candidate list no longer add up to 1 on their own.",
    ],
    code: {
      JavaScript: `function softmax(logits) {
  const exps = logits.map((x) => Math.exp(x));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

const candidates = [
  { word: "cat", logit: 4 },
  { word: "dog", logit: 3 },
  { word: "fish", logit: 2 },
  { word: "bird", logit: 1 },
  { word: "ant", logit: 0 },
];

const p = 0.7;

const sorted = [...candidates].sort((a, b) => b.logit - a.logit || (a.word < b.word ? -1 : 1));
const probs = softmax(sorted.map((c) => c.logit));

// Walk down the sorted list, adding words to the "nucleus" until their
// combined probability first reaches (or passes) the cutoff p.
const nucleus = [];
let cumulative = 0;
for (let i = 0; i < sorted.length; i++) {
  nucleus.push({ word: sorted[i].word, prob: probs[i] });
  cumulative += probs[i];
  if (cumulative >= p) break;
}

const nucleusTotal = nucleus.reduce((sum, c) => sum + c.prob, 0);
const renormalized = nucleus.map((c) => ({ word: c.word, prob: c.prob / nucleusTotal }));

console.log("All candidates, sorted by probability:");
sorted.forEach((c, i) => {
  console.log(\`\${c.word}: probability \${probs[i].toFixed(2)}\`);
});
console.log("");
console.log(\`Nucleus (smallest set with cumulative probability >= \${p.toFixed(2)}):\`);
console.log(nucleus.map((c) => c.word).join(" "));
console.log("");
console.log("Renormalized probabilities within the nucleus:");
for (const c of renormalized) {
  console.log(\`\${c.word}: \${c.prob.toFixed(2)}\`);
}
console.log("");
console.log("Selected token (highest probability in the nucleus):", renormalized[0].word);`,
      Python: `import math

def softmax(logits):
    exps = [math.exp(x) for x in logits]
    total = sum(exps)
    return [e / total for e in exps]

candidates = [
    {"word": "cat", "logit": 4},
    {"word": "dog", "logit": 3},
    {"word": "fish", "logit": 2},
    {"word": "bird", "logit": 1},
    {"word": "ant", "logit": 0},
]

p = 0.7

sorted_candidates = sorted(candidates, key=lambda c: (-c["logit"], c["word"]))
probs = softmax([c["logit"] for c in sorted_candidates])

# Walk down the sorted list, adding words to the "nucleus" until their
# combined probability first reaches (or passes) the cutoff p.
nucleus = []
cumulative = 0
for i in range(len(sorted_candidates)):
    nucleus.append({"word": sorted_candidates[i]["word"], "prob": probs[i]})
    cumulative += probs[i]
    if cumulative >= p:
        break

nucleus_total = sum(c["prob"] for c in nucleus)
renormalized = [{"word": c["word"], "prob": c["prob"] / nucleus_total} for c in nucleus]

print("All candidates, sorted by probability:")
for c, prob in zip(sorted_candidates, probs):
    print(f"{c['word']}: probability {prob:.2f}")

print("")
print(f"Nucleus (smallest set with cumulative probability >= {p:.2f}):")
print(" ".join(c["word"] for c in nucleus))

print("")
print("Renormalized probabilities within the nucleus:")
for c in renormalized:
    print(f"{c['word']}: {c['prob']:.2f}")

print("")
print("Selected token (highest probability in the nucleus):", renormalized[0]["word"])`,
    },
    output: `All candidates, sorted by probability:
cat: probability 0.64
dog: probability 0.23
fish: probability 0.09
bird: probability 0.03
ant: probability 0.01

Nucleus (smallest set with cumulative probability >= 0.70):
cat dog

Renormalized probabilities within the nucleus:
cat: 0.73
dog: 0.27

Selected token (highest probability in the nucleus): cat`,
  },
  {
    id: "perplexity",
    pillar: "Generative AI",
    name: "Perplexity",
    easy: "Imagine you read a sentence out loud with a friend. Every time you say the next word, they silently guess whether they saw it coming. A friend who is rarely surprised, who keeps nodding 'yeah, I expected that', knows you well. Perplexity turns that idea into one number for a language model. It measures how surprised the model was, on average, by the words that actually came next in some real text. A model that gives high probability to what actually happens is rarely surprised, and gets a LOW perplexity score. A model that keeps getting caught off guard gets a HIGH perplexity score.",
    how: [
      "For each word in a real piece of text, take the probability the model gave to that exact word being next. In a real system, this comes from softmax over the whole vocabulary at that step.",
      "Multiply all of these per-word probabilities together. That gives you the probability the model assigned to the entire sequence happening exactly as it did.",
      "This combined probability shrinks fast as sentences get longer. To make sequences of different lengths comparable, invert it (1 divided by it) and take the n-th root, where n is the number of words. The result is perplexity: a per-word score for how surprised the model was, on average.",
    ],
    when: "This is the standard headline metric for comparing how well two language models predict real text, or for tracking whether a model is improving during training. Lower is always better, whatever the model's exact architecture.",
    big: "O(n) time, where n is the number of words being scored.",
    mistakes: [
      "Don't read perplexity backwards. It is easy to instinctively assume a higher score is better, but perplexity measures confusion, so a lower score always means a better fit to the real text.",
      "Don't compare perplexity scores that were computed differently, such as over different vocabularies, different tokenization, or different text. Perplexity is only a fair comparison between models scored the exact same way on the exact same text.",
    ],
    code: {
      JavaScript: `function perplexity(probs) {
  // Combined probability the model assigned to the whole sequence.
  let product = 1;
  for (const p of probs) product *= p;
  // Invert it and take the n-th root, so longer sequences are still
  // comparable to shorter ones (a per-word "average surprise" score).
  return Math.pow(1 / product, 1 / probs.length);
}

const sentence = ["the", "cat", "sat"];

// Toy per-word probabilities two different models assigned to the ACTUAL
// next word at each step (in a real model these come from softmax).
const modelA = { name: "Model A (confident)", probs: [0.5, 0.5, 0.5] };
const modelB = { name: "Model B (unsure)", probs: [0.2, 0.2, 0.2] };

console.log("Real sentence:", sentence.join(" "));
console.log("");

for (const model of [modelA, modelB]) {
  console.log(\`\${model.name}:\`);
  sentence.forEach((word, i) => {
    console.log(\`  probability assigned to "\${word}": \${model.probs[i].toFixed(2)}\`);
  });
  const ppl = perplexity(model.probs);
  console.log(\`  perplexity: \${ppl.toFixed(2)}\`);
  console.log("");
}

const better = perplexity(modelA.probs) < perplexity(modelB.probs) ? modelA.name : modelB.name;
console.log(\`Lower perplexity means less surprised: \${better} fits the real sentence better.\`);`,
      Python: `def perplexity(probs):
    # Combined probability the model assigned to the whole sequence.
    product = 1
    for p in probs:
        product *= p
    # Invert it and take the n-th root, so longer sequences are still
    # comparable to shorter ones (a per-word "average surprise" score).
    return (1 / product) ** (1 / len(probs))

sentence = ["the", "cat", "sat"]

# Toy per-word probabilities two different models assigned to the ACTUAL
# next word at each step (in a real model these come from softmax).
model_a = {"name": "Model A (confident)", "probs": [0.5, 0.5, 0.5]}
model_b = {"name": "Model B (unsure)", "probs": [0.2, 0.2, 0.2]}

print("Real sentence:", " ".join(sentence))
print("")

for model in [model_a, model_b]:
    print(f"{model['name']}:")
    for i, word in enumerate(sentence):
        print(f"  probability assigned to \\"{word}\\": {model['probs'][i]:.2f}")
    ppl = perplexity(model["probs"])
    print(f"  perplexity: {ppl:.2f}")
    print("")

better = model_a["name"] if perplexity(model_a["probs"]) < perplexity(model_b["probs"]) else model_b["name"]
print(f"Lower perplexity means less surprised: {better} fits the real sentence better.")`,
    },
    output: `Real sentence: the cat sat

Model A (confident):
  probability assigned to "the": 0.50
  probability assigned to "cat": 0.50
  probability assigned to "sat": 0.50
  perplexity: 2.00

Model B (unsure):
  probability assigned to "the": 0.20
  probability assigned to "cat": 0.20
  probability assigned to "sat": 0.20
  perplexity: 5.00

Lower perplexity means less surprised: Model A (confident) fits the real sentence better.`,
  },
  {
    id: "masked-word-prediction",
    pillar: "Generative AI",
    name: "Masked-Word Prediction",
    easy: "Think of a fill-in-the-blank quiz: \"The ___ sat on the mat.\" You use both the words before the blank ('the') and the words after it ('sat on the mat') to guess the missing word. This is masked-word prediction, the training trick behind models like BERT. You hide a real word behind a [MASK] token, and train the model to guess it back using context from both directions at once. It is a close cousin of the N-gram Language Model. But where an n-gram model can only look backward, masked-word prediction gets to peek on both sides of the gap.",
    how: [
      "Take a small pile of ordinary training sentences with no blanks. For every word that is not at the very start or end of a sentence, note down its left neighbor and its right neighbor.",
      "Build a lookup. For every left-neighbor, right-neighbor pair seen during training, count how many times each actual word filled that exact slot.",
      "Given a new sentence with a real word swapped out for [MASK], look at its left and right neighbors. Look up which word filled that exact same slot most often during training, and predict that word. If there is a tie, break it alphabetically.",
    ],
    when: "This is the core training idea behind masked language models, like BERT, used for understanding text. Unlike the N-gram Language Model, or the model behind Beam Search, which only ever predict what comes next, masked-word prediction lets a model build a representation of a word informed by context from both sides.",
    big: "O(n) time to scan an n-word training corpus once and build the neighbor-count lookup · O(1) average time per prediction lookup once it's built.",
    mistakes: [
      "Don't confuse this with the N-gram Language Model. N-gram prediction only ever looks at words before the gap. Masked-word prediction needs, and uses, words on both sides. That is exactly why it needs a full sentence with a hole in it, not just a running prefix.",
      "Don't expect this toy version to handle a slot it never saw exactly during training. Real masked language models generalize using embeddings and similarity. But this simple lookup only recognizes an exact repeat of a left-right pair it already counted.",
    ],
    code: {
      JavaScript: `const corpus = [
  "the cat sat on the mat",
  "the dog sat on the mat",
  "the cat sat on the rug",
  "a cat sat on the mat",
];

// For every interior word in every training sentence, record what word
// filled the slot between its left neighbor and its right neighbor.
const fillCounts = {}; // "left|right" -> { word -> count }
for (const sentence of corpus) {
  const words = sentence.split(" ");
  for (let i = 1; i < words.length - 1; i++) {
    const left = words[i - 1];
    const right = words[i + 1];
    const word = words[i];
    const key = \`\${left}|\${right}\`;
    if (!fillCounts[key]) fillCounts[key] = {};
    fillCounts[key][word] = (fillCounts[key][word] || 0) + 1;
  }
}

function predictMasked(left, right) {
  const key = \`\${left}|\${right}\`;
  const counts = fillCounts[key] || {};
  const options = Object.entries(counts).sort(
    (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)
  );
  return options;
}

console.log("Training sentences:");
corpus.forEach((s) => console.log(\`  \${s}\`));
console.log("");

const testSentence = "the [MASK] sat on the mat";
const left = "the";
const right = "sat";
console.log("Test sentence:", testSentence);
console.log(\`Left context: "\${left}"   Right context: "\${right}"\`);
console.log("");

const options = predictMasked(left, right);
console.log("Candidates seen in that exact slot during training:");
for (const [word, count] of options) {
  console.log(\`  \${word}: seen \${count} time(s)\`);
}
console.log("");
console.log("Predicted word for [MASK]:", options[0][0]);`,
      Python: `corpus = [
    "the cat sat on the mat",
    "the dog sat on the mat",
    "the cat sat on the rug",
    "a cat sat on the mat",
]

# For every interior word in every training sentence, record what word
# filled the slot between its left neighbor and its right neighbor.
fill_counts = {}  # "left|right" -> {word: count}
for sentence in corpus:
    words = sentence.split(" ")
    for i in range(1, len(words) - 1):
        left = words[i - 1]
        right = words[i + 1]
        word = words[i]
        key = f"{left}|{right}"
        fill_counts.setdefault(key, {})
        fill_counts[key][word] = fill_counts[key].get(word, 0) + 1

def predict_masked(left, right):
    key = f"{left}|{right}"
    counts = fill_counts.get(key, {})
    options = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return options

print("Training sentences:")
for s in corpus:
    print(f"  {s}")
print("")

test_sentence = "the [MASK] sat on the mat"
left = "the"
right = "sat"
print("Test sentence:", test_sentence)
print(f'Left context: "{left}"   Right context: "{right}"')
print("")

options = predict_masked(left, right)
print("Candidates seen in that exact slot during training:")
for word, count in options:
    print(f"  {word}: seen {count} time(s)")

print("")
print("Predicted word for [MASK]:", options[0][0])`,
    },
    output: `Training sentences:
  the cat sat on the mat
  the dog sat on the mat
  the cat sat on the rug
  a cat sat on the mat

Test sentence: the [MASK] sat on the mat
Left context: "the"   Right context: "sat"

Candidates seen in that exact slot during training:
  cat: seen 2 time(s)
  dog: seen 1 time(s)

Predicted word for [MASK]: cat`,
  },
];

export default lessons;
