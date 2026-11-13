// Helpers de DOM. Los textos vienen de fuentes externas: siempre textContent, nunca innerHTML.

/** Crea un elemento: el("a", { class: "x", text: "Hola", href: "…" }, hijos…) */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.filter((c) => c != null && c !== false));
  return node;
}

/** Solo URLs http(s): descarta javascript:, data: y cualquier otro esquema de una fuente externa. */
export function safeUrl(value) {
  try {
    const u = new URL(value, location.href);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

/** Enlace externo seguro en pestaña nueva. */
export const extLink = (href, props = {}, ...children) =>
  el("a", { href: safeUrl(href), target: "_blank", rel: "noopener noreferrer", ...props }, ...children);

/** Portada diferida dentro de un .cover-frame; si falla, el marco muestra la inicial del título. */
export function coverImg(frame, src) {
  const url = safeUrl(src);
  if (!url) return;
  const img = el("img", { src: url, alt: "", loading: "lazy", decoding: "async", width: 320, height: 480, referrerpolicy: "no-referrer" });
  img.addEventListener("error", () => frame.classList.add("is-broken"), { once: true });
  frame.replaceChildren(img);
}

/** Tarjeta de favorito: portada + título, con enlace si hay URL. */
export function coverCard({ title, image, url }) {
  const frame = el("span", { class: "cover-frame", "data-initial": (title || "?").trim().charAt(0).toUpperCase() });
  coverImg(frame, image);
  const body = [frame, el("span", { class: "cover-title", text: title })];
  const href = safeUrl(url);
  return el("li", { class: "cover" }, href ? extLink(href, {}, ...body) : el("div", {}, ...body));
}
