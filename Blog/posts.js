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
    date:    "2025-04-26",
    tags:    ["misc"],
    excerpt: "Why I'm keeping a daily academic journal and how this site works."
  },
  {
    file:    "posts/2025-04-25-reading-notes-kuhn.md",
    title:   "Reading Notes: The Structure of Scientific Revolutions",
    date:    "2025-04-25",
    tags:    ["reading", "philosophy of science"],
    excerpt: "Kuhn's notion of paradigm shifts feels more nuanced on a second reading — especially chapters 6–8."
  },
  {
    file:    "posts/2025-04-24-research-update.md",
    title:   "Weekly Research Update",
    date:    "2025-04-24",
    tags:    ["research"],
    excerpt: "Progress on the literature review; three new papers to integrate; a methodological puzzle."
  }
];
