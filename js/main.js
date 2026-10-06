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
/* ---------------- a clean address: reach.avxur.com, never .../#srl ----------------
   Same as Kivia's page. The list and the name in the corner still take you where
   they say (smoothly, from the CSS), but the address bar keeps the plain address. */
function arrive(t) {
  if (!t || !t.classList.contains('part')) return;
  t.classList.add('is-in');
  document.querySelectorAll('.part.is-target').forEach((p) => p !== t && p.classList.remove('is-target'));
  t.classList.remove('is-target'); void t.offsetWidth; t.classList.add('is-target');   // says hello again on a second click
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const target = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'auto' });   // 'auto' = whatever the CSS says (smooth, or instant for reduced motion)
  arrive(target);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
});
// arriving straight at a part (a link from Kivia's page): show it at once, go there, then tidy the address
if (location.hash) {
  const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  arrive(t);
  window.addEventListener('load', () => {
    if (t) t.scrollIntoView({ behavior: 'instant' });
    history.replaceState(null, '', location.pathname + location.search);
  });
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

/* ---------------- 9 · 13 · 2019 ----------------
   Somewhere in the sky there's a star that isn't like the others.
   (Or you can just type its name.) */
(function moss() {
  let open = null;
  function reveal() {
    if (open) return;
    const wrap = document.createElement('div');
    wrap.className = 'moss-reveal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Moss Ball');
    wrap.innerHTML =
      '<figure>' +
        '<img src="img/moss-ball.jpg" width="400" height="300" alt="Moss balls, captioned: Bro, you just posted moss ball. You are going to gain subscriber.">' +
        '<figcaption class="moss__caption">Moss Ball Group formed 9/13/2019</figcaption>' +
      '</figure>';
    document.body.appendChild(wrap);
    open = wrap;
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('is-on')));
    wrap.tabIndex = -1; wrap.focus();
  }
  function close() {
    if (!open) return;
    const w = open; open = null;
    w.classList.remove('is-on');
    setTimeout(() => w.remove(), 500);
  }
  document.querySelector('.moss')?.addEventListener('click', (e) => { e.stopPropagation(); reveal(); });
  document.addEventListener('click', (e) => { if (open && open.contains(e.target)) close(); });
  let typed = '';
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).replace(/[^a-z]/g, '').slice(-8);
    if (typed.endsWith('mossball')) { typed = ''; reveal(); }
  });
  console.log('%c✦ psst. not every star up there is a star.', 'color:#f5b8ca; font-size:12px');
})();
