// 게임별 · 방법별 이로치 확률
// 값은 커뮤니티에 널리 알려진 수치 기준 (예: 4096 / 3 = 빛나는부적으로 이로치 판정 3번)
// 각 방법: [id, 이름, 확률 분모, (선택) 한 번에 증가량]
const ODDS_GAMES = [
  {
    id: "sv", name: "스칼렛·바이올렛",
    methods: [
      ["base", "기본", 4096],
      ["charm", "빛나는부적", 4096 / 3],
      ["masuda", "국제교배", 4096 / 6],
      ["masudaCharm", "국제교배 + 빛나는부적", 4096 / 8],
      ["outbreak30", "대량발생 30~59마리 처치", 4096 / 2],
      ["outbreak30Charm", "대량발생 30~59마리 처치 + 빛나는부적", 4096 / 4],
      ["outbreak60", "대량발생 60마리+ 처치", 4096 / 3],
      ["outbreak60Charm", "대량발생 60마리+ 처치 + 빛나는부적", 4096 / 5],
      ["sparkling", "빛나기파워 Lv3", 4096 / 4],
      ["sparklingCharm", "빛나기파워 Lv3 + 빛나는부적", 4096 / 6],
      ["outbreakSparkling", "대량발생 60마리+ + 빛나기파워 Lv3", 4096 / 6],
      ["max", "대량발생 60마리+ + 빛나기파워 Lv3 + 빛나는부적", 4096 / 8],
    ],
  },
  {
    id: "pla", name: "레전즈 아르세우스",
    methods: [
      ["base", "기본", 4096],
      ["research10", "도감 연구레벨 10", 4096 / 2],
      ["perfect", "도감 연구 완벽", 4096 / 4],
      ["perfectCharm", "도감 연구 완벽 + 빛나는부적", 4096 / 7],
      ["outbreak", "대량발생", 4096 / 26],
      ["outbreakMax", "대량발생 + 연구 완벽 + 빛나는부적", 4096 / 32],
      ["massive", "대대량발생", 4096 / 13],
      ["massiveMax", "대대량발생 + 연구 완벽 + 빛나는부적", 4096 / 19],
    ],
  },
  {
    id: "bdsp", name: "브릴리언트다이아몬드·샤이닝펄",
    methods: [
      ["base", "기본", 4096],
      ["charm", "빛나는부적", 4096 / 3],
      ["masuda", "국제교배", 4096 / 6],
      ["masudaCharm", "국제교배 + 빛나는부적", 4096 / 8],
      ["radar", "포켓트레 40연쇄", 99],
    ],
  },
  {
    id: "swsh", name: "소드·실드",
    methods: [
      ["base", "기본", 4096],
      ["charm", "빛나는부적", 4096 / 3],
      ["masuda", "국제교배", 4096 / 6],
      ["masudaCharm", "국제교배 + 빛나는부적", 4096 / 8],
      ["ko500", "쓰러뜨린 수 500마리+", 4096 / 6],
      ["ko500Charm", "쓰러뜨린 수 500마리+ + 빛나는부적", 4096 / 8],
      ["dynamax", "다이맥스 어드벤처", 300],
      ["dynamaxCharm", "다이맥스 어드벤처 + 빛나는부적", 100],
    ],
  },
  {
    id: "lgpe", name: "레츠고 피카츄·이브이",
    methods: [
      ["base", "기본", 4096],
      ["charm", "빛나는부적", 4096 / 3],
      ["combo31", "포획 콤보 31+", 4096 / 12],
      ["combo31Max", "포획 콤보 31+ + 빛나는부적 + 향수", 4096 / 15],
    ],
  },
  {
    id: "sm", name: "썬·문 / 울트라썬·울트라문",
    methods: [
      ["base", "기본", 4096],
      ["charm", "빛나는부적", 4096 / 3],
      ["masuda", "국제교배", 4096 / 6],
      ["masudaCharm", "국제교배 + 빛나는부적", 4096 / 8],
      ["sos", "SOS 연쇄 31+", 4096 / 13],
      ["sosCharm", "SOS 연쇄 31+ + 빛나는부적", 4096 / 15],
    ],
  },
  {
    id: "gen6", name: "X·Y / 오메가루비·알파사파이어",
    methods: [
      ["base", "기본", 4096],
      ["charm", "빛나는부적", 4096 / 3],
      ["masuda", "국제교배", 4096 / 6],
      ["masudaCharm", "국제교배 + 빛나는부적", 4096 / 8],
      ["horde", "무리배틀 (5마리씩)", 4096, 5],
      ["hordeCharm", "무리배틀 (5마리씩) + 빛나는부적", 4096 / 3, 5],
      ["fishing", "연쇄낚시 20+", 4096 / 41],
      ["fishingCharm", "연쇄낚시 20+ + 빛나는부적", 4096 / 43],
      ["safari", "프렌드사파리 (XY)", 4096 / 5],
      ["safariCharm", "프렌드사파리 + 빛나는부적 (XY)", 4096 / 7],
      ["radar", "포켓트레 40연쇄 (XY)", 4096 / 41],
    ],
  },
  {
    id: "bw2", name: "블랙2·화이트2",
    methods: [
      ["base", "기본", 8192],
      ["charm", "빛나는부적", 8192 / 3],
      ["masuda", "국제교배", 8192 / 6],
      ["masudaCharm", "국제교배 + 빛나는부적", 8192 / 8],
    ],
  },
  {
    id: "bw", name: "블랙·화이트",
    methods: [
      ["base", "기본", 8192],
      ["masuda", "국제교배", 8192 / 6],
    ],
  },
  {
    id: "gen4", name: "DP·Pt / HGSS (4세대)",
    methods: [
      ["base", "기본", 8192],
      ["masuda", "국제교배", 8192 / 5],
      ["radar", "포켓트레 40연쇄 (DPPt)", 200],
    ],
  },
  {
    id: "gen3", name: "3세대 (RSE·FRLG)",
    methods: [
      ["base", "기본", 8192],
    ],
  },
  {
    id: "gen2", name: "금·은·크리스탈",
    methods: [
      ["base", "기본", 8192],
      ["shinyParent", "이로치 부모로 교배", 64],
    ],
  },
];

function findGame(gameId) {
  return ODDS_GAMES.find(g => g.id === gameId) || null;
}

function findMethod(gameId, methodId) {
  const game = findGame(gameId);
  if (!game) return null;
  const m = game.methods.find(m => m[0] === methodId);
  return m ? { id: m[0], name: m[1], odds: m[2], step: m[3] } : null;
}
