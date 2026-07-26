/* =========================================================
   BESCom Elektronik GmbH – main.js
   Vanilla JS – kein jQuery, kein Framework
   ========================================================= */

/* Webhook-Endpoint für das Kontaktformular (n8n) –
   hier die eigene Domain eintragen: */
const KONTAKT_WEBHOOK_URL = 'https://DEINE-N8N-DOMAIN/webhook/kontaktformular';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. STICKY NAV – Klasse beim Scrollen wechseln
     --------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initialzustand
  }

  /* ---------------------------------------------------------
     2. HAMBURGER MENÜ
     --------------------------------------------------------- */
  const toggle   = document.querySelector('.nav__toggle');
  const drawer   = document.querySelector('.nav__drawer');
  const overlay  = document.querySelector('.nav__overlay');

  function openMenu() {
    toggle?.classList.add('open');
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle?.classList.remove('open');
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);

  // Drawer-Links schließen das Menü
  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ESC schließt Menü
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------------------------------------------------
     3. TABS (Landingpages – Planung / Installation / Wartung)
     --------------------------------------------------------- */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');

      // Smooth-Scroll zum Panel-Beginn (optional)
      const panel = document.getElementById(target);
      if (panel) {
        const offset = 130;
        const top = panel.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------------------------------------------------------
     4. ANCHOR-TABS auf Landingpages – Active beim Scrollen
     --------------------------------------------------------- */
  const anchorTabs = document.querySelectorAll('.anchor-tab');

  if (anchorTabs.length) {
    const sections = Array.from(anchorTabs)
      .map(tab => document.querySelector(tab.getAttribute('href')))
      .filter(Boolean);

    const activateTab = () => {
      let current = sections[0];
      sections.forEach(sec => {
        if (window.scrollY + 160 >= sec.offsetTop) current = sec;
      });
      anchorTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('href') === `#${current?.id}`);
      });
    };

    window.addEventListener('scroll', activateTab, { passive: true });
    activateTab();
  }

  /* ---------------------------------------------------------
     5. KONTAKTFORMULAR – POST an Webhook, inline Erfolgsmeldung
     --------------------------------------------------------- */
  document.querySelectorAll('.js-contact-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const data       = new FormData(form);
      const emailInput = form.querySelector('[name="email"]');

      // Validierung: Pflichtfelder + mindestens E-Mail oder Telefon
      emailInput?.setCustomValidity('');
      const hasEmail = (data.get('email')   || '').trim() !== '';
      const hasTel   = (data.get('telefon') || '').trim() !== '';
      if (emailInput && !hasEmail && !hasTel) {
        emailInput.setCustomValidity('Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.');
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const success   = form.querySelector('.form-success');
      const error     = form.querySelector('.form-error');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (success) success.style.display = 'none';
      if (error)   error.style.display   = 'none';
      if (submitBtn) submitBtn.disabled  = true;

      try {
        const res = await fetch(KONTAKT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:      data.get('name')      || '',
            firma:     data.get('firma')     || '',
            telefon:   data.get('telefon')   || '',
            email:     data.get('email')     || '',
            leistung:  data.get('leistung')  || '',
            nachricht: data.get('nachricht') || '',
            quelle:    window.location.href,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        form.reset();
        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (err) {
        if (error) {
          error.style.display = 'block';
          error.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

  /* ---------------------------------------------------------
     6. AOS INITIALISIERUNG
     --------------------------------------------------------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic',
    });
  }

  /* ---------------------------------------------------------
     7. AKTIVE NAV-LINKS hervorheben (aktuelle Seite)
     --------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

});
