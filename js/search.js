// 포켓몬 검색창 (자동완성 목록)
function setupSearch(h) {
  const input = document.getElementById("fSearch");
  const box = document.getElementById("results");
  let items = [];
  let sel = 0;

  function choose(p) {
    remember("포켓몬 선택");
    h.dex = p.dex;
    h.name = p.ko;
    save();
    render();
  }

  // 목록 전체를 다시 그림 (검색어가 바뀔 때만)
  function draw() {
    if (!items.length) {
      box.innerHTML = `<div class="result"><span>검색 결과가 없어요</span></div>`;
    } else {
      box.innerHTML = items.map((p, i) => `
        <div class="result" data-i="${i}">
          <img src="${spriteUrl(p.dex, true)}" alt="" loading="lazy">
          <span>${escapeHtml(p.ko)} <span class="hint">${escapeHtml(p.en)}</span></span>
          <small>#${p.dex}</small>
        </div>`).join("");
    }
    box.classList.add("open");
    highlight();
  }

  // 선택 표시만 옮김 (방향키)
  function highlight() {
    box.querySelector(".result.sel")?.classList.remove("sel");
    const row = box.querySelector(`.result[data-i="${sel}"]`);
    if (row) {
      row.classList.add("sel");
      row.scrollIntoView({ block: "nearest" });
    }
  }

  function update() {
    items = searchPokemon(input.value);
    // 검색어가 없으면 현재 포켓몬 위치에서 목록을 보여줌
    const cur = input.value.trim() ? -1 : items.findIndex(p => p.dex === Number(h.dex));
    sel = Math.max(0, cur);
    draw();
  }

  input.addEventListener("focus", update);
  input.addEventListener("input", update);
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); highlight(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); highlight(); }
    else if (e.key === "Enter" && !e.isComposing && items[sel]) { e.preventDefault(); choose(items[sel]); }
    else if (e.key === "Escape") { input.value = ""; input.blur(); }
  });
  input.addEventListener("blur", () => box.classList.remove("open"));
  box.addEventListener("mousedown", e => {
    e.preventDefault();
    const row = e.target.closest(".result[data-i]");
    if (row) choose(items[Number(row.dataset.i)]);
  });
}
