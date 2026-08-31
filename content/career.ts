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
  /** Common equivalent titles / levels at this rung. */
  aka?: string[];
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
    aka: ["SDE I", "Engineer I", "L3", "SWE I", "New Grad"],
  },
  {
    id: "mid",
    role: "Mid-level Engineer",
    years: "About 2–5 years",
    desc: "You can now take on a task and finish it on your own. You need less help, and you start guiding newer teammates. Many companies drop the label and just call this 'Engineer'.",
    color: "#5B4BEB",
    aka: ["SDE II", "Engineer II", "L4", "Software Engineer"],
  },
  {
    id: "senior",
    role: "Senior Engineer",
    years: "5+ years (it varies a lot)",
    desc: "You handle big, unclear problems and make smart trade-offs. You help lift the whole team's work. The years above are a rough guide, not a promise — some people get here sooner, many take longer, and that's normal. From here, the path often splits in two, but you can still switch between them later.",
    color: "#191C33",
    aka: ["SDE III", "Senior SWE", "L5", "Engineer III"],
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
  /** Learning-path id this role maps to (from content/paths.ts), or omit if none fits. */
  pathId?: string;
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
    pathId: "frontend",
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
    pathId: "backend",
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
    pathId: "fullstack",
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
    pathId: "mobile-developer",
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
    pathId: "devops",
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
    pathId: "data-analyst",
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
    pathId: "ai-engineer",
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
    pathId: "qa-test-automation",
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
    pathId: "cybersecurity",
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
    pathId: "cloud-engineer",
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
    pathId: "game-developer",
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
    pathId: "data-engineer",
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
    pathId: "ai-engineer",
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
    pathId: "developer-advocate",
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
    pathId: "technical-writer",
  },
  {
    id: "founding-engineer",
    name: "Founding Engineer",
    sub: "You're one of the first engineers at a startup. You build the first version of the product across the whole stack, with little structure to lean on. It's more a stage than a rung: you usually get more equity (a share of the company) in exchange for more risk and less certainty.",
    color: "#BE4BDB",
    levels: [
      ["First engineering hire", "You join a tiny team, often right after the founders. You set up the codebase from scratch and make fast calls with very little in place yet."],
      ["Founding Engineer", "You build the first real product end-to-end — frontend, backend, and infrastructure — and do a bit of everything, including talking to early users."],
      ["Eng Lead / Head of Engineering", "As the team grows, you start setting the technical direction and hiring the next engineers. You still code, but you also shape how the team works."],
      ["VP Engineering / CTO (at a growing startup)", "If the company succeeds and scales, early engineers often step into senior leadership. Others prefer to stay hands-on, or move on to the next early-stage company — all normal."],
    ],
    pathId: "fullstack",
  },
  {
    id: "platform-engineer",
    name: "Platform Engineer",
    sub: "You build the internal tools and 'paved paths' that other engineers use to ship their work — things like deployment systems, shared libraries, and developer tooling. Your customers are your own company's engineers. It overlaps with DevOps, but leans more toward building products for developers than running servers.",
    color: "#3B5BDB",
    levels: [
      ["Junior Platform Engineer", "You help build and maintain internal tools and scripts that other engineers rely on, with guidance."],
      ["Platform Engineer", "You build self-service tools and templates so other teams can deploy and run their code without reinventing the basics."],
      ["Senior Platform Engineer", "You design the internal platform other teams build on, weighing what to standardize and what to leave flexible."],
      ["Platform Tech Lead", "You set the direction for the developer platform and the standards teams follow to use it."],
      ["Principal Platform Engineer", "You shape the internal-tooling strategy for the whole company, so every team ships faster and more safely."],
    ],
    pathId: "devops",
  },
  {
    id: "solutions-engineer",
    name: "Solutions / Sales Engineer",
    sub: "You're a technical engineer who works directly with customers: you run demos, build integrations, and help deploy the product into a client's own systems. A Forward-Deployed Engineer is a close cousin who embeds with a customer to build custom solutions on top of the product. You need both coding skills and people skills.",
    color: "#087F5B",
    levels: [
      ["Associate Solutions Engineer", "You learn the product deeply and support demos and customer questions, with a senior teammate leading."],
      ["Solutions / Sales Engineer", "You run technical demos, answer hard questions, and build proof-of-concept integrations to help close deals."],
      ["Forward-Deployed Engineer", "You embed with a customer to build and deploy custom solutions using the product, inside their real environment."],
      ["Senior Solutions Engineer", "You own the technical relationship for big customers, and shape how the product fits their needs."],
      ["Solutions Architect / Solutions Engineering Lead", "You design end-to-end solutions for major accounts, and guide the rest of the solutions team."],
    ],
    pathId: "fullstack",
  },
  {
    id: "ux-engineer",
    name: "UX Engineer / Design Engineer",
    sub: "You sit between design and frontend. You build polished, pixel-accurate interfaces, design systems (shared, reusable UI pieces), and interactive prototypes. You care about how something looks and feels as much as how the code works.",
    color: "#C2255C",
    levels: [
      ["Junior UX Engineer", "You turn designs into clean, accurate UI, and help maintain the shared component library, with support."],
      ["UX Engineer / Design Engineer", "You build refined interfaces and interactive prototypes, working closely with designers to get the details right."],
      ["Senior UX Engineer", "You own the design system and the tricky, high-polish interactions the whole product depends on."],
      ["UX Engineering Lead", "You set how design and frontend work together, and guide the standards for a consistent, quality interface."],
      ["Principal Design Engineer", "You shape the design-engineering practice across the company, bridging design and engineering at scale."],
    ],
    pathId: "uiux-to-developer",
  },
  {
    id: "embedded-firmware",
    name: "Embedded / Firmware Engineer",
    sub: "You write low-level code that runs directly on physical devices — think smart watches, cars, medical devices, and appliances. You work close to the hardware, where memory and power are tight, so careful, efficient code really matters.",
    color: "#364FC7",
    levels: [
      ["Junior Embedded Engineer", "You write and test small pieces of device code, and learn how the hardware and software fit together, with guidance."],
      ["Embedded / Firmware Engineer", "You build the software that controls a device's features, working within tight memory and power limits."],
      ["Senior Embedded Engineer", "You own tricky, low-level problems — timing, power use, and reliability — on the devices that ship to customers."],
      ["Embedded Tech Lead", "You decide how the firmware is structured, and how it talks to both the hardware and the outside world."],
      ["Principal Embedded / Firmware Architect", "You set the technical direction for firmware across a whole product line."],
    ],
    pathId: "embedded-iot",
  },
  {
    id: "database-administrator",
    name: "Database Administrator (DBA) / Database Engineer",
    sub: "You keep databases fast, safe, backed up, and reliable — the systems that store a company's most important data. When queries are slow or data is at risk, you're the person who fixes it. A Database Engineer leans more toward building and automating; a DBA leans more toward running and protecting.",
    color: "#2F9E44",
    levels: [
      ["Junior DBA", "You run backups, watch database health, and help with routine maintenance, following set procedures."],
      ["Database Administrator / Database Engineer", "You keep databases fast and reliable: you tune slow queries, plan backups, and manage access safely."],
      ["Senior DBA / Database Engineer", "You design how data is stored and scaled, and lead recovery when something goes wrong with the data."],
      ["Database Lead", "You set the standards and tools for how the whole company runs and protects its databases."],
      ["Principal Database Engineer / Data Architect", "You shape the big-picture database strategy the entire organization depends on."],
    ],
    pathId: "backend",
  },
  {
    id: "product-manager",
    name: "Product Manager",
    sub: "You decide what the team builds and why — the user problem to solve, not the code. You lead through influence, since the engineers and designers don't report to you.",
    color: "#A61E4D",
    levels: [
      ["Associate Product Manager (APM)", "This is the entry rung, often a structured program for new PMs. You own a small feature or slice of a product, learn the craft, and lean on senior PMs for the bigger calls."],
      ["Product Manager", "You own a product area on your own: you talk to users, decide what to build, write the requirements, and work with design and engineering to ship it."],
      ["Senior Product Manager", "You own a bigger or more important area, and you handle the fuzzy, high-stakes problems. You also start guiding newer PMs, and connect your work to the company's wider goals."],
      ["Group / Principal Product Manager", "The path splits here. A Group PM leads a few PMs and coordinates a whole product line. A Principal PM stays hands-on (an individual contributor) but tackles the hardest, most strategic product problems — both are senior, without necessarily managing people yet."],
      ["Director of Product", "You lead several PMs through the managers under you, own the strategy for a large part of the product, and make sure the teams' work adds up to something coherent."],
      ["VP of Product / CPO", "You set product direction for the whole company and turn business goals into a product plan. CPO stands for Chief Product Officer. These top seats are few by nature — usually just one."],
    ],
    pathId: "product-manager",
  },
  {
    id: "product-qa",
    name: "Product QA (manual / exploratory)",
    sub: "You test the product by hand to catch problems before users do. This ladder is the hands-on, exploratory side of quality. Many QA folks also grow toward automation (the SDET path), where you write code that tests the app — the two often blend as you climb.",
    color: "#5C940D",
    levels: [
      ["QA Tester", "You run tests by hand, follow written test steps, and report bugs clearly, while learning the product inside out."],
      ["QA Analyst / QA Engineer", "You design your own test cases and checklists, and dig into a whole feature to find edge cases — not just the obvious path. (The two titles overlap; 'Engineer' sometimes hints at more technical or automation work.)"],
      ["Senior QA Engineer", "You own the test strategy for big features, decide what's most important to check before a release, and mentor newer testers. Many people start picking up test automation around here."],
      ["QA Lead", "You guide the testing approach for a whole product or team, and coordinate the QA work across a release. You still test hands-on, but you also set how the team does it."],
      ["QA Manager / Head of Quality", "You own quality across many teams: the people, the process, and the standards. You focus less on testing yourself and more on making sure the whole organization ships reliable software."],
    ],
    pathId: "product-qa",
  },
  {
    id: "scrum-master",
    name: "Scrum Master / Agile Coach",
    sub: "You help a team work well together using Agile ways of working, often with little or no coding. This track is about influence and coaching, not managing people directly — nobody on the team reports to you. It overlaps a lot with delivery and project roles, and how far it goes depends heavily on the company.",
    color: "#099268",
    levels: [
      ["Scrum Master", "You help one team run its Agile ways of working: you facilitate the meetings, remove blockers, and protect the team's focus. You don't assign work or manage people — you help the team work better together. Many people come into this from testing, business analysis, project coordination, or development."],
      ["Senior Scrum Master", "You do the same for a more complex or higher-stakes team, and you handle the harder people situations — conflict, unclear priorities, a team that's going through the motions. You start coaching newer Scrum Masters and spotting 'fake agile' early, where the rituals happen but nothing actually improves."],
      ["Agile Coach", "You step beyond a single team and coach several teams, and the people who lead them, on how to work well. The focus shifts from running ceremonies to changing habits and mindsets. You influence through questions and trust, not authority, and you help managers and leaders — not just teams — work in a more Agile way."],
      ["Enterprise / Lead Agile Coach", "You work across a whole organisation, helping many teams and senior leaders improve how work flows end-to-end. You deal with the messy, political parts — org structures, budgets, and habits that quietly block agility. This is broad influence work: you rarely have direct authority, so persuasion and credibility are everything."],
      ["Head of Agile Delivery / Agile Practice Lead", "You own how the whole organisation approaches delivery and ways of working. You set the standards, hire and grow coaches, and connect the teams' work to business goals. Titles here vary a lot and blur into delivery and programme leadership — the honest truth is this top rung looks different at almost every company, and not every company has it at all."],
    ],
    pathId: "scrum-master",
  },
  {
    id: "blockchain-developer",
    name: "Blockchain / Web3 Developer",
    sub: "You build apps and smart contracts that run on blockchains, where code often controls real money. Be honest with yourself: it's a smaller, more volatile field than mainstream web work, the hype comes and goes, and a single bug can be very expensive — so security matters more here than almost anywhere else.",
    color: "#E8590C",
    levels: [
      ["Junior Blockchain Developer", "You write and test small pieces of smart-contract code and connect apps to a blockchain, with close guidance."],
      ["Smart Contract Developer", "You build and deploy full smart contracts, and learn the security patterns that stop them from losing funds."],
      ["Senior Blockchain Engineer", "You own the security and correctness of contracts that handle real value, and design how the on-chain and off-chain parts fit together."],
      ["Blockchain Lead / Protocol Engineer", "You set the technical direction for a product, or design the rules of the protocol itself — the shared system many apps build on."],
      ["Blockchain Architect", "You shape the whole system's design: how it scales, stays secure, and connects to other chains and the outside world."],
    ],
    pathId: "blockchain",
  },
  {
    id: "ar-vr",
    name: "AR / VR (XR) Developer",
    sub: "You build immersive 3D experiences for headsets, phones, and glasses. XR is the umbrella term for AR (adding digital things to the real world) and VR (a fully virtual world). Much of the work happens inside game engines like Unity or Unreal.",
    color: "#6741D9",
    levels: [
      ["Junior XR Developer", "You build simple 3D scenes and interactions inside an engine like Unity, and learn how headsets and tracking work, with support."],
      ["XR / Unity Developer", "You build full immersive features — 3D interactions, hand tracking, and comfortable movement — on your own."],
      ["Senior XR Developer", "You own the hard problems unique to XR: smooth frame rates, motion comfort, and making 3D interactions feel natural."],
      ["XR Tech Lead", "You decide how an immersive app is structured, and set the patterns the team follows across devices."],
      ["Principal XR Engineer", "You set the technical direction for immersive work across the company, including new devices and platforms."],
    ],
    pathId: "ar-vr",
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    sub: "You're the bridge between the business side and the tech team: you dig into what people actually need, then turn it into clear requirements engineers can build. It's light on code and heavy on questions, and it overlaps a lot with product roles — at some companies the line between BA and Product Manager is blurry.",
    color: "#1098AD",
    levels: [
      ["Junior Business Analyst", "You gather requirements, write them up clearly, and help document how things work today, with guidance."],
      ["Business Analyst", "You own the requirements for whole projects: you talk to stakeholders, map out processes, and make sure the team builds the right thing."],
      ["Senior Business Analyst", "You handle the fuzzy, high-stakes problems, weigh trade-offs, and connect the details back to what the business is trying to achieve."],
      ["Lead BA / Product Analyst", "You guide other analysts and shape how requirements and analysis are done across a product area."],
      ["BA Manager / Business Architect", "You set the standards for analysis across the company, or design how whole business processes and systems fit together."],
    ],
    pathId: "business-analyst",
  },
];

export type RoleCategory = {
  /** Stable id used for the active-tab state. */
  id: string;
  /** Short, plain-English group name shown on the filter tab. */
  label: string;
  /** Ordered role ids (must match roleTrees[].id) that belong to this group. */
  roleIds: string[];
};

/** Groups the many role trees into a handful of families so the Grow page reads
 *  as a browsable menu (one family at a time) instead of one long scroll. Every
 *  role in `roleTrees` appears in exactly one category — see the runtime check
 *  in components/RoleTree.tsx that surfaces any role missed here. */
export const roleCategories: RoleCategory[] = [
  {
    id: "build",
    label: "Build the product",
    roleIds: [
      "frontend-developer",
      "backend-developer",
      "fullstack-developer",
      "mobile-developer",
      "game-developer",
      "ar-vr",
      "blockchain-developer",
      "ux-engineer",
    ],
  },
  {
    id: "data-ai",
    label: "Data & AI",
    roleIds: [
      "data-analyst-scientist",
      "ai-ml-engineer",
      "data-engineer",
      "mlops-engineer",
    ],
  },
  {
    id: "infrastructure",
    label: "Cloud & infrastructure",
    roleIds: [
      "devops-sre",
      "cloud-engineer",
      "platform-engineer",
      "embedded-firmware",
      "database-administrator",
    ],
  },
  {
    id: "quality-security",
    label: "Quality & security",
    roleIds: ["qa-sdet", "product-qa", "cybersecurity"],
  },
  {
    id: "lead",
    label: "Lead & manage",
    roleIds: [
      "engineering-manager",
      "scrum-master",
      "product-manager",
      "business-analyst",
      "founding-engineer",
    ],
  },
  {
    id: "advise",
    label: "Advise & communicate",
    roleIds: ["developer-advocate", "technical-writer", "solutions-engineer"],
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
  {
    term: "Founding Engineer",
    answer:
      "This is one of the first engineers at a startup, often hired right after the founders. You build the first version of the product across the whole stack, with almost no structure to lean on. The trade-off is real: you usually get more equity (a share of the company) in return for more risk, longer hours, and less certainty. It's less a fixed 'level' and more a stage — as the company grows, founding engineers often become Staff engineers or leaders, or move on to the next early-stage company.",
  },
  {
    term: "Staff, Principal, Distinguished, Fellow",
    answer:
      "These are the senior individual-contributor (IC) levels above Senior — you keep building and influencing, without becoming a people manager. Roughly: Staff influences several teams, Principal shapes a whole area, Distinguished shapes the company's technology, and Fellow is the rarest of all. Each step up is much rarer than the last, and many companies stop at Staff or Principal. Treat the top ones as a bonus, not a target you must hit.",
  },
  {
    term: "Fractional / Interim CTO",
    answer:
      "A fractional CTO is a senior tech leader who works part-time, often across several small companies at once. An interim CTO is a temporary one, filling the seat until a permanent hire is found. Both are common at startups that need experienced leadership but can't yet justify a full-time executive.",
  },
  {
    term: "Platform Engineer vs DevOps vs SRE",
    answer:
      "These overlap a lot and the lines are blurry. DevOps focuses on automating how code is built, tested, and deployed. SRE (Site Reliability Engineer) focuses on keeping systems up and recovering fast when they break. A Platform Engineer builds internal tools and 'paved paths' so other engineers can ship easily — more like building a product for developers. Many companies mix these titles freely.",
  },
  {
    term: "Solutions Architect vs Software Architect",
    answer:
      "A Software Architect designs the internal structure of a system — how the code and services fit together. A Solutions Architect is usually customer-facing: they design how a product or set of technologies solves a specific client's problem, often during a sale or a big rollout. One looks inward at the codebase; the other looks outward at the customer.",
  },
  {
    term: "Sales Engineer / Forward-Deployed Engineer",
    answer:
      "Both are engineers who work directly with customers. A Sales (or Solutions) Engineer supports the sales process with demos, technical answers, and proof-of-concept integrations. A Forward-Deployed Engineer goes further and embeds with a customer to build custom solutions on top of the product, inside their real systems. You need coding skills and people skills for both.",
  },
  {
    term: "Leveling: L3/L4/L5, E3/E4, SDE I/II/III",
    answer:
      "Most companies number their engineering levels, but there's no shared standard, so the numbers mean different things in different places. Loosely: the first working level is entry/junior, the next is mid, and the one after is senior — for example L3/L4/L5 at one company, or SDE I/II/III at another. The exact numbers differ, so ask what a given level actually means rather than assuming it matches another company's.",
  },
  {
    term: "UX Engineer / Design Engineer",
    answer:
      "This is a hybrid that sits between design and frontend. You build polished, pixel-accurate interfaces, design systems (shared, reusable UI pieces), and prototypes. You care about how something looks and feels as much as how the code works — a good fit if you like both design and coding.",
  },
  {
    term: "Application Security (AppSec) Engineer",
    answer:
      "This is a security role focused on the app and its code itself, rather than networks or servers. An AppSec engineer reviews code for weak spots, helps developers write safer code, and sets up tools that catch security bugs before they ship. It's a specialty within the broader security field.",
  },
  {
    term: "Web Developer vs Software Engineer",
    answer:
      "These overlap heavily and are often the same work. 'Web Developer' usually points specifically at building websites and web apps. 'Software Engineer' is a broader term that can include web, but also mobile, desktop, and systems that never touch a browser. The 'engineer' label sometimes carries a hint of more pay or scope, but that's about connotation, not a hard rule.",
  },
  {
    term: "Consultant vs Freelancer vs Contractor",
    answer:
      "All three work outside a normal full-time job, but the flavor differs. A freelancer usually takes on smaller, hands-on project work, often for several clients. A contractor is typically hired to fill a role for a fixed period, working much like an employee but without permanent status. A consultant is usually brought in for their expertise and advice, sometimes charging more for guidance than for building. The words get used loosely and overlap.",
  },
  {
    term: "Open-source maintainer",
    answer:
      "This is someone who runs or heavily contributes to an open-source project — reviewing changes, fixing bugs, and guiding its direction. It can be a paid job, a volunteer role, or a side project, and it counts as real, visible experience. Many people land jobs partly on the strength of open-source work anyone can go and see.",
  },
  {
    term: "Director vs VP vs CTO",
    answer:
      "These are the upper rungs of the management track, and each covers more ground than the last. A Director leads several teams through the managers under them. A VP of Engineering sets direction for a large part of engineering and turns company goals into plans. A CTO (Chief Technology Officer) owns the company's overall technology direction. These seats are few by nature — usually only one CTO.",
  },
  {
    term: "Product Manager vs Product Engineer",
    answer:
      "These sound alike but are different jobs. A Product Manager (PM) owns the 'what' and 'why': they decide what to build and why it matters, usually without writing the code. A Product Engineer builds it, and cares a lot about the product and its users while doing so. They work closely together, but one mainly decides and the other mainly builds.",
  },
  {
    term: "Intern vs New Grad",
    answer:
      "An intern is a student on a short, often paid work placement — usually a summer — to learn and try the job before finishing school. A 'new grad' role is a real, full-time first job aimed at people who just finished a degree or program. Internships are temporary and about learning; new-grad roles are permanent and about starting your career.",
  },
  {
    term: "Product Manager vs Product Owner",
    answer:
      "A Product Manager (PM) owns the 'why' and 'what': the strategy, the user problems, and which direction the product should go. A Product Owner (PO) is often a specific Scrum role focused on the 'how and when' of building it — owning the backlog and making sure the team builds the right things in the right order. At many companies the two heavily overlap, and one person does both; at others they're separate jobs. It varies a lot by company.",
  },
  {
    term: "Product Manager vs Project Manager vs Program Manager",
    answer:
      "The three PMs, and they're genuinely different. A Product Manager decides what to build and why, based on users and business goals. A Project Manager makes sure one specific project ships on time and on budget — they own the plan, not the product direction. A Program Manager coordinates many related projects or teams toward a bigger goal. Roughly: product owns the 'what', project owns the 'when', program owns the 'how it all fits together'.",
  },
  {
    term: "QA vs QC",
    answer:
      "These sound the same but point in opposite directions. QA (Quality Assurance) is about preventing bugs — building quality into how the software is made, through good process and testing early. QC (Quality Control) is about catching them — checking the finished product to find defects before it ships. QA asks 'are we building it right?'; QC asks 'did this come out right?' In everyday tech jobs, 'QA' is often used loosely to cover both.",
  },
  {
    term: "QA Analyst vs QA Engineer vs Tester",
    answer:
      "These titles overlap a lot and companies use them loosely. 'Tester' or 'QA Tester' usually points at hands-on testing: running through the app and reporting bugs. 'QA Analyst' often leans toward planning what to test and analyzing quality, still mostly by hand. 'QA Engineer' sometimes hints at more technical work, including writing automated tests. But the lines are blurry — always read what the job actually involves rather than trusting the label.",
  },
  {
    term: "Agile vs Waterfall",
    answer:
      "These are two ways to run a project. Waterfall plans everything up front, then builds it in order — design, then build, then test — like following a fixed blueprint. Agile builds a little at a time, shows it, gets feedback, and adjusts as it goes. Waterfall suits work where the requirements really won't change; Agile suits the common case where you learn what's actually needed as you go.",
  },
  {
    term: "Scrum vs Kanban",
    answer:
      "Both are Agile ways of working, but they're organised differently. Scrum works in fixed time-boxes called sprints (often two weeks), with set roles and regular meetings. Kanban has no sprints — work flows continuously across a board, and the team limits how many things are in progress at once so nothing piles up. Scrum adds rhythm and structure; Kanban is lighter and focuses on smooth flow. Some teams blend the two.",
  },
  {
    term: "Extreme Programming (XP)",
    answer:
      "XP is an Agile approach that's heavy on engineering practices, not just meetings. Its habits include pair programming (two people working at one screen), test-driven development (writing the test before the code), and continuous integration (merging and testing small changes often, instead of one big merge later). The goal is to keep the code healthy enough to change safely and often. Teams often borrow XP's technical practices even when they use Scrum for the rest.",
  },
  {
    term: "Scrum Master vs Project Manager",
    answer:
      "A Scrum Master is a servant and facilitator: they help the team work well, run the meetings, and clear blockers, but they don't own the plan or tell people what to do. A Project Manager owns the project's scope, budget, and timeline, and is accountable for delivering it on schedule. One helps the team help themselves; the other drives a plan to a deadline. Some companies blur the two into one role.",
  },
  {
    term: "Agile Coach vs Scrum Master",
    answer:
      "A Scrum Master usually helps one team with its day-to-day ways of working. An Agile Coach works broader — across several teams, and often with managers and leaders — to change how a whole part of the organisation thinks and works. It's usually a more senior step: less about running one team's ceremonies, more about shifting habits and mindsets at a larger scale.",
  },
  {
    term: "The Agile ceremonies",
    answer:
      "These are Scrum's four regular meetings, and each has a clear purpose. Sprint planning: agree what the team will build next. Daily standup: a short daily sync to spot blockers early, not a status report to a boss. Sprint review: show the finished work and gather feedback. Retrospective: the team reflects on how to work better next time. Kept short and useful they help; run out of habit with no purpose, they become the meetings people dread.",
  },
  {
    term: "\"Agile\" — the overloaded word",
    answer:
      "'Agile' started as a mindset — build a bit, get feedback, adjust — but it's often reduced to a set of rituals and tools. Be honest about 'fake agile' (also called cargo-cult agile): a team holds all the standups and sprints, yet nothing actually improves, and 'Agile' becomes a way to micromanage or track output. Real agility is about how a team learns and adapts, not how many ceremonies it performs. The word gets used to mean almost anything, so always look at how a team actually works.",
  },
  {
    term: "Data Engineer vs Data Scientist vs Data Analyst",
    answer:
      "These three work with data but do very different jobs. A Data Engineer builds the pipes: the systems that move, clean, and store data so it's reliable. A Data Scientist uses that data to build models that predict what might happen next. A Data Analyst explains what already happened, using charts and reports. Roughly: the engineer plumbs it, the scientist predicts with it, the analyst explains it.",
  },
  {
    term: "Generalist vs Specialist (and \"T-shaped\")",
    answer:
      "A generalist knows a bit of many areas and can move between them; a specialist goes deep in one and becomes the expert. Neither is better — they fit different teams and stages. 'T-shaped' is the middle most people aim for: broad enough to work across areas (the top of the T) with real depth in one (the stem). You don't have to pick forever — many people widen or deepen over time.",
  },
  {
    term: "The \"10x engineer\" myth",
    answer:
      "This is the idea that some engineers are ten times more productive than everyone else. It's mostly a myth, and a harmful one. Real, lasting impact comes from making a whole team better — clear code, good reviews, sharing what you know — not from one hero coding alone at 2am. Chasing the '10x' label tends to reward showing off and burnout over the steady, collaborative work that actually ships good software.",
  },
  {
    term: "On-call — what it means",
    answer:
      "On-call means taking turns being the person who gets paged when production breaks — sometimes at night or on weekends. Teams rotate it so no one carries it alone, and healthy teams keep it rare by fixing root causes and often pay or give time back for it. It's a normal part of many engineering jobs, especially in backend, DevOps, and SRE. It's fair to ask about the on-call load in an interview — how often, how noisy, and how it's compensated.",
  },
  {
    term: "Remote vs hybrid vs on-site",
    answer:
      "Remote means you work from anywhere, with no regular office. On-site means you're expected in the office most days. Hybrid is a mix — a few set days in, the rest at home. Each has real trade-offs: remote offers freedom and no commute but can feel isolating and needs strong writing; on-site makes mentoring and casual learning easier, which can help early in your career. Policies shift often, so check what a company actually does now, not just what a job ad says.",
  },
  {
    term: "Big Tech / FAANG vs everyone else",
    answer:
      "FAANG is an old nickname for a handful of giant US tech firms (Meta, Amazon, Apple, Netflix, Google), now used loosely for 'big-name tech'. These jobs often pay more and look good on a CV, but they're highly competitive, narrow in scope, and not automatically better for you. Plenty of great engineers build strong careers at smaller companies with more ownership and variety. Chase the work and the growth that fit you, not just the logo.",
  },
  {
    term: "Web3 / dApp / smart contract",
    answer:
      "These are the everyday words of the blockchain world. Web3 is a broad label for apps built on blockchains instead of on one company's servers. A smart contract is a small program that runs on a blockchain and enforces rules automatically — often moving real money, which is why bugs are so costly. A dApp ('decentralized app') is an app whose backend logic lives in those smart contracts rather than on a normal server. It's a smaller, more hype-prone field, so learn it with clear eyes.",
  },
  {
    term: "Business Analyst vs Product Manager vs Data Analyst",
    answer:
      "All three inform what gets built, but they own different things. A Business Analyst digs into what stakeholders need and turns it into clear requirements for the team. A Product Manager decides what to build and why, and owns the product's direction and priorities. A Data Analyst answers questions with data — charts and reports about what's actually happening. The BA and PM roles overlap a lot at some companies; the Data Analyst is the more distinct one.",
  },
  {
    term: "Technical Writer vs Content Designer vs Developer Advocate",
    answer:
      "All three 'explain things', but for different readers and goals. A Technical Writer creates the docs, guides, and references people use to actually operate a product. A Content Designer shapes the words inside the product itself — button labels, error messages, and flows — so the interface is clear. A Developer Advocate is part engineer, part communicator: they teach other developers through demos, talks, and tutorials, and carry that community's feedback back to the product team.",
  },
  {
    term: "AR vs VR vs MR vs XR",
    answer:
      "These describe how much digital content mixes with the real world. VR (virtual reality) replaces your view with a fully virtual world, usually through a headset. AR (augmented reality) adds digital things on top of the real world you can still see, like on a phone screen. MR (mixed reality) blends the two so virtual objects react to your real surroundings. XR ('extended reality') is the umbrella term that covers all of them.",
  },
];
