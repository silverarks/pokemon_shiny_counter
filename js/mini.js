// 작은 창 (항상 위에 떠 있는 미니 카운터)
// Chrome/Edge의 Document Picture-in-Picture 기능을 사용. 같은 페이지의 창이라 기록이 바로 연동됨
let miniWin = null;

async function openMini() {
  if (miniWin) { miniWin.focus(); return; }
  if (!("documentPictureInPicture" in window)) {
    alert("작은 창은 Chrome 또는 Edge 최신 버전에서만 쓸 수 있어요.");
    return;
  }
  const win = await documentPictureInPicture.requestWindow({ width: 360, height: 170 });
  setupMiniWindow(win);
}

function setupMiniWindow(win) {
  miniWin = win;
  const doc = win.document;
  // 메인 화면의 CSS를 그대로 가져옴
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    const copy = doc.createElement("link");
    copy.rel = "stylesheet";
    copy.href = link.href;
    doc.head.appendChild(copy);
  }
  doc.title = "이로치 카운터";
  doc.body.className = "mini-body";
  doc.body.innerHTML = `<div id="mini"></div>`;

  doc.addEventListener("keydown", handleShortcut);
  doc.addEventListener("click", e => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "plus") changeCount(1);
    else if (action === "minus") changeCount(-1);
    else if (action === "found") document.getElementById("foundBtn")?.click();
    else if (action === "timer") document.getElementById("timerToggle")?.click();
  });
  win.addEventListener("pagehide", () => {
    miniWin = null;
    renderMiniButton();
  });

  renderMini();
  renderMiniButton();
}

function renderMini() {
  if (!miniWin) return;
  const box = miniWin.document.getElementById("mini");
  const h = activeHunt();
  if (!h) {
    box.innerHTML = `<div class="mini-empty">헌팅을 먼저 만들어 주세요</div>`;
    return;
  }
  const chance = cumulativeChance(h.count, h.odds);
  box.innerHTML = `
    <div class="mini-card ${h.found ? "found" : ""}">
      ${h.dex ? `<img class="mini-sprite" src="${spriteUrl(h.dex, true)}" alt="">` : ""}
      <div class="mini-info">
        <div class="mini-name">${h.found ? "✨ " : ""}${escapeHtml(h.name)}</div>
        <div class="mini-count">${h.count.toLocaleString()}</div>
        <div class="mini-sub">
          <span class="mini-timer ${h.timerStart ? "running" : ""}" data-action="timer" title="타이머 시작/정지 (T)">⏱ ${formatDuration(elapsedOf(h))}</span>
          · ${(chance * 100).toFixed(1)}%
        </div>
      </div>
      <div class="mini-btns">
        <button class="primary" data-action="plus" ${h.found ? "disabled" : ""}>+${h.step}</button>
        <div>
          <button data-action="minus" title="감소">−</button>
          <button data-action="found" title="${h.found ? "발견 취소" : "발견!"}">✨</button>
        </div>
      </div>
    </div>
  `;
}

function renderMiniButton() {
  document.getElementById("miniToggle").textContent = miniWin ? "📌 작은 창 닫기" : "📌 작은 창으로 띄우기";
}

function toggleMini() {
  if (miniWin) miniWin.close();
  else openMini();
}

// 작은 창의 타이머 표시만 1초마다 갱신
setInterval(() => {
  if (!miniWin) return;
  const h = activeHunt();
  const t = miniWin.document.querySelector(".mini-timer");
  if (h && t && h.timerStart) t.textContent = `⏱ ${formatDuration(elapsedOf(h))}`;
}, 1000);
