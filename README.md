# profiles-links

Página personal de enlaces de **Dreex** (@dreex14): mis perfiles de trofeos y gaming, mis redes y un pequeño escaparate con mis animes, series y videojuegos favoritos.

🔗 **https://dreex14.github.io/profiles-links/**

## Qué incluye

| Bloque | Contenido |
| --- | --- |
| Perfil | Avatar, nombre, usuario y una línea de presentación |
| Trofeos y gaming | Exophase, Steam, Steam Hunters y PSNProfiles |
| Redes y contenido | YouTube, Twitch, Twitter / X y GitHub; MyAnimeList, Filmaffinity y Letterboxd |
| Mis favoritos | 3 animes (automáticos, de MyAnimeList), 3 series y 3 videojuegos |

## Estructura

Web estática: HTML, CSS y JavaScript sin frameworks ni paso de compilación.

```
index.html                Enlaces, series y juegos (contenido fijo)
styles.css                Diseño y responsive
icons.svg                 Sprite de iconos, sin peticiones externas
img/                      Avatar y portadas optimizadas (WebP) de series y juegos
stats.json                Animes favoritos (últimos datos válidos)
js/main.js                Punto de entrada
js/favorites.js           Obtención de los animes favoritos (stats.json y Jikan)
js/ui.js                  Helpers de DOM y enlaces seguros
scripts/update-stats.mjs  Actualiza stats.json en GitHub Actions
```

## Animes favoritos

Son los tres primeros favoritos del perfil de MyAnimeList y se actualizan solos:

1. [`scripts/update-stats.mjs`](scripts/update-stats.mjs) los lee del perfil público de MyAnimeList (o de la API de Jikan si falla) y genera `stats.json`.
2. GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) lo ejecuta una vez al día y con cada cambio en `main`, y publica la web sin hacer commits.
3. Si una fuente falla, se conserva la última lista válida publicada. Si en el navegador no hay datos en `stats.json`, la página consulta Jikan en directo.

## Cambiar series o juegos

Son fijos en `index.html`. Para cambiar uno, edita su tarjeta en el bloque «Mis favoritos» y pon su portada en `img/series/` o `img/games/` (WebP, 320 × 480 px).

## Ejecutarla en local

```bash
python -m http.server
```

Después abre `http://localhost:8000`.

## Créditos

- Iconos de marcas: [Simple Icons](https://simpleicons.org) (CC0 1.0)
- Iconos de interfaz: [Lucide](https://lucide.dev) (ISC)
- Tipografías: [Inter](https://fonts.google.com/specimen/Inter) y [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (SIL Open Font License 1.1)
- Animes favoritos: perfil público de [MyAnimeList](https://myanimelist.net) y [Jikan API](https://jikan.moe) (MIT)
- Pósters de las series: [TVmaze](https://www.tvmaze.com)
- Portadas de los juegos: [Steam](https://store.steampowered.com) (Persona 5 Royal, Elden Ring) e [IGDB](https://www.igdb.com) (The Legend of Zelda: Tears of the Kingdom)

Las portadas y pósters pertenecen a sus respectivos dueños y se muestran solo como referencia. Esta página no está afiliada con ninguna de las plataformas enlazadas; sus nombres y logos pertenecen a sus dueños.

Hecho por **Dreex**.
