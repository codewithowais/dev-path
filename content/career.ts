// content/career.ts
// The career ladder + the two senior branches + the "confusing titles" guide.
// Content lives here so more rungs, branches, and role-trees slot in later.

export type Rung = {
  /** Stable id, used for the "you are here" selection. */
  id: string;
  /** Job title at this rung. */
  role: string;
  /** Rough time-in-career range (honest, not a promise). */
  years: string;
  /** Plain-English "what you actually do here". */
  desc: string;
  /** Accent color token (hex) for the rung. */
  color: string;
};

export type Branch = {
  /** Track name. */
  title: string;
  /** One-line "what this track is about". */
  sub: string;
  /** Accent color (hex). */
  color: string;
  /** Ordered [title, plain-English description] roles, climbing up. */
  roles: [title: string, description: string][];
};

/** The shared ladder everyone climbs first, bottom → top. */
export const ladder: Rung[] = [
  {
    id: "student",
    role: "Student / Self-learner",
    years: "Learning stage",
    desc: "You're learning the basics — a coding language, how the web works, and small projects. You don't have a job title yet, and that's fine. This stage has no fixed length, so go at your own pace.",
    color: "#727793",
  },
  {
    id: "intern",
    role: "Intern / Trainee",
    years: "About 0–1 year",
    desc: "This is your first time on a real team. You do small tasks with guidance, and you learn how people build software together. Not everyone does an internship — many people go straight to a junior job.",
    color: "#5B4BEB",
  },
  {
    id: "junior",
    role: "Junior / Associate Engineer",
    years: "About 0–2 years",
    desc: "This is your first real job. You build features with guidance and ask lots of questions — that's exactly what you should do. Some companies skip the word 'junior' and just call you 'Engineer'.",
    color: "#5B4BEB",
  },
  {
    id: "mid",
    role: "Mid-level Engineer",
    years: "About 2–5 years",
    desc: "You can now take on a task and finish it on your own. You need less help, and you start guiding newer teammates. Many companies drop the label and just call this 'Engineer'.",
    color: "#5B4BEB",
  },
  {
    id: "senior",
    role: "Senior Engineer",
    years: "5+ years (it varies a lot)",
    desc: "You handle big, unclear problems and make smart trade-offs. You help lift the whole team's work. The years above are a rough guide, not a promise — some people get here sooner, many take longer, and that's normal. From here, the path often splits in two, but you can still switch between them later.",
    color: "#191C33",
  },
];

/** After Senior, the path branches. This is the "tree" part. */
export const branches: Branch[] = [
  {
    title: "IC track — keep building",
    sub: "IC means Individual Contributor. You grow by getting better at the craft itself, not by managing people. You can stay a senior engineer for your whole career — that's a good, well-paid choice. You don't have to climb any further.",
    color: "#12B886",
    roles: [
      ["Staff Engineer", "You solve problems that touch many teams, and you set the technical direction for big pieces of work. Not every company has this level, and reaching it is far from automatic."],
      ["Principal Engineer", "You shape the technical strategy for a whole area of the company. You also mentor other senior engineers."],
      ["Distinguished Engineer", "You're a rare, top-tier expert whose decisions shape the whole company's technology. Very few people reach this level — treat it as a bonus, not a goal you must hit."],
    ],
  },
  {
    title: "Manager track — lead people",
    sub: "You grow by helping a team do their best work, instead of writing most of the code yourself. This is a career change, not just a promotion. If it's not for you, moving back to the IC track is common and fine.",
    color: "#FF8A3D",
    roles: [
      ["Engineering Manager", "You lead a small team: their growth, their projects, and clearing roadblocks for them. You'll code much less — some people love that, and some miss it."],
      ["Director of Engineering", "You lead several teams, through the managers who report to you, and you own bigger goals across all of them."],
      ["VP Engineering / CTO", "You set the direction for all of engineering and help steer the whole company. These top seats are few and rare by nature — that's not a sign you fell short."],
    ],
  },
];

export type RoleTree = {
  /** Stable kebab-case id. */
  id: string;
  /** Role/specialty name, e.g. "Frontend Developer". */
  name: string;
  /** One plain-English line: what this role is about. */
  sub: string;
  /** Distinct accent color (hex) for this tree. */
  color: string;
  /** Ordered [title, plain-English description] levels, entry → senior/lead/architect. */
  levels: [title: string, description: string][];
};

/** Role-specific growth trees — many more designations than the shared ladder. */
export const roleTrees: RoleTree[] = [
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    sub: "You build the part of an app that people see and click — the pages, buttons, and layout.",
    color: "#5B4BEB",
    levels: [
      ["Junior Frontend Developer", "You turn designs into working pages using HTML, CSS, and JavaScript, with help always nearby."],
      ["Frontend Developer", "You build full features and components on your own. You also make sure they work well on every screen size."],
      ["Senior Frontend Developer", "You own tricky problems, like speed, accessibility, and keeping track of data as users interact with the page. You also review other people's work."],
      ["Frontend Tech Lead", "You decide how the frontend code is structured, and set the patterns the rest of the team follows."],
      ["Principal Frontend Engineer / UI Architect", "You decide how the frontend is built across the whole company, and mentor senior engineers on other teams."],
    ],
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    sub: "You build the engine behind the scenes: databases, logins, and the rules the app runs on.",
    color: "#12B886",
    levels: [
      ["Junior Backend Developer", "You write and fix small pieces of server code, like API endpoints and simple database queries, with guidance."],
      ["Backend Developer", "You design and build the APIs and database structures for whole features, on your own."],
      ["Senior Backend Developer", "You handle the speed, security, and reliability of the systems that power the app."],
      ["Backend Tech Lead", "You guide how different services talk to each other, and set standards for the backend code."],
      ["Principal Backend Engineer / Systems Architect", "You design the large-scale structure that the entire backend runs on."],
    ],
  },
  {
    id: "fullstack-developer",
    name: "Full-stack Developer",
    sub: "You're comfortable working on both the frontend and the backend of an app.",
    color: "#FF8A3D",
    levels: [
      ["Junior Full-stack Developer", "You build small features end-to-end — a bit of screen, a bit of server code — with support."],
      ["Full-stack Developer", "You ship complete features on your own, from the database all the way to the screen."],
      ["Senior Full-stack Developer", "You make the big calls on how a feature is built, across the whole stack."],
      ["Full-stack Tech Lead", "You coordinate frontend and backend decisions so the whole product fits together."],
      ["Staff / Principal Full-stack Engineer", "You shape technical direction across many products, and mentor other full-stack engineers."],
    ],
  },
  {
    id: "mobile-developer",
    name: "Mobile Developer",
    sub: "You build apps that run on phones and tablets — iOS, Android, or both.",
    color: "#E64980",
    levels: [
      ["Junior Mobile Developer", "You build simple screens and features in an existing app, and learn the quirks of the mobile platform."],
      ["Mobile Developer (iOS / Android)", "You build and ship full app features, including working through the app store release process."],
      ["Senior Mobile Developer", "You own app speed, offline behavior, and tricky platform-specific bugs."],
      ["Mobile Tech Lead", "You decide the app's structure, and how code is shared across iOS, Android, or cross-platform tools."],
      ["Principal Mobile Engineer", "You set mobile strategy for the whole company, including new platforms and tools."],
    ],
  },
  {
    id: "devops-sre",
    name: "DevOps / SRE",
    sub: "You keep apps running smoothly, deploy code safely, and fix things when they break.",
    color: "#1971C2",
    levels: [
      ["Junior DevOps Engineer", "You help set up basic deployment scripts and watch dashboards, under supervision."],
      ["DevOps Engineer", "You build and maintain the pipelines that test and deploy code automatically."],
      ["Site Reliability Engineer (SRE)", "You focus on keeping systems up — building tools that spot failures and recover from them fast."],
      ["Senior DevOps / SRE", "You design the infrastructure strategy and lead the response when something major breaks."],
      ["Principal SRE / Infrastructure Architect", "You set reliability and infrastructure standards for the whole engineering team."],
    ],
  },
  {
    id: "data-analyst-scientist",
    name: "Data (Analyst → Scientist → ML Engineer)",
    sub: "You turn raw numbers into insights, predictions, and working ML (machine learning) systems. These are related but separate jobs — the arrows show one common route, not a ladder everyone must climb. Many people happily stay an analyst for their whole career.",
    color: "#F08C00",
    levels: [
      ["Data Analyst", "You explore data, build charts and reports, and answer 'what happened' questions for the business."],
      ["Senior Data Analyst", "You own key metrics and dashboards, and advise teams on what the data means."],
      ["Data Scientist", "You build statistical models and run experiments to answer 'why' and 'what happens next'."],
      ["Senior Data Scientist", "You lead bigger modeling projects, and decide which questions are worth solving with data."],
      ["Machine Learning Engineer", "You take models out of notebooks and turn them into real, running systems."],
      ["Staff Data Scientist / ML Lead", "You set the data and modeling strategy across multiple teams."],
    ],
  },
  {
    id: "ai-ml-engineer",
    name: "AI / ML Engineer",
    sub: "You build and ship systems powered by machine learning and AI models.",
    color: "#7048E8",
    levels: [
      ["Junior ML Engineer", "You train and test small models on existing data, guided by a senior teammate."],
      ["ML Engineer", "You build full ML pipelines — from preparing data to a trained model other systems can use."],
      ["Senior ML Engineer", "You make models faster and cheaper to run, and own how they're deployed and watched in production."],
      ["Applied AI / ML Lead", "You decide which AI approach — including using existing large models — fits each product problem."],
      ["Principal ML Engineer / AI Architect", "You set the AI strategy and infrastructure standards for the whole company."],
    ],
  },
  {
    id: "qa-sdet",
    name: "QA / Test Automation (SDET)",
    sub: "You make sure software actually works before real users ever see it.",
    color: "#0CA678",
    levels: [
      ["Junior QA Tester", "You follow test steps by hand and report bugs clearly, while learning the product inside out."],
      ["QA Engineer", "You write test plans and find edge cases across a whole feature, not just the obvious path."],
      ["SDET (Software Development Engineer in Test)", "You write code that runs tests automatically, so checks happen on every change."],
      ["Senior SDET / QA Lead", "You build the test-automation tools and strategy the whole team relies on."],
      ["Principal QA / Test Architect", "You set quality standards and testing strategy for every team in the company."],
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    sub: "You protect apps, data, and users from attackers.",
    color: "#E03131",
    levels: [
      ["Security Analyst", "You watch for suspicious activity and help investigate security alerts, with a mentor's help."],
      ["Security Engineer", "You find and fix weak spots in apps and infrastructure before attackers can use them."],
      ["Penetration Tester / Ethical Hacker", "You deliberately try to break into systems — with permission — to find those weak spots first."],
      ["Senior Security Engineer", "You lead security reviews for major projects and respond to serious incidents."],
      ["Security Architect / CISO", "You set the security strategy, policies, and standards for the whole organization. CISO stands for Chief Information Security Officer."],
    ],
  },
  {
    id: "cloud-engineer",
    name: "Cloud Engineer",
    sub: "You build and manage the cloud infrastructure that apps run on, like AWS, Azure, or GCP.",
    color: "#15AABF",
    levels: [
      ["Junior Cloud Engineer", "You set up basic cloud resources, like servers and storage, following existing templates."],
      ["Cloud Engineer", "You design cloud environments for new projects, and keep costs and security in check."],
      ["Senior Cloud Engineer", "You build automated, repeatable infrastructure — known as infrastructure-as-code — at scale."],
      ["Cloud Architect", "You design the overall cloud strategy: which services to use, and how systems fit together."],
      ["Principal Cloud Architect", "You set cloud standards and vendor strategy for the whole company."],
    ],
  },
  {
    id: "game-developer",
    name: "Game Developer",
    sub: "You build the code, physics, and systems that make games playable and fun.",
    color: "#D6336C",
    levels: [
      ["Junior Game Programmer", "You add small gameplay features, like movement or menus, inside an existing game engine."],
      ["Game Developer", "You build full gameplay systems — combat, levels, physics — working closely with designers."],
      ["Senior Game Developer", "You own the speed and structure of a major system, like rendering or networking."],
      ["Lead Game Programmer", "You guide the technical direction of the whole game, and mentor the programming team."],
      ["Technical Director", "You own every technical decision across the studio's games and tools."],
    ],
  },
  {
    id: "data-engineer",
    name: "Data Engineer",
    sub: "You build the pipes that move and clean data, so analysts and scientists have something reliable to work with. This is different from a Data Analyst, who studies the data — you build the plumbing.",
    color: "#4263EB",
    levels: [
      ["Junior Data Engineer", "You write small scripts to move data from one place to another, and fix broken pipelines, with guidance."],
      ["Data Engineer", "You build and maintain full data pipelines that collect, clean, and store data on a schedule."],
      ["Senior Data Engineer", "You design reliable, large-scale data systems, and make sure the data stays accurate and on time."],
      ["Data Engineering Lead", "You set the standards and tools the whole data team uses, and guide how data flows across the company."],
      ["Principal Data Engineer / Data Architect", "You design the big-picture data platform the entire organization depends on."],
    ],
  },
  {
    id: "mlops-engineer",
    name: "MLOps Engineer",
    sub: "This is the DevOps of machine learning: you keep AI models running, updated, and healthy in production. You sit between ML Engineers and infrastructure teams.",
    color: "#9C36B5",
    levels: [
      ["Junior MLOps Engineer", "You help set up the tools that deploy and monitor models, learning from senior teammates."],
      ["MLOps Engineer", "You build the pipelines that retrain, deploy, and track machine-learning models automatically."],
      ["Senior MLOps Engineer", "You own the reliability, cost, and monitoring of models running in production at scale."],
      ["MLOps / ML Platform Lead", "You design the platform other teams use to ship their models safely and repeatably."],
      ["Principal MLOps / ML Platform Architect", "You set the strategy and standards for how the whole company runs AI in production."],
    ],
  },
  {
    id: "engineering-manager",
    name: "Engineering Manager (people track)",
    sub: "You grow by helping a team do their best work, rather than writing most of the code yourself. This is a career change, not just a promotion — moving back to hands-on engineering later is common and fine.",
    color: "#F76707",
    levels: [
      ["Team Lead / Tech Lead Manager", "This is a first step into leadership. You still code some, but you also start looking after a couple of teammates."],
      ["Engineering Manager", "You lead one team: their growth, their projects, hiring, and clearing roadblocks. You code much less."],
      ["Senior Engineering Manager", "You lead a larger or more critical team, and often help other managers grow."],
      ["Director of Engineering", "You lead several teams through the managers who report to you, and own bigger cross-team goals."],
      ["VP of Engineering", "You set direction for a large part of engineering, and turn company goals into team plans."],
      ["CTO", "CTO stands for Chief Technology Officer. You own the company's overall technology direction. This role is rare by nature — there's usually only one."],
    ],
  },
  {
    id: "developer-advocate",
    name: "Developer Advocate / DevRel",
    sub: "You're part engineer, part teacher, part communicator. You help other developers succeed with a product through demos, docs, talks, and honest feedback to the product team.",
    color: "#66A80F",
    levels: [
      ["Junior Developer Advocate", "You write tutorials, answer community questions, and build small demo apps, with support."],
      ["Developer Advocate / Developer Relations Engineer", "You create content, speak at events, and carry developer feedback back to the product team."],
      ["Senior Developer Advocate", "You own the developer experience for a product area, and shape how the community grows."],
      ["Lead / Principal Developer Advocate", "You set the DevRel (developer relations) strategy, and mentor other advocates."],
      ["Head of Developer Relations", "You lead the whole DevRel team and its goals across the company."],
    ],
  },
  {
    id: "technical-writer",
    name: "Technical Writer",
    sub: "You turn complicated technical things into clear docs, guides, and tutorials people can actually follow. This is a real, in-demand path, and a common way for strong writers to enter tech.",
    color: "#0B7285",
    levels: [
      ["Junior / Associate Technical Writer", "You write and update smaller docs and help articles, while learning the product and its audience."],
      ["Technical Writer", "You own the documentation for whole features: how-to guides, references, and tutorials."],
      ["Senior Technical Writer", "You shape how a product is explained end-to-end, and improve the docs experience overall."],
      ["Lead / Staff Technical Writer", "You set documentation standards and tools, and guide other writers."],
      ["Documentation Manager / Content Architect", "You own the strategy for all of a company's technical content."],
    ],
  },
];

export type TitleQA = {
  /** The confusing pair or term. */
  term: string;
  /** The plain, honest answer. */
  answer: string;
};

/** "Confusing titles, in plain words." Short and honest. */
export const titleGuide: TitleQA[] = [
  {
    term: "Developer vs Engineer",
    answer:
      "These are mostly the same job with a fancier-sounding word. 'Engineer' sometimes hints at more focus on design and scale, but many companies use the two words to mean the same thing. Don't overthink it.",
  },
  {
    term: "Junior vs Senior",
    answer:
      "This is about how much guidance you need, not just years on the job. Junior means you're still learning the ropes and asking questions. Senior means you handle unclear problems alone, and help others do the same.",
  },
  {
    term: "Frontend vs Backend",
    answer:
      "Frontend is the part people see and click: buttons, pages, layout. Backend is the engine they don't see: saving data, logins, and the heavy lifting. Full-stack means you do a bit of both.",
  },
  {
    term: "SDE / SWE",
    answer:
      "These are just abbreviations. SDE stands for Software Development Engineer, and SWE stands for Software Engineer. Different companies pick different letters for the same 'person who builds software' role.",
  },
  {
    term: "Programmer / Coder",
    answer:
      "These are older, more casual words for someone who writes code. They mean the same thing as developer or engineer — you'll just see them less on modern job titles.",
  },
  {
    term: "Architect vs Engineer",
    answer:
      "An architect designs the big-picture structure — how systems fit together — more than writing day-to-day code. An engineer builds and maintains things. Architect is usually a senior specialty, not a separate career.",
  },
  {
    term: "Tech Lead vs Engineering Manager",
    answer:
      "A Tech Lead still codes and makes technical decisions for a team. An Engineering Manager focuses on people: growth, hiring, and one-on-one check-ins. A manager usually codes much less, or not at all.",
  },
  {
    term: "Staff vs Senior",
    answer:
      "Staff is a step above Senior on the IC (individual contributor) track. A Senior engineer handles hard problems alone. A Staff engineer influences multiple teams and projects at once, without becoming a manager.",
  },
  {
    term: "IC vs Manager",
    answer:
      "IC stands for Individual Contributor: you grow by getting better at the craft itself. Manager means you grow by helping other people do their best work. Both are valid, well-paid paths. Neither is a demotion or a promotion over the other.",
  },
  {
    term: "DevOps vs SRE",
    answer:
      "DevOps is a broad culture and role focused on automating how code gets built, tested, and deployed. SRE (Site Reliability Engineer) is a related but more specific job focused on keeping systems up, and recovering fast when they go down. Many companies use the two titles almost interchangeably.",
  },
  {
    term: "Data Analyst vs Data Scientist vs ML Engineer",
    answer:
      "A Data Analyst explains what already happened, using charts and reports. A Data Scientist builds statistical models to predict what might happen next. An ML Engineer takes those models and turns them into real software that runs in production.",
  },
  {
    term: "QA vs SDET",
    answer:
      "QA stands for Quality Assurance — testing software, often by hand, to find bugs before users do. SDET stands for Software Development Engineer in Test — a QA role that also writes code, building automated tests instead of only running them by hand.",
  },
  {
    term: "Cloud Engineer",
    answer:
      "This is someone who sets up and manages the servers, storage, and networking an app runs on — but inside a provider's data center (like AWS, Azure, or GCP), instead of physical hardware you own yourself. Think of it as the plumbing an app needs to exist.",
  },
  {
    term: "Contractor vs Full-time",
    answer:
      "A contractor is hired for a project or a fixed period, usually without standard benefits, and can work with several clients at once. Full-time means you're a permanent employee of one company, usually with benefits like health insurance and paid leave.",
  },
  {
    term: "Lead vs Principal",
    answer:
      "Lead usually means you guide a specific team or project day-to-day. Principal is a more senior, individual-contributor title, with influence across many teams. It's about depth of impact, not managing people.",
  },
  {
    term: "Product Engineer / Full-cycle",
    answer:
      "This is a newer title for someone who owns a feature end-to-end: talking to users, writing the code, and shipping it, instead of only handling one narrow layer. It overlaps a lot with 'full-stack,' just with more focus on product thinking.",
  },
  {
    term: "Do I need a CS degree?",
    answer:
      "No. Plenty of working engineers are self-taught or came from bootcamps, and many good teams hire on skills, not diplomas. That said, be honest: a degree can make a first job easier to land in some countries and companies, and a few — like big-name firms, or certain visas — still ask for one. Either way, what gets you hired is real projects you can show, and problems you can solve.",
  },
  {
    term: "What does 'years of experience' really mean?",
    answer:
      "It's a rough shorthand for 'how much have you actually done,' not a stopwatch. Someone who built and shipped real things for two focused years can be ahead of someone who coasted for five. Job ads that say '3+ years' are usually describing a level of skill, not a strict rule. If you can do the work, it's often worth applying anyway.",
  },
  {
    term: "Why do the same jobs have different titles?",
    answer:
      "Because there's no industry-wide rulebook. Every company invents its own titles and levels, so 'Software Engineer II' at one place might equal 'Senior' at another. Titles also vary by country. Focus on what the job actually involves — the day-to-day work and the skills — more than the label on it.",
  },
  {
    term: "Startup vs big company",
    answer:
      "At a startup, you usually wear many hats, ship fast, and work with less structure. That's great for learning broadly, but it often means more chaos and risk. At a big company, you go deeper on one area, with more support, mentorship, and process. That's steadier, but slower-moving. Neither is 'better' — they suit different people at different times, and it's normal to switch between them.",
  },
  {
    term: "Do titles and pay work the same in every country?",
    answer:
      "No. Titles, typical timelines, salaries, and even which roles exist all vary a lot by country and city. The levels and 'years' shown here are a general guide from the global tech industry. Treat them as a rough map, and check what's normal where you actually plan to work.",
  },
];
