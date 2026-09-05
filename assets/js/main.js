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


/* =========================================================
   MASTHEAD (Phase 2) – Dropdowns, Mobile-Drawer, PLZ-Finder
   Eigenständig & defensiv: läuft nur, wenn die neuen
   Elemente auf der Seite existieren (Rollout-sicher).
   ========================================================= */
(function () {
  'use strict';

  /* --- Desktop-Dropdowns: Klick-Toggle (Hover via CSS) ------- */
  const dropItems = document.querySelectorAll('.mainnav__item--drop');
  function closeAllDrops() {
    dropItems.forEach(function (i) {
      i.classList.remove('open');
      const t = i.querySelector('.mainnav__trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
  dropItems.forEach(function (item) {
    const trigger = item.querySelector('.mainnav__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      const isOpen = item.classList.contains('open');
      closeAllDrops();
      if (!isOpen) { item.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
    });
  });
  if (dropItems.length) {
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.mainnav__item--drop')) closeAllDrops();
    });
  }

  /* --- Mobile Drawer ----------------------------------------- */
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('drawerClose');

  if (burger && drawer && overlay) {
    const openDrawer = function () {
      drawer.classList.add('open'); overlay.classList.add('open');
      burger.classList.add('open'); burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = function () {
      drawer.classList.remove('open'); overlay.classList.remove('open');
      burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', function () {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    /* Drawer-Accordion */
    drawer.querySelectorAll('.drawer__grouptop').forEach(function (top) {
      top.addEventListener('click', function () {
        const group = top.closest('.drawer__group');
        const open = group.classList.toggle('open');
        top.setAttribute('aria-expanded', String(open));
      });
    });
    /* Direktlinks schließen das Menü */
    drawer.querySelectorAll('.drawer__sub a, .drawer__single, .drawer__cta a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDrawer(); closeAllDrops();
      }
    });
  }
})();


/* =========================================================
   MULTI-STEP LEAD-FUNNEL (Phase 4) – "#leadFunnel"
   Frontend-State-Management, voll durchklickbar.
   ========================================================= */
(function () {
  'use strict';

  const funnel = document.getElementById('leadFunnel');
  if (!funnel) return;

  const TOTAL = 4;
  const form     = funnel.querySelector('.js-funnel-form');
  const steps    = Array.from(funnel.querySelectorAll('.funnel__step'));
  const fill     = document.getElementById('funnelFill');
  const stepNum  = document.getElementById('funnelStepNum');
  const pct      = document.getElementById('funnelPct');
  const backBtn  = funnel.querySelector('.funnel__back');
  const nextBtn  = funnel.querySelector('.funnel__next');
  const submitBtn= funnel.querySelector('.funnel__submit');
  const errBox   = funnel.querySelector('.funnel__err');
  const progress = document.getElementById('funnelProgress');
  const success  = document.getElementById('funnelSuccess');
  const summary  = document.getElementById('funnelSummary');

  const state = { rolle: '', status: '', gebaeudetyp: '', flaeche: '' };
  let current = 1;

  /* --- Option-Auswahl (Single-Select je data-field) --------- */
  funnel.querySelectorAll('.funnel__options').forEach(function (group) {
    const field = group.dataset.field;
    group.querySelectorAll('.funnel-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.funnel-opt').forEach(function (o) { o.classList.remove('is-selected'); o.setAttribute('aria-pressed', 'false'); });
        opt.classList.add('is-selected');
        opt.setAttribute('aria-pressed', 'true');
        state[field] = opt.dataset.value;
        clearError();
        /* Flüssiger Auto-Vorlauf bei reinen Auswahl-Schritten (1 & 2) */
        if (current === 1 || current === 2) {
          const at = current;
          setTimeout(function () { if (current === at) goNext(); }, 260);
        }
      });
    });
  });

  /* --- Datei-Auswahl / Drag&Drop ---------------------------- */
  const fileInput = document.getElementById('funnelFile');
  const fileName  = document.getElementById('funnelFileName');
  const dropzone  = funnel.querySelector('.funnel__upload');
  if (fileInput && fileName) {
    fileInput.addEventListener('change', function () {
      fileName.textContent = fileInput.files.length ? fileInput.files[0].name : 'Datei auswählen oder hierher ziehen';
    });
  }
  if (dropzone && fileInput) {
    ['dragover', 'dragenter'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.style.borderColor = ''; });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileName.textContent = e.dataTransfer.files[0].name;
      }
    });
  }

  /* --- Navigation ------------------------------------------- */
  function render() {
    steps.forEach(function (s) { s.classList.toggle('is-active', Number(s.dataset.step) === current); });
    fill.style.width = (current / TOTAL * 100) + '%';
    stepNum.textContent = current;
    pct.textContent = Math.round(current / TOTAL * 100) + ' %';
    backBtn.hidden = current === 1;
    nextBtn.hidden = current === TOTAL;
    submitBtn.hidden = current !== TOTAL;
  }

  function validateStep(step) {
    if (step === 1 && !state.rolle)        return 'Bitte wählen Sie Ihre Rolle aus.';
    if (step === 2 && !state.status)       return 'Bitte wählen Sie den Projektstatus aus.';
    if (step === 3 && !state.gebaeudetyp)  return 'Bitte wählen Sie einen Gebäudetyp aus.';
    return '';
  }

  function goNext() {
    const msg = validateStep(current);
    if (msg) { showError(msg); return; }
    if (current < TOTAL) { current++; render(); scrollToTop(); }
  }
  function goBack() {
    if (current > 1) { current--; clearError(); render(); scrollToTop(); }
  }
  function scrollToTop() {
    const top = funnel.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }

  function showError(msg) {
    if (!errBox) return;
    errBox.textContent = '⚠️ ' + msg;
    errBox.style.display = 'block';
  }
  function clearError() { if (errBox) errBox.style.display = 'none'; }

  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', goBack);

  /* --- Abschluss -------------------------------------------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name  = (document.getElementById('funnelName').value || '').trim();
    const firma = (document.getElementById('funnelFirma').value || '').trim();
    const email = (document.getElementById('funnelEmail').value || '').trim();
    const tel   = (document.getElementById('funnelTel').value || '').trim();
    const dsgvo = document.getElementById('funnelDsgvo');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    let msg = '';
    if (!name)               msg = 'Bitte geben Sie Ihren Namen an.';
    else if (!firma)         msg = 'Bitte geben Sie Ihre Firma an.';
    else if (!emailOk)       msg = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
    else if (dsgvo && !dsgvo.checked) msg = 'Bitte bestätigen Sie die Datenschutzerklärung.';
    if (msg) { showError(msg); return; }

    state.flaeche = (document.getElementById('funnelFlaeche') || {}).value || '';

    /* Versand best-effort an den bestehenden Webhook (nicht blockierend) */
    try {
      fetch(CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typ: 'projekt-funnel',
          rolle: state.rolle, status: state.status,
          gebaeudetyp: state.gebaeudetyp, flaeche: state.flaeche,
          name: name, firma: firma, email: email, telefon: tel,
          seite: window.location.href
        })
      }).catch(function () {});
    } catch (err) { /* offline / kein Endpoint – Erfolgsansicht trotzdem zeigen */ }

    /* Zusammenfassung als Badges */
    if (summary) {
      const chips = [state.rolle, state.status, state.gebaeudetyp, state.flaeche ? state.flaeche + ' m²' : '']
        .filter(Boolean)
        .map(function (v) { return '<span class="badge">' + v + '</span>'; }).join('');
      summary.innerHTML = chips;
    }

    if (form) form.style.display = 'none';
    if (progress) progress.style.display = 'none';
    if (success) success.classList.add('is-active');
    scrollToTop();
  });

  render();
})();


/* =========================================================
   ZIELGRUPPEN-ROUTER (Phase 5) – Tabbed Interface "#zgRouter"
   ========================================================= */
(function () {
  'use strict';
  const router = document.getElementById('zgRouter');
  if (!router) return;

  const tabs   = Array.from(router.querySelectorAll('.zg-tab'));
  const panels = Array.from(router.querySelectorAll('.zg-panel'));

  function activate(id) {
    tabs.forEach(function (t) {
      const on = t.dataset.panel === id;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    panels.forEach(function (p) {
      const on = p.id === id;
      p.classList.toggle('is-active', on);
      if (on) { p.removeAttribute('hidden'); } else { p.setAttribute('hidden', ''); }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activate(tab.dataset.panel); });
  });
})();
