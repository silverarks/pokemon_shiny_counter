// 시작점: 왼쪽 메뉴 버튼 + 키보드 단축키 연결 후 첫 화면 그리기
document.getElementById("newHunt").onclick = createHunt;
document.getElementById("soundPick").onclick = () => document.getElementById("soundFile").click();
document.getElementById("soundFile").onchange = e => {
  const file = e.target.files[0];
  if (file) setCustomSound(file);
  e.target.value = ""; // 같은 파일을 다시 골라도 반응하도록
};
document.getElementById("soundReset").onclick = () => {
  if (confirm("기본 효과음으로 되돌릴까요?")) clearCustomSound();
};
document.getElementById("soundToggle").onclick = () => {
  state.soundOff = !state.soundOff;
  save();
  renderSoundToggle();
  playShinySound(); // 켤 때 미리듣기
};

document.getElementById("miniToggle").onclick = toggleMini;

// 메인 화면과 작은 창에서 같이 쓰는 단축키
function handleShortcut(e) {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
  if (e.code === "Space" || e.key === "+" || e.key === "=") {
    e.preventDefault();
    changeCount(1);
  } else if (e.key === "-") {
    e.preventDefault();
    changeCount(-1);
  } else if (e.key === "t" || e.key === "T" || e.key === "ㅅ") {
    document.getElementById("timerToggle")?.click();
  }
}
document.addEventListener("keydown", handleShortcut);

render();
