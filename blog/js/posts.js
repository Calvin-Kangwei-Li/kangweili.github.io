// ─────────────────────────────────────────────────────────────
//  POSTS REGISTRY
//  Add a new entry here every time you write a new post.
//  Fields:
//    file     – path to the .md file (relative to site root)
//    title    – post title
//    date     – ISO date string "YYYY-MM-DD"
//    tags     – array of tag strings (lowercase)
//    excerpt  – one-sentence teaser shown on the list page
// ─────────────────────────────────────────────────────────────
const POSTS = [
  {
    file:    "posts/2025-04-26-getting-started.md",
    title:   "Getting Started with This Journal",
    date:    "2026-04-26",
    tags:    ["misc"],
    excerpt: "Why I'm keeping a daily academic journal and how this site works."
  },
  {
    file:    "posts/4-26-26subgradient.md",
    title:   "Reading Notes: Subgradient method",
    date:    "2026-04-26",
    tags:    ["reading", "Convex Optimization"],
    excerpt: "Boyd's notes for EE364b in subgradient method"
  },
  {
    file:    "posts/4-26-26-research-update.md",
    title:   "Weekly Research Update",
    date:    "2026-04-26",
    tags:    ["research"],
    excerpt: "Progress on the literature review in minimax RL problem"
  }
];
