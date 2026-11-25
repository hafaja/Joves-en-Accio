/* Joves en Acció · interaccions del web (menú, carrusels, fotos pendents i formulari) */
(function () {
  "use strict";
  try { if (window.top !== window.self) window.top.location = window.location.href; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = (document.documentElement.lang || "ca").slice(0, 2);
  var quiet = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- Fotos pendents: si encara no s'ha pujat la foto, es mostra un requadre amb el nom del fitxer ---------- */
  function ph(img) {
    if (img.classList.contains("is-ph")) return;
    var name = img.getAttribute("data-ph") || "foto.webp";
    var txt = (lang === "es" ? "Foto pendiente: " : "Foto pendent: ") + name;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#E4EEFE"/><rect x="24" y="24" width="1152" height="752" rx="28" fill="none" stroke="#6FA8F5" stroke-width="6" stroke-dasharray="22 16"/><g fill="none" stroke="#1D4FA8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" transform="translate(540 270)"><path d="M10 40h28l12-20h20l12 20h28v80H10z"/><circle cx="60" cy="78" r="22"/></g><text x="600" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#14233B">' + txt.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</text></svg>';
    img.classList.add("is-ph");
    img.removeAttribute("srcset");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  $$("img.foto").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) ph(img);
    else img.addEventListener("error", function () { ph(img); });
  });
  /* El logotip: si no hi és, el nom en text */
  var logo = $(".brand img");
  if (logo) logo.addEventListener("error", function () { var s = document.createElement("strong"); s.textContent = "Joves en Acció"; s.style.cssText = "font-family:var(--serif);font-size:24px;color:var(--ink)"; logo.replaceWith(s); });

  /* ---------- Menú: desplegables i mòbil ---------- */
  var navBtns = $$(".nav__btn");
  function closeMenus(except) {
    navBtns.forEach(function (b) {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      var dd = document.getElementById(b.getAttribute("aria-controls"));
      if (dd) dd.classList.remove("is-open");
    });
  }
  navBtns.forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = b.getAttribute("aria-expanded") === "true";
      closeMenus(b);
      b.setAttribute("aria-expanded", String(!open));
      document.getElementById(b.getAttribute("aria-controls")).classList.toggle("is-open", !open);
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".nav__item")) closeMenus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });
  var menuToggle = $(".menu-toggle"), menu = $("#menu");
  if (menuToggle && menu) menuToggle.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? (lang === "es" ? "Cerrar el menú" : "Tancar el menú") : (lang === "es" ? "Abrir el menú" : "Obrir el menú"));
  });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { if (menu) menu.classList.remove("is-open"); closeMenus(); }); });

  /* ---------- Any al peu ---------- */
  $$("[data-any]").forEach(function (s) { s.textContent = String(new Date().getFullYear()); });

  /* ---------- Portada: fotos que van passant ---------- */
  (function () {
    var box = $(".hero__slides"); if (!box) return;
    var s = box.querySelectorAll(".hero__slide"), d = box.querySelectorAll(".hero__dots span"), i = 0;
    if (s.length < 2 || quiet) return;
    setInterval(function () {
      if (document.hidden) return;
      s[i].classList.remove("is-on"); if (d[i]) d[i].classList.remove("is-on");
      i = (i + 1) % s.length;
      s[i].classList.add("is-on"); if (d[i]) d[i].classList.add("is-on");
    }, 5000);
  })();

  /* ---------- Galeria ---------- */
  (function () {
    var g = document.getElementById("galeria"); if (!g) return;
    var sl = g.querySelectorAll(".gal__slide"), dots = g.querySelectorAll(".gal__dots button"), n = sl.length, cur = 1, timer;
    function render() {
      for (var k = 0; k < n; k++) {
        var off = (k - cur + n) % n; if (off > n / 2) off -= n;
        sl[k].className = "gal__slide" + (off === 0 ? " is-0" : off === 1 ? " is-1" : off === -1 ? " is-m1" : off === 2 ? " is-2" : off === -2 ? " is-m2" : "");
        sl[k].setAttribute("aria-hidden", off === 0 ? "false" : "true");
        sl[k].tabIndex = off === 0 ? 0 : -1;
        if (dots[k]) dots[k].classList.toggle("is-on", k === cur);
      }
    }
    function go(i) { cur = (i + n) % n; render(); }
    function stop() { clearInterval(timer); }
    function start() { if (quiet) return; stop(); timer = setInterval(function () { if (!document.hidden) go(cur + 1); }, 4500); }
    g.querySelector(".gal__nav--prev").addEventListener("click", function () { go(cur - 1); start(); });
    g.querySelector(".gal__nav--next").addEventListener("click", function () { go(cur + 1); start(); });
    Array.prototype.forEach.call(dots, function (d, k) { d.addEventListener("click", function () { go(k); start(); }); });
    Array.prototype.forEach.call(sl, function (s, k) { s.addEventListener("click", function (e) { if (k !== cur) { e.preventDefault(); go(k); start(); } }); });
    var st = g.querySelector(".gal__stage"), x0 = null;
    st.addEventListener("mouseenter", stop); st.addEventListener("mouseleave", start);
    st.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    st.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); x0 = null; start(); });
    render(); start();
  })();

  /* ---------- Formulari de contacte: motiu des de l'enllaç i pàgina de gràcies ---------- */
  (function () {
    var form = $("#formulari"); if (!form) return;
    var m = new URLSearchParams(location.search).get("motiu"), sel = $("#c-motiu");
    if (m && sel) $$("option", sel).forEach(function (o) { if (o.getAttribute("data-k") === m) sel.value = o.value; });
    form.addEventListener("submit", function () {
      var next = form.querySelector("[name=_next]");
      if (next) next.value = new URL((lang === "es" ? "es-" : "") + "gracies.html", location.href).href;
    });
  })();
})();
