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
];

export function getPath(id: string): Path | undefined {
  return paths.find((p) => p.id === id);
}
