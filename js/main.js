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

  // The ball: rolls down a curved ramp, launches off its lip, arcs across and lands on the next ramp (which runs the other way),
  // riding the page down with you. Everything is one smooth curve; the scroll position is eased so wheel clicks don't jerk it.
  var track = document.querySelector(".track");
  if (!track || reduce) return;
  var ball = track.querySelector(".ball"), spin = ball.firstElementChild;
  var R = 10, S = 0.85, ROLL = 0.55, SPAN = 92 * S;
  var L = [[0, 0], [22, 14], [52, 40], [92, 30]].map(function (p) { return [p[0] * S, p[1] * S]; });   // one ramp, local coordinates
  var P = 0, vh = 0, trackX = 0, active = false, sY = window.scrollY, running = false, ramps = [], NS = "http://www.w3.org/2000/svg";

  function bez(p, t) {
    var m = 1 - t, a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
    return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
  }
  function tan(p, t) {
    var m = 1 - t, a = 3 * m * m, b = 6 * m * t, c = 3 * t * t;
    var x = a * (p[1][0] - p[0][0]) + b * (p[2][0] - p[1][0]) + c * (p[3][0] - p[2][0]);
    var y = a * (p[1][1] - p[0][1]) + b * (p[2][1] - p[1][1]) + c * (p[3][1] - p[2][1]);
    var n = Math.sqrt(x * x + y * y) || 1; return [x / n, y / n];
  }
  function rampY(k) { return k * P + vh * 0.55; }
  // ball centre on ramp k at parameter t, plus the direction it is travelling (mirrored on odd ramps)
  function onRamp(k, t) {
    var sg = k % 2 ? -1 : 1, x0 = trackX + (k % 2 ? SPAN : 0), pt = bez(L, t), tg = tan(L, t);
    return { x: x0 + sg * pt[0] + sg * tg[1] * R, y: rampY(k) + pt[1] - tg[0] * R, dx: sg * tg[0], dy: tg[1] };
  }

  function setup() {
    var vw = window.innerWidth;
    active = vw >= 1360;
    if (!active) return;
    vh = window.innerHeight;
    P = Math.max(380, vh * 0.6);                                     // distance between ramps
    trackX = (vw + Math.min(1000, vw - 40)) / 2 + 42;                 // in the margin, right of the content
    var need = Math.ceil(document.documentElement.scrollHeight / P) + 2;
    for (var i = ramps.length; i < need; i++) {
      var s = document.createElementNS(NS, "svg"); s.setAttribute("class", "ramp"); s.setAttribute("viewBox", "0 0 100 56");
      var pa = document.createElementNS(NS, "path");
      pa.setAttribute("d", "M4 8 C " + (4 + L[1][0] / S) + " " + (8 + L[1][1] / S) + " " + (4 + L[2][0] / S) + " " + (8 + L[2][1] / S) + " " + (4 + L[3][0] / S) + " " + (8 + L[3][1] / S));
      s.appendChild(pa); track.insertBefore(s, ball); ramps.push(s);
    }
    for (var k = 0; k < ramps.length; k++) {
      ramps[k].classList.toggle("flip", k % 2 === 1);
      ramps[k].style.left = (trackX - 4 * S) + "px";
      ramps[k].style.top = (rampY(k) - 8 * S) + "px";
    }
  }
  function draw() {
    var s = sY / P, k = Math.floor(s), u = s - k, pos, squash = 1, stretch = 1;
    if (u < ROLL) {                                                   // rolling down the curve, speeding up
      var t = u / ROLL; pos = onRamp(k, Math.pow(t, 1.5));
      if (k > 0 && u < 0.06) squash = 1 - 0.14 * (1 - u / 0.06);               // soft squash on landing
    } else {                                                          // one smooth arc to the next ramp
      var j = (u - ROLL) / (1 - ROLL), a = onRamp(k, 1), b = onRamp(k + 1, 0);
      var p = [[a.x, a.y], [a.x + a.dx * 44, a.y + a.dy * 44], [b.x - b.dx * 60, b.y - b.dy * 60], [b.x, b.y]];
      var q = bez(p, j); pos = { x: q[0], y: q[1] };
      stretch = 1 + 0.12 * Math.sin(j * Math.PI);                      // a hint of stretch in the air
    }
    ball.style.transform = "translate3d(" + (pos.x - R).toFixed(1) + "px," + (pos.y - R).toFixed(1) + "px,0) scale(" + (squash < 1 ? (1 + (1 - squash) * 0.7).toFixed(3) : (1 / stretch).toFixed(3)) + "," + (squash < 1 ? squash : stretch).toFixed(3) + ")";
    spin.style.transform = "rotate(" + (sY * 0.8).toFixed(1) + "deg)";
  }
  function frame() {
    var d = window.scrollY - sY;
    sY += d * 0.14;                                                   // glide towards the real scroll position
    if (active) draw();
    if (Math.abs(d) < 0.25) { sY = window.scrollY; if (active) draw(); running = false; return; }
    requestAnimationFrame(frame);
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", function () { setup(); wake(); });
  window.addEventListener("load", function () { setup(); wake(); });
  setup(); wake();
})();
