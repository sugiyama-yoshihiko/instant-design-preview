/**
 * フォーム送信ハンドラ
 * - create-{flyer,logo,reel}.html で読み込まれる
 * - フォーム submit を JS で intercept し、回答を JSON として sessionStorage に保存
 * - result.html へリダイレクト
 */
(() => {
  const form = document.querySelector("form[data-product-kind]");
  if (!form) return;

  const kind = form.dataset.productKind;
  const submitBtn = form.querySelector('button[type="submit"]');

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
    location.href = "result.html";
  });
})();
