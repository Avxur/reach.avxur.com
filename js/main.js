/*
 * REACH - the small amount of script this page needs:
 * a quiet starfield, parts that fade in as you reach them, and the
 * "On this page" list following where you are.
 * No cookies, no storage, no requests to anywhere.
 */
document.documentElement.classList.add('js');

/* ---------------- the night sky ---------------- */
(function sky() {
  const c = document.getElementById('sky');
  if (!c) return;
  const g = c.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [], w = 0, h = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const n = Math.round((w * h) / 9000);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() < 0.08 ? 1.3 + Math.random() * 0.8 : 0.4 + Math.random() * 0.7,
      a: 0.25 + Math.random() * 0.6, s: 0.4 + Math.random() * 1.4, p: Math.random() * Math.PI * 2,
      pink: Math.random() < 0.12,
    }));
    draw(0);
  }
  function draw(t) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    for (const s of stars) {
      const tw = still ? 1 : 0.65 + 0.35 * Math.sin(t / 1000 * s.s + s.p);
      g.globalAlpha = s.a * tw;
      g.fillStyle = s.pink ? '#f5b8ca' : '#efe8f0';
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
    }
  }
  size();
  window.addEventListener('resize', size);
  if (!still) {
    let last = 0;
    const loop = (t) => { if (t - last > 66 && !document.hidden) { draw(t); last = t; } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();

/* ---------------- parts fade in as you reach them ---------------- */
const parts = [...document.querySelectorAll('.part, .close, .stars--close')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.08 });
  parts.forEach((p) => io.observe(p));
} else {
  parts.forEach((p) => p.classList.add('is-in'));
}
// arriving straight at a part (a link from Kivia's page): show it at once
if (location.hash) {
  const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (t && t.classList.contains('part')) t.classList.add('is-in');
}

/* ---------------- "On this page" follows you ---------------- */
const links = [...document.querySelectorAll('.toc a')];
const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
function here() {
  const mid = window.innerHeight * 0.35;
  let current = null;
  for (const s of sections) if (s.getBoundingClientRect().top <= mid) current = s;
  links.forEach((a) => a.classList.toggle('is-here', !!current && a.getAttribute('href') === '#' + current.id));
}
window.addEventListener('scroll', here, { passive: true });
here();
