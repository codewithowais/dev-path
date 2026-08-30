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
];
