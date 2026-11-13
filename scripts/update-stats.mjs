// Genera stats.json con los 3 primeros animes favoritos de MyAnimeList
// (perfil público; si falla, API de Jikan).
// Se ejecuta en GitHub Actions (.github/workflows/pages.yml) antes de publicar la web.
//
// Si una fuente falla, se conserva el último valor bueno ya publicado.

import { readFile, writeFile } from "node:fs/promises";

const MAL_USER = "Dreex14";
const MAX_ANIME_FAVS = 3;
const OUT = new URL("../stats.json", import.meta.url);
const PUBLISHED = "https://dreex14.github.io/profiles-links/stats.json";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
// Imagen original de MAL (sin el redimensionado firmado /r/WxH ni ?s=)
const malImg = (u) => (u || "").replace(/\/r\/\d+x\d+\//, "/").split("?")[0];

// ---------- Animes favoritos ----------
// 1) Perfil público de MyAnimeList. 2) Si falla o no trae nada, Jikan.
async function favoritesFromProfile() {
  const r = await fetch(`https://myanimelist.net/profile/${MAL_USER}`);
  if (!r.ok) throw new Error(`MAL perfil HTTP ${r.status}`);
  const html = await r.text();
  const block = html.match(/id="anime_favorites"[\s\S]*?<\/ul>/);
  if (!block) throw new Error("MAL perfil: sin bloque de favoritos");
  const list = [...block[0].matchAll(/<li class="btn-fav" title="([^"]*)">[\s\S]*?href="([^"]+)"[\s\S]*?data-src="([^"]+)"/g)]
    .map(([, title, url, img]) => ({ title: decode(title), image: malImg(img), url }))
    .slice(0, MAX_ANIME_FAVS);
  if (!list.length) throw new Error("MAL perfil: lista vacía");
  return list;
}

async function favoritesFromJikan() {
  const r = await fetch(`https://api.jikan.moe/v4/users/${MAL_USER}/favorites`);
  if (!r.ok) throw new Error(`Jikan HTTP ${r.status}`);
  const j = await r.json();
  const list = (j?.data?.anime || []).slice(0, MAX_ANIME_FAVS).map((a) => ({
    title: a.title,
    image: a.images?.jpg?.image_url,
    url: a.url,
  }));
  if (!list.length) throw new Error("Jikan: lista vacía");
  return list;
}

async function getAnimeFavorites() {
  try {
    return await favoritesFromProfile();
  } catch (e) {
    console.warn("MAL:", e.message, "→ probando Jikan");
    return await favoritesFromJikan();
  }
}

// ---------- Main ----------
// Punto de partida: los datos ya publicados (los últimos buenos), porque el workflow
// no hace commits; si no se pueden leer, se usa el stats.json del repositorio.
let local = {};
try {
  local = JSON.parse(await readFile(OUT, "utf8"));
} catch {}

let published = {};
try {
  const r = await fetch(`${PUBLISHED}?t=${Date.now()}`);
  if (r.ok) published = await r.json();
  console.log("Partiendo de los datos publicados", published.updatedAt || "");
} catch (e) {
  console.warn("No se pudieron leer los datos publicados:", e.message);
}

const sources = { animeFavorites: getAnimeFavorites };
const next = {};
for (const key of Object.keys(sources)) next[key] = published[key] ?? local[key];

// Cada fuente se intenta hasta 3 veces; si todas fallan, se queda el valor anterior.
const ATTEMPTS = 3;
for (const [key, fn] of Object.entries(sources)) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      next[key] = await fn();
      console.log(`✔ ${key}`, next[key]);
      break;
    } catch (e) {
      if (attempt === ATTEMPTS) {
        console.warn(`✘ ${key}: ${e.message} (se mantiene el valor anterior)`);
        break;
      }
      const wait = /\b429\b/.test(e.message) ? 20000 * attempt : 3000;
      console.warn(`… ${key}: ${e.message}, reintento en ${wait / 1000} s`);
      await sleep(wait);
    }
  }
}
next.updatedAt = new Date().toISOString();

await writeFile(OUT, JSON.stringify(next, null, 2) + "\n");
console.log("stats.json actualizado");
