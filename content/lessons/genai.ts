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
    easy: "Picture snapping a sentence apart like LEGO bricks — each brick is one small piece of text, usually a single word. That's tokenization: breaking text into small pieces called tokens. Every token then gets its own ID number. From that point on, the computer works only with those numbers, never the actual words, because a language model can only do math — it can't read English directly.",
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
    easy: "Picture dumping every word from a sentence into a bag and then just counting how many of each word landed inside — word order doesn't matter anymore, only the totals. That's a bag-of-words vector: a list of numbers, one count per word. Two sentences that use a lot of the same words end up with very similar-looking lists of numbers.",
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
    easy: "Imagine a map where words with similar meanings sit close together — 'king' and 'queen' are near neighbors, while 'bread' is off in a different part of the map. Each word's spot on that map is called its embedding: a list of numbers standing in for its meaning. Cosine similarity is a score for how close two spots are — but instead of straight-line distance, it compares the angle between them as seen from the map's center. It always lands between -1 and 1: 1.00 means pointing in the exact same direction (very similar), 0.00 means unrelated, and a negative number means close to opposite.",
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
    easy: "Your phone keyboard suggesting the next word as you type is doing something close to this old, simple trick: just count. Before today's huge AI models existed, you could predict 'the next word' by reading a big pile of text and, for every word, tallying which word tends to follow it directly. Then to predict what comes next after some word, just pick whichever follower showed up the most in your counts. It's the ancestor of your keyboard's suggestions — and of what a modern language model does, just at a vastly bigger scale.",
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
    easy: "A language model doesn't just blurt out one 'next word' — it first gives every candidate word a raw score (called a logit) for how likely it seems. Softmax is the step that turns those raw scores into real percentages that add up to 100%, like a poll of the model's confidence in each word. Temperature is a dial you turn before that happens: turn it down (like 0.5) and the model gets more confident and predictable, almost always picking the top word. Turn it up (like 2.0) and the scores flatten out, giving less-likely words a real shot at being picked — more surprising, more 'creative' text.",
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
  {
    id: "tfidf",
    pillar: "Generative AI",
    name: "TF-IDF",
    easy: "Imagine flipping through a pile of documents, looking for the words that make one of them special — not just any word that shows up a lot, but a word that's common in THIS document and rare everywhere else, like a fingerprint. TF-IDF (Term Frequency times Inverse Document Frequency) is a score that finds exactly those words. A word that's frequent here but also frequent in every other document (like 'the') gets a near-zero score — it's not special. A word that's frequent here but rare across the rest gets a high score — that's what makes this document distinct.",
    how: [
      "For each word in the document you're scoring, compute its Term Frequency (TF): how often that word shows up in this document, divided by the document's total word count.",
      "For each word, compute its Inverse Document Frequency (IDF): take the total number of documents, divide by how many of them contain that word at least once, and take the logarithm of that ratio. A word in every document gets an IDF near zero; a word in only one document gets a high IDF.",
      "Multiply TF by IDF for each word — that's its TF-IDF score. Sort the words by that score to see which ones best characterize this particular document.",
    ],
    when: "Search engines, keyword extraction, and finding the most 'important' or distinctive words in a document compared to a larger collection — an old but still widely used building block, from before embeddings took over.",
    big: "O(n · m) time to score one document, where n is its number of unique words and m is the number of documents in the collection (or O(n) if document frequencies are precomputed) · O(v) space for a vocabulary of v words.",
    mistakes: [
      "Forgetting the IDF half and ranking words by raw frequency (TF) alone — that just surfaces filler words like 'the' and 'and', which show up everywhere and say nothing distinctive about this document.",
      "Computing IDF once and never updating it — if you add new documents to the collection, every existing document's TF-IDF scores can shift, since IDF depends on the whole collection, not just one document.",
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
    note: "'and', 'are', and 'friends' all tie at the highest score (each appears in only one document), and 'cat'/'dog' tie right behind them — ties are broken alphabetically so both languages always print the words in the same order.",
  },
  {
    id: "text-chunking-rag",
    pillar: "Generative AI",
    name: "Text Chunking for RAG",
    easy: "Imagine slicing a long loaf of bread into pieces small enough to actually eat — but instead of clean, unrelated slices, each one overlaps a little with the next, so no bite loses its context. That's text chunking: before an AI can search over or reason about a long document, the document has to be cut into small pieces ('chunks') that fit in the AI's working memory. Chunks usually overlap a little with their neighbors, so an idea that happens to sit right on the cut line doesn't get sliced in half and lost.",
    how: [
      "Split the document into words (or another small unit of text).",
      "Decide a chunk size (how many words go in each chunk) and an overlap (how many of the last words of one chunk should also start the next chunk).",
      "Walk through the document taking a chunk of `chunk size` words at a time, but instead of jumping forward by the full chunk size each time, jump forward by (chunk size − overlap) words — that gap is what creates the overlap between consecutive chunks. Stop once a chunk reaches the end of the document.",
    ],
    when: "Retrieval-Augmented Generation (RAG) systems: before you can search or embed a long document, you first have to break it into chunks small enough to embed and hand to a language model — this preprocessing step happens before Vector Search / RAG Retrieval.",
    big: "O(n) time and space, where n is the number of words in the document — every word is visited only a small, constant number of extra times because of the overlap.",
    mistakes: [
      "Chunking on a fixed number of characters instead of something meaning-aware (like whole words or sentences) — this can slice a sentence, or even a word, right in half, leaving both halves harder to search and understand.",
      "Using zero overlap — if the answer to a question spans the exact boundary between two chunks, neither chunk alone contains the full answer.",
      "Using overlap that's too large relative to the chunk size — you end up storing and searching almost the same text many times over, wasting space and letting near-duplicate chunks compete with each other during retrieval.",
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
    easy: "Picture a leaderboard for 'what word comes next': instead of only ever crowning a single #1 word, or being forced to weigh every possible word in the language, you just keep the top handful of contenders — say, the top 3 — and ignore the long tail of unlikely options. That's top-k selection: a filtering step language models use before choosing the next word. Keep only the k highest-scoring candidates, then decide among just those.",
    how: [
      "Score every candidate (every possible next word) with a number — a higher number means the model thinks it's more likely to come next.",
      "Sort the candidates by score, highest first.",
      "Keep only the top k candidates and throw the rest away, no matter how good or bad they were.",
      "Turn the kept candidates' scores back into probabilities (for example with softmax — see Softmax & Temperature) using only this smaller shortlist, then pick from among them.",
    ],
    when: "Controlling text generation so a model can't wander into extremely unlikely, nonsensical words — a common safety net used alongside temperature, often set to something like k=40 or k=50 in real systems.",
    big: "O(n log n) time to sort n candidates (or O(n) with a selection algorithm) · O(k) space for the shortlist.",
    mistakes: [
      "Setting k too small (like k=1) — that's the same as always picking the single highest-scoring word every time, which can make text repetitive and robotic.",
      "Setting k too large (close to the whole vocabulary) — top-k stops doing anything useful, since you're barely filtering out any of the unlikely candidates.",
      "Forgetting to re-score (renormalize) the probabilities after cutting candidates out — the leftover scores no longer add up to 100% unless you recompute them over just the shortlist.",
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
    easy: "Think about turning the word 'cat' into 'cot' — you only need to change one letter, so they're '1 edit' apart. Edit distance (also called Levenshtein distance) counts the fewest single-letter edits — inserting a letter, deleting a letter, or swapping one letter for another — needed to turn one piece of text into another. Two identical words are '0 edits' apart; the more edits it takes, the less alike they are. This is the trick behind a spell-checker's 'did you mean...?' suggestions and other fuzzy (approximate, not exact) text matching.",
    how: [
      "Build a grid with one row per letter of the first word (plus an extra row for the empty string) and one column per letter of the second word (plus an extra column for the empty string).",
      "Fill in the first row and column with 0, 1, 2, 3... — turning an empty string into a growing prefix just costs that many letter insertions.",
      "Fill in the rest of the grid cell by cell: if the current letters from both words match, copy the value from the diagonal cell up-left (no edit needed there). If they don't match, take the smallest of the cell above, the cell to the left, and the diagonal cell, and add 1 for the edit.",
      "The number in the grid's bottom-right corner is the edit distance between the two full words.",
    ],
    when: "Fuzzy string matching: spell-check suggestions, 'did you mean' search corrections, matching slightly misspelled names or addresses, and measuring how close a generated string is to an expected one.",
    big: "O(m · n) time and space, where m and n are the lengths of the two words being compared (the size of the grid).",
    mistakes: [
      "Confusing edit distance with 'how different the words look' at a glance — 'flaw' and 'lawn' share every single letter but are still 2 edits apart, because the letters are in a different order.",
      "Forgetting that a lower edit distance always means more similar (0 = identical) — it's easy to instinctively read it backwards, like a similarity score where higher is better.",
      "Using edit distance alone to compare words of very different lengths — a short word will always need at least (the length difference) edits to reach a much longer one, no matter how related the two actually are.",
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
    note: "'apple' and 'maple' are tied at distance 1 from 'aple' — the code keeps the first one it finds with the lowest distance so far, and both languages check the dictionary in the same order, so both always pick 'apple'.",
  },
  {
    id: "self-attention",
    pillar: "Generative AI",
    name: "Self-Attention",
    easy: "Imagine reading the sentence 'The trophy didn't fit in the suitcase because it was too big' — to figure out what 'it' refers to, you glance back at the earlier words and decide the trophy is the more relevant one, not the suitcase. Self-attention is a language model doing exactly that, for every single word: it looks at all the other words (and itself) in the sentence and decides how much to 'focus' on each one, using a weight between 0 and 1 for each. Words that seem more relevant get a bigger weight; blending all the words together using those weights becomes the model's new, context-aware understanding of the word it's focusing from.",
    how: [
      "Give each token (word) a vector — a small list of numbers standing in for its meaning (a toy embedding).",
      "For the token you're computing attention *from*, take the dot product of its vector with every token's vector, including its own — this raw number is the attention score for that pair.",
      "Run all of that token's scores through softmax (see Softmax & Temperature) to turn them into attention weights that add up to 1 — a bigger score becomes a bigger weight.",
      "Multiply every token's vector by its attention weight and add all the results together. That weighted sum is the context vector: a new representation of the original token, blended with whatever else in the sentence it decided to focus on.",
    ],
    when: "The mechanism at the heart of Transformers — the architecture behind modern language models. It's how a model figures out which other words in a sentence matter for understanding (or generating) any given word, instead of only ever looking at fixed nearby positions.",
    big: "O(n² · d) time and O(n²) space for a sequence of n tokens with d-dimensional vectors — every token computes a score against every other token, which is why very long inputs get expensive fast.",
    mistakes: [
      "Thinking a word only pays attention to its immediate neighbors — self-attention scores every word against every other word in the sequence, no matter how far apart they are.",
      "Forgetting the softmax step — raw dot-product scores aren't weights yet; they need to be turned into a normalized set of numbers that add up to 1 before they can be used to blend vectors together.",
      "Assuming this toy version is exactly how real Transformers work — real self-attention uses three different learned projections of each token (called query, key, and value) instead of reusing the same raw vector for all three roles, which lets the model learn different notions of 'relevance' rather than just raw similarity.",
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
];

export default lessons;
