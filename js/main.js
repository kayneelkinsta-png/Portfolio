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

  // The </>: eases down the right-hand side behind you, flying apart while you scroll and settling back together when you stop
  if (!buddy || reduce) return;
  var pl = buddy.querySelector(".l"), pm = buddy.querySelector(".m"), pr = buddy.querySelector(".r");
  var cur = { x: 0, y: 70, s: 0, v: 0, dir: 1 }, lastY = window.scrollY, running = false;
  function target() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = Math.min(1, Math.max(0, window.scrollY / max));
    var w = vw < 760 ? 52 : 74;
    return {
      x: (vw < 760 ? vw - w - 8 : Math.min(vw - w - 20, (vw + 1000) / 2 + 12)) + (vw < 760 ? 6 : 20) * Math.sin(p * 22),
      y: 70 + p * (vh - 150)
    };
  }
  function frame() {
    var t = target(), sy = window.scrollY, dy = sy - lastY; lastY = sy;
    if (dy) cur.dir = dy > 0 ? 1 : -1;
    cur.v += (Math.min(1, Math.abs(dy) / 18) - cur.v) * 0.12;      // how hard you're scrolling, smoothed
    cur.s += (cur.v - cur.s) * 0.14;                                  // spread chases it, so it eases in and out
    cur.x += (t.x - cur.x) * 0.16;
    cur.y += (t.y - cur.y) * 0.16;
    var s = cur.s, d = cur.dir;
    buddy.style.transform = "translate3d(" + cur.x.toFixed(1) + "px," + cur.y.toFixed(1) + "px,0)";
    pl.style.transform = "translate3d(" + (-20 * s).toFixed(1) + "px," + (-18 * s * d).toFixed(1) + "px,0) rotate(" + (-40 * s * d).toFixed(1) + "deg)";
    pm.style.transform = "translate3d(0," + (26 * s * d).toFixed(1) + "px,0) rotate(" + (80 * s * d).toFixed(1) + "deg)";
    pr.style.transform = "translate3d(" + (22 * s).toFixed(1) + "px," + (14 * s * d).toFixed(1) + "px,0) rotate(" + (46 * s * d).toFixed(1) + "deg)";
    var settled = Math.abs(t.x - cur.x) < 0.3 && Math.abs(t.y - cur.y) < 0.3 && cur.s < 0.003 && cur.v < 0.003 && !dy;
    if (settled) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake);
  wake();
})();
