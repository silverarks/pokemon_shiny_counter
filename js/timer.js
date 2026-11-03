// 헌팅 타이머
// elapsedMs: 지금까지 쌓인 시간, timerStart: 실행 중이면 시작 시각(아니면 null)
function elapsedOf(h) {
  return (h.elapsedMs || 0) + (h.timerStart ? Date.now() - h.timerStart : 0);
}

function pauseTimer(h) {
  if (!h.timerStart) return;
  h.elapsedMs = elapsedOf(h);
  h.timerStart = null;
}

function startTimer(h) {
  if (h.timerStart) return;
  state.hunts.forEach(pauseTimer); // 한 번에 하나만 실행
  h.timerStart = Date.now();
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = s % 60;
  return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

// "1:30:00" / "45:00" / "90"(분) → 밀리초, 잘못된 입력이면 null
function parseDuration(text) {
  const parts = text.trim().split(":");
  if (parts.length > 3 || !parts.every(p => /^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.length === 1) return nums[0] * 60000;
  const [hh, mm, ss] = nums.length === 3 ? nums : [0, ...nums];
  if (mm >= 60 && nums.length === 3 || ss >= 60) return null;
  return ((hh * 60 + mm) * 60 + ss) * 1000;
}

function avgText(h) {
  if (!h.count) return "회당 평균 -";
  return `회당 평균 ${(elapsedOf(h) / 1000 / h.count).toFixed(1)}초`;
}

// 실행 중인 타이머 표시만 1초마다 갱신 (전체 다시 그리기 X)
setInterval(() => {
  const h = activeHunt();
  if (!h || !h.timerStart) return;
  const t = document.getElementById("timerText");
  const a = document.getElementById("timerAvg");
  if (t) t.textContent = formatDuration(elapsedOf(h));
  if (a) a.textContent = avgText(h);
}, 1000);

// 창을 닫은 동안은 시간이 흐르지 않도록 일시정지해서 저장
window.addEventListener("beforeunload", () => {
  state.hunts.forEach(pauseTimer);
  save();
});
