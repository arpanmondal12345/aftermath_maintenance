/* =========================================================
   Aftermath Maintenance — script.js
   ========================================================= */

/* ---------------------------------------------------------
   SITE SETTINGS — edit these values
   --------------------------------------------------------- */
const SITE_CONFIG = {
  phoneDisplay: '+248 2 544 722',
  phoneLink: '+2482544722',
  email: 'aftermathmaintenance140@gmail.com',

  // WhatsApp: keep false until the business confirms this number is on WhatsApp.
  // When true, a WhatsApp button appears in the Contact section and bottom-right corner.
  whatsappEnabled: false,
  whatsappNumber: '2482544722', // international format, digits only, no "+"
  whatsappMessage: 'Hello Aftermath Maintenance, I would like to enquire about a construction or renovation project in Seychelles.',

  // Form backend: leave empty for demo mode (nothing is sent; the visitor is
  // offered an email/phone fallback). Paste a Formspree / Getform / Basin endpoint
  // URL here to deliver real enquiries, e.g. 'https://formspree.io/f/abcdwxyz'
  formEndpoint: ''
};

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow + back-to-top ---------- */
  const header = $('#siteHeader');
  const toTop = $('#backToTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    toTop.classList.toggle('is-visible', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    $('.brand').focus({ preventScroll: true });
  });

  /* ---------- Mobile navigation ---------- */
  const navToggle = $('#navToggle');
  const nav = $('#primaryNav');
  const mq = window.matchMedia('(max-width: 960px)');

  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', open);
    if (open) { const first = $('a', nav); first && first.focus(); }
  };
  navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => { if (mq.matches) setNav(false); }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
  });
  mq.addEventListener('change', (e) => { if (!e.matches) setNav(false); });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = $$('.nav-link');
  const sections = navLinks.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => {
            const on = l.getAttribute('href') === '#' + entry.target.id;
            l.classList.toggle('is-active', on);
            on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el, i) => {
      // small stagger for siblings in the same grid
      const siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 90, 360) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Quote links: pre-select service + focus form ---------- */
  const serviceSelect = $('#fService');
  $$('[data-quote]').forEach(link => {
    link.addEventListener('click', () => {
      const svc = link.dataset.service;
      if (svc && serviceSelect) {
        const opt = Array.from(serviceSelect.options).find(o => o.text.startsWith(svc));
        if (opt) { serviceSelect.value = opt.value || opt.text; clearError(serviceSelect); }
      }
      // focus first empty field after the scroll finishes
      setTimeout(() => {
        const form = $('#quoteForm');
        if (form && !form.hidden) {
          const firstEmpty = $$('input[required], select[required], textarea[required]', form).find(f => !f.value.trim());
          (firstEmpty || $('#fName')).focus({ preventScroll: true });
        }
      }, reduceMotion ? 50 : 700);
    });
  });

  /* ---------- Gallery filter ---------- */
  const filters = $$('.filter');
  const items = $$('.g-item');
  const emptyMsg = $('#galleryEmpty');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
      let shown = 0;
      items.forEach(item => {
        const match = f === 'all' || item.dataset.cat.split(' ').includes(f);
        item.hidden = !match;
        if (match) {
          shown++;
          item.style.animation = 'none'; void item.offsetWidth; item.style.animation = '';
        }
      });
      emptyMsg.hidden = shown > 0;
    });
  });

  /* ---------- Lightbox (project-grouped) ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCaption = $('#lbCaption');
  const lbLabel = $('#lbLabel');
  const lbCount = $('#lbCount');
  const lbThumbs = $('#lbThumbs');
  let seq = [];        // flat list of photos across visible projects
  let current = 0;
  let lastFocus = null;
  let thumbProject = null;

  const buildSequence = () => {
    seq = [];
    items.filter(i => !i.hidden).forEach(item => {
      const btn = $('.g-btn', item);
      const photos = JSON.parse(btn.dataset.photos);
      photos.forEach((p, i) => seq.push({ ...p, project: btn.dataset.title.replace(/&amp;/g, '&'), btn, index: i, total: photos.length, photos }));
    });
  };

  const renderThumbs = (entry) => {
    if (thumbProject === entry.btn) return;
    thumbProject = entry.btn;
    lbThumbs.innerHTML = '';
    lbThumbs.hidden = entry.total < 2;
    entry.photos.forEach((p, i) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.setAttribute('aria-label', `Photo ${i + 1}: ${p.caption}`);
      t.innerHTML = `<img src="${p.src}" alt="" loading="lazy">`;
      t.addEventListener('click', () => show(seq.findIndex(s => s.btn === entry.btn && s.index === i)));
      lbThumbs.appendChild(t);
    });
  };

  const show = (idx) => {
    current = (idx + seq.length) % seq.length;
    const e = seq[current];
    lbImg.src = e.src;
    lbImg.alt = e.alt;
    lbLabel.textContent = `${e.project} · ${e.status}`;
    lbCaption.textContent = e.caption;
    lbCount.textContent = e.total > 1 ? `Photo ${e.index + 1} of ${e.total}` : '';
    renderThumbs(e);
    $$('button', lbThumbs).forEach((t, i) => {
      const on = i === e.index;
      t.setAttribute('aria-current', String(on));
      if (on) t.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
    [1, -1].forEach(d => { const n = seq[(current + d + seq.length) % seq.length]; if (n) { const p = new Image(); p.src = n.src; } });
  };

  const openLb = (btn) => {
    buildSequence();
    thumbProject = null;
    lastFocus = btn;
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    show(seq.findIndex(s => s.btn === btn));
    $('.lb-close', lb).focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('no-scroll');
    lastFocus && lastFocus.focus();
  };

  $$('.g-btn').forEach(btn => btn.addEventListener('click', () => openLb(btn)));
  $$('[data-close]', lb).forEach(el => el.addEventListener('click', closeLb));
  $('#lbPrev').addEventListener('click', () => show(current - 1));
  $('#lbNext').addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      const focusables = $$('button', lb).filter(b => b.offsetParent !== null);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe support
  let touchX = null, touchY = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    touchX = touchY = null;
  }, { passive: true });

  /* ---------- WhatsApp (only when confirmed) ---------- */
  if (SITE_CONFIG.whatsappEnabled && SITE_CONFIG.whatsappNumber) {
    const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;
    ['#whatsappInline', '#whatsappFab'].forEach(sel => { const el = $(sel); if (el) { el.href = waUrl; el.hidden = false; } });
  }

  /* ---------- Contact form ---------- */
  const form = $('#quoteForm');
  const result = $('#formResult');
  const submitBtn = $('#submitBtn');

  const rules = {
    fName:     v => v.trim().length >= 2 || 'Please enter your full name.',
    fEmail:    v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || (v.trim() ? 'Please enter a valid email address, e.g. name@example.com.' : 'Please enter your email address.'),
    fPhone:    v => {
      const digits = v.replace(/[^\d]/g, '');
      if (!v.trim()) return 'Please enter a phone number so we can reach you.';
      return (digits.length >= 7 && digits.length <= 15 && /^[+\d\s().-]+$/.test(v.trim())) || 'Please enter a valid phone number (digits, spaces and + only).';
    },
    fService:  v => !!v || 'Please choose the service you need.',
    fLocation: v => v.trim().length >= 2 || 'Please tell us where the project is located.',
    fMessage:  v => v.trim().length >= 15 || (v.trim() ? 'Please add a little more detail (at least 15 characters).' : 'Please describe your project.')
  };

  function setError(field, msg) {
    const wrap = field.closest('.field');
    const err = $('#' + field.id + '-err');
    wrap.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    if (err) err.textContent = msg;
  }
  function clearError(field) {
    const wrap = field.closest('.field');
    const err = $('#' + field.id + '-err');
    wrap && wrap.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    if (err) err.textContent = '';
  }
  function validate(field) {
    const rule = rules[field.id];
    if (!rule) return true;
    const res = rule(field.value);
    if (res === true) { clearError(field); return true; }
    setError(field, res); return false;
  }

  Object.keys(rules).forEach(id => {
    const f = $('#' + id);
    f.addEventListener('blur', () => { if (f.value || f.closest('.field').classList.contains('has-error')) validate(f); });
    f.addEventListener('input', () => { if (f.closest('.field').classList.contains('has-error')) validate(f); });
    f.addEventListener('change', () => { if (f.closest('.field').classList.contains('has-error')) validate(f); });
  });

  const buildMailto = (data) => {
    const body =
`Hello Aftermath Maintenance,

I would like to request a quote.

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.service}
Location: ${data.location}
Budget: ${data.budget || 'Not specified'}

Project description:
${data.message}`;
    return `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent('Quote request – ' + data.service)}&body=${encodeURIComponent(body)}`;
  };

  const showResult = (type, data) => {
    const title = $('#resultTitle');
    const text = $('#resultText');
    const mailBtn = $('#mailtoBtn');
    mailBtn.href = buildMailto(data);
    if (type === 'success') {
      result.classList.add('is-success');
      title.textContent = 'Thank you — your enquiry has been sent';
      text.textContent = 'Aftermath Maintenance has received your details and will be in touch. For anything urgent, please call us.';
      mailBtn.hidden = true;
    } else if (type === 'error') {
      result.classList.remove('is-success');
      title.textContent = 'Sorry — your enquiry could not be sent';
      text.textContent = 'Something went wrong while sending the form. Your details have not been delivered. Please email or call us instead.';
      mailBtn.hidden = false;
    } else {
      result.classList.remove('is-success');
      title.textContent = 'Demo mode — enquiry not sent';
      text.innerHTML = 'This form is not yet connected to an email service, so your details have <strong>not</strong> been delivered. Use “Send via Email App” to send them with everything pre-filled, or call us directly.';
      mailBtn.hidden = false;
    }
    form.hidden = true;
    result.hidden = false;
    result.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Object.keys(rules).map(id => $('#' + id));
    const invalid = fields.filter(f => !validate(f));
    if (invalid.length) { invalid[0].focus(); return; }
    if (form._gotcha && form._gotcha.value) return; // bot

    const data = Object.fromEntries(new FormData(form).entries());
    delete data._gotcha;

    if (!SITE_CONFIG.formEndpoint) { showResult('demo', data); return; }

    submitBtn.disabled = true;
    const label = submitBtn.innerHTML;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch(SITE_CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _subject: 'New quote request – ' + data.service })
      });
      showResult(res.ok ? 'success' : 'error', data);
      if (res.ok) form.reset();
    } catch (err) {
      showResult('error', data);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = label;
    }
  });

  $('#resetForm').addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    $('#fName').focus();
  });
});
