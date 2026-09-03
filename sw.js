const VERSION = "v13";
const CACHE_NAME = `nattiva-cache-${VERSION}`;

const CORE = [
  "./",
  "./index.html",
  "./styles.css?v=13",
  "./script.js?v=13",
  "./manifest.webmanifest",
  "./vendor/jspdf.umd.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/logo-nattiva.png"
];

/* Se cachea recurso a recurso: con cache.addAll(), un solo 404 aborta el
   install entero y el service worker nunca llega a instalarse. */
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(CORE.map(async (url) => {
    try {
      const res = await fetch(url, { cache: "reload" });
      if (res.ok) await cache.put(url, res);
    } catch (e) {
      /* un recurso que falle no debe tumbar la instalación */
    }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Red primero para el código de la app (HTML, JS, CSS): así una actualización
   se ve en la carga siguiente y nadie queda atrapado en una versión vieja.
   La caché queda solo como respaldo cuando no hay conexión. */
const CODIGO = /\.(?:html|js|css|webmanifest)$/i;

async function redPrimero(req, clave) {
  try {
    const res = await fetch(req, { cache: "no-store" });
    if (res && res.ok) {
      const copia = res.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(clave, copia);
    }
    return res;
  } catch (e) {
    const cached = await caches.match(clave);
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(redPrimero(req, "./index.html"));
    return;
  }

  if (CODIGO.test(url.pathname)) {
    event.respondWith(redPrimero(req, req));
    return;
  }

  /* Resto (imágenes, logo, iconos): caché primero y actualización en segundo
     plano, que casi nunca cambian y así la app abre al instante. */
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
