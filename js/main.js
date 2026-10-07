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

  // The sparkle: weaves down the right-hand side as you scroll, spinning with the page
  if (!buddy || reduce) return;
  var ticking = false;
  function place() {
    ticking = false;
    var vw = window.innerWidth, vh = window.innerHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = Math.min(1, Math.max(0, window.scrollY / max));
    var size = vw < 760 ? 28 : 38;
    var track = vw < 760 ? vw - size - 6 : Math.min(vw - size - 20, (vw + 1000) / 2 + 24);
    var sway = (vw < 760 ? 8 : 26) * Math.sin(p * 22);
    var y = 70 + p * (vh - 140 - size);
    buddy.style.transform = "translate(" + (track + sway).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + (window.scrollY * 0.18).toFixed(1) + "deg)";
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(place); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  place();
})();
