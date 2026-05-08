/**
 * フォーム送信ハンドラ + プレフィル
 * - create-{flyer,logo,reel,copy}.html で読み込まれる
 * - フォーム submit を JS で intercept し、回答を JSON として sessionStorage に保存
 * - result.html / result-copy.html へリダイレクト
 * - キャッチコピー結果からの自動入力(prefill)もここで行う
 */
(() => {
  const form = document.querySelector("form[data-product-kind]");
  if (!form) return;

  const kind = form.dataset.productKind;
  const submitBtn = form.querySelector('button[type="submit"]');

  // ---- プレフィル(キャッチコピー結果からチラシ/ロゴへ自動入力) ----
  applyPrefill(form, kind);

  function applyPrefill(form, kind) {
    const key = `instantDesign:prefill:${kind}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    Object.entries(data).forEach(([name, value]) => {
      // textarea / input
      const el = form.querySelector(`[name="${cssEscape(name)}"]`);
      if (el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && el.type !== "radio" && el.type !== "checkbox"))) {
        el.value = String(value ?? "");
        return;
      }
      // radio:値が一致するものをcheck
      if (typeof value === "string") {
        const radio = form.querySelector(`input[type="radio"][name="${cssEscape(name)}"][value="${cssEscape(value)}"]`);
        if (radio) { radio.checked = true; return; }
      }
      // checkbox(配列)
      if (Array.isArray(value)) {
        value.forEach((v) => {
          const cb = form.querySelector(`input[type="checkbox"][name="${cssEscape(name)}"][value="${cssEscape(v)}"]`);
          if (cb) cb.checked = true;
        });
      }
    });

    // 一度限り(リロードでは復活しない)
    sessionStorage.removeItem(key);

    // 視覚的なお知らせバナーを上部に挿入
    const banner = document.createElement("div");
    banner.className = "prefill-banner";
    banner.textContent = "✓ キャッチコピー結果からフォームを自動入力しました。必要に応じて編集してください。";
    form.parentNode.insertBefore(banner, form);
  }

  function cssEscape(s) { return String(s).replace(/(["\\\]])/g, "\\$1"); }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // FormData → object(配列値はキーごとに集約)
    const fd = new FormData(form);
    const data = {};
    for (const [key, value] of fd.entries()) {
      if (key.startsWith("_") || key === "制作種別") continue; // FormSubmit互換のhiddenは除外
      if (data[key] === undefined) {
        data[key] = value;
      } else if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    }

    // checkbox の name を集めて配列化(未チェックは欠落するので明示的に)
    const checkboxNames = new Set();
    form.querySelectorAll('input[type="checkbox"]').forEach((el) => checkboxNames.add(el.name));
    checkboxNames.forEach((n) => {
      if (data[n] === undefined) data[n] = [];
      else if (!Array.isArray(data[n])) data[n] = [data[n]];
    });

    sessionStorage.setItem("instantDesign:pending", JSON.stringify({
      kind,
      form: data,
      submittedAt: Date.now(),
    }));

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "送信中…";
    }
    location.href = kind === "copy" ? "result-copy.html" : "result.html";
  });
})();
