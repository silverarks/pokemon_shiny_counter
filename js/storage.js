// 헌팅 기록 저장 / 불러오기 (브라우저 localStorage)
const STORAGE_KEY = "shinyCounter.v1";

let state = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.hunts)) {
      // 게임/방법 선택이 생기기 전의 기록은 '직접 입력' 확률로 취급
      saved.hunts.forEach(h => { h.game ??= "custom"; });
      return saved;
    }
  } catch (e) {}
  return { hunts: [], activeId: null };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeHunt() {
  return state.hunts.find(h => h.id === state.activeId) || null;
}
