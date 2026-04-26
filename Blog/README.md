# Academic Journal — GitHub Pages Blog

A minimal, markdown-powered academic blog. No build step. No dependencies to install.

## Quick Start

### 1. Create the GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it **`yourusername.github.io`** (replace `yourusername` with your actual GitHub username)
3. Set it to **Public**
4. Click **Create repository**

### 2. Upload the files

Option A — GitHub web UI:
- Click **"uploading an existing file"** on the repo page
- Drag the entire project folder in
- Commit

Option B — Git CLI:
```bash
cd academic-blog
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. Click **Save**

Your site will be live at `https://yourusername.github.io` within a minute or two.

---

## Writing a New Post

### Step 1 — Create the Markdown file

Add a file to the `posts/` directory named `YYYY-MM-DD-your-title.md`:

```markdown
# Your Post Title

Write your content here using standard Markdown.

## A section heading

Regular paragraph text...

- Bullet list
- Another item

> A blockquote looks like this

`inline code` or code blocks:

```python
def hello():
    print("world")
```
```

### Step 2 — Register it in `js/posts.js`

Open `js/posts.js` and add an entry at the top of the `POSTS` array:

```javascript
{
  file:    "posts/2025-04-27-my-new-post.md",
  title:   "My New Post Title",
  date:    "2025-04-27",
  tags:    ["research"],           // pick from: reading, research, ideas, misc
  excerpt: "One sentence teaser shown on the homepage."
},
```

### Step 3 — Commit and push

```bash
git add posts/2025-04-27-my-new-post.md js/posts.js
git commit -m "add post: My New Post Title"
git push
```

The site updates automatically — no build step required.

---

## Customization

| What | Where |
|------|-------|
| Your name / site title | `index.html` — edit `.site-title` and `.site-desc` text |
| Avatar initials | `index.html` — edit the `.avatar` div |
| GitHub link | `index.html` — edit the `href` in `.gh-link` |
| Colors / fonts | `css/style.css` — edit the `:root` CSS variables |
| Add a tag filter | `index.html` add a `<a data-filter="newtag">` in `.nav` |

---

## Project Structure

```
.
├── index.html          # Main page (list + post viewer)
├── css/
│   └── style.css       # All styles
├── js/
│   ├── posts.js        # Posts registry — edit this for every new post
│   └── app.js          # App logic (rendering, routing, search)
└── posts/
    ├── 2025-04-26-getting-started.md
    ├── 2025-04-25-reading-notes-kuhn.md
    └── 2025-04-24-research-update.md
```
