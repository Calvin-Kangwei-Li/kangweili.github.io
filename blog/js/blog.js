(function () {
  "use strict";

  marked.setOptions({ gfm: true, breaks: false });

  const gridView  = document.getElementById("grid-view");
  const postView  = document.getElementById("post-view");
  const cardGrid  = document.getElementById("card-grid");
  const postBody  = document.getElementById("post-body");
  const backBtn   = document.getElementById("back-btn");
  const searchBox = document.getElementById("search");
  const noResults = document.getElementById("no-results");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let activeFilter = "all";
  let activeSearch = "";

  /* ── Helpers ─────────────────────────── */
  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return {
      short: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      full:  d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    };
  }

  function tagHtml(tags, size) {
    return tags.map(t => `<span class="tag ${t}">${t}</span>`).join("");
  }

  /* ── Filter + search ─────────────────── */
  function getVisible() {
    let list = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeFilter !== "all") {
      list = list.filter(p => p.tags.includes(activeFilter));
    }
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    return list;
  }

  /* ── Render cards ────────────────────── */
  function renderCards() {
    const posts = getVisible();
    cardGrid.innerHTML = "";

    if (!posts.length) {
      noResults.classList.remove("hidden");
      return;
    }
    noResults.classList.add("hidden");

    posts.forEach(p => {
      const dt = formatDate(p.date);
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <div class="card-top">
          <span class="card-date">${dt.short}</span>
          <div class="card-tags">${tagHtml(p.tags)}</div>
        </div>
        <div class="card-title">${p.title}</div>
        <div class="card-excerpt">${p.excerpt}</div>
        <div class="card-footer">
          <span class="card-read-more">Read more</span>
        </div>
      `;
      card.addEventListener("click", () => openPost(p));
      cardGrid.appendChild(card);
    });
  }

  /* ── Open post ───────────────────────── */
  async function openPost(meta) {
    postBody.innerHTML = `<p style="color:var(--muted);font-size:0.85rem;">Loading…</p>`;
    gridView.classList.add("hidden");
    postView.classList.remove("hidden");
    window.scrollTo(0, 0);

    try {
      const res = await fetch(meta.file);
      if (!res.ok) throw new Error();
      let md = await res.text();
      md = md.replace(/^---[\s\S]*?---\n?/, ""); // strip front-matter

      const dt = formatDate(meta.date);
      postBody.innerHTML = `
        <div class="post-meta-header">
          <div class="post-meta-date">${dt.full}</div>
          <h1 class="post-meta-title">${meta.title}</h1>
          <div class="post-meta-tags">${tagHtml(meta.tags)}</div>
        </div>
        ${marked.parse(md)}
      `;
    } catch {
      postBody.innerHTML = `<p style="color:var(--muted)">Could not load post. Make sure <code>${meta.file}</code> exists.</p>`;
    }
  }

  /* ── Back ────────────────────────────── */
  backBtn.addEventListener("click", () => {
    postView.classList.add("hidden");
    gridView.classList.remove("hidden");
    window.scrollTo(0, 0);
  });

  /* ── Filter buttons ──────────────────── */
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderCards();
    });
  });

  /* ── Search ──────────────────────────── */
  searchBox.addEventListener("input", () => {
    activeSearch = searchBox.value.trim();
    renderCards();
  });

  /* ── Init ────────────────────────────── */
  renderCards();
})();
