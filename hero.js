/* Benny identity, Telha reference choreography. Shared kit owns motion preferences and menu. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const root = document.querySelector('.hero-scroll');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let paused = false;
  let frame = 0;
  let entry = 0;
  let metrics = {};
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const ease = v => v * v * (3 - 2 * v);
  const mobile = () => innerWidth < 768;
  const motionAllowed = () => !reduced.matches && !(connection && connection.saveData);
  if (root) doc.classList.add('is-home');
  function fitWords() {
    document.querySelectorAll('.giant-wordmark').forEach(word => {
      const span = word.querySelector('span');
      span.style.fontSize = '100px';
      const width = span.getBoundingClientRect().width;
      span.style.fontSize = (100 * word.clientWidth / Math.max(width, 1)) + 'px';
    });
    measure();
  }
  function measure() {
    metrics = {};
    for (const id of ['opening', 'selected', 'all-work', 'vision', 'method']) {
      const el = document.getElementById(id);
      if (el) metrics[id] = { top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight };
    }
    if (root) {
      const word = root.querySelector('.hero-wordmark');
      const height = word.querySelector('span').getBoundingClientRect().height + (mobile() ? 24 : 28);
      root.style.setProperty('--wordmark-height', height + 'px');
      metrics.wordmark = height;
    }
    update();
  }
  function progress(id) {
    const m = metrics[id];
    return m ? clamp((scrollY - m.top) / Math.max(m.height - innerHeight, 1)) : 0;
  }
  function updateHero() {
    if (!root || !metrics.opening) return;
    const p = ease(progress('opening'));
    const h = metrics.wordmark || 180;
    const word = root.querySelector('.hero-wordmark');
    const paper = root.querySelector('.hero-paper');
    const image = root.querySelector('.hero-frame');
    const width = (mobile() ? 70 : 40) + (mobile() ? 30 : 60) * p;
    word.style.transform = 'translateY(' + (-h * p) + 'px)';
    paper.style.transform = 'translateY(' + (-h * p) + 'px)';
    paper.style.height = (innerHeight - (mobile() ? 60 : 0) - h * (1 - p)) + 'px';
    image.style.width = width + '%';
    image.style.height = (mobile() ? 70 + 30 * p : 75 + 25 * p) + '%';
    image.style.top = ((mobile() ? 15 : 27) * (1 - p)) + '%';
    image.querySelector('img').style.transform = 'translateY(' + (8 * (1 - entry)) + 'px) scale(' + (1.018 - .018 * entry) + ')';
    image.querySelector('.hero-line').style.width = (entry * 100) + '%';
    document.querySelector('.hero-caption').style.opacity = String(1 - .35 * p);
    doc.style.setProperty('--header-y', (mobile() ? 0 : h * (1 - p)) + 'px');
    document.querySelector('.dk-wordmark').style.opacity = '1';
  }
  function updateSelected() {
    const cards = [...document.querySelectorAll('.selected-project')];
    if (!cards.length) return;
    const p = progress('selected');
    const index = Math.min(cards.length - 1, Math.floor(p * cards.length));
    const fraction = p * cards.length - index;
    cards.forEach((card, i) => {
      const active = index === i;
      card.classList.toggle('is-active', active);
      card.style.transform = active ? 'translateY(' + (clamp((fraction - .8) / .2) * -65) + 'px)' : '';
      card.style.opacity = active ? String(1 - clamp((fraction - .87) / .13) * .55) : '0';
    });
    document.querySelector('.project-counter').textContent = String(index + 1).padStart(2, '0') + ' / 04';
  }
  function updateScatter() {
    const p = progress('all-work');
    document.querySelectorAll('[data-drift]').forEach(img => {
      const distance = (0.5 - p) * innerHeight * Number(img.dataset.drift) * 3.8;
      img.style.transform = 'translateY(' + distance + 'px)';
    });
  }
  function updateVision() {
    const p = progress('vision');
    const grow = ease(clamp(p / .18));
    const bg = document.querySelector('.vision-background');
    if (!bg) return;
    bg.style.clipPath = 'inset(' + ((1 - grow) * 10) + '% ' + ((1 - grow) * 28) + '%)';
    bg.querySelector('img').style.transform = 'scale(' + (1.1 - .1 * grow) + ')';
    const words = [...document.querySelectorAll('.vision-words h2')];
    const slide = clamp((p - .18) / .82) * 2;
    const first = Math.floor(slide), last = Math.min(2, first + 1);
    const stage = Math.round(slide);
    const offset = words[first].offsetLeft + (words[last].offsetLeft - words[first].offsetLeft) * (slide - first) - (mobile() ? 16 : innerWidth * .16);
    document.querySelector('.vision-words').style.transform = 'translateX(' + (-offset) + 'px)';
    words.forEach((w, i) => w.classList.toggle('is-active', i === stage));
    document.querySelectorAll('.vision-copy p').forEach((p, i) => p.classList.toggle('is-active', i === stage));
  }
  function setMethod(index) {
    document.querySelectorAll('[data-method-stage]').forEach((a, i) => a.classList.toggle('is-active', i === index));
    document.querySelectorAll('.method-picture img').forEach((img, i) => img.classList.toggle('is-active', i === index));
  }
  function updatePill() {
    const pill = document.querySelector('.section-pill');
    if (!pill) return;
    let current = null;
    document.querySelectorAll('[data-section-name]').forEach(section => {
      const r = section.getBoundingClientRect();
      if (r.top < innerHeight * .55 && r.bottom > innerHeight * .3) current = section;
    });
    if (current) {
      const card = document.querySelector('.selected-project.is-active');
      const inWork = current.id === 'selected' && card && doc.classList.contains('motion-on');
      pill.querySelector('[data-pill-label]').textContent = inWork ? card.dataset.projectName : current.dataset.sectionName;
      pill.href = inWork ? card.dataset.projectRoute : current.dataset.sectionLink;
    }
    const footer = document.querySelector('.dk-footer');
    pill.style.opacity = scrollY < innerHeight * .7 || footer.getBoundingClientRect().top < innerHeight * .45 ? '0' : '1';
    pill.style.pointerEvents = pill.style.opacity === '0' ? 'none' : 'auto';
  }
  function update() {
    frame = 0;
    if (!root || paused || !motionAllowed()) return;
    updateHero();
    updateSelected();
    updateScatter();
    updateVision();
    setMethod(Math.min(6, Math.floor(progress('method') * 7)));
    updatePill();
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function clearMotion() {
    doc.classList.remove('motion-on');
    doc.style.removeProperty('--header-y');
    document.querySelector('.dk-wordmark').style.removeProperty('opacity');
    document.querySelectorAll('.hero-wordmark,.hero-paper,.hero-frame,.hero-frame img,.hero-line,.hero-caption,.selected-project,.scatter-image,.vision-background,.vision-background img,.vision-words').forEach(el => el.removeAttribute('style'));
    document.querySelectorAll('.selected-project').forEach(el => el.classList.remove('is-active'));
    document.querySelectorAll('.vision-copy p,.vision-words h2').forEach(el => el.classList.add('is-active'));
    const pill = document.querySelector('.section-pill');
    if (pill) pill.hidden = true;
  }
  function preferences() {
    if (!root) return;
    if (motionAllowed()) {
      doc.classList.add('motion-on');
      const pill = document.querySelector('.section-pill');
      if (pill) pill.hidden = false;
      measure();
    } else clearMotion();
  }
  if (root) {
    preferences();
    DemoKitMotion.mount(root, {
      durationMs: 60000,
      draw(elapsed) {
        entry = ease(clamp(elapsed / 8000));
        if (!paused) updateHero();
      },
      staticFrame() { clearMotion(); }
    });
    root.querySelector('[data-dk-motion-toggle]').addEventListener('click', () => {
      paused = root.dataset.motionState === 'paused';
      if (!paused) schedule();
    });
    addEventListener('scroll', schedule, { passive: true });
    reduced.addEventListener('change', preferences);
    if (connection && connection.addEventListener) connection.addEventListener('change', preferences);
    document.querySelectorAll('[data-method-stage]').forEach((a, i) => {
      a.addEventListener('mouseenter', () => { if (motionAllowed() && !paused) setMethod(i); });
      a.addEventListener('focus', () => { if (motionAllowed() && !paused) setMethod(i); });
    });
  }
  function clock() {
    const value = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());
    document.querySelectorAll('[data-mumbai-time]').forEach(el => { el.textContent = value; el.dateTime = new Date().toISOString(); });
  }
  clock();
  setInterval(clock, 30000);
  document.fonts.ready.then(fitWords);
  addEventListener('resize', fitWords, { passive: true });
  const loader = document.querySelector('.page-loader');
  if (motionAllowed() && !sessionStorage.getItem('interex-preview-seen')) {
    loader.classList.add('is-loading');
    const start = performance.now();
    function loadTick(now) {
      const p = clamp((now - start) / 1400);
      loader.querySelector('[data-loader-counter]').textContent = String(Math.round(p * 100));
      loader.querySelector('.loader-word').style.clipPath = 'inset(0 ' + (100 - p * 100) + '% 0 0)';
      if (p < 1) requestAnimationFrame(loadTick);
      else { loader.classList.remove('is-loading'); sessionStorage.setItem('interex-preview-seen', '1'); }
    }
    requestAnimationFrame(loadTick);
  }
  const work = document.querySelector('.work-content');
  if (work) {
    document.querySelector('.work-controls').hidden = false;
    document.querySelectorAll('[data-work-view]').forEach(button => {
      button.addEventListener('click', () => {
        work.classList.toggle('is-list', button.dataset.workView === 'list');
        document.querySelectorAll('[data-work-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      });
    });
  }
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('.html') || url.pathname === location.pathname || !motionAllowed()) return;
    event.preventDefault();
    document.querySelector('.page-curtain').classList.add('is-active');
    setTimeout(() => { location.href = url.href; }, 340);
  });
  addEventListener('pageshow', () => document.querySelector('.page-curtain').classList.remove('is-active'));
})();

// Fit the temporary entry wordmark to this studio's actual name.
document.fonts.ready.then(() => { const word=document.querySelector('.loader-word'); if(!word)return; const range=document.createRange(); range.selectNodeContents(word); word.style.fontSize='100px'; const width=range.getBoundingClientRect().width; word.style.fontSize=(100*word.clientWidth/Math.max(width,1))+'px'; });
