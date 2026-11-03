// 이로치 발견 효과음
// 기본: 파일 없이 Web Audio로 반짝이는 소리를 합성
// 사용자가 고른 효과음 파일 (data URL)은 헌팅 기록과 따로 저장해서 기록 저장이 무거워지지 않게 함
const CUSTOM_SOUND_KEY = "shinyCounter.customSound";
const CUSTOM_SOUND_MAX_BYTES = 2 * 1024 * 1024;

function customSound() {
  return localStorage.getItem(CUSTOM_SOUND_KEY);
}

function setCustomSound(file) {
  if (file.size > CUSTOM_SOUND_MAX_BYTES) {
    alert("효과음 파일은 2MB 이하만 쓸 수 있어요. 소리 부분만 짧게 잘라 주세요.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      localStorage.setItem(CUSTOM_SOUND_KEY, reader.result);
      localStorage.setItem(CUSTOM_SOUND_KEY + ".name", file.name);
    } catch (e) {
      alert("파일이 너무 커서 저장하지 못했어요. 더 짧은 파일을 골라 주세요.");
      return;
    }
    renderSoundToggle();
    playShinySound(); // 미리듣기
  };
  reader.readAsDataURL(file);
}

function clearCustomSound() {
  localStorage.removeItem(CUSTOM_SOUND_KEY);
  localStorage.removeItem(CUSTOM_SOUND_KEY + ".name");
  renderSoundToggle();
}

let audioCtx = null;
function playShinySound() {
  if (state.soundOff) return;
  const custom = customSound();
  if (custom) {
    new Audio(custom).play().catch(() => alert("효과음 파일을 재생하지 못했어요. 다른 형식(mp3/wav)으로 시도해 주세요."));
    return;
  }
  audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
  const ctx = audioCtx;
  if (ctx.state === "suspended") ctx.resume();
  const start = ctx.currentTime + 0.02;
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  // 위로 올라가는 아르페지오 + 마지막 화음
  const notes = [
    [1318.5, 0.00], [1661.2, 0.07], [1975.5, 0.14], [2637.0, 0.21],
    [1975.5, 0.32], [2637.0, 0.32], [3322.4, 0.32],
  ];
  for (const [freq, at] of notes) {
    const t = start + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (at >= 0.32 ? 0.9 : 0.35));
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 1);
  }
}

function renderSoundToggle() {
  document.getElementById("soundToggle").textContent = state.soundOff ? "🔇 효과음 꺼짐" : "🔊 효과음 켜짐";
  const name = localStorage.getItem(CUSTOM_SOUND_KEY + ".name");
  document.getElementById("soundName").textContent = customSound() ? `🎵 ${name || "내 효과음"}` : "🎵 기본 효과음";
  document.getElementById("soundReset").hidden = !customSound();
}
