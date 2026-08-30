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
    desc: "You're picking up the basics — a language, how the web works, small projects. No job title yet, and that's completely fine.",
    color: "#727793",
  },
  {
    id: "intern",
    role: "Intern / Trainee",
    years: "0–1 yr",
    desc: "Your first taste of a real team. You do small, guided tasks and learn how software is built with other people.",
    color: "#5B4BEB",
  },
  {
    id: "junior",
    role: "Junior / Associate Engineer",
    years: "0–2 yrs",
    desc: "Your first real job. You build features with guidance and ask lots of questions — exactly what you should be doing.",
    color: "#5B4BEB",
  },
  {
    id: "mid",
    role: "Mid-level Engineer",
    years: "2–5 yrs",
    desc: "You can take a task and finish it on your own. You need less hand-holding and start helping newer teammates.",
    color: "#5B4BEB",
  },
  {
    id: "senior",
    role: "Senior Engineer",
    years: "5+ yrs",
    desc: "You handle big, fuzzy problems, make smart trade-offs, and lift the whole team. From here, the path splits in two.",
    color: "#191C33",
  },
];

/** After Senior, the path branches. This is the "tree" part. */
export const branches: Branch[] = [
  {
    title: "IC track — keep building",
    sub: "IC = Individual Contributor: you grow by getting deeper at the craft, not by managing people.",
    color: "#12B886",
    roles: [
      ["Staff Engineer", "You solve problems that span many teams and set the technical direction for big pieces of work."],
      ["Principal Engineer", "You shape the technical strategy of a whole area of the company and mentor other senior engineers."],
      ["Distinguished Engineer", "A rare, top-tier expert whose decisions influence the entire company's technology."],
    ],
  },
  {
    title: "Manager track — lead people",
    sub: "You grow by helping a team of people do their best work, instead of writing most of the code yourself.",
    color: "#FF8A3D",
    roles: [
      ["Engineering Manager", "You lead a small team — their growth, their projects, and clearing roadblocks for them."],
      ["Director of Engineering", "You lead several teams (managers report to you) and own bigger goals across them."],
      ["VP Engineering / CTO", "You set the direction for all of engineering and help steer the whole company."],
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
    sub: "Builds the part of an app people see and click — pages, buttons, layout.",
    color: "#5B4BEB",
    levels: [
      ["Junior Frontend Developer", "Turns designs into working pages using HTML, CSS, and JavaScript, with help nearby."],
      ["Frontend Developer", "Builds full features and components on your own, and makes sure they work well on every screen size."],
      ["Senior Frontend Developer", "Owns tricky UI problems — performance, accessibility, state management — and reviews others' work."],
      ["Frontend Tech Lead", "Sets the frontend architecture and coding patterns the rest of the team follows."],
      ["Principal Frontend Engineer / UI Architect", "Decides how the frontend is built company-wide and mentors senior engineers across teams."],
    ],
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    sub: "Builds the engine behind the scenes — databases, logins, and business logic.",
    color: "#12B886",
    levels: [
      ["Junior Backend Developer", "Writes and fixes small pieces of server code — API endpoints, simple database queries — with guidance."],
      ["Backend Developer", "Designs and builds APIs and database schemas for whole features on your own."],
      ["Senior Backend Developer", "Handles performance, security, and reliability of the systems that power the app."],
      ["Backend Tech Lead", "Guides how services talk to each other and sets standards for the backend codebase."],
      ["Principal Backend Engineer / Systems Architect", "Designs the large-scale architecture that the entire backend runs on."],
    ],
  },
  {
    id: "fullstack-developer",
    name: "Full-stack Developer",
    sub: "Comfortable working on both the frontend and the backend of an app.",
    color: "#FF8A3D",
    levels: [
      ["Junior Full-stack Developer", "Builds small features end-to-end — a bit of UI, a bit of server code — with support."],
      ["Full-stack Developer", "Ships complete features on your own, from the database to the screen."],
      ["Senior Full-stack Developer", "Makes the big calls on how a feature is built across the whole stack."],
      ["Full-stack Tech Lead", "Coordinates frontend and backend decisions so the whole product fits together."],
      ["Staff / Principal Full-stack Engineer", "Shapes technical direction across many products and mentors other full-stack engineers."],
    ],
  },
  {
    id: "mobile-developer",
    name: "Mobile Developer",
    sub: "Builds apps that run on phones and tablets (iOS, Android, or both).",
    color: "#E64980",
    levels: [
      ["Junior Mobile Developer", "Builds simple screens and features in an existing app, learning the mobile platform's quirks."],
      ["Mobile Developer (iOS / Android)", "Builds and ships full app features, including working with the app store release process."],
      ["Senior Mobile Developer", "Owns app performance, offline behavior, and tricky platform-specific bugs."],
      ["Mobile Tech Lead", "Decides the app's architecture and how iOS/Android/cross-platform code is shared."],
      ["Principal Mobile Engineer", "Sets mobile strategy across the company, including new platforms and frameworks."],
    ],
  },
  {
    id: "devops-sre",
    name: "DevOps / SRE",
    sub: "Keeps apps running smoothly, deploys code safely, and fixes things when they break.",
    color: "#1971C2",
    levels: [
      ["Junior DevOps Engineer", "Helps set up basic deployment scripts and monitors dashboards under supervision."],
      ["DevOps Engineer", "Builds and maintains the pipelines that test and deploy code automatically."],
      ["Site Reliability Engineer (SRE)", "Focuses on uptime — building systems that detect and recover from failures fast."],
      ["Senior DevOps / SRE", "Designs the infrastructure strategy and leads the response to major incidents."],
      ["Principal SRE / Infrastructure Architect", "Sets reliability and infrastructure standards for the whole engineering org."],
    ],
  },
  {
    id: "data-analyst-scientist",
    name: "Data (Analyst → Scientist → ML Engineer)",
    sub: "Turns raw numbers into insights, predictions, and eventually production ML systems.",
    color: "#F08C00",
    levels: [
      ["Data Analyst", "Explores data, builds charts and reports, and answers 'what happened' questions for the business."],
      ["Senior Data Analyst", "Owns key metrics and dashboards, and advises teams on what the data means."],
      ["Data Scientist", "Builds statistical models and experiments to answer 'why' and 'what will happen next'."],
      ["Senior Data Scientist", "Leads bigger modeling projects and decides which questions are worth solving with data."],
      ["Machine Learning Engineer", "Takes models out of notebooks and turns them into real, running production systems."],
      ["Staff Data Scientist / ML Lead", "Sets the data and modeling strategy across multiple teams."],
    ],
  },
  {
    id: "ai-ml-engineer",
    name: "AI / ML Engineer",
    sub: "Builds and ships systems powered by machine learning and AI models.",
    color: "#7048E8",
    levels: [
      ["Junior ML Engineer", "Trains and tests small models on existing datasets, guided by a senior teammate."],
      ["ML Engineer", "Builds full ML pipelines — from data prep to a trained model that other systems can call."],
      ["Senior ML Engineer", "Optimizes models for speed and cost, and owns how ML is deployed and monitored in production."],
      ["Applied AI / ML Lead", "Decides which AI approaches (including using existing large models) fit each product problem."],
      ["Principal ML Engineer / AI Architect", "Sets the AI strategy and infrastructure standards across the whole company."],
    ],
  },
  {
    id: "qa-sdet",
    name: "QA / Test Automation (SDET)",
    sub: "Makes sure software actually works before real users ever see it.",
    color: "#0CA678",
    levels: [
      ["Junior QA Tester", "Follows test scripts by hand and reports bugs clearly, learning the product inside out."],
      ["QA Engineer", "Writes test plans and finds edge cases across a whole feature, not just the happy path."],
      ["SDET (Software Development Engineer in Test)", "Writes code that automates tests, so checks run automatically on every change."],
      ["Senior SDET / QA Lead", "Builds the test automation framework and strategy the whole team relies on."],
      ["Principal QA / Test Architect", "Sets quality standards and testing strategy across every team in the company."],
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    sub: "Protects apps, data, and users from attackers.",
    color: "#E03131",
    levels: [
      ["Security Analyst", "Watches for suspicious activity and helps investigate security alerts, with a mentor's help."],
      ["Security Engineer", "Finds and fixes vulnerabilities in apps and infrastructure before attackers can use them."],
      ["Penetration Tester / Ethical Hacker", "Deliberately tries to break into systems, on purpose and with permission, to find weak spots."],
      ["Senior Security Engineer", "Leads security reviews for major projects and responds to serious incidents."],
      ["Security Architect / CISO", "Sets the security strategy, policies, and standards for the entire organization."],
    ],
  },
  {
    id: "cloud-engineer",
    name: "Cloud Engineer",
    sub: "Builds and manages the cloud infrastructure that apps run on (AWS, Azure, GCP).",
    color: "#15AABF",
    levels: [
      ["Junior Cloud Engineer", "Sets up basic cloud resources (servers, storage) following existing templates."],
      ["Cloud Engineer", "Designs cloud environments for new projects and keeps costs and security in check."],
      ["Senior Cloud Engineer", "Builds automated, repeatable infrastructure (infrastructure-as-code) at scale."],
      ["Cloud Architect", "Designs the overall cloud strategy — which services to use and how systems fit together."],
      ["Principal Cloud Architect", "Sets cloud standards and vendor strategy for the whole company."],
    ],
  },
  {
    id: "game-developer",
    name: "Game Developer",
    sub: "Builds the code, physics, and systems that make games playable and fun.",
    color: "#D6336C",
    levels: [
      ["Junior Game Programmer", "Implements small gameplay features (movement, UI) inside an existing game engine."],
      ["Game Developer", "Builds full gameplay systems — combat, levels, physics — and works closely with designers."],
      ["Senior Game Developer", "Owns performance and architecture for a major system, like rendering or networking."],
      ["Lead Game Programmer", "Guides the technical direction of the whole game and mentors the programming team."],
      ["Technical Director", "Owns every technical decision across the studio's games and tools."],
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
      "Mostly the same job with a fancier-sounding word. 'Engineer' sometimes hints at more focus on design and scale, but tons of companies use the two words interchangeably. Don't overthink it.",
  },
  {
    term: "Junior vs Senior",
    answer:
      "It's about how much guidance you need, not just years. Junior = still learning the ropes and asking questions. Senior = handles fuzzy problems alone and helps others do the same.",
  },
  {
    term: "Frontend vs Backend",
    answer:
      "Frontend is the part people see and click (buttons, pages, layout). Backend is the engine they don't see (saving data, logins, the heavy lifting). Full-stack means you do a bit of both.",
  },
  {
    term: "SDE / SWE",
    answer:
      "Just abbreviations. SDE = Software Development Engineer, SWE = Software Engineer. Different companies pick different letters for the same 'person who builds software' role.",
  },
  {
    term: "Programmer / Coder",
    answer:
      "Older, more casual words for someone who writes code. They mean the same thing as developer or engineer — you'll just see them less on modern job titles.",
  },
  {
    term: "Architect vs Engineer",
    answer:
      "An architect designs the big-picture structure — how systems fit together — more than writing day-to-day code. An engineer builds and maintains things. Architect is usually a senior specialization, not a separate career.",
  },
  {
    term: "Tech Lead vs Engineering Manager",
    answer:
      "A Tech Lead still codes and makes technical decisions for a team. An Engineering Manager focuses on people — growth, hiring, 1:1s — and usually codes much less or not at all.",
  },
  {
    term: "Staff vs Senior",
    answer:
      "Staff is a step above Senior on the IC track. Senior handles hard problems alone; Staff influences multiple teams and projects at once, without becoming a manager.",
  },
  {
    term: "IC vs Manager",
    answer:
      "IC (Individual Contributor) means you grow by getting better at the craft itself. Manager means you grow by helping other people do their best work. Both are valid, well-paid paths — neither is a demotion or a promotion over the other.",
  },
  {
    term: "DevOps vs SRE",
    answer:
      "DevOps is a broad culture/role about automating how code gets built, tested, and deployed. SRE (Site Reliability Engineer) is a related but more specific job focused on keeping systems up and recovering fast when they go down. Many companies use the titles almost interchangeably.",
  },
  {
    term: "Data Analyst vs Data Scientist vs ML Engineer",
    answer:
      "Data Analyst explains what already happened using charts and reports. Data Scientist builds statistical models to predict what might happen next. ML Engineer takes those models and turns them into real software that runs in production.",
  },
  {
    term: "QA vs SDET",
    answer:
      "QA (Quality Assurance) tests software, often by hand, to find bugs before users do. SDET (Software Development Engineer in Test) is a QA role that also writes code — building automated tests instead of only running them manually.",
  },
  {
    term: "Cloud Engineer",
    answer:
      "Someone who sets up and manages the servers, storage, and networking an app runs on — but in a provider's data center (AWS, Azure, GCP) instead of physical hardware you own. Think 'the plumbing an app needs to exist.'",
  },
  {
    term: "Contractor vs Full-time",
    answer:
      "A contractor is hired for a project or a fixed period, usually without standard benefits, and can work with multiple clients. Full-time means you're a permanent employee of one company, typically with benefits like health insurance and paid leave.",
  },
  {
    term: "Lead vs Principal",
    answer:
      "Lead usually means you guide a specific team or project day-to-day. Principal is a more senior, individual-contributor title with influence across many teams — it's about depth of impact, not managing people.",
  },
  {
    term: "Product Engineer / Full-cycle",
    answer:
      "A newer title for someone who owns a feature end-to-end — talking to users, writing the code, and shipping it — instead of only handling one narrow layer. It overlaps a lot with 'full-stack,' just with more focus on product thinking.",
  },
];
