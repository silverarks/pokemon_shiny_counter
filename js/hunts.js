// 헌팅 만들기 / 카운트 변경 / 확률 설정
function createHunt() {
  remember("새 헌팅");
  const hunt = {
    id: Date.now().toString(36),
    name: "포켓몬 미선택",
    dex: "",
    game: ODDS_GAMES[0].id,
    method: "base",
    odds: findMethod(ODDS_GAMES[0].id, "base").odds,
    step: 1,
    count: 0,
    found: false,
    foundAt: null,
    createdAt: Date.now(),
  };
  state.hunts.unshift(hunt);
  state.activeId = hunt.id;
  save();
  render();
  document.getElementById("fSearch")?.focus();
}

function changeCount(delta) {
  const h = activeHunt();
  if (!h || h.found) return;
  if (delta < 0 && h.count === 0) return;
  remember(delta > 0 ? `+${h.step}` : `−${h.step}`);
  h.count =Math.max(0, h.count + delta * h.step);
  if (delta > 0) startTimer(h); // + 누르면 타이머 자동 시작
  save();
  render();
  const el = document.querySelector(".count");
  if (el && delta > 0) {
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }
}

// 게임/방법을 고르면 확률(과 필요하면 증가량)을 맞춤
function applyMethod(h, gameId, methodId) {
  const m = findMethod(gameId, methodId);
  if (!m) return;
  h.game = gameId;
  h.method = m.id;
  h.odds = m.odds;
  h.step = m.step || 1;
}
