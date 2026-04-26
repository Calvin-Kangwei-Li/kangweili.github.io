/* ─── App ─────────────────────────────────────────────── */

(function () {
  "use strict";

  // Configure marked
  marked.setOptions({ gfm: true, breaks: false });

  /* DOM references */
  const listView    = document.getElementById("list-view");
  const postView    = document.getElementById("post-view");
  const postContent = document.getElementById("post-content");
  const postList    = document.getElementById("post-list");
  const backBtn     = document.getElementById("back-btn");
  const searchBox   = document.getElementById("search");
  const navLinks    = document.querySelectorAll(".nav-link[data-filter]");

  let currentFilter = null;
  let currentSearch = "";

  /* ── Helpers ─────────────────────────────────────────── */
  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return {
      day:   d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
      year:  d.getFullYear(),
      full:  d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    };
  }

  function tagHtml(tags) {
    return tags.map(t => `<span class="tag">${t}</span>`).join("");
  }

  function sortedPosts() {
    return [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function filteredPosts() {
    let list = sortedPosts();
    if (currentFilter) {
      list = list.filter(p => p.tags.includes(currentFilter));
    }
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    return list;
  }

  /* ── Render list ─────────────────────────────────────── */
  function renderList() {
    const posts = filteredPosts();
    if (!posts.length) {
      postList.innerHTML = `<p class="empty">No posts found.</p>`;
      return;
    }

    postList.innerHTML = posts.map(p => {
      const dt = formatDate(p.date);
      return `
        <div class="post-card" data-file="${p.file}">
          <div class="card-date">
            <span class="day">${String(dt.day).padStart(2, "0")}</span>
            ${dt.month}<br>${dt.year}
          </div>
          <div class="card-body">
            <div class="card-title">${p.title}</div>
            <div class="card-excerpt">${p.excerpt}</div>
            <div class="card-tags">${tagHtml(p.tags)}</div>
          </div>
        </div>
      `;
    }).join("");

    postList.querySelectorAll(".post-card").forEach(card => {
      card.addEventListener("click", () => openPost(card.dataset.file));
    });
  }

  /* ── Open post ───────────────────────────────────────── */
  async function openPost(file) {
    // Find meta
    const meta = POSTS.find(p => p.file === file);

    postContent.innerHTML = `<div class="loading">Loading…</div>`;
    showView("post");

    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(res.status);
      let md = await res.text();

      // Strip YAML front-matter if present
      md = md.replace(/^---[\s\S]*?---\n?/, "");

      const dt = meta ? formatDate(meta.date) : null;
      const metaHtml = meta ? `
        <div class="post-meta-header">
          <div class="post-meta-date">${dt.full}</div>
          <h1 class="post-meta-title">${meta.title}</h1>
          <div class="post-meta-tags">${tagHtml(meta.tags)}</div>
        </div>
      ` : "";

      postContent.innerHTML = metaHtml + marked.parse(md);
      window.scrollTo(0, 0);
    } catch {
      postContent.innerHTML = `<p class="empty">Could not load post. Make sure the file exists at <code>${file}</code>.</p>`;
    }
  }

  /* ── View switching ──────────────────────────────────── */
  function showView(view) {
    if (view === "list") {
      listView.classList.remove("hidden");
      postView.classList.add("hidden");
    } else {
      listView.classList.add("hidden");
      postView.classList.remove("hidden");
    }
  }

  /* ── Filter nav ──────────────────────────────────────── */
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const filter = link.dataset.filter;
      currentFilter = (currentFilter === filter) ? null : filter;
      navLinks.forEach(l => l.classList.toggle("active", l.dataset.filter === currentFilter));
      // Also toggle main "All Posts" link
      document.querySelector(".nav-link:not([data-filter])").classList.toggle("active", !currentFilter);
      renderList();
      showView("list");
    });
  });

  /* ── Search ──────────────────────────────────────────── */
  searchBox.addEventListener("input", () => {
    currentSearch = searchBox.value.trim();
    renderList();
  });

  /* ── Back button ─────────────────────────────────────── */
  backBtn.addEventListener("click", () => {
    showView("list");
  });

  /* ── Init ────────────────────────────────────────────── */
  renderList();
})();
