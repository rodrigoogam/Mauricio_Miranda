// =========================================================
// Sitio de Mauricio Miranda Avila
// 1) Idioma ES / EN        4) Cifras que cuentan hacia arriba
// 2) Encabezado y progreso 5) Banda de trayectoria
// 3) Red neuronal animada (hero y contacto)
// =========================================================

(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1) IDIOMA ----------
  // Todo el texto existe en los dos idiomas dentro de index.html
  // (data-l="es" y data-l="en"); el CSS oculta el que no está activo.
  // Un link con ?lang=en abre el sitio directo en inglés.
  var TITLES = {
    es: 'Mauricio Miranda Avila | Director de Big Data e IA',
    en: 'Mauricio Miranda Avila | Director of Big Data and AI'
  };

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    document.title = TITLES[lang];
    try { localStorage.setItem('mm-lang', lang); } catch (e) { /* modo privado */ }
  }

  var initial = 'es';
  var fromUrl = new URLSearchParams(window.location.search).get('lang');
  var saved = null;
  try { saved = localStorage.getItem('mm-lang'); } catch (e) { /* sin acceso */ }
  if (fromUrl === 'en' || fromUrl === 'es') initial = fromUrl;
  else if (saved === 'en' || saved === 'es') initial = saved;
  setLang(initial);

  document.getElementById('langToggle').addEventListener('click', function () {
    setLang(root.getAttribute('data-lang') === 'es' ? 'en' : 'es');
  });

  // ---------- 2) ENCABEZADO Y BARRA DE PROGRESO ----------
  var topbar = document.querySelector('.topbar');
  var bar = document.getElementById('progressBar');
  function onScroll() {
    var y = window.scrollY;
    topbar.classList.toggle('is-scrolled', y > 24);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 3) RED NEURONAL ANIMADA ----------
  // Nodos que flotan y se conectan cuando están cerca;
  // el cursor actúa como un nodo más que "atrae" conexiones.
  function neuralNet(canvas, opts) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], w = 0, h = 0, raf = null, running = false;
    var mouse = { x: -9999, y: -9999 };
    var LINK = opts.link || 140;

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(opts.max || 90, Math.floor((w * h) / (opts.density || 15000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.8
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(143,168,255,' + (0.22 * (1 - d / LINK)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // conexión con el cursor
        var mx = a.x - mouse.x, my = a.y - mouse.y;
        var md = Math.sqrt(mx * mx + my * my);
        if (md < LINK * 1.4) {
          ctx.strokeStyle = 'rgba(47,91,255,' + (0.55 * (1 - md / (LINK * 1.4))) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = md < LINK * 1.4 ? 'rgba(143,168,255,0.95)' : 'rgba(203,223,237,0.55)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }

    function start() { if (!running && !reduceMotion) { running = true; draw(); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    resize();
    draw(); // primer cuadro (también es el estado fijo con movimiento reducido)

    var host = canvas.parentElement;
    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('resize', function () { resize(); if (!running) draw(); });

    // Solo anima cuando está en pantalla (ahorra batería)
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  neuralNet(document.getElementById('net'), { max: 95, density: 14000, link: 150 });
  neuralNet(document.getElementById('netContact'), { max: 55, density: 22000, link: 130 });

  // ---------- 4) CIFRAS QUE CUENTAN HACIA ARRIBA ----------
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var start = parseFloat(el.getAttribute('data-from') || '0');
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = pre + end + suf; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(start + (end - start) * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var metricObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      var n = entry.target.querySelector('[data-count]');
      if (n) countUp(n);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.metric').forEach(function (m) { metricObserver.observe(m); });

  // ---------- 5) BANDA DE TRAYECTORIA ----------
  var band = document.getElementById('band');
  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) { band.classList.add('is-visible'); obs.disconnect(); }
  }, { threshold: 0.3 }).observe(band);
})();
