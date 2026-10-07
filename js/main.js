(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal cards as they scroll into view
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Nav pill follows the section in view; sparkle takes the section's colour
  var sections = document.querySelectorAll("main section[id]");
  var links = document.querySelectorAll(".pills a[href^='#']");
  var buddy = document.querySelector(".buddy");
  var colours = { coral: "#f0674a", lilac: "#b36fd9", blue: "#6f9fd8", peach: "#ee9a55", green: "#2f9d7a" };
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); });
        var c = colours[e.target.getAttribute("data-buddy")];
        if (c) document.documentElement.style.setProperty("--buddy", c);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main > section").forEach(function (s) { so.observe(s); });
  }

  // The </>: follows you down the right-hand side, falling apart and coming back together as you scroll
  if (!buddy || reduce) return;
  var ticking = false;
  function place() {
    ticking = false;
    var vw = window.innerWidth, vh = window.innerHeight, y0 = window.scrollY;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = Math.min(1, Math.max(0, y0 / max));
    var w = vw < 760 ? 52 : 74;
    var track = vw < 760 ? vw - w - 8 : Math.min(vw - w - 20, (vw + 1000) / 2 + 12);
    var sway = (vw < 760 ? 6 : 20) * Math.sin(p * 22);
    var y = 70 + p * (vh - 150);
    // one fall-apart-and-reassemble cycle every ~900px of scrolling; whole again at the top of the page
    var s = (1 - Math.cos((y0 / 900) * Math.PI * 2)) / 2;
    s = Math.pow(s, 1.4);
    buddy.style.setProperty("--s", s.toFixed(3));
    buddy.style.transform = "translate(" + (track + sway).toFixed(1) + "px," + y.toFixed(1) + "px)";
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(place); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  place();
})();
