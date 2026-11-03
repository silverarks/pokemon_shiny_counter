// 화면 그리기
function render() {
  renderList();
  renderMain();
  renderSoundToggle();
  renderMini();
}

function renderList() {
  const list = document.getElementById("huntList");
  list.innerHTML = "";
  for (const h of state.hunts) {
    const div = document.createElement("div");
    div.className = "hunt-item" + (h.id === state.activeId ? " active" : "") + (h.found ? " done" : "");
    const icon = h.dex ? `<img src="${spriteUrl(h.dex, true)}" alt="" onerror="this.remove()">` : "";
    div.innerHTML = `<span>${icon}${h.found ? "✨ " : ""}${escapeHtml(h.name)}</span><small>${h.count.toLocaleString()}</small>`;
    div.onclick = () => { state.activeId = h.id; save(); render(); };
    list.appendChild(div);
  }
}

function oddsSettingsHtml(h) {
  const game = findGame(h.game);
  return `
    <label>게임
      <select id="fGame">
        ${ODDS_GAMES.map(g => `<option value="${g.id}" ${g === game ? "selected" : ""}>${escapeHtml(g.name)}</option>`).join("")}
        <option value="custom" ${game ? "" : "selected"}>직접 입력</option>
      </select>
    </label>
    <label class="wide">방법
      <select id="fMethod" ${game ? "" : "disabled"}>
        ${game
          ? game.methods.map(([id, name, odds]) => `<option value="${id}" ${id === h.method ? "selected" : ""}>${escapeHtml(name)} — 1/${formatOdds(odds)}</option>`).join("")
          : `<option>확률을 직접 입력하는 중</option>`}
      </select>
    </label>
    <label>확률 1/<input id="fOdds" type="number" min="1" step="any" value="${Math.round(h.odds * 10) / 10}"></label>
    <label>한 번에 증가량<input id="fStep" type="number" min="1" value="${h.step}"></label>
  `;
}

function renderMain() {
  const main = document.getElementById("main");
  const h = activeHunt();
  if (!h) {
    main.innerHTML = `<div class="empty"><p>아직 헌팅이 없어요.</p><p>왼쪽의 <b>+ 새 헌팅</b>을 눌러 시작하세요!</p></div>`;
    return;
  }

  const chance = cumulativeChance(h.count, h.odds);
  const ratio = h.count / h.odds;
  const poke = h.dex ? findByDex(h.dex) : null;

  main.innerHTML = `
    <div class="settings">
      <label class="search-wrap">포켓몬 검색 (한글 · 영어 · 초성 · 도감번호)
        <input id="fSearch" placeholder="클릭하면 전체 목록 · 예: 피카츄, ㅍㅋㅊ, pikachu, 25" autocomplete="off">
        <div class="results" id="results"></div>
      </label>
      ${oddsSettingsHtml(h)}
    </div>

    ${poke ? `
      <div class="poke-title">No.${String(poke.dex).padStart(4, "0")} ${escapeHtml(poke.ko)} <small>${escapeHtml(poke.en)}</small></div>
      <div class="artwork">
        <figure class="normal">
          <img src="${artworkUrl(poke.dex, false)}" alt="" onerror="this.onerror=null;this.src='${spriteUrl(poke.dex, false)}'">
          <figcaption>일반</figcaption>
        </figure>
        <figure class="shiny">
          <img src="${artworkUrl(poke.dex, true)}" alt="" onerror="this.onerror=null;this.src='${spriteUrl(poke.dex, true)}'">
          <figcaption>✨ 이로치</figcaption>
        </figure>
      </div>` : `<div class="poke-title">${escapeHtml(h.name)}</div>`}

    ${h.found ? `<div class="found-banner">✨ ${h.count.toLocaleString()}번 · ${formatDuration(elapsedOf(h))} 만에 발견! ✨</div>` : ""}
    <div class="count">${h.count.toLocaleString()}</div>

    <div class="timer ${h.timerStart ? "running" : ""}">
      <span id="timerText">${formatDuration(elapsedOf(h))}</span>
      <button id="timerToggle" ${h.found ? "disabled" : ""}>${h.timerStart ? "⏸ 일시정지" : "▶ 시작"}</button>
      <button id="timerReset">⏹ 시간 초기화</button>
      <span class="hint" id="timerAvg">${avgText(h)}</span>
    </div>

    <div class="controls">
      <button id="minus">−</button>
      <button class="primary big" id="plus" ${h.found ? "disabled" : ""}>+${h.step}</button>
      <button id="foundBtn">${h.found ? "발견 취소" : "✨ 발견!"}</button>
    </div>
    <div class="hint">단축키: <b>Space</b> / <b>+</b> 증가 (타이머 자동 시작) · <b>-</b> 감소 · <b>T</b> 타이머 시작/정지 (입력칸 밖에서)</div>

    <div class="gauge">
      <div class="gauge-title"><span>누적 발견 확률</span><b>${(chance * 100).toFixed(2)}%</b></div>
      <div class="bar">
        <div class="rest" style="width:${100 - chance * 100}%"></div>
        ${GAUGE_MARKS.map(m => `<div class="tick" style="left:${m * 100}%"></div>`).join("")}
      </div>
      <div class="ticks">
        ${GAUGE_MARKS.map(m => `<span style="left:${m * 100}%">${m * 100}% · ${attemptsFor(m, h.odds).toLocaleString()}회</span>`).join("")}
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="label">90%까지 남은 횟수</div><div class="value">${Math.max(0, attemptsFor(0.9, h.odds) - h.count).toLocaleString()}</div></div>
      <div class="stat"><div class="label">기대값 대비</div><div class="value">${ratio.toFixed(2)}배</div></div>
      <div class="stat"><div class="label">현재 확률</div><div class="value">1/${formatOdds(h.odds)}</div></div>
    </div>

    <div class="controls">
      <input id="fSetCount" type="number" min="0" value="${h.count}" style="width:120px" title="카운트 직접 입력">
      <button id="setCount">카운트 설정</button>
      <button id="reset">0으로 초기화</button>
      <button class="danger" id="delete">헌팅 삭제</button>
    </div>
    <div class="controls">
      <input id="fSetTime" value="${formatDuration(elapsedOf(h))}" placeholder="시:분:초" style="width:120px" title="시간 직접 입력 (예: 1:30:00, 45:00)">
      <button id="setTime">시간 설정</button>
      <span class="hint">예: 1:30:00 (1시간 30분), 45:00 (45분)</span>
    </div>
  `;

  setupSearch(h);
  bindMainEvents(h);
}

function bindMainEvents(h) {
  bind("fGame", "change", e => {
    if (e.target.value === "custom") {
      h.game = "custom";
      save(); render();
      document.getElementById("fOdds").focus();
      return;
    }
    const game = findGame(e.target.value);
    applyMethod(h, game.id, game.methods[0][0]);
    save(); render();
  });
  bind("fMethod", "change", e => { applyMethod(h, h.game, e.target.value); save(); render(); });
  bind("fOdds", "change", e => {
    h.odds = Math.max(1, parseFloat(e.target.value) || 1);
    h.game = "custom"; // 직접 고친 확률은 게임/방법 프리셋과 다를 수 있으니 '직접 입력'으로 전환
    save(); render();
  });
  bind("fStep", "change", e => { h.step = Math.max(1, parseInt(e.target.value, 10) || 1); save(); render(); });
  bind("plus", "click", () => changeCount(1));
  bind("minus", "click", () => changeCount(-1));
  bind("foundBtn", "click", () => {
    h.found = !h.found;
    h.foundAt = h.found ? Date.now() : null;
    if (h.found) {
      pauseTimer(h);
      playShinySound();
    }
    save(); render();
  });
  bind("timerToggle", "click", () => {
    h.timerStart ? pauseTimer(h) : startTimer(h);
    save(); render();
  });
  bind("timerReset", "click", () => {
    if (confirm(`'${h.name}' 시간을 0:00:00으로 초기화할까요?`)) {
      h.elapsedMs = 0;
      h.timerStart = h.timerStart ? Date.now() : null;
      save(); render();
    }
  });
  const applyTime = () => {
    const ms = parseDuration(document.getElementById("fSetTime").value);
    if (ms === null) { alert("시간을 1:30:00 또는 45:00 형식으로 입력해 주세요."); return; }
    h.elapsedMs = ms;
    if (h.timerStart) h.timerStart = Date.now(); // 실행 중이면 입력한 시간부터 이어서
    save(); render();
  };
  bind("setTime", "click", applyTime);
  bind("fSetTime", "keydown", e => { if (e.key === "Enter") applyTime(); });
  const applyCount = () => {
    const v = parseInt(document.getElementById("fSetCount").value, 10);
    if (!Number.isFinite(v) || v < 0) { alert("0 이상의 숫자를 입력해 주세요."); return; }
    h.count = v;
    save(); render();
  };
  bind("setCount", "click", applyCount);
  bind("fSetCount", "keydown", e => { if (e.key === "Enter") applyCount(); });
  bind("reset", "click", () => {
    if (confirm(`'${h.name}' 카운트를 0으로 초기화할까요?`)) { h.count = 0; h.found = false; save(); render(); }
  });
  bind("delete", "click", () => {
    if (confirm(`'${h.name}' 헌팅을 삭제할까요?`)) {
      state.hunts = state.hunts.filter(x => x.id !== h.id);
      state.activeId = state.hunts[0]?.id ?? null;
      save(); render();
    }
  });
}

function bind(id, evt, fn) {
  document.getElementById(id).addEventListener(evt, fn);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
