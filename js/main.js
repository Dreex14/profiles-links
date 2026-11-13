// Punto de entrada. Enlaces, series y juegos son HTML estático; aquí solo se
// completan los animes favoritos y se vigilan las portadas que no carguen.
import { el, extLink, coverCard } from "./ui.js";
import { loadStats, animeFavorites, MAL_PROFILE } from "./favorites.js";

document.getElementById("year").textContent = new Date().getFullYear();

// Portadas locales: si alguna falla, el marco muestra la inicial del título.
for (const img of document.querySelectorAll(".cover-frame img")) {
  const mark = () => img.closest(".cover-frame").classList.add("is-broken");
  if (img.complete && !img.naturalWidth) mark();
  else img.addEventListener("error", mark, { once: true });
}

// Animes: stats.json (últimos datos válidos) o, si no hay, Jikan en directo.
const block = document.querySelector('[data-favs="anime"]');
const list = block.querySelector(".covers");

let stats = null;
try {
  stats = await loadStats();
} catch (e) {
  console.warn("[stats.json]", e.message);
}

try {
  const favs = await animeFavorites(stats);
  list.replaceChildren(...favs.map(coverCard));
} catch (e) {
  console.warn("[animes favoritos]", e.message);
  list.replaceChildren(
    el("li", { class: "notice", role: "status" },
      "No he podido cargar mis animes favoritos. ",
      extLink(MAL_PROFILE, { text: "Verlos en MyAnimeList" })
    )
  );
} finally {
  block.removeAttribute("aria-busy");
}
