/**
 * /content/*.json を読み込み、HTML 内の data-content="..." 要素に流し込む
 *
 * CMS で site.json / pricing.json を編集すると、リロード後に画面に即反映される。
 * 編集→反映を体感するためのデモ用ライブラリ。
 */
(async () => {
  try {
    const [site, pricing] = await Promise.all([
      fetch("content/site.json?_=" + Date.now()).then((r) => r.ok ? r.json() : null),
      fetch("content/pricing.json?_=" + Date.now()).then((r) => r.ok ? r.json() : null),
    ]);

    // ---- site.json をテキストに流し込む ----
    if (site) {
      const set = (selector, value) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (value != null) el.textContent = value;
        });
      };
      set('[data-content="brand_name"]',  site.brand_name);
      set('[data-content="tagline"]',     site.tagline);
      set('[data-content="hero_badge"]',  site.hero_badge);
      set('[data-content="hero_title_1"]',site.hero_title_1);
      set('[data-content="hero_title_2"]',site.hero_title_2);
      set('[data-content="hero_lead"]',   site.hero_lead);
      set('[data-content="coming_title"]',site.coming_title);
      set('[data-content="coming_desc"]', site.coming_desc);
    }

    // ---- pricing.json を価格表に流し込む ----
    if (pricing && Array.isArray(pricing.items)) {
      document.querySelectorAll('[data-content="pricing"]').forEach((host) => {
        const compact = host.dataset.compact === "true";
        host.innerHTML = pricing.items.map((p) => compact
          ? `<div class="price"><div class="price__name">${escape(p.name)}</div><div class="price__amount">¥${formatPrice(p.price)}</div></div>`
          : `<div class="price reveal"><div class="price__name">${escape(p.name)}</div><div class="price__amount">¥${formatPrice(p.price)}<span> /件</span></div></div>`
        ).join("");
      });
    }
  } catch (e) {
    console.warn("[content.js] 動的コンテンツの読み込みに失敗(静的内容のまま表示):", e);
  }

  function escape(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function formatPrice(n) {
    return Number(n || 0).toLocaleString("ja-JP");
  }
})();
