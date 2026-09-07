/* =========================================================
   BESCom Elektronik GmbH – main.js
   Vanilla JS – kein jQuery, kein Framework
   ========================================================= */

/* =========================================================
   LEAD-ENDPOINT (zentral) – GoHighLevel (GHL)
   ---------------------------------------------------------
   Ziel-URL für ALLE Lead-Kanäle:
     • Projekt-Funnel (Startseite)
     • Normen-Check → Funnel-Übergabe
     • PDF-Lead-Magnet-Modal
     • Rückruf-/Exit-Intent-Modal
   TODO(GHL): Sobald das GoHighLevel-Formular/Webhook live ist,
   hier die Inbound-Webhook-URL eintragen. Bis dahin Platzhalter –
   Downloads/Interaktionen funktionieren, Lead-Daten werden noch
   NICHT zugestellt.
   ========================================================= */
const CONTACT_WEBHOOK_URL = 'https://n8n-ujih.srv1675981.hstgr.cloud/webhook/bescom-lead';

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
            typ: 'kontakt',
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

  /* --- Öffentliche API: Vorbefüllung aus dem Normen-Check ---- */
  function selectOption(field, value) {
    const group = funnel.querySelector('.funnel__options[data-field="' + field + '"]');
    if (!group) return;
    group.querySelectorAll('.funnel-opt').forEach(function (o) {
      const on = o.dataset.value === value;
      o.classList.toggle('is-selected', on);
      o.setAttribute('aria-pressed', String(on));
    });
  }
  window.LeadFunnel = {
    prefill: function (data) {
      data = data || {};
      if (data.gebaeudetyp) { state.gebaeudetyp = data.gebaeudetyp; selectOption('gebaeudetyp', data.gebaeudetyp); }
      if (data.status)      { state.status = data.status; selectOption('status', data.status); }
      if (data.flaeche) {
        state.flaeche = data.flaeche;
        const f = document.getElementById('funnelFlaeche');
        if (f) f.value = data.flaeche;
      }
      /* Direkt zum Kontakt-Schritt springen – Qualifizierung ist erledigt */
      current = TOTAL;
      clearError();
      render();
    }
  };

  render();
})();


/* =========================================================
   NORMEN- & PFLICHTEN-CHECK (Vorschlag 1) – "#normCheck"
   3-Schritt-Self-Qualifier mit Sofort-Verdict + Funnel-Handoff
   ========================================================= */
(function () {
  'use strict';

  const nc = document.getElementById('normCheck');
  if (!nc) return;

  const TOTAL   = 3;
  const form    = nc.querySelector('.js-normcheck-form');
  const steps   = Array.from(nc.querySelectorAll('.normcheck__step'));
  const fill    = document.getElementById('normFill');
  const stepNum = document.getElementById('normStepNum');
  const pct     = document.getElementById('normPct');
  const backBtn = nc.querySelector('.normcheck__back');
  const nextBtn = nc.querySelector('.normcheck__next');
  const errBox  = nc.querySelector('.normcheck__err');
  const progress= document.getElementById('normProgress');
  const result  = document.getElementById('normResult');

  const state = { typ: '', bgf: '', ug: '', phase: '' };
  let current = 1;

  /* --- Auswahl (Cards + Toggle, Single-Select je data-field) - */
  nc.querySelectorAll('[data-field]').forEach(function (group) {
    const field = group.dataset.field;
    group.querySelectorAll('.normcheck-opt, .normcheck-toggle').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.normcheck-opt, .normcheck-toggle').forEach(function (o) {
          o.classList.remove('is-selected'); o.setAttribute('aria-checked', 'false');
        });
        opt.classList.add('is-selected'); opt.setAttribute('aria-checked', 'true');
        state[field] = opt.dataset.value;
        clearError();
        /* Auto-Vorlauf nur bei den reinen Card-Schritten 1 & 3 */
        if (current === 1) {
          const at = current;
          setTimeout(function () { if (current === at) goNext(); }, 240);
        }
      });
    });
  });

  /* --- Navigation ------------------------------------------- */
  function render() {
    steps.forEach(function (s) { s.classList.toggle('is-active', Number(s.dataset.step) === current); });
    fill.style.width = (current / TOTAL * 100) + '%';
    stepNum.textContent = current;
    pct.textContent = Math.round(current / TOTAL * 100) + ' %';
    backBtn.hidden = current === 1;
    nextBtn.textContent = current === TOTAL ? 'Ergebnis anzeigen →' : 'Weiter →';
  }

  function validateStep(step) {
    if (step === 1 && !state.typ)   return 'Bitte wählen Sie einen Gebäudetyp aus.';
    if (step === 2 && !state.bgf)   return 'Bitte wählen Sie die Bruttogeschossfläche aus.';
    if (step === 2 && !state.ug)    return 'Bitte geben Sie an, ob Untergeschosse vorhanden sind.';
    if (step === 3 && !state.phase) return 'Bitte wählen Sie die Projektphase aus.';
    return '';
  }

  function goNext() {
    const msg = validateStep(current);
    if (msg) { showError(msg); return; }
    if (current < TOTAL) { current++; render(); scrollToTop(); }
    else { showResult(); }
  }
  function goBack() { if (current > 1) { current--; clearError(); render(); scrollToTop(); } }
  function scrollToTop() {
    const top = nc.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }
  function showError(msg) { if (errBox) { errBox.textContent = '⚠️ ' + msg; errBox.style.display = 'block'; } }
  function clearError() { if (errBox) errBox.style.display = 'none'; }

  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', goBack);

  /* --- Ergebnis-Logik (transparentes Scoring) --------------- */
  function computeVerdict() {
    /* Sonderfall: Die anfordernde Stelle fordert zunächst eine Erforderlichkeits-
       messung. Deren Ergebnis entscheidet über die Pflicht UND den Anlagentyp
       (TMO / DMO / TMOa / Anbindung nach Metropol-Konzept). */
    if (state.phase === 'Erforderlichkeitsmessung gefordert') {
      return {
        level: 'high', badge: 'Erforderlichkeitsmessung',
        title: 'Der richtige nächste Schritt ist die Erforderlichkeitsmessung.',
        text: 'Die anfordernde Stelle (Feuerwehr / Brandschutzdienststelle) entscheidet anhand der Messergebnisse, ob – und in welcher Ausführung (TMO, DMO, TMOa oder Anbindung nach dem Metropol-Konzept) – eine BOS-Objektfunkanlage erforderlich ist. Wir führen die Messung durch und liefern Ihnen den prüffähigen Nachweis zur Vorlage bei der Behörde.'
      };
    }
    let score = 0;
    if (state.typ === 'Klinik / Pflegeheim')        score += 3;
    if (state.typ === 'Tiefgarage / Unterniveau')   score += 3;
    if (state.typ === 'Logistik / Industrie')       score += 2;
    if (state.typ === 'Büro / Verkaufsstätte / Sonderbau') score += 1;
    if (state.ug === 'Ja')                           score += 2;
    if (state.bgf === '> 10.000 m²')                 score += 2;
    else if (state.bgf === '2.000–10.000 m²')        score += 1;
    if (state.phase === 'Behördliche Auflage / Brandschutzkonzept liegt vor') score += 3;

    if (score >= 5 || state.phase === 'Behördliche Auflage / Brandschutzkonzept liegt vor') {
      return {
        level: 'high', badge: 'Hohe Wahrscheinlichkeit',
        title: 'Hohe Wahrscheinlichkeit für eine DIN-14024-Pflicht & ein BDBOS-Anzeigeverfahren.',
        text: 'Ihre Angaben deuten stark auf eine Objektfunk-Pflicht hin. Wir empfehlen eine frühzeitige HF-Fachplanung, um Bauverzögerungen und Nachträge zu vermeiden.'
      };
    }
    if (score >= 3) {
      return {
        level: 'mid', badge: 'Wahrscheinlich',
        title: 'Eine Objektfunkanlage ist wahrscheinlich – abhängig vom Brandschutzkonzept.',
        text: 'Ob eine Pflicht besteht, hängt vom konkreten Brandschutzkonzept und der Einschätzung der Behörde ab. Eine fachliche Prüfung schafft schnell Klarheit.'
      };
    }
    return {
      level: 'low', badge: 'Einzelfallprüfung',
      title: 'Keine pauschale Pflicht erkennbar – eine Einzelfallprüfung wird empfohlen.',
      text: 'Auf Basis Ihrer Angaben ist keine eindeutige Pflicht ableitbar. Die tatsächliche Anforderung ergibt sich aus dem Brandschutzkonzept und der Bauaufsicht.'
    };
  }

  /* Mapping Normen-Check → Lead-Funnel */
  const TYP_MAP = {
    'Klinik / Pflegeheim': 'Sonderbau/Klinik',
    'Tiefgarage / Unterniveau': 'Tiefgarage',
    'Logistik / Industrie': 'Industrie/Mall',
    'Büro / Verkaufsstätte / Sonderbau': 'Gewerbe'
  };
  const PHASE_MAP = {
    'Erforderlichkeitsmessung gefordert': 'Planung/Ausschreibung läuft',
    'Behördliche Auflage / Brandschutzkonzept liegt vor': 'Auflagenbescheid liegt vor',
    'Entwurfs-/Genehmigungsplanung (HOAI 1–3)': 'Planung/Ausschreibung läuft',
    'Bestandsobjekt / Prüfung / Anbieterwechsel': 'Bestandsanlage/Wartung'
  };
  const BGF_MAP = { '< 2.000 m²': '1500', '2.000–10.000 m²': '6000', '> 10.000 m²': '12000' };

  function showResult() {
    const v = computeVerdict();
    result.className = 'normcheck__result is-active normcheck__result--' + v.level;
    document.getElementById('normVerdictBadge').textContent = v.badge;
    document.getElementById('normVerdictTitle').textContent = v.title;
    document.getElementById('normVerdictText').textContent = v.text;

    const chips = [state.typ, state.bgf, state.ug === 'Ja' ? 'Mit Untergeschoss' : 'Ohne Untergeschoss', state.phase]
      .filter(Boolean)
      .map(function (t) { return '<span class="badge">' + t + '</span>'; }).join('');
    document.getElementById('normSummary').innerHTML = chips;

    if (form) form.style.display = 'none';
    if (progress) progress.style.display = 'none';
    scrollToTop();
  }

  /* --- CTA: Übergabe an den Lead-Funnel --------------------- */
  document.getElementById('normCta').addEventListener('click', function () {
    if (window.LeadFunnel && typeof window.LeadFunnel.prefill === 'function') {
      window.LeadFunnel.prefill({
        gebaeudetyp: TYP_MAP[state.typ] || '',
        status: PHASE_MAP[state.phase] || '',
        flaeche: BGF_MAP[state.bgf] || ''
      });
    }
    const target = document.getElementById('projekt-funnel');
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  /* --- Neustart --------------------------------------------- */
  document.getElementById('normRestart').addEventListener('click', function () {
    state.typ = state.bgf = state.ug = state.phase = '';
    nc.querySelectorAll('.is-selected').forEach(function (o) { o.classList.remove('is-selected'); o.setAttribute('aria-checked', 'false'); });
    result.className = 'normcheck__result';
    if (form) form.style.display = '';
    if (progress) progress.style.display = '';
    current = 1; clearError(); render(); scrollToTop();
  });

  render();
})();


/* =========================================================
   LEAD-MAGNET DOWNLOADS (Vorschlag 2) – "[data-leadmagnet]"
   Delegierter Trigger → barrierefreies Modal → Webhook →
   sofortiger PDF-Download. Rollout-sicher (nur wenn Trigger da).
   ========================================================= */
(function () {
  'use strict';
  const triggers = document.querySelectorAll('[data-leadmagnet]');
  if (!triggers.length) return;

  let lastFocus = null;

  function buildModal(data) {
    const overlay = document.createElement('div');
    overlay.className = 'lm-modal-overlay';
    overlay.innerHTML =
      '<div class="lm-modal" role="dialog" aria-modal="true" aria-labelledby="lmTitle">' +
      '  <button class="lm-modal__close" aria-label="Schließen" type="button">✕</button>' +
      '  <span class="lm-modal__eyebrow">Kostenloser Fach-Download</span>' +
      '  <h3 id="lmTitle">' + data.title + '</h3>' +
      '  <p class="lm-modal__sub">Bitte hinterlassen Sie kurz Ihre Kontaktdaten – Sie erhalten den Download sofort.</p>' +
      '  <form class="lm-modal__form" novalidate>' +
      '    <div class="lm-modal__row">' +
      '      <div><label>Vorname <sup>*</sup></label><input type="text" name="vorname" autocomplete="given-name"></div>' +
      '      <div><label>Nachname <sup>*</sup></label><input type="text" name="nachname" autocomplete="family-name"></div>' +
      '    </div>' +
      '    <label>Geschäftliche E-Mail <sup>*</sup></label>' +
      '    <input type="email" name="email" autocomplete="email" placeholder="name@firma.de">' +
      '    <label>Firma <span class="lm-opt">(optional)</span></label>' +
      '    <input type="text" name="firma" autocomplete="organization" placeholder="Unternehmen">' +
      '    <label class="lm-modal__check"><input type="checkbox" name="dsgvo"> <span>Ich stimme der Kontaktaufnahme gemäß <a href="' + data.dspath + '" target="_blank" rel="noopener">Datenschutzerklärung</a> zu. <sup>*</sup></span></label>' +
      '    <p class="lm-modal__err" role="alert" style="display:none;"></p>' +
      '    <button type="submit" class="btn btn--primary lm-modal__submit">' + data.cta + '</button>' +
      '  </form>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const box = overlay.querySelector('.lm-modal');
    const form = overlay.querySelector('.lm-modal__form');
    const err = overlay.querySelector('.lm-modal__err');

    function close() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = box.querySelectorAll('button, input, a[href]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.lm-modal__close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    setTimeout(() => { const i = form.querySelector('input'); if (i) i.focus(); }, 30);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const vorname = form.vorname.value.trim();
      const nachname = form.nachname.value.trim();
      const email = form.email.value.trim();
      const firma = form.firma.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      let msg = '';
      if (!vorname || !nachname) msg = 'Bitte geben Sie Vor- und Nachnamen an.';
      else if (!emailOk) msg = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
      else if (!form.dsgvo.checked) msg = 'Bitte bestätigen Sie die Datenschutzerklärung.';
      if (msg) { err.textContent = '⚠️ ' + msg; err.style.display = 'block'; return; }

      /* Best-effort-Versand ans bestehende Lead-Handling */
      try {
        fetch(CONTACT_WEBHOOK_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            typ: 'lead-magnet', magnet: data.id,
            vorname, nachname, email, firma, seite: window.location.href
          })
        }).catch(function () {});
      } catch (e2) { /* offline – Download trotzdem anzeigen */ }

      box.innerHTML =
        '<button class="lm-modal__close" aria-label="Schließen" type="button">✕</button>' +
        '<div class="lm-modal__success">' +
        '  <div class="lm-modal__check-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></div>' +
        '  <h3>Vielen Dank!</h3>' +
        '  <p>Ihr Download steht bereit. Ein Objektfunk-Ingenieur meldet sich bei Rückfragen innerhalb von 24 Stunden.</p>' +
        '  <a href="' + data.pdf + '" class="btn btn--primary" download target="_blank" rel="noopener">' + data.cta + '</a>' +
        '</div>';
      box.querySelector('.lm-modal__close').addEventListener('click', close);
      const dl = box.querySelector('a[download]'); if (dl) dl.focus();
    });
  }

  triggers.forEach(function (t) {
    t.addEventListener('click', function () {
      lastFocus = t;
      buildModal({
        id: t.dataset.leadmagnet,
        title: t.dataset.title || 'Fach-Download',
        cta: t.dataset.cta || 'Jetzt herunterladen (PDF)',
        pdf: t.dataset.pdf,
        dspath: t.dataset.ds || '/datenschutz.html'
      });
    });
  });
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
