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
    tag: "The basics you need before you specialize",
    color: "#5F3DC4",
    blurb:
      "Not sure which path to pick? Start here. These basics help with every path later, and they help you find out what you enjoy.",
    steps: [
      ["How computers & the internet work", "A simple picture of what code is, what a program does, and what happens when you open a website. You won't write any code yet — this is just the big picture."],
      ["Pick one beginner-friendly language", "Choose one language to start. Python and JavaScript are the easiest for beginners. You won't be stuck with it forever — the skills carry over to other languages later."],
      ["Programming fundamentals", "Learn variables, loops, functions, and conditions (if/else). These few ideas are the building blocks of every program ever written."],
      ["Practice solving small problems", "Work through small exercises. This is where reading about code turns into actually writing it. It's normal to struggle at this stage."],
      ["The command line basics", "You control your computer by typing commands instead of clicking. Even a little knowledge helps — most tech jobs use this skill."],
      ["Git & GitHub", "Git saves the history of your code, so you never lose your work. You can also share your code with others. Learn it early — you'll use it for the rest of your career."],
      ["Build a few small projects", "Build small, fun things — a to-do list, a simple web page, a mini calculator. Finishing small projects teaches you more than watching endless tutorials."],
      ["Try out a few specialties", "Try frontend, backend, and data work, using the other paths on this page. Find out what you enjoy before you commit to one."],
      ["Pick a path and go deeper", "Choose one path above and follow it. You can always change direction later — almost everyone does at some point."],
    ],
  },
  {
    id: "frontend",
    name: "Frontend",
    tag: "The part people see and click",
    color: "#5B4BEB",
    blurb:
      "You build the screens people actually use — buttons, pages, and everything they see and click.",
    steps: [
      ["HTML — the page's skeleton", "HTML holds the words, images, and boxes on a page. Think of it as a house's frame, before the paint goes on."],
      ["CSS — the paint & layout", "CSS controls colors, spacing, and where things sit on the page. It turns a plain page into something nice to look at."],
      ["JavaScript basics", "JavaScript is the language that makes pages react to clicks and typing. It lets things change without reloading the page."],
      ["The browser & how the web works", "Learn what happens when you type a web address and press enter: your browser sends a request, gets a response, and loads the page."],
      ["Git & GitHub", "Git saves the history of your code, so you never lose your work. It also lets you team up with others."],
      ["A framework: React", "React is a popular toolkit. It lets you build screens from reusable pieces called components."],
      ["Fetching data (APIs)", "Learn how your page asks another computer for information, like loading a list of products."],
      ["Accessibility & responsive design", "Make sure your site works for everyone. It should work on phones and with screen readers, not just on your laptop."],
      ["Deploy your site", "Put it on the internet so anyone can visit. Tools like Vercel make this a one-click step."],
    ],
  },
  {
    id: "backend",
    name: "Backend",
    tag: "The engine behind the app",
    color: "#12B886",
    blurb:
      "You build the app's engine. It saves data, checks passwords, and does the hard work users never see.",
    steps: [
      ["Pick a language", "Pick one language to start. JavaScript (using Node) and Python are good first choices."],
      ["Programming fundamentals", "Learn variables, loops, functions, and conditions. Every program is built from these basic building blocks."],
      ["Git & GitHub", "Git saves your code's history, so you never lose work. It also lets teams work together without overwriting each other. Learn it early — you'll use it in every step after this."],
      ["How the internet talks (HTTP)", "HTTP is the set of rules computers use to send messages to each other. Your computer sends a request; the other computer sends back a response."],
      ["Build an API", "An API is a list of things your server can do. Apps and websites use it to ask for data or actions."],
      ["Databases", "A database stores information long-term. Learn to save, find, update, and delete data in one."],
      ["Authentication", "Authentication means knowing who a user is and keeping their account safe. This covers logins, sessions, and passwords done the right way."],
      ["Testing your code", "Small checks that catch bugs before your users do."],
      ["Deploy & keep it running", "Get your server online. Learn to watch it, so you know right away when something breaks."],
    ],
  },
  {
    id: "fullstack",
    name: "Full-stack",
    tag: "Both sides of the screen",
    color: "#FF8A3D",
    blurb:
      "You do a bit of everything: the screens people see, and the engine behind them. This path suits people who like variety.",
    steps: [
      ["Frontend basics", "Learn HTML, CSS, and JavaScript. That's enough to build a page people can actually use."],
      ["Git & GitHub", "Git saves your code's history, so you never lose work and can work with others. Learn it early — you'll use it through every step below."],
      ["A frontend framework", "Learn React, or a similar tool, to build screens from reusable pieces."],
      ["Backend fundamentals", "Learn a server language, how HTTP works, and how to build a simple API."],
      ["Databases", "Learn to store and retrieve data. A database is your app's memory."],
      ["Connect the two ends", "Connect your frontend to your backend, so the screen shows real, saved data."],
      ["Authentication end-to-end", "Log a user in on the frontend and verify them on the backend."],
      ["A full framework: Next.js", "One tool that handles both frontend and backend in a single project."],
      ["Deploy the whole app", "Ship your complete app to the internet in one go."],
    ],
  },
  {
    id: "ai-engineer",
    name: "AI Engineer",
    tag: "Teaching machines to learn",
    color: "#0CA5E9",
    blurb:
      "You build apps powered by AI. This ranges from smart chat features to models that spot patterns in data.",
    steps: [
      ["Python", "Python is the main language used in AI. It's easy to read and has many helpful tools."],
      ["Math you actually need", "Learn the basic statistics and algebra behind AI. You don't need a PhD to start."],
      ["Working with data", "Learn to load, clean, and explore data using tools like pandas."],
      ["Machine learning basics", "Learn how a computer 'learns' patterns from examples, instead of being told every rule directly."],
      ["Using AI models & APIs", "Learn to plug powerful, ready-made models — like large language models — into your own apps."],
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
      "You build the pipelines and tools that move code from a developer's laptop to real users. This happens safely and automatically.",
    steps: [
      ["Linux & the command line", "Linux is the operating system behind most servers. Instead of clicking icons, you control it by typing text commands."],
      ["Networking basics", "Learn how computers find and talk to each other. This includes IP addresses and DNS, the internet's phonebook that turns names into addresses."],
      ["Git & GitHub", "A save-history for code so teams can work together without overwriting each other's changes."],
      ["Scripting (Bash or Python)", "Small programs that automate repetitive tasks instead of doing them by hand every time."],
      ["Containers with Docker", "Docker packs an app and everything it needs into one box. That box runs the same way on any computer."],
      ["CI/CD pipelines", "CI/CD stands for Continuous Integration and Continuous Deployment. It automatically tests and ships code every time someone makes a change."],
      ["Cloud platforms", "Instead of owning physical servers, you rent computers and services from providers like AWS, Azure, or GCP."],
      ["Infrastructure as Code", "Describe your servers and setup in text files, using a tool like Terraform. Then you can recreate them instantly, instead of clicking through menus."],
      ["Monitoring & alerts", "Watching your systems so you find out about problems before your users do."],
      ["Orchestration with Kubernetes", "Kubernetes is a tool that manages many containers across many machines. It restarts and scales them automatically."],
    ],
  },
  {
    id: "mobile-developer",
    name: "Mobile Developer",
    tag: "Apps that live in your pocket",
    color: "#7048E8",
    blurb:
      "You build the apps people install on their phones. This covers everything from the home-screen icon to how it feels to tap around inside.",
    steps: [
      ["Pick your path", "You can go native — Swift for iPhone, Kotlin for Android — or cross-platform, using one codebase for both, like React Native or Flutter. Most beginners start cross-platform."],
      ["Programming fundamentals", "Learn variables, loops, and functions. Every app is built from these basics, no matter the language."],
      ["Git & GitHub", "Git saves the history of your code, so you never lose work and can work with others. Learn it early — you'll rely on it through every step below."],
      ["UI building blocks", "Learn about the screens, buttons, and lists your app is made of. Learn how to arrange them on phone screens of different sizes."],
      ["Navigation between screens", "How a user moves from one screen to another, like tapping a post to open its details."],
      ["Storing data on the device", "Saving small bits of info, like login state or preferences, directly on the user's phone."],
      ["Talking to a server (APIs)", "How your app fetches or sends data over the internet, like loading a news feed."],
      ["Device features", "Using the camera, location, notifications, and other things that are unique to phones."],
      ["Testing on real devices", "Making sure your app actually works well on different phones, screen sizes, and operating system versions."],
      ["Publish to app stores", "The process of submitting your app to the Apple App Store or Google Play, so anyone can download it."],
    ],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    tag: "Turns numbers into answers",
    color: "#0CA678",
    blurb:
      "You dig through data to answer real business questions, like \"why did sales drop last month?\" Then you explain what you found, clearly, to others.",
    steps: [
      ["Spreadsheets (Excel/Sheets)", "Spreadsheets are the simplest tool for looking at data, sorting it, and doing quick calculations. Start here before anything more advanced."],
      ["SQL — talking to databases", "A language for asking a database questions, like 'show me all orders from last week.'"],
      ["Statistics basics", "Averages, percentages, and how to tell if a pattern in data is real or just chance."],
      ["Data cleaning", "Real-world data is messy. You need to fix typos, missing values, and duplicates before you can trust any analysis."],
      ["Python or R for analysis", "A programming language that lets you analyze bigger datasets faster than a spreadsheet can."],
      ["Data visualization", "Turning numbers into charts and graphs so people can understand your findings at a glance."],
      ["Dashboards (Tableau/Power BI)", "Tools that turn your analysis into a live, clickable report other people can check anytime."],
      ["Storytelling with data", "Explain what the numbers mean in plain language. Don't just show charts and hope people understand."],
      ["Git & version control basics", "Keeping track of changes to your analysis files, especially useful once you work with others."],
      ["Working with real business questions", "Practice on real problems, like deciding which product to promote. Use all the tools above from start to finish."],
    ],
  },
  {
    id: "data-scientist-ml",
    name: "Data Scientist / ML",
    tag: "Finds patterns machines can use",
    color: "#F03E3E",
    blurb:
      "You go further than describing data. You build models that predict things, like which customers might cancel their subscription.",
    steps: [
      ["Python", "Python is the main language for data science. It's easy to read, beginner-friendly, and packed with tools built for this work."],
      ["Math foundations", "Learn the basics of statistics, probability, and a bit of algebra. This is the logic behind how models learn."],
      ["Working with data (pandas)", "Loading, cleaning, and reshaping datasets so they're ready to analyze or feed into a model."],
      ["Data visualization", "Charting your data to spot patterns and check your assumptions before building anything complex."],
      ["Machine learning fundamentals", "Learn how a computer 'learns' patterns from past examples. It uses those patterns to predict new data, instead of following fixed rules."],
      ["Key algorithms", "Learn a handful of common techniques, like decision trees and regression. They solve most real-world problems."],
      ["Feature engineering", "Choose and shape the right inputs, so your model has the best clues to learn from. You usually do this as you build the model."],
      ["Model evaluation", "Checking whether your model is actually good, and not just memorizing the examples you gave it."],
      ["Deep learning basics", "Get an introduction to neural networks. This technique powers image recognition and modern AI chatbots."],
      ["Deploying a model", "Turning your model from a notebook experiment into something a real app can actually use."],
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    tag: "Keeps the bad guys out",
    color: "#1098AD",
    blurb:
      "You learn how systems get attacked, so you can defend them. You protect data, accounts, and apps from people trying to break in.",
    steps: [
      ["How computers & networks work", "Learn the basics of operating systems and networks. You can't protect a system you don't understand."],
      ["Linux fundamentals", "Most servers and security tools run on Linux, so getting comfortable with it early pays off."],
      ["Networking & protocols", "Learn how data travels between computers. Learn the common rules, like HTTP and DNS, that attackers try to exploit."],
      ["Security fundamentals", "Learn core ideas like encryption — scrambling data so only the right people can read it — and authentication, proving who you are."],
      ["Common vulnerabilities", "Learn the classic mistakes that let attackers in, like weak passwords or unchecked user input, known as SQL injection."],
      ["Hands-on labs (CTFs)", "CTFs, or Capture The Flag challenges, are safe, legal puzzles. You practice 'hacking' into systems built to be broken into."],
      ["Tools of the trade", "Learn tools like Wireshark, which watches network traffic, and Nmap, which scans for open doors into a system."],
      ["Web app security", "Specifically protecting websites and apps, since that's where most everyday attacks happen."],
      ["Security certifications path", "Recognized credentials, like CompTIA Security+, that prove your skills to employers."],
      ["Incident response basics", "Learn what to do when a breach happens: contain the damage, then figure out what went wrong."],
    ],
  },
  {
    id: "cloud-engineer",
    name: "Cloud Engineer",
    tag: "Builds on rented supercomputers",
    color: "#E64980",
    blurb:
      "You design and manage the online systems that apps run on. You use services from providers like AWS, instead of physical servers.",
    steps: [
      ["Networking basics", "Learn how computers find and talk to each other. This is essential before you rent any cloud service."],
      ["Linux fundamentals", "Most cloud servers run Linux, so being comfortable with it is a must."],
      ["Pick a cloud provider", "AWS, Azure, and Google Cloud are the three biggest providers of rented computing power. Start with one and learn its basics."],
      ["Core cloud services", "Virtual servers, storage, and databases — the building blocks every cloud app is made from."],
      ["Networking in the cloud", "Set up private, secure spaces, called VPCs, where your resources live and talk to each other."],
      ["Identity & access management", "Control exactly who, and what, can access your cloud resources. This avoids costly mistakes or breaches."],
      ["Infrastructure as Code", "Write your setup as text files, using a tool like Terraform. This makes it repeatable, instead of manual clicking."],
      ["Containers & Docker", "Packaging apps so they run the same way anywhere, which is how most modern cloud apps are shipped."],
      ["Monitoring & cost management", "Watch that your systems stay healthy, and that your cloud bill doesn't quietly grow out of control."],
      ["Cloud certification path", "Provider certifications (like AWS Solutions Architect) that prove your skills and help you get hired."],
    ],
  },
  {
    id: "qa-test-automation",
    name: "QA / Test Automation",
    tag: "Catches bugs before users do",
    color: "#F59F00",
    blurb:
      "You make sure software actually works. You test it by hand, and you write code that tests it automatically, every time.",
    steps: [
      ["How software gets built", "Get a basic understanding of how software is built. This helps you see where, and why, bugs creep in."],
      ["Manual testing fundamentals", "Use an app the way a real user would. Try to break it on purpose, and write down what goes wrong."],
      ["Writing good bug reports", "Clearly describing what went wrong so a developer can actually reproduce and fix it."],
      ["Test case design", "Planning ahead of time exactly what to check, so you don't miss important scenarios."],
      ["Basic programming (JavaScript or Python)", "Learn enough coding to read and write simple scripts. This is the foundation for automating tests."],
      ["Automated testing basics", "Write code that clicks around your app and checks it for you. You won't need to test everything by hand every time."],
      ["Testing tools (Selenium/Playwright/Cypress)", "Popular frameworks that let your code control a real browser to test websites automatically."],
      ["API testing", "Check that the hidden connections between an app and its server work correctly, not just what's on screen."],
      ["CI/CD integration", "Connect your automated tests to the pipeline that ships code. Then tests run automatically on every change."],
      ["Performance & load testing", "Checking that an app stays fast and stable even when lots of people use it at once."],
    ],
  },
  {
    id: "game-developer",
    name: "Game Developer",
    tag: "Builds worlds people play in",
    color: "#364FC7",
    blurb:
      "You create interactive games. You write the code and rules, and shape the feel, that turn an idea into something fun to play.",
    steps: [
      ["Programming fundamentals", "Learn variables, loops, and functions. Every game, no matter how advanced, is built from these basics."],
      ["Pick a game engine", "Unity and Godot are software that handle the hard parts, like graphics and physics. This lets you focus on making the game."],
      ["Git & version control", "Git saves your project's history, so you never lose work. This matters even more in games, since they pile up lots of code and art files. Set it up early."],
      ["2D basics", "Start simple, with sprites (2D images), movement, and collisions, before you jump into 3D."],
      ["Game loops & physics", "The game loop is the engine's heartbeat — it keeps everything updating. Physics is the set of rules that make things fall, bounce, and collide realistically."],
      ["Player input & controls", "Make the game respond to keyboard, mouse, or controller input in a way that feels quick and fun."],
      ["Game design basics", "Learn the craft of making a game fun: good pacing, fair difficulty, and rewarding the player at the right moments."],
      ["Art & sound basics", "Using or creating simple graphics and sound effects that make a game feel alive, even without a big art team."],
      ["3D fundamentals", "Moving from flat 2D worlds to full 3D scenes, cameras, and models."],
      ["Publish your game", "Get your finished game onto platforms like Steam, itch.io, or mobile app stores, so people can actually play it."],
    ],
  },
  {
    id: "uiux-to-developer",
    name: "UI/UX Designer-to-Developer",
    tag: "From pretty mockup to real app",
    color: "#D6336C",
    blurb:
      "You already think about how things should look and feel. This path teaches you to build those designs yourself, in code.",
    steps: [
      ["Design fundamentals recap", "Review layout, color, spacing, and typography. These are the design principles you'll now translate directly into code."],
      ["HTML — a page's skeleton", "The structure and content of a web page, like the frame of a house before any styling is added."],
      ["CSS — bringing designs to life", "CSS is the language that turns plain HTML into something that matches your design file: colors, spacing, and layout."],
      ["Responsive design in code", "Making sure a design you drew for desktop actually looks good and works on a phone screen too."],
      ["JavaScript basics", "JavaScript is the language that adds interactivity: dropdowns, animations, and buttons that actually do something."],
      ["Git & GitHub", "Git saves your code's history, so you never lose work. It's also the tool developers use to work together. Learning it early lets you work the way real dev teams do."],
      ["Design systems & components", "Build reusable pieces, like buttons and cards, once. This keeps your whole app looking consistent."],
      ["From Figma to code", "Translate a design file into real, working code. Learn which details actually matter to keep."],
      ["A frontend framework: React", "A widely-used toolkit for building interactive interfaces out of reusable components."],
      ["Accessibility basics", "Make sure your well-designed app also works for people using screen readers or keyboard-only navigation."],
    ],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    tag: "Decides what to build, and why",
    color: "#A61E4D",
    blurb:
      "You decide what the team should build and why it matters — not the code itself. Your job is to point everyone at the right problem, then help them ship a solution users actually want.",
    steps: [
      ["How software gets built", "Get a plain-English picture of how engineers and designers turn an idea into a working product. You won't write the code, but you need to understand the work well enough to plan it and talk to the people doing it."],
      ["Talk to users, find real problems", "Learn to interview users and watch how they actually behave, not just what they say. The whole job starts here: finding a real problem worth solving, instead of guessing or building your own pet idea."],
      ["Write clear requirements", "Turn a fuzzy problem into something a team can build. Learn to write short user stories — 'as a shopper, I want to save my cart' — so engineers and designers know exactly what's needed and why."],
      ["Prioritize, and say no", "You'll always have more ideas than time. Learn simple ways to rank what matters most, and get comfortable saying 'not now' to good ideas. Deciding what NOT to build is half the job."],
      ["Work with design", "Partner with designers on wireframes and prototypes — rough sketches of a feature before anyone builds it. You don't need to design, but you do need to give useful feedback and keep it tied to the user's problem."],
      ["Basic data & metrics", "Learn to read the numbers that show whether a feature worked: how many people used it, and whether it actually helped. You don't need heavy math — just enough to tell progress from wishful thinking."],
      ["Roadmaps & stakeholders", "A roadmap is a simple plan of what's coming and roughly when. Learn to build one, and to keep leaders, sales, and support in the loop — honestly, without overpromising dates you can't hit."],
      ["Ship, measure, and iterate", "Getting a feature live is the start, not the finish. Learn to release it, watch how it does, and decide what to fix or improve next. Good products are built in small loops, not one big launch."],
      ["Lead without authority", "The hard part: nobody on your team reports to you, yet you have to get everyone rowing the same way. Learn to build trust, communicate clearly, and make decisions the team believes in. These soft skills matter more than any tool."],
    ],
  },
  {
    id: "product-qa",
    name: "Product QA",
    tag: "Finds problems before users do",
    color: "#5C940D",
    blurb:
      "You test the product by hand to catch problems before real users hit them — clicking through it, thinking like a user, and trying to break it. This is hands-on manual and exploratory testing. It's different from the QA / Test Automation path, which is code-heavy and focuses on writing automated tests.",
    steps: [
      ["What QA actually is", "QA stands for Quality Assurance. Your job is to find problems before users do, and to help the team ship something that works. It's not about blaming developers — it's about protecting the user's experience together."],
      ["Learn how software works", "You don't need to code, but you do need to understand how an app is put together: the screens, the server behind them, and how data flows. The better you understand it, the better you can guess where bugs hide."],
      ["Write clear test cases", "A test case is a simple, written check: do this, expect that. Learn to write clear test cases and checklists, so testing is repeatable and nothing important gets skipped when you're tired or rushed."],
      ["Exploratory testing", "Here you go off the script and poke at the app like a curious, slightly mischievous user. Try weird inputs, tap things in the wrong order, and ask 'what if?' This is where you find the surprising bugs a checklist would miss."],
      ["Write great bug reports", "A good bug report gets a bug fixed fast. Learn to write clear steps to reproduce it, what you expected versus what happened, and how serious it is (its severity). A vague report just bounces back to you."],
      ["Regression & release testing", "Regression testing means re-checking things that already worked, to make sure a new change didn't quietly break them. Learn what to test before every release, so a fix in one place doesn't cause a fire somewhere else."],
      ["Test across devices & browsers", "Your app runs on many phones, screen sizes, and browsers — and it can look fine on one and broken on another. Learn to check the important combinations, so users aren't the ones who discover the difference."],
      ["Work with developers", "QA and developers are on the same team. Learn to report problems kindly and clearly, help confirm fixes, and join in early — asking questions before a feature is built catches bugs cheaper than finding them after."],
      ["A first look at automation", "Once you can test well by hand, learn what automated testing is: code that runs the boring, repetitive checks for you. You don't have to become a coder, but this is the natural next step, and it bridges toward the QA / Test Automation path."],
    ],
  },
  {
    id: "scrum-master",
    name: "Scrum Master & Agile",
    tag: "Helps a team work well together",
    color: "#099268",
    blurb:
      "You help a team work well together using Agile ways of working — often with little or no coding. It's a facilitation and coaching role, not a boss role, and it only really works when the team genuinely wants to work this way. Done badly, it's just running meetings; done well, it quietly removes the friction that slows everyone down.",
    steps: [
      ["What 'Agile' really means", "Agile is a mindset, not a tool or a checklist. It comes from the Agile Manifesto, which values people and working software over rigid process and heavy documents. The core idea is simple: build a little, show it, get feedback, and adjust — instead of planning everything up front and hoping you got it right."],
      ["The Scrum framework", "Scrum is the most common way teams try to work in an Agile way. Learn its three roles (a Scrum Master who helps the team, a Product Owner who decides what's most important, and the developers who build it), the sprint (a short, fixed stretch of work, often two weeks), and the backlog (the ordered to-do list of what's next)."],
      ["The ceremonies, and what each is FOR", "Scrum has four regular meetings, and each has a real purpose — not meeting for meeting's sake. Sprint planning: agree what to build next. Daily standup: a quick sync so the team spots blockers early. Sprint review: show the finished work and get feedback. Retrospective: the team talks about how to work better. If a meeting isn't helping, that's a problem to fix, not to sit through."],
      ["Facilitation skills", "Your core skill is running meetings that are useful and short. Learn to keep a discussion on track, make sure quieter people get heard, cut off rambling kindly, and end with clear next steps. A good facilitator makes a meeting feel like time well spent — that's harder than it sounds, and it's most of the job."],
      ["Removing blockers & protecting focus", "A blocker is anything stopping the team from finishing work — a slow approval, a missing answer, a broken tool. Your job is to spot these and clear them, often by chasing people outside the team. You also protect the team's focus by pushing back on constant interruptions and last-minute changes, so they can actually get things done."],
      ["Other flavours: Kanban and XP", "Scrum isn't the only way. Kanban focuses on smooth flow: you visualise the work on a board and limit how many things are in progress at once, instead of working in fixed sprints. XP (Extreme Programming) is an Agile approach heavy on engineering habits — pair programming (two people, one screen), test-driven development (write the test first), and continuous integration (merge and test small changes often). Knowing these helps you pick what fits your team."],
      ["Healthy metrics vs vanity metrics", "Numbers can help a team or fool it. Velocity — how much work a team gets through in a sprint — is a planning tool to help the team forecast, not a scoreboard to compare teams or push people harder. The moment a metric becomes a target to hit, people game it and it stops telling the truth. Learn to watch for whether real, working software is reaching users, not just whether the numbers look busy."],
      ["Coaching a team toward real agility", "This is the heart of the role: helping a team genuinely adopt the mindset, not just perform the rituals. Watch for 'fake agile' (also called cargo-cult agile) — where a team holds all the ceremonies but nothing actually improves, and 'Agile' becomes a way to micromanage. Real agility shows up as a team that ships steadily, learns from feedback, and fixes its own problems. You coach toward that by asking questions, not giving orders."],
      ["Certifications & growing", "Be honest about certifications: a CSM (Certified ScrumMaster) or PSM (Professional Scrum Master) can help you get hired and give you a shared vocabulary, but a two-day course doesn't make you good — real skill comes from working with teams. From here, many people grow toward Agile Coach, working with several teams or a whole organisation. The role rewards patience, listening, and genuinely caring that the team does well."],
    ],
  },
];

export function getPath(id: string): Path | undefined {
  return paths.find((p) => p.id === id);
}

// ─────────────────────────── Group-wise taxonomy ───────────────────────────
// The home page groups the tracks so 17 cards aren't one overwhelming wall.
// `foundations` is pulled out as a "start here" spotlight above the groups.

/** The starting-point track, spotlighted above the groups. */
export const FOUNDATION_ID = "foundations";

export type PathGroup = {
  /** Short label above the group title. */
  eyebrow: string;
  /** Group heading. */
  title: string;
  /** One plain-English line describing the group. */
  description: string;
  /** Path ids in this group, in display order. */
  pathIds: string[];
};

/** The 5 groups (everything except `foundations`), in page order. */
export const pathGroups: PathGroup[] = [
  {
    eyebrow: "Build",
    title: "Build what people use",
    description: "Make the apps, sites, and games people open every day.",
    pathIds: ["frontend", "backend", "fullstack", "mobile-developer", "uiux-to-developer", "game-developer"],
  },
  {
    eyebrow: "Data & AI",
    title: "Work with data & AI",
    description: "Find answers hidden in data, and build things that learn.",
    pathIds: ["data-analyst", "data-scientist-ml", "ai-engineer"],
  },
  {
    eyebrow: "Ship & run",
    title: "Ship it & keep it running",
    description: "Get code online and keep it fast, safe, and always up.",
    pathIds: ["devops", "cloud-engineer"],
  },
  {
    eyebrow: "Quality & security",
    title: "Keep it safe & working",
    description: "Catch bugs before users do, and keep attackers out.",
    pathIds: ["qa-test-automation", "cybersecurity"],
  },
  {
    eyebrow: "Product & people",
    title: "Shape the product & the team",
    description: "Decide what to build, keep it working, and help the team build it well — lighter on code.",
    pathIds: ["product-manager", "product-qa", "scrum-master"],
  },
];

/** A hand-picked set of gentle entry points, flagged as "Good first path". */
export const GOOD_FIRST_PATHS = new Set([
  "frontend",
  "data-analyst",
  "product-qa",
  "uiux-to-developer",
]);

// Build-time guard: every path is spotlighted or in exactly one group. If a new
// path is added but never grouped, the build fails here instead of silently
// dropping the card from the home page.
{
  const grouped = new Set<string>([FOUNDATION_ID, ...pathGroups.flatMap((g) => g.pathIds)]);
  const missing = paths.filter((p) => !grouped.has(p.id)).map((p) => p.id);
  if (missing.length) {
    throw new Error(`content/paths.ts: these paths are not in any group: ${missing.join(", ")}`);
  }
}
