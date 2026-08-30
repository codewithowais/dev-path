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
    id: "foundations",
    name: "Not sure yet? Start here",
    tag: "Universal basics before you specialize",
    color: "#5F3DC4",
    blurb:
      "If you don't know which path to pick, start here. These basics are useful no matter what you specialize in later — and they help you figure out what you actually enjoy.",
    steps: [
      ["How computers & the internet work", "A simple mental model of what code is, what a program does, and what happens when you open a website. No coding yet — just the big picture."],
      ["Pick one beginner-friendly language", "Choose ONE to start — Python or JavaScript are the gentlest. You're not marrying it; the skills carry over to any language later."],
      ["Programming fundamentals", "Variables, loops, functions, and conditions (if/else). These few ideas are the building blocks behind every program ever written."],
      ["Practice solving small problems", "Work through little exercises. This is where 'I read about it' turns into 'I can actually do it' — struggling here is normal and expected."],
      ["The command line basics", "Controlling your computer by typing commands instead of clicking. A little goes a long way and shows up in almost every tech job."],
      ["Git & GitHub", "A save-history for your code so you never lose work and can share it with others. Learn it early — you'll use it forever."],
      ["Build a few small projects", "Make tiny things you find fun — a to-do list, a simple page, a mini calculator. Finished small projects teach more than endless tutorials."],
      ["Try out a few specialties", "Sample frontend, backend, and data (using the other paths here) to feel what you actually enjoy before committing."],
      ["Pick a path and go deeper", "Choose one track above and follow it. You can always change direction later — almost everyone adjusts course at some point."],
    ],
  },
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
      ["Git & GitHub", "A save-history for your code so you never lose work, and how teams collaborate without overwriting each other. Learn it early — you'll use it in every step after this."],
      ["How the internet talks (HTTP)", "The rules computers use to send messages back and forth. Requests in, responses out."],
      ["Build an API", "A menu of things your server can do, so apps and websites can ask it for data or actions."],
      ["Databases", "Where information is stored long-term. Learn to save, find, update, and delete data."],
      ["Authentication", "Knowing who a user is and keeping their account safe. Logins, sessions, and passwords done right."],
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
      ["Git & GitHub", "A save-history for your code so you never lose work and can collaborate. Learn it early so you're using it through every step below."],
      ["A frontend framework", "React (or similar) to build screens out of reusable pieces."],
      ["Backend fundamentals", "A server language, how HTTP works, and building a simple API."],
      ["Databases", "Store and retrieve data — the memory of your app."],
      ["Connect the two ends", "Wire your frontend to your backend so the screen shows real, saved data."],
      ["Authentication end-to-end", "Log a user in on the frontend and verify them on the backend."],
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
  {
    id: "devops",
    name: "DevOps Engineer",
    tag: "Keeps apps running smoothly",
    color: "#E8590C",
    blurb:
      "You build the pipelines and tools that get code from a developer's laptop to real users, safely and automatically.",
    steps: [
      ["Linux & the command line", "The operating system behind most servers, and the text commands you use to control it instead of clicking icons."],
      ["Networking basics", "How computers find and talk to each other — IP addresses and DNS, the internet's phonebook that turns names into addresses."],
      ["Git & GitHub", "A save-history for code so teams can work together without overwriting each other's changes."],
      ["Scripting (Bash or Python)", "Small programs that automate repetitive tasks instead of doing them by hand every time."],
      ["Containers with Docker", "Packing an app and everything it needs into one box that runs the same way on any computer."],
      ["CI/CD pipelines", "Short for Continuous Integration/Continuous Deployment — automatically testing and shipping code every time someone makes a change."],
      ["Cloud platforms", "Renting computers and services from providers like AWS, Azure, or GCP instead of owning physical servers."],
      ["Infrastructure as Code", "Describing your servers and setup in text files (with a tool like Terraform) so you can recreate them instantly instead of clicking through menus."],
      ["Monitoring & alerts", "Watching your systems so you find out about problems before your users do."],
      ["Orchestration with Kubernetes", "A tool that manages lots of containers across many machines, restarting and scaling them automatically."],
    ],
  },
  {
    id: "mobile-developer",
    name: "Mobile Developer",
    tag: "Apps that live in your pocket",
    color: "#7048E8",
    blurb:
      "You build the apps people install on their phones — from the icon on the home screen to how it feels to tap around inside.",
    steps: [
      ["Pick your path", "Native (Swift for iPhone, Kotlin for Android) or cross-platform (one codebase for both, like React Native or Flutter) — most beginners start cross-platform."],
      ["Programming fundamentals", "Variables, loops, and functions — the basic building blocks any app is made of, no matter the language."],
      ["Git & GitHub", "A save-history for your code so you never lose work and can collaborate. Learn it early — you'll rely on it through every step below."],
      ["UI building blocks", "The screens, buttons, and lists your app is made of, and how to arrange them on different-sized phone screens."],
      ["Navigation between screens", "How a user moves from one screen to another, like tapping a post to open its details."],
      ["Storing data on the device", "Saving small bits of info, like login state or preferences, directly on the user's phone."],
      ["Talking to a server (APIs)", "How your app fetches or sends data over the internet, like loading a news feed."],
      ["Device features", "Using the camera, location, notifications, and other things that are unique to phones."],
      ["Testing on real devices", "Making sure your app actually works well on different phones, screen sizes, and operating system versions."],
      ["Publish to app stores", "The process of submitting your app to the Apple App Store or Google Play so anyone can download it."],
    ],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    tag: "Turns numbers into answers",
    color: "#0CA678",
    blurb:
      "You dig through data to answer real business questions, like \"why did sales drop last month?\", and explain it clearly to others.",
    steps: [
      ["Spreadsheets (Excel/Sheets)", "The simplest tool for looking at data, sorting it, and doing quick calculations — start here before anything fancier."],
      ["SQL — talking to databases", "A language for asking a database questions, like 'show me all orders from last week.'"],
      ["Statistics basics", "Averages, percentages, and how to tell if a pattern in data is real or just chance."],
      ["Data cleaning", "Real-world data is messy — fixing typos, missing values, and duplicates before you can trust any analysis."],
      ["Python or R for analysis", "A programming language that lets you analyze bigger datasets faster than a spreadsheet can."],
      ["Data visualization", "Turning numbers into charts and graphs so people can understand your findings at a glance."],
      ["Dashboards (Tableau/Power BI)", "Tools that turn your analysis into a live, clickable report other people can check anytime."],
      ["Storytelling with data", "Explaining what the numbers mean in plain language, not just showing charts and hoping people get it."],
      ["Git & version control basics", "Keeping track of changes to your analysis files, especially useful once you work with others."],
      ["Working with real business questions", "Practicing on real problems, like which product to promote, using the tools above end-to-end."],
    ],
  },
  {
    id: "data-scientist-ml",
    name: "Data Scientist / ML",
    tag: "Finds patterns machines can use",
    color: "#F03E3E",
    blurb:
      "You go beyond describing data — you build models that predict things, like which customers might cancel their subscription.",
    steps: [
      ["Python", "The main language for data science. Readable, friendly, and packed with tools built exactly for this work."],
      ["Math foundations", "A gentle grounding in statistics, probability, and a bit of algebra — the logic behind how models learn."],
      ["Working with data (pandas)", "Loading, cleaning, and reshaping datasets so they're ready to analyze or feed into a model."],
      ["Data visualization", "Charting your data to spot patterns and check your assumptions before building anything complex."],
      ["Machine learning fundamentals", "How a computer 'learns' patterns from past examples and uses them to make predictions on new data, instead of following fixed rules."],
      ["Key algorithms", "Learning the handful of go-to techniques (like decision trees and regression) that solve most real-world problems."],
      ["Feature engineering", "Choosing and shaping the right inputs so your model has the best possible clues to learn from — usually done as you build the model."],
      ["Model evaluation", "Checking whether your model is actually good, and not just memorizing the examples you gave it."],
      ["Deep learning basics", "An intro to neural networks — the technique behind image recognition and modern AI chatbots."],
      ["Deploying a model", "Turning your model from a notebook experiment into something a real app can actually use."],
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    tag: "Keeps the bad guys out",
    color: "#1098AD",
    blurb:
      "You learn how systems get attacked so you can defend them — protecting data, accounts, and apps from people trying to break in.",
    steps: [
      ["How computers & networks work", "The basics of operating systems and networking — you can't protect a system you don't understand."],
      ["Linux fundamentals", "Most servers and security tools run on Linux, so getting comfortable with it early pays off."],
      ["Networking & protocols", "How data travels between computers, and the common rules (like HTTP and DNS) attackers try to exploit."],
      ["Security fundamentals", "Core ideas like encryption (scrambling data so only the right people can read it) and authentication (proving who you are)."],
      ["Common vulnerabilities", "The classic mistakes that let attackers in, like weak passwords or unchecked user input (SQL injection)."],
      ["Hands-on labs (CTFs)", "Capture The Flag challenges — safe, legal puzzles where you practice 'hacking' into intentionally vulnerable systems."],
      ["Tools of the trade", "Learning software like Wireshark (watches network traffic) and Nmap (scans for open doors into a system)."],
      ["Web app security", "Specifically protecting websites and apps, since that's where most everyday attacks happen."],
      ["Security certifications path", "Recognized credentials, like CompTIA Security+, that prove your skills to employers."],
      ["Incident response basics", "What to do when a breach actually happens — containing the damage and figuring out what went wrong."],
    ],
  },
  {
    id: "cloud-engineer",
    name: "Cloud Engineer",
    tag: "Builds on rented supercomputers",
    color: "#E64980",
    blurb:
      "You design and manage the online infrastructure apps run on, using services from providers like AWS instead of physical servers.",
    steps: [
      ["Networking basics", "How computers find and talk to each other — an essential foundation before renting any cloud service."],
      ["Linux fundamentals", "Most cloud servers run Linux, so being comfortable with it is a must."],
      ["Pick a cloud provider", "AWS, Azure, or Google Cloud — the big three renting out computing power. Start with one and learn its basics."],
      ["Core cloud services", "Virtual servers, storage, and databases — the building blocks every cloud app is made from."],
      ["Networking in the cloud", "Setting up private, secure spaces (called VPCs) for your resources to live in and talk to each other."],
      ["Identity & access management", "Controlling exactly who and what can access your cloud resources, to avoid costly mistakes or breaches."],
      ["Infrastructure as Code", "Writing your setup as text files (with a tool like Terraform) so it's repeatable, not just manual clicking."],
      ["Containers & Docker", "Packaging apps so they run the same way anywhere, which is how most modern cloud apps are shipped."],
      ["Monitoring & cost management", "Watching that your systems are healthy, and that your cloud bill doesn't quietly explode."],
      ["Cloud certification path", "Provider certifications (like AWS Solutions Architect) that prove your skills and help you get hired."],
    ],
  },
  {
    id: "qa-test-automation",
    name: "QA / Test Automation",
    tag: "Catches bugs before users do",
    color: "#F59F00",
    blurb:
      "You make sure software actually works — by testing it by hand and by writing code that tests it automatically, every time.",
    steps: [
      ["How software gets built", "A basic understanding of the development process, so you know where and why bugs creep in."],
      ["Manual testing fundamentals", "Actually using an app like a real user would, on purpose trying to break it, and writing down what goes wrong."],
      ["Writing good bug reports", "Clearly describing what went wrong so a developer can actually reproduce and fix it."],
      ["Test case design", "Planning ahead of time exactly what to check, so you don't miss important scenarios."],
      ["Basic programming (JavaScript or Python)", "Enough coding to read and write simple scripts — the foundation for automating tests."],
      ["Automated testing basics", "Writing code that clicks around and checks your app for you, so you don't have to test everything by hand every time."],
      ["Testing tools (Selenium/Playwright/Cypress)", "Popular frameworks that let your code control a real browser to test websites automatically."],
      ["API testing", "Checking that the invisible connections between an app and its server work correctly, not just what's on screen."],
      ["CI/CD integration", "Hooking your automated tests into the pipeline that ships code, so tests run automatically on every change."],
      ["Performance & load testing", "Checking that an app stays fast and stable even when lots of people use it at once."],
    ],
  },
  {
    id: "game-developer",
    name: "Game Developer",
    tag: "Builds worlds people play in",
    color: "#364FC7",
    blurb:
      "You create interactive games — the code, rules, and feel that turn an idea into something fun people can actually play.",
    steps: [
      ["Programming fundamentals", "Variables, loops, and functions — every game, no matter how fancy, is built from these basics."],
      ["Pick a game engine", "Software like Unity or Godot that handles the hard parts (graphics, physics) so you can focus on making the game."],
      ["Git & version control", "A save-history for your project so you never lose work — it matters even more in games, which pile up lots of code and art files. Set it up early."],
      ["2D basics", "Start simple — sprites (2D images), movement, and collisions — before jumping into 3D."],
      ["Game loops & physics", "The engine's heartbeat that keeps everything updating, plus the rules that make things fall, bounce, and collide realistically."],
      ["Player input & controls", "Making the game respond to keyboard, mouse, or controller in a way that feels responsive and fun."],
      ["Game design basics", "The craft of making a game actually fun — pacing, difficulty, and rewarding the player at the right moments."],
      ["Art & sound basics", "Using or creating simple graphics and sound effects that make a game feel alive, even without a big art team."],
      ["3D fundamentals", "Moving from flat 2D worlds to full 3D scenes, cameras, and models."],
      ["Publish your game", "Getting your finished game onto platforms like Steam, itch.io, or mobile app stores so people can actually play it."],
    ],
  },
  {
    id: "uiux-to-developer",
    name: "UI/UX Designer-to-Developer",
    tag: "From pretty mockup to real app",
    color: "#D6336C",
    blurb:
      "You already think about how things should look and feel — this path helps you learn to build those designs yourself, in code.",
    steps: [
      ["Design fundamentals recap", "Layout, color, spacing, and typography — the design principles you'll now translate directly into code."],
      ["HTML — a page's skeleton", "The structure and content of a web page, like the frame of a house before any styling is added."],
      ["CSS — bringing designs to life", "The language that turns plain HTML into something that actually matches your design file — colors, spacing, layout."],
      ["Responsive design in code", "Making sure a design you drew for desktop actually looks good and works on a phone screen too."],
      ["JavaScript basics", "The language that adds interactivity — dropdowns, animations, and buttons that actually do something."],
      ["Git & GitHub", "A save-history for your code so you never lose work, and the tool developers use to collaborate. Getting it early lets you work the way real dev teams do."],
      ["Design systems & components", "Building reusable pieces (like buttons and cards) once, so your whole app stays visually consistent."],
      ["From Figma to code", "Translating a design file into real, working code, and knowing which details actually matter to preserve."],
      ["A frontend framework: React", "A widely-used toolkit for building interactive interfaces out of reusable components."],
      ["Accessibility basics", "Making sure your beautifully designed app also works for people using screen readers or keyboard-only navigation."],
    ],
  },
];

export function getPath(id: string): Path | undefined {
  return paths.find((p) => p.id === id);
}
