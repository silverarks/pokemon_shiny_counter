// 되돌리기 (Ctrl+Z)
// 바꾸기 직전 상태를 기억해 두었다가 되돌림. 새로고침하면 기록은 사라짐
const UNDO_LIMIT = 100;
const undoStack = [];

// 상태를 바꾸기 직전에 호출. restoreTime: 시간 자체를 바꾸는 동작(시간 초기화/설정)인지
function remember(label, { restoreTime = false } = {}) {
  undoStack.push({ label, restoreTime, at: Date.now(), json: JSON.stringify(state) });
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  renderUndoButton();
}

function undo() {
  const entry = undoStack.pop();
  if (!entry) {
    showToast("되돌릴 작업이 없어요");
    return;
  }
  const prev = JSON.parse(entry.json);
  const current = new Map(state.hunts.map(h => [h.id, h]));
  for (const p of prev.hunts) {
    const cur = current.get(p.id);
    if (cur && !entry.restoreTime) {
      // 카운트 등을 되돌려도 그동안 흐른 시간은 그대로 둠
      p.elapsedMs = cur.elapsedMs;
      p.timerStart = cur.timerStart;
    } else {
      // 시간을 바꾼 작업이거나 삭제된 헌팅: 그때의 시간으로 복원
      p.elapsedMs = (p.elapsedMs || 0) + (p.timerStart ? entry.at - p.timerStart : 0);
      p.timerStart = cur?.timerStart ? Date.now() : null;
    }
  }
  prev.soundOff = state.soundOff; // 효과음 켜기/끄기는 되돌리기 대상이 아님
  state = prev;
  save();
  render();
  showToast(`↶ '${entry.label}' 되돌림`);
}

function renderUndoButton() {
  const btn = document.getElementById("undoBtn");
  const last = undoStack[undoStack.length - 1];
  btn.disabled = !last;
  btn.textContent = last ? `↶ 되돌리기: ${last.label}` : "↶ 되돌리기";
  btn.title = "Ctrl+Z";
}

let toastTimer = null;
function showToast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}
