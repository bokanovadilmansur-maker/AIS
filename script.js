(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const i18n = window.AIS_I18N;
  const WA = 'https://wa.me/77474662973';

  /* Language-dependent links */
  const waConsult = document.getElementById('wa-consult');
  const syncLang = () => { waConsult.href = WA + '?text=' + encodeURIComponent(i18n.t('wa.consult')); };
  syncLang();
  i18n.onChange(syncLang);
  const hasIO = 'IntersectionObserver' in window;

  /* Header shadow */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', i18n.t(open ? 'aria.menuClose' : 'aria.menuOpen'));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Hero typewriter — как на ais.edu.kz: BEYOND THE LIMITS / EDUCATION */
  const typed = document.getElementById('typed');
  const words = ['limits', 'education'];
  if (!reduce && typed) {
    let w = 0, i = words[0].length, deleting = true;
    const step = () => {
      if (deleting) {
        i--;
        typed.textContent = words[w].slice(0, i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; }
        setTimeout(step, 55);
      } else {
        i++;
        typed.textContent = words[w].slice(0, i);
        if (i === words[w].length) { deleting = true; setTimeout(step, 2600); }
        else setTimeout(step, 95);
      }
    };
    setTimeout(step, 2600);
  }

  /* Reveal */
  const reveals = document.querySelectorAll('.reveal');
  if (hasIO && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* Count-up */
  if (hasIO && !reduce) {
    const co = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, target = +el.dataset.count, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach((el) => co.observe(el));
  }

  /* Clubs carousel buttons */
  const clubs = document.getElementById('clubs');
  document.querySelectorAll('.clubs__nav .round').forEach((b) =>
    b.addEventListener('click', () => {
      const card = clubs.querySelector('.club');
      clubs.scrollBy({ left: +b.dataset.dir * (card.offsetWidth + 16) * 2, behavior: reduce ? 'auto' : 'smooth' });
    }));

  /* Active nav item */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  if (hasIO) {
    const so = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle('is-current', l.hash === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach((l) => { const s = document.querySelector(l.hash); if (s) so.observe(s); });
  }

  /* Phone mask +7 (XXX) XXX-XX-XX */
  const phone = document.getElementById('f-phone');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d && d[0] !== '7') d = '7' + d;
    const p = d.slice(1, 11);
    let out = d ? '+7' : '';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    phone.value = out;
  });

  /* Form → WhatsApp приёмной комиссии (работает без сервера) */
  const form = document.getElementById('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rules = { name: (v) => v.trim().length >= 2, phone: (v) => v.replace(/\D/g, '').length === 11, grade: (v) => !!v };
    let first = null;
    Object.entries(rules).forEach(([name, ok]) => {
      const el = form.elements[name];
      const valid = ok(el.value);
      el.closest('.field').classList.toggle('is-invalid', !valid);
      el.setAttribute('aria-invalid', String(!valid));
      if (!valid && !first) first = el;
    });
    if (first) return first.focus();
    const msg = i18n.t('wa.form', {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value,
      grade: form.elements.grade.selectedOptions[0].textContent.trim(),
    });
    window.open(WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
