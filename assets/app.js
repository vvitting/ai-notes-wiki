/* =========================================================
   AI 工程筆記本 — 前端路由與渲染
   資料來源：wiki/manifest.json（由 scripts/build.py 產生）與 wiki/<slug>.md
   路由：
     #/            首頁
     #/<slug>      條目頁
     #/tag/<標籤>  標籤頁
   ========================================================= */
(function () {
  "use strict";

  const REPO_URL = "https://vvitting.github.io/ai-notes-wiki/"; // ← 上傳 GitHub 後改成你的 repo 網址

  const $main = document.getElementById("main");
  const $nav = document.getElementById("nav");
  const $search = document.getElementById("search");
  const $sidebar = document.getElementById("sidebar");
  const $toggle = document.getElementById("menu-toggle");

  let manifest = null;
  const bySlug = new Map();
  const mdCache = new Map();

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const categoryName = (id) => (manifest.site.categories.find((c) => c.id === id) || { name: id }).name;
  const tagLink = (t) => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">${esc(t)}</a>`;

  /* ---------- 資料載入 ---------- */
  async function loadManifest() {
    const res = await fetch("wiki/manifest.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("找不到 wiki/manifest.json，請先執行 python3 scripts/build.py");
    manifest = await res.json();
    manifest.entries.forEach((e) => bySlug.set(e.slug, e));
  }

  async function loadMarkdown(entry) {
    if (mdCache.has(entry.slug)) return mdCache.get(entry.slug);
    const res = await fetch(entry.file, { cache: "no-cache" });
    if (!res.ok) throw new Error(`讀不到 ${entry.file}`);
    const text = (await res.text()).replace(/^---[\s\S]*?\n---\s*\n/, ""); // 去掉 frontmatter
    mdCache.set(entry.slug, text);
    return text;
  }

  /* ---------- Markdown 處理 ---------- */
  function renderMarkdown(md) {
    // 先把 [[slug]] / [[slug|文字]] 轉成連結（程式碼區塊內不轉）
    const parts = md.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
    const linked = parts.map((part, i) => {
      if (i % 2 === 1) return part;
      return part.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, slug, label) => {
        slug = slug.trim();
        const target = bySlug.get(slug);
        const text = (label || (target ? target.title : slug)).trim();
        const cls = target ? "wikilink" : "wikilink missing";
        return `<a class="${cls}" href="#/${encodeURIComponent(slug)}">${esc(text)}</a>`;
      });
    }).join("");
    return marked.parse(linked, { gfm: true });
  }

  /* ---------- 側欄 ---------- */
  function renderNav(query = "") {
    const q = query.trim().toLowerCase();
    const match = (e) => !q || [e.title, e.summary, e.slug, ...e.tags].join(" ").toLowerCase().includes(q);
    const current = currentSlug();
    let html = "";
    let total = 0;
    for (const cat of manifest.site.categories) {
      const items = manifest.entries.filter((e) => e.category === cat.id && match(e))
        .sort((a, b) => a.title.localeCompare(b.title, "zh-Hant"));
      if (!items.length) continue;
      total += items.length;
      html += `<section class="nav-group"><h2>${esc(cat.name)}</h2><ul>` +
        items.map((e) => `<li><a href="#/${e.slug}"${e.slug === current ? ' aria-current="page"' : ""}>${esc(e.title)}</a></li>`).join("") +
        `</ul></section>`;
    }
    $nav.innerHTML = total ? html : `<p class="nav-empty">找不到符合「${esc(query)}」的條目</p>`;
  }

  function card(e) {
    return `<li><a class="card" href="#/${e.slug}">
      <h3>${esc(e.title)}</h3>
      <p>${esc(e.summary)}</p>
      <div class="meta">${e.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}<span>· ${esc(e.updated)}</span></div>
    </a></li>`;
  }

  /* ---------- 頁面 ---------- */
  function viewHome() {
    const s = manifest.site;
    document.title = s.title;
    const recent = manifest.entries.slice(0, 4);
    let html = `<section class="hero">
      <h1>${esc(s.title)}</h1>
      <p>${esc(s.subtitle)}。每一篇都依照同一份 <a href="${REPO_URL}/blob/main/AGENTS.md" target="_blank" rel="noopener">AGENTS.md</a> 規則，由 AI 從原始筆記整理而成。</p>
      <div class="stats"><span><b>${manifest.count}</b>篇條目</span><span><b>${s.categories.length}</b>個分類</span><span><b>${manifest.tags.length}</b>個標籤</span></div>
    </section>
    <h2 class="section-title">最近更新</h2>
    <ul class="cards">${recent.map(card).join("")}</ul>`;
    for (const cat of s.categories) {
      const items = manifest.entries.filter((e) => e.category === cat.id);
      if (!items.length) continue;
      html += `<h2 class="section-title">${esc(cat.name)}</h2>
        <p class="section-desc">${esc(cat.description)}</p>
        <ul class="cards">${items.map(card).join("")}</ul>`;
    }
    $main.innerHTML = html;
  }

  async function viewEntry(slug) {
    const e = bySlug.get(slug);
    if (!e) return viewNotFound(slug);
    document.title = `${e.title}｜${manifest.site.title}`;
    $main.innerHTML = `<p class="loading">載入 ${esc(e.title)}…</p>`;
    let body;
    try {
      body = renderMarkdown(await loadMarkdown(e));
    } catch (err) {
      $main.innerHTML = `<p class="loading">${esc(err.message)}</p>`;
      return;
    }
    const sources = (e.sources || []).map((s) => {
      const href = /^https?:\/\//.test(s) ? s : `${REPO_URL}/blob/main/${s}`;
      return `<li class="src"><a href="${esc(href)}" target="_blank" rel="noopener">${esc(s)}</a></li>`;
    }).join("");
    const backlinks = e.backlinks.map((b) => bySlug.get(b)).filter(Boolean)
      .map((b) => `<li><a href="#/${b.slug}">${esc(b.title)}</a></li>`).join("");

    $main.innerHTML = `<article>
      <header class="entry-head">
        <div class="crumbs"><a href="#/">首頁</a> / ${esc(categoryName(e.category))}</div>
        <h1 class="entry-title">${esc(e.title)}</h1>
        <p class="entry-summary">${esc(e.summary)}</p>
        <div class="meta">${e.tags.map(tagLink).join("")}<span>· 更新於 ${esc(e.updated)}</span>
          <span>· <a href="${REPO_URL}/blob/main/${e.file}" target="_blank" rel="noopener">原始檔</a></span></div>
      </header>
      <div class="prose">${body}</div>
      <footer class="entry-foot">
        ${sources ? `<h2>參考來源</h2><ul>${sources}</ul>` : ""}
        <h2>連到這頁的條目</h2>
        ${backlinks ? `<ul>${backlinks}</ul>` : `<p class="meta">目前還沒有其他條目連到這裡。</p>`}
      </footer>
    </article>`;
  }

  function viewTag(tag) {
    const items = manifest.entries.filter((e) => e.tags.includes(tag));
    document.title = `#${tag}｜${manifest.site.title}`;
    $main.innerHTML = `<section class="hero">
      <div class="crumbs"><a href="#/">首頁</a> / 標籤</div>
      <h1># ${esc(tag)}</h1><p>共 ${items.length} 篇條目</p>
    </section>
    <ul class="cards">${items.map(card).join("")}</ul>
    <h2 class="section-title">所有標籤</h2>
    <div class="meta">${manifest.tags.map(tagLink).join("")}</div>`;
  }

  function viewNotFound(slug) {
    document.title = `找不到頁面｜${manifest.site.title}`;
    $main.innerHTML = `<section class="notfound"><h1>找不到「${esc(slug)}」</h1>
      <p>這個條目可能還沒寫，或 slug 拼錯了。<a href="#/">回首頁</a></p></section>`;
  }

  /* ---------- 路由 ---------- */
  function currentSlug() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    return h && !h.startsWith("tag/") ? h : "";
  }

  async function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    if (!h) viewHome();
    else if (h.startsWith("tag/")) viewTag(h.slice(4));
    else await viewEntry(h);
    renderNav($search.value);
    $sidebar.classList.remove("open");
    $toggle.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
    $main.focus({ preventScroll: true });
  }

  /* ---------- 啟動 ---------- */
  async function init() {
    try {
      await loadManifest();
    } catch (err) {
      $main.innerHTML = `<p class="loading">${esc(err.message)}</p>`;
      return;
    }
    document.getElementById("site-title").textContent = manifest.site.title;
    document.getElementById("site-subtitle").textContent = manifest.site.subtitle;
    document.getElementById("repo-link").href = `${REPO_URL}/blob/main/AGENTS.md`;
    $search.addEventListener("input", () => renderNav($search.value));
    $toggle.addEventListener("click", () => {
      const open = $sidebar.classList.toggle("open");
      $toggle.setAttribute("aria-expanded", String(open));
    });
    window.addEventListener("hashchange", route);
    route();
  }

  init();
})();
