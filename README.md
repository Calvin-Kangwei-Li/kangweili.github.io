# kangweili.github.io

Personal academic website for Kangwei Li.

## Site Structure

```
.
├── index.html        ← Homepage (bio, contact, news)
├── research.html     ← Research papers page
├── style.css         ← Shared styles for homepage & research
├── cv.pdf            ← Your CV (add this file yourself)
├── photo.jpg         ← Your photo (add this file yourself)
└── blog/             ← Daily academic blog
    ├── index.html
    ├── css/style.css
    ├── js/posts.js   ← Edit this to add new blog posts
    ├── js/app.js
    └── posts/        ← Markdown blog post files
```

## Deployment

1. Create a repo named exactly `kangweili.github.io` on GitHub
2. Upload all files (preserving folder structure)
3. Settings → Pages → Deploy from branch (main)
4. Live at: https://kangweili.github.io/

## Customizing the Homepage

Open `index.html` and fill in the `[bracketed]` placeholders:
- Your department and university
- Your email address
- Office location
- Bio paragraphs
- Research interests
- News items

## Adding Your Photo

Replace the placeholder with a real photo:
1. Add your photo file as `photo.jpg` in the root folder
2. In `index.html`, replace the `<div class="photo-placeholder">KL</div>` with:
   ```html
   <img src="photo.jpg" alt="Kangwei Li"/>
   ```
   (keep it inside `<div class="photo-wrap">`)

## Adding Blog Posts

1. Create `blog/posts/YYYY-MM-DD-title.md`
2. Add an entry to `blog/js/posts.js`
3. Commit and push
