/* =========================================================
   BESCom Elektronik GmbH – main.js
   Vanilla JS – kein jQuery, kein Framework
   ========================================================= */

/* Webhook-Endpoint für das Kontaktformular (z.B. n8n) –
   hier die eigene Domain eintragen: */
const CONTACT_WEBHOOK_URL = 'https://DEINE-N8N-DOMAIN/webhook/kontaktformular';

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
      .filter(tab => (tab.getAttribute('href') || '').startsWith('#'))
      .map(tab => document.querySelector(tab.getAttribute('href')))
      .filter(Boolean);

    const activateTab = () => {
      if (!sections.length) return;
      let current = sections[0];
      sections.forEach(sec => {
        if (window.scrollY + 196 >= sec.offsetTop) current = sec;
      });
      anchorTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('href') === `#${current?.id}`);
      });
    };

    window.addEventListener('scroll', activateTab, { passive: true });
    activateTab();
  }

  /* ---------------------------------------------------------
     5. KONTAKTFORMULAR – Versand per fetch() an Webhook
     --------------------------------------------------------- */
  document.querySelectorAll('.js-contact-form').forEach(form => {

    // Fehlermeldung-Element sicherstellen (Fallback mit Telefonnummer)
    let errorBox = form.querySelector('.form-error');
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.className = 'form-error';
      errorBox.setAttribute('role', 'alert');
      errorBox.innerHTML = '⚠️ Ihre Anfrage konnte nicht übermittelt werden. Bitte versuchen Sie es erneut oder rufen Sie uns direkt an: <a href="tel:+4940211191110">040 2111 9111</a>';
      form.appendChild(errorBox);
    }
    const errorDefault = errorBox.innerHTML;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const success = form.querySelector('.form-success');
      if (success) success.style.display = 'none';
      errorBox.style.display = 'none';

      // Pflichtfelder: Name, Firma, E-Mail oder Telefon, Datenschutz
      const data        = new FormData(form);
      const name        = (data.get('name') || '').trim();
      const firma       = (data.get('firma') || '').trim();
      const telefon     = (data.get('telefon') || '').trim();
      const email       = (data.get('email') || '').trim();
      const datenschutz = form.querySelector('input[name="datenschutz"]');

      let hinweis = '';
      if (!name)                       hinweis = 'Bitte geben Sie Ihren Namen an.';
      else if (!firma)                 hinweis = 'Bitte geben Sie Ihre Firma an.';
      else if (!telefon && !email)     hinweis = 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.';
      else if (datenschutz && !datenschutz.checked) hinweis = 'Bitte bestätigen Sie die Datenschutzerklärung.';

      if (hinweis) {
        errorBox.innerHTML = '⚠️ ' + hinweis;
        errorBox.style.display = 'block';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const btnLabel  = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Wird gesendet …';
      }

      try {
        const res = await fetch(CONTACT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            firma,
            telefon,
            email,
            leistung:  data.get('leistung') || '',
            nachricht: data.get('nachricht') || '',
            seite:     window.location.href,
          }),
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
      } catch (err) {
        errorBox.innerHTML = errorDefault;
        errorBox.style.display = 'block';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnLabel;
        }
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


/* =========================================================
   EXIT-INTENT MODAL – Desktop only, 1x pro Session
   ========================================================= */
(function () {
  if (window.innerWidth < 769) return;
  if (sessionStorage.getItem('exitIntentShown')) return;

  function showModal() {
    if (sessionStorage.getItem('exitIntentShown')) return;
    sessionStorage.setItem('exitIntentShown', '1');

    const overlay = document.createElement('div');
    overlay.className = 'exit-modal-overlay';
    overlay.innerHTML =
      '<div class="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">' +
      '  <button class="exit-modal__close" aria-label="Schließen">✕</button>' +
      '  <h3 id="exit-modal-title">Kurze Frage zum Objektfunk?</h3>' +
      '  <p>Hinterlassen Sie Ihre Telefonnummer – ein Ingenieur ruft Sie kostenlos zurück.</p>' +
      '  <form class="exit-modal__form">' +
      '    <input type="tel" name="telefon" placeholder="Ihre Telefonnummer" required autocomplete="tel">' +
      '    <button type="submit" class="btn btn--primary" style="width:100%;">Rückruf anfragen</button>' +
      '  </form>' +
      '  <p class="exit-modal__phone">Oder direkt: <a href="tel:+4940211191110"><strong>040 2111 9111</strong></a></p>' +
      '</div>';
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.exit-modal__close').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });

    overlay.querySelector('.exit-modal__form').addEventListener('submit', async e => {
      e.preventDefault();
      const telefon = e.target.telefon.value.trim();
      if (!telefon) return;
      const box = overlay.querySelector('.exit-modal');
      try {
        await fetch(CONTACT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ typ: 'rueckruf', telefon, seite: window.location.href }),
        });
        box.innerHTML = '<h3>Vielen Dank!</h3><p>Wir rufen Sie schnellstmöglich zurück.</p>';
      } catch (err) {
        box.innerHTML = '<h3>Rufen Sie uns direkt an</h3>' +
          '<p>Die Anfrage konnte nicht übermittelt werden. Sie erreichen uns unter ' +
          '<a href="tel:+4940211191110"><strong>040 2111 9111</strong></a>.</p>';
      }
      setTimeout(close, 4000);
    });
  }

  document.documentElement.addEventListener('mouseleave', e => {
    if (e.clientY <= 0) showModal();
  });
})();
