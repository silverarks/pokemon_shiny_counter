// 헌팅 타이머
// elapsedMs: 지금까지 쌓인 시간, timerStart: 실행 중이면 시작 시각(아니면 null)
function elapsedOf(h) {
  return (h.elapsedMs || 0) + (h.timerStart ? Date.now() - h.timerStart : 0);
}

function pauseTimer(h) {
  if (!h.timerStart) return;
  const now = Date.now();
  h.elapsedMs = (h.elapsedMs || 0) + (now - h.timerStart);
  recordTime(h, h.timerStart, now);
  h.timerStart = null;
}

// 실행 중인 타이머의 지금까지 구간을 날짜별 기록에 넣고, 지금부터 새 구간으로 이어서 잼
function restartSegment(h) {
  if (!h.timerStart) return;
  const now = Date.now();
  recordTime(h, h.timerStart, now);
  h.timerStart = now;
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

// ── 날짜별 기록 ──
// dailyCount: { "2026-11-13": 시도 횟수 }, dailyMs: { "2026-11-13": 밀리초 } (내 컴퓨터 시간 기준 날짜)
function dayKey(ms = Date.now()) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(ms = Date.now()) {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// from~to 구간의 시간을 날짜별로 나눠 기록 (자정을 넘기면 두 날로 나뉨)
function recordTime(h, from, to) {
  h.dailyMs ??= {};
  while (from < to) {
    const d = new Date(from);
    const end = Math.min(to, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime());
    const k = dayKey(from);
    h.dailyMs[k] = (h.dailyMs[k] || 0) + (end - from);
    from = end;
  }
}

function recordCount(h, delta) {
  if (!delta) return;
  h.dailyCount ??= {};
  const k = dayKey();
  h.dailyCount[k] = Math.max(0, (h.dailyCount[k] || 0) + delta);
}

function todayCount(h) {
  return h.dailyCount?.[dayKey()] || 0;
}

// 오늘 기록된 시간 + 실행 중이면 오늘 0시 이후로 흐른 시간
function todayMs(h) {
  const running = h.timerStart ? Date.now() - Math.max(h.timerStart, startOfDay()) : 0;
  return (h.dailyMs?.[dayKey()] || 0) + Math.max(0, running);
}

// 실행 중인 타이머 표시만 1초마다 갱신 (전체 다시 그리기 X) — 메인 화면과 작은 창을 함께
setInterval(() => {
  const h = activeHunt();
  if (!h || !h.timerStart) return;
  const elapsed = formatDuration(elapsedOf(h));
  const today = formatDuration(todayMs(h));
  const t = document.getElementById("timerText");
  const a = document.getElementById("timerAvg");
  const tt = document.getElementById("todayTime");
  if (t) t.textContent = elapsed;
  if (a) a.textContent = avgText(h);
  if (tt) tt.textContent = today;
  tickMini(elapsed, today);
}, 1000);

// 창을 닫은 동안은 시간이 흐르지 않도록 일시정지해서 저장
window.addEventListener("beforeunload", () => {
  state.hunts.forEach(pauseTimer);
  save();
});
