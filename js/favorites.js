// Animes favoritos. Nada de DOM aquí: solo devuelve listas o lanza errores.
//
// stats.json lo genera scripts/update-stats.mjs en GitHub Actions y siempre conserva
// los últimos datos válidos. Si no trae animes, se consulta Jikan en directo.

export const MAL_USER = "Dreex14";
export const MAL_PROFILE = `https://myanimelist.net/profile/${MAL_USER}`;
const MAX = 3;

async function getJson(url, { timeout = 8000, cache = "default" } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache });
    if (!r.ok) throw new Error(`${url} HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

// no-cache: el navegador revalida y no se queda con un stats.json antiguo.
export const loadStats = () => getJson("stats.json", { cache: "no-cache" });

/** Favoritos de anime de MyAnimeList vía Jikan (API pública), en el mismo formato que stats.json. */
export async function loadJikanFavorites() {
  const j = await getJson(`https://api.jikan.moe/v4/users/${MAL_USER}/favorites`);
  return (j?.data?.anime || []).slice(0, MAX).map((a) => ({
    title: a.title,
    image: a.images?.jpg?.image_url,
    url: a.url,
  }));
}

/** Los 3 primeros animes favoritos: stats.json y, si no hay, Jikan. */
export async function animeFavorites(stats) {
  const saved = stats?.animeFavorites;
  if (saved?.length) return saved.slice(0, MAX);
  const live = await loadJikanFavorites();
  if (!live.length) throw new Error("Jikan: sin favoritos");
  return live;
}
