// 포켓몬 이미지 주소 + 검색
const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function spriteUrl(dex, shiny) {
  return `${SPRITE_BASE}/${shiny ? "shiny/" : ""}${dex}.png`;
}

function artworkUrl(dex, shiny) {
  return `${SPRITE_BASE}/other/official-artwork/${shiny ? "shiny/" : ""}${dex}.png`;
}

// 한글 초성 검색 지원 ("ㅍㅋㅊ" → 피카츄)
const CHOSUNG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function toChosung(s) {
  return [...s].map(c => {
    const code = c.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHOSUNG[Math.floor(code / 588)] : c;
  }).join("");
}

const SEARCH_INDEX = POKEMON.map(([dex, ko, en]) => ({
  dex, ko, en,
  enLower: en.toLowerCase(),
  cho: toChosung(ko),
}));

// 검색어가 없으면 전체 목록, 결과는 항상 도감번호 순서 (SEARCH_INDEX가 이미 도감번호 순)
function searchPokemon(query) {
  const q = query.trim().toLowerCase();
  if (!q) return SEARCH_INDEX;
  if (/^\d+$/.test(q)) return SEARCH_INDEX.filter(p => String(p.dex).startsWith(q));
  const isCho = /^[ㄱ-ㅎ]+$/.test(q);
  return SEARCH_INDEX.filter(p => isCho ? p.cho.includes(q) : p.ko.includes(q) || p.enLower.includes(q));
}

function findByDex(dex) {
  return SEARCH_INDEX.find(p => p.dex === Number(dex)) || null;
}
