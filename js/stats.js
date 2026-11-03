// 확률 계산

// 지금까지 n번 시도했을 때 이로치를 한 번 이상 만났을 확률
function cumulativeChance(n, odds) {
  return 1 - Math.pow(1 - 1 / odds, n);
}

// 누적 확률이 target에 도달하는 시도 횟수
function attemptsFor(target, odds) {
  if (odds <= 1) return 1;
  return Math.ceil(Math.log(1 - target) / Math.log(1 - 1 / odds));
}

// 1365.33 → "1,365" (분모가 작을 때만 소수 첫째 자리까지)
function formatOdds(odds) {
  return odds >= 100 ? Math.round(odds).toLocaleString() : String(Math.round(odds * 10) / 10);
}

const GAUGE_MARKS = [0.5, 0.9];
