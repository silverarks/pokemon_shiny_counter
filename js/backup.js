// 백업: 헌팅 기록을 .json 파일로 내보내기 / 불러오기
// 사용자 효과음 파일은 용량이 커서 백업에 넣지 않음
const BACKUP_FORMAT = "shiny-counter-backup";

function exportBackup() {
  // 실행 중인 타이머는 지금까지의 시간으로 고정해서 저장 (불러올 때 그 사이 시간이 더해지지 않게)
  const hunts = state.hunts.map(h => ({ ...h, elapsedMs: elapsedOf(h), timerStart: null }));
  const data = { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), state: { ...state, hunts } };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `shiny-counter-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(`💾 헌팅 ${hunts.length}개를 저장했어요`);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (e) {
      alert("백업 파일을 읽지 못했어요. 이 카운터에서 저장한 .json 파일인지 확인해 주세요.");
      return;
    }
    if (data?.format !== BACKUP_FORMAT || !Array.isArray(data.state?.hunts)) {
      alert("이 카운터의 백업 파일이 아니에요.");
      return;
    }
    const n = data.state.hunts.length;
    if (!confirm(`백업의 헌팅 ${n}개로 지금 기록을 바꿀까요?\n(잘못 불러왔다면 '되돌리기'로 원래대로 돌릴 수 있어요)`)) return;
    remember("백업 불러오기", { restoreTime: true });
    state = data.state;
    state.hunts.forEach(h => { h.game ??= "custom"; h.timerStart = null; });
    if (!activeHunt()) state.activeId = state.hunts[0]?.id ?? null;
    save();
    render();
    showToast(`📂 헌팅 ${n}개를 불러왔어요`);
  };
  reader.readAsText(file);
}
