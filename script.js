// script.js — SNAC ANIME core logic
(function () {
  "use strict";

  const state = { search: "", genre: "all", language: "all", sort: "latest", section: "all" };
  const GENRES = ["Action", "Adventure", "Fantasy", "Romance", "Comedy", "Supernatural"];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (t) => t.split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  const safeTelegram = (url) => typeof url === "string" && /^https?:\/\/t\.me\//i.test(url) ? url : "https://t.me/SNAC_hindi_anime";
  const animeUrl = (a) => safeTelegram(a.telegramUrl);
  const t = (key, vars) => window.i18n ? i18n.t(key, vars) : key;

  function getAllAnime() {
    return typeof animeList !== "undefined" ? animeList : [];
  }

  function buildPoster(a) {
    const wrapper = document.createElement("div");
    wrapper.className = "poster";
    const badges = document.createElement("div");
    badges.className = "poster-badges";
    if (a.language) badges.appendChild(pill(a.language, "pill-lang"));
    if (a.status) badges.appendChild(pill(a.status, "pill-status"));
    wrapper.appendChild(badges);
    if (a.rating) {
      const r = document.createElement("span");
      r.className = "pill pill-rating";
      r.textContent = "★ " + a.rating;
      wrapper.appendChild(r);
    }
    const poster = (a.poster || "").trim();
    if (poster && /^https?:\/\//i.test(poster)) {
      const img = document.createElement("img");
      img.alt = a.title + " poster";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.src = poster;
      let errored = false;
      img.addEventListener("load", () => img.classList.add("loaded"));
      img.addEventListener("error", () => {
        if (errored) return;
        errored = true;
        img.remove();
        wrapper.appendChild(fallback(a));
      });
      wrapper.appendChild(img);
    } else {
      wrapper.appendChild(fallback(a));
    }
    return wrapper;
  }

  function pill(text, cls) {
    const p = document.createElement("span");
    p.className = "pill " + cls;
    p.textContent = text;
    return p;
  }

  function fallback(a) {
    const fb = document.createElement("div");
    fb.className = "poster-fallback";
    fb.innerHTML = `<div class="initials">${initials(a.title)}</div><div class="sub">${a.year || ""}</div>`;
    return fb;
  }

  function buildCard(a, idx = 0) {
    const card = document.createElement("article");
    card.className = "anime-card";
    card.dataset.id = a.id;
    card.style.animationDelay = Math.min(idx * 30, 300) + "ms";
    card.appendChild(buildPoster(a));
    
    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <h3 class="card-title">${escapeHtml(a.title)}</h3>
      <div class="card-meta">
        <span class="genre">${(a.genre || []).join(" • ")}</span>
        ${a.year ? `<span>• ${a.year}</span>` : ""}
      </div>
      <div class="card-actions">
        <button class="btn btn-details" onclick="window.SNAC.openModal('${a.id}')">${t("card.details") || "Details"}</button>
        <a class="btn btn-tg" href="${animeUrl(a)}" target="_blank" rel="noopener noreferrer">${t("card.telegram") || "Telegram"}</a>
      </div>
    `;
    card.appendChild(body);
    return card;
  }

  function filteredList() {
    let list = getAllAnime();
    
    // সেকশন ফিল্টার
    if (state.section === "trending") list = list.filter((a) => a.trending === true);
    if (state.section === "latest") list = list.filter((a) => a.latest === true);
    
    // সার্চ ফিল্টার
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || (a.titleBn || "").toLowerCase().includes(q) || (a.genre || []).some((g) => g.toLowerCase().includes(q)));
    }
    
    // জেনার ফিল্টার
    if (state.genre !== "all") list = list.filter((a) => (a.genre || []).includes(state.genre));
    
    // ভাষা ফিল্টার
    if (state.language !== "all") list = list.filter((a) => (a.language || "").toLowerCase() === state.language.toLowerCase());
    
    // সর্টিং
    const sorters = {
      latest: (a, b) => (b.year || 0) - (a.year || 0),
      oldest: (a, b) => (a.year || 0) - (b.year || 0),
      az: (a, b) => a.title.localeCompare(b.title),
      za: (a, b) => b.title.localeCompare(a.title),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    };
    list.sort(sorters[state.sort] || sorters.latest);
    return list;
  }

  function renderSection(containerId, list, emptyMsg) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    if (!list.length) {
      el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🔍</div><h3>${t("card.empty") || "কিছু পাওয়া যায়নি"}</h3><p>${escapeHtml(emptyMsg)}</p></div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((a, i) => frag.appendChild(buildCard(a, i)));
    el.appendChild(frag);
  }

  function renderAll() {
    const all = getAllAnime();
    const trending = all.filter((a) => a.trending === true).slice(0, 8);
    const latest = all.filter((a) => a.latest === true).sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 8);
    
    renderSection("trendingGrid", trending, t("card.noTrending") || "কোনো Trending Anime নেই।");
    renderSection("latestGrid", latest, t("card.noLatest") || "কোনো Latest Anime নেই।");
    renderSection("allGrid", filteredList(), t("card.noSearch") || "আপনার সার্চের সাথে কোনো Anime মেলেনি।");
    
    updateCount();
    renderCategories();
  }

  function updateCount() {
    const c = document.getElementById("filterCount");
    if (c) {
      const n = filteredList().length;
      c.textContent = t("filter.count", { n }) || ("মোট " + n + " টি Anime");
    }
  }

  function renderCategories() {
    const grid = document.getElementById("catGrid");
    if (!grid) return;
    const icons = { Action: "⚔️", Adventure: "🗺️", Fantasy: "✨", Romance: "💖", Comedy: "😂", Supernatural: "👻" };
    const all = getAllAnime();
    grid.innerHTML = "";
    GENRES.forEach((g) => {
      const count = all.filter((a) => (a.genre || []).includes(g)).length;
      const countText = t("card.countGenre", { n: count }) || (count + " টি Anime");
      const card = document.createElement("div");
      card.className = "cat-card";
      card.innerHTML = `<div class="cat-icon">${icons[g] || "🎬"}</div><div class="cat-name">${g}</div><div class="cat-count">${countText}</div>`;
      card.addEventListener("click", () => {
        state.genre = g;
        document.getElementById("genreSelect").value = g;
        renderAll();
        document.getElementById("all-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      grid.appendChild(card);
    });
  }

  function openModal(id) {
    const a = getAllAnime().find((x) => x.id === id);
    if (!a) return;
    const overlay = document.getElementById("modalOverlay");
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" onclick="window.SNAC.closeModal()">✕</button>
        <div class="modal-poster">${buildPoster(a).outerHTML}</div>
        <div class="modal-body">
          <h2>${escapeHtml(a.title)}</h2>
          ${a.titleBn ? `<div class="sub-title">${escapeHtml(a.titleBn)}</div>` : ""}
          <div class="modal-tags">
            ${(a.genre || []).map((g) => `<span class="tag">${escapeHtml(g)}</span>`).join("")}
            ${a.year ? `<span class="tag">${a.year}</span>` : ""}
            ${a.rating ? `<span class="tag">★ ${a.rating}</span>` : ""}
          </div>
          <p class="desc">${escapeHtml(a.description || "")}</p>
          <a class="btn btn-tg" href="${animeUrl(a)}" target="_blank" rel="noopener noreferrer">${t("modal.watch") || "✈️ Telegram-এ দেখুন"}</a>
        </div>
      </div>
    `;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.innerHTML = "";
    document.body.style.overflow = "";
  }

  function setupMobileMenu() {
    const btn = document.getElementById("hamburger");
    const menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;
    menu.style.display = "none";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "flex" : "none";
    });
  }

  function setupFilters() {
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", (e) => { state[key] = e.target.value; renderAll(); });
    };
    bind("genreSelect", "genre");
    bind("languageSelect", "language");
    bind("sortSelect", "sort");
    bind("sectionSelect", "section");
    
    const search = document.getElementById("filterSearch");
    if (search) {
      let tm;
      search.addEventListener("input", (e) => {
        clearTimeout(tm);
        tm = setTimeout(() => { state.search = e.target.value; renderAll(); }, 120);
      });
    }
    
    const clearBtn = document.getElementById("clearFilters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        Object.assign(state, { search: "", genre: "all", language: "all", sort: "latest", section: "all" });
        ["genreSelect", "languageSelect", "sortSelect", "sectionSelect"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = id === "sortSelect" ? "latest" : "all";
        });
        ["filterSearch", "navSearch", "mobileSearch"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
        renderAll();
      });
    }
  }

  function setupNavSearch() {
    const navSearch = document.getElementById("navSearch");
    const filterSearch = document.getElementById("filterSearch");
    const mSearch = document.getElementById("mobileSearch");
    const section = document.getElementById("all-section");
    const apply = (v) => {
      state.search = v;
      if (filterSearch) filterSearch.value = v;
      if (navSearch) navSearch.value = v;
      if (mSearch) mSearch.value = v;
      renderAll();
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    let tm;
    const debounced = (e) => {
      clearTimeout(tm);
      tm = setTimeout(() => apply(e.target.value), 180);
    };
    if (navSearch) navSearch.addEventListener("input", debounced);
    if (mSearch) mSearch.addEventListener("input", debounced);
  }

  function setupToTop() {
    const btn = document.getElementById("toTop");
    if (!btn) return;
    window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 500), { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function setupModalEvents() {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  function setupLanguageSwitcher() {
    if (!window.i18n) return;
    const btn = document.getElementById("langBtn");
    const menu = document.getElementById("langMenu");
    if (btn && menu) {
      btn.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("open"); });
      document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove("open");
      });
      menu.querySelectorAll("[data-lang]").forEach((b) => {
        b.addEventListener("click", () => { i18n.setLang(b.dataset.lang); menu.classList.remove("open"); });
      });
    }
    document.querySelectorAll(".m-lang-options [data-lang]").forEach((b) => {
      b.addEventListener("click", () => i18n.setLang(b.dataset.lang));
    });
  }

  window.addEventListener("snac:langchange", () => renderAll());

  document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    setupFilters();
    setupNavSearch();
    setupMobileMenu();
    setupToTop();
    setupModalEvents();
    setupLanguageSwitcher();
  });

  window.SNAC = { openModal, closeModal, renderAll };
})();