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
    easy: "A language model can't read sentences the way you do — it needs everything chopped into small, numbered pieces first. Tokenization is like snapping a sentence apart into LEGO bricks: each brick (a 'token', usually a word or word-piece) gets a number, and the model only ever works with those numbers.",
    how: [
      "Lowercase the text and split it into tokens — here, the simplest version: pull out runs of letters/digits and throw away punctuation and spacing.",
      "Walk through the tokens and build a vocabulary: the first time you see a new token, give it the next free id (0, 1, 2, ...). If you've seen it before, reuse its existing id.",
      "The sentence is now representable as a list of ids instead of text — that list of numbers is what actually gets fed into a model.",
    ],
    when: "The very first step of every text-based AI system — before embeddings, before attention, before anything else, raw text has to become tokens.",
    big: "O(n) time to scan the text once, where n is the character count · O(v) space for a vocabulary of v unique tokens.",
    mistakes: [
      "Thinking tokens are always whole words — real tokenizers often split rare words into smaller pieces (e.g. 'unhappiness' → 'un' + 'happi' + 'ness'). We use whole words here to keep the example simple.",
      "Forgetting to lowercase (or otherwise normalize) first, so 'Dog' and 'dog' end up as two different tokens with two different ids.",
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
    note: "Both languages keep dictionary/object keys in the order they were first inserted, so the vocabulary prints in the same order in JavaScript and Python.",
  },
  {
    id: "bag-of-words",
    pillar: "Generative AI",
    name: "Bag-of-Words Vectors",
    easy: "A bag-of-words vector turns a sentence into a list of numbers by counting words, ignoring order entirely — like dumping a sentence's words into a bag and just tallying how many of each word you find. Two sentences that share a lot of words end up with similar-looking number lists.",
    how: [
      "Collect every unique word across all the sentences you care about — that's your shared vocabulary.",
      "Sort the vocabulary so the word order is fixed and predictable (e.g. alphabetically).",
      "For each sentence, build a vector the same length as the vocabulary: slot i counts how many times vocabulary word i appears in that sentence.",
    ],
    when: "A simple, classic way to turn text into numbers for comparison or basic search — the ancestor of the embedding vectors that modern models use (see Cosine Similarity and Vector Search / RAG Retrieval).",
    big: "O(s · w) time to build one vector, where s is sentence length and w is vocabulary size · O(w) space per vector.",
    mistakes: [
      "Forgetting that word order is completely thrown away — 'dog bites man' and 'man bites dog' produce the identical bag-of-words vector.",
      "Building a different vocabulary per sentence — vectors are only comparable if they're built against the same shared vocabulary.",
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
    easy: "Embeddings give every word (or sentence) a location in space, so similar meanings end up near each other — like a map where 'king' and 'queen' sit close together, and 'bread' sits far away. Cosine similarity measures how alike two of these locations are by comparing the *angle* between them: 1.00 means pointing the exact same direction (very similar), 0.00 means unrelated, and it can go negative for opposite meanings.",
    how: [
      "Take the dot product of the two vectors: multiply matching positions together and add up the results.",
      "Compute each vector's magnitude (length): square every number, add them up, and take the square root.",
      "Divide the dot product by the product of the two magnitudes. The result is always between -1 and 1 — bigger means more similar.",
    ],
    when: "Comparing embeddings (number representations of meaning) — finding similar words, similar documents, or which stored chunk of text best matches a search query.",
    big: "O(d) time and space, where d is the number of dimensions in each vector.",
    mistakes: [
      "Comparing raw dot products without dividing by the magnitudes — that unfairly favors longer vectors over genuinely more similar ones.",
      "Comparing vectors of different lengths (dimensions) — they have to come from the same embedding space to mean anything.",
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
    easy: "RAG (Retrieval-Augmented Generation) is like giving an AI an open-book exam: instead of answering purely from memory, it first looks up the most relevant notes, then writes its answer using them. The 'lookup' step is vector search — every stored chunk of text has an embedding (a location in meaning-space), the query gets one too, and you retrieve whichever stored chunk's embedding is closest (most similar) to the query's.",
    how: [
      "Turn every chunk of text in your knowledge base into an embedding vector ahead of time, and store them.",
      "When a query comes in, turn it into an embedding vector using the same method.",
      "Compare the query vector to every stored vector using cosine similarity, and retrieve the chunk with the highest score — that's the 'retrieval' in Retrieval-Augmented Generation. A real system then hands that chunk to a language model to write the final answer.",
    ],
    when: "Letting an AI answer questions about your own documents, a knowledge base, or anything outside what it memorized during training — without retraining the model itself.",
    big: "O(n · d) time for a plain scan over n stored vectors of dimension d. Real systems use specialized vector indexes to search millions of vectors faster than checking every single one.",
    mistakes: [
      "Assuming retrieval always finds a *relevant* chunk — if nothing in the knowledge base is actually related, it still returns whichever chunk scored highest, even if that's a poor match.",
      "Skipping the generation step entirely — retrieval only finds supporting text; a language model still needs to turn it into a real answer.",
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
    easy: "Before today's huge AI models, a much simpler trick could still predict 'the next word': just count. Read a pile of text, and for every word, tally which word tends to follow it. Then to predict what comes next, pick whichever follower showed up the most. This is the ancestor of your phone keyboard's word suggestions — and the ancestor of what a language model does at a much bigger scale.",
    how: [
      "Break the training text into a sequence of tokens (words).",
      "For every word, count how often each other word directly follows it — these word-pairs are called 'bigrams' (2-grams).",
      "To predict the next word after some word W, look up W's followers and pick the one with the highest count (breaking ties alphabetically, so the result is predictable).",
    ],
    when: "A lightweight, fully explainable way to model 'what word comes next' — useful for teaching the core idea before jumping to neural language models, or for simple autocomplete.",
    big: "O(n) time to build the counts from n training tokens · O(1) average time per prediction lookup once built.",
    mistakes: [
      "Only ever looking one word back (a 'bigram') — real language depends on much more context, which is why modern models look back over huge windows of text.",
      "Not handling words the model never saw during training — an n-gram model simply has no prediction for a word it has no counts for.",
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
    note: "'the' has two equally common followers ('cat' and 'mat', both seen twice) and 'cat' has two equally common followers ('ran' and 'sat', both seen once) — ties are broken alphabetically so both languages always pick the same word.",
  },
  {
    id: "softmax-temperature",
    pillar: "Generative AI",
    name: "Softmax & Temperature",
    easy: "A language model doesn't just pick one 'next word' — it scores every candidate word, and softmax turns those raw scores into proper probabilities that add up to 100%. Temperature is a creativity dial applied before that: a low temperature (like 0.5) sharpens the scores so the model confidently picks the top word almost every time; a high temperature (like 2.0) flattens them out so more surprising words get a real chance.",
    how: [
      "Start with raw scores ('logits') for each candidate — one number per option, can be any size.",
      "Divide every score by the temperature first: smaller temperature makes big scores relatively even bigger (sharper), larger temperature squashes the differences (flatter).",
      "Apply softmax: exponentiate each (scaled) score, then divide each by the total of all the exponentials — that turns them into probabilities that sum to 1.",
    ],
    when: "Deciding how 'creative' vs. 'predictable' text generation should be — low temperature for factual, consistent answers; higher temperature for brainstorming or varied writing.",
    big: "O(k) time and space, where k is the number of candidate options being scored.",
    mistakes: [
      "Setting temperature to 0 and dividing directly — that causes a division by zero. Real systems handle temperature 0 as a special case ('always pick the top score') instead.",
      "Forgetting that probabilities are rounded for display — independently rounding each one to 2 decimals can make them add up to 1.01 or 0.99 instead of exactly 1.00. That's normal rounding, not a bug.",
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
    easy: "A prompt template is a fill-in-the-blank form for talking to an AI — like a mail-merge letter with '{name}' and '{date}' placeholders. You write the wording once, then plug in different variables (a topic, a tone, a user's question) each time, instead of retyping the instructions from scratch for every request.",
    how: [
      "Write a template string once, with placeholders marked like {topic} or {question}.",
      "Collect the real values you want to fill in as a simple key-to-value mapping (a dictionary/object).",
      "Scan the template for every {placeholder}, and replace each one with its matching value from the mapping.",
    ],
    when: "Any time you send an AI the same kind of instruction repeatedly with different details — a support bot, a summarizer, a code reviewer — templating keeps the wording consistent and the variable parts easy to swap.",
    big: "O(n) time to scan and fill a template of length n.",
    mistakes: [
      "Forgetting to fill in a placeholder — the literal text \"{topic}\" gets sent to the model instead of a real value, confusing it.",
      "Building prompts by raw string concatenation instead of a template — makes it hard to see or reuse the fixed wording once you have many slightly different prompts.",
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
];

export default lessons;
