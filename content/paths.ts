// content/paths.ts
// Career "what should I learn?" tracks. Each path is an ordered roadmap:
// learn this, then this. The FIRST step is treated as "start here".
//
// Keep content here (not in components) so new tracks slot in easily.

export type PathStep = [title: string, description: string];

export type Path = {
  /** Stable id used in anchors/links. */
  id: string;
  /** Human name of the track. */
  name: string;
  /** Short tag shown on the card chip. */
  tag: string;
  /** Accent color token name from the design system (used as CSS var). */
  color: string;
  /** One-line plain-English "what is this track". */
  blurb: string;
  /** Ordered [title, plain-English description] steps. Index 0 = "start here". */
  steps: PathStep[];
};

export const paths: Path[] = [
  {
    id: "frontend",
    name: "Frontend",
    tag: "The part people see & click",
    color: "#5B4BEB",
    blurb:
      "You build the screens people actually touch — buttons, pages, and everything that looks and feels a certain way.",
    steps: [
      ["HTML — the page's skeleton", "The words, images, and boxes on a page. Think of it as the frame of a house before paint."],
      ["CSS — the paint & layout", "Colors, spacing, and where things sit. This is how a plain page becomes something nice to look at."],
      ["JavaScript basics", "The language that makes pages react — clicks, typing, and things that change without reloading."],
      ["The browser & how the web works", "What happens when you type a website and hit enter. Requests, responses, and pages loading."],
      ["Git & GitHub", "A save-history for your code so you never lose work and can team up with others."],
      ["A framework: React", "A popular toolkit that lets you build screens out of reusable pieces called components."],
      ["Fetching data (APIs)", "How your page asks another computer for information — like loading a list of products."],
      ["Accessibility & responsive design", "Making your site work for everyone, on phones and screen readers, not just your laptop."],
      ["Deploy your site", "Put it on the internet so anyone can visit. Tools like Vercel make this a one-click step."],
    ],
  },
  {
    id: "backend",
    name: "Backend",
    tag: "The engine behind the app",
    color: "#12B886",
    blurb:
      "You build the invisible engine — saving data, checking passwords, and doing the heavy lifting the user never sees.",
    steps: [
      ["Pick a language", "Start with one: JavaScript (Node) or Python are the friendliest first choices."],
      ["Programming fundamentals", "Variables, loops, functions, and conditions — the building blocks every program is made of."],
      ["How the internet talks (HTTP)", "The rules computers use to send messages back and forth. Requests in, responses out."],
      ["Build an API", "A menu of things your server can do, so apps and websites can ask it for data or actions."],
      ["Databases", "Where information is stored long-term. Learn to save, find, update, and delete data."],
      ["Authentication", "Knowing who a user is and keeping their account safe. Logins, sessions, and passwords done right."],
      ["Git & GitHub", "Track your changes and collaborate without stepping on each other's work."],
      ["Testing your code", "Small checks that catch bugs before your users do."],
      ["Deploy & keep it running", "Get your server online and learn to watch it so you know when something breaks."],
    ],
  },
  {
    id: "fullstack",
    name: "Full-stack",
    tag: "Both sides of the screen",
    color: "#FF8A3D",
    blurb:
      "You do a bit of everything — the screens people see AND the engine behind them. A great all-rounder path.",
    steps: [
      ["Frontend basics", "HTML, CSS, and JavaScript — enough to build a page people can use."],
      ["A frontend framework", "React (or similar) to build screens out of reusable pieces."],
      ["Backend fundamentals", "A server language, how HTTP works, and building a simple API."],
      ["Databases", "Store and retrieve data — the memory of your app."],
      ["Connect the two ends", "Wire your frontend to your backend so the screen shows real, saved data."],
      ["Authentication end-to-end", "Log a user in on the frontend and verify them on the backend."],
      ["Git & GitHub", "Version control for the whole project, front and back."],
      ["A full framework: Next.js", "One tool that handles both frontend and backend in a single project."],
      ["Deploy the whole app", "Ship your complete app to the internet in one go."],
    ],
  },
  {
    id: "ai-engineer",
    name: "AI Engineer",
    tag: "Teaching machines to learn",
    color: "#191C33",
    blurb:
      "You build apps powered by AI — from smart chat features to models that spot patterns in data.",
    steps: [
      ["Python", "The main language of AI. Friendly to read and packed with helpful tools."],
      ["Math you actually need", "A gentle intro to the stats and algebra behind AI — no PhD required to start."],
      ["Working with data", "Loading, cleaning, and exploring data using tools like pandas."],
      ["Machine learning basics", "How a computer 'learns' patterns from examples instead of being told every rule."],
      ["Using AI models & APIs", "Plug powerful ready-made models (like large language models) into your own apps."],
      ["Prompting & retrieval (RAG)", "Get better answers from AI by giving it the right context and your own data."],
      ["Build an AI-powered app", "Combine an AI model with a real interface people can use."],
      ["Evaluating & improving", "Measure whether your AI is actually good, and make it better over time."],
      ["Deploy responsibly", "Ship it, watch costs, and handle mistakes AI can make."],
    ],
  },
];

export function getPath(id: string): Path | undefined {
  return paths.find((p) => p.id === id);
}
