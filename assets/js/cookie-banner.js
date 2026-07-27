/* =========================================================
   BESCom – Cookie Consent Banner
   Speichert Einwilligung in localStorage und lädt externe
   Dienste (Chat-Widget) erst nach Zustimmung "Externe Medien".
   ========================================================= */

(function () {
  const STORAGE_KEY = 'bescom_cookie_consent';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }

  function saveConsent(statistiken, externeMedien) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        essenziell: true,
        statistiken,
        externeMedien,
        timestamp: Date.now()
      }));
    } catch {
      // localStorage nicht verfügbar (z.B. iOS Private Mode) – Banner trotzdem schließen
    }
  }

  /* Aktiviert alle Skripte, die auf die Einwilligung "Externe Medien"
     warten (z.B. LeadConnector Chat-Widget). Ein blockiertes Template hat
     type="text/plain" data-cookieconsent="externeMedien" und trägt die
     echten Attribute als data-src / data-resources-url / data-widget-id. */
  function loadExterneMedien() {
    const tpls = document.querySelectorAll(
      'script[type="text/plain"][data-cookieconsent="externeMedien"]'
    );
    tpls.forEach(function (tpl) {
      if (tpl.dataset.consentActivated) return;
      tpl.dataset.consentActivated = '1';
      const s = document.createElement('script');
      if (tpl.dataset.src)          s.src = tpl.dataset.src;
      if (tpl.dataset.resourcesUrl) s.setAttribute('data-resources-url', tpl.dataset.resourcesUrl);
      if (tpl.dataset.widgetId)     s.setAttribute('data-widget-id', tpl.dataset.widgetId);
      document.body.appendChild(s);
    });
  }

  function hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.remove('visible');
      setTimeout(() => { banner.style.display = 'none'; }, 300);
    }
    const mobileCta = document.querySelector('.mobile-sticky-cta');
    if (mobileCta) mobileCta.style.display = '';
  }

  function onBtn(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    // click + touchend für maximale Mobile-Kompatibilität
    el.addEventListener('click', handler);
    el.addEventListener('touchend', function (e) {
      e.preventDefault(); // verhindert doppeltes Feuern mit click
      handler();
    });
  }

  function initBanner() {
    // Bereits entschieden: gespeicherte Einwilligung anwenden (auf jeder Seite,
    // auch ohne Banner-Markup wie Impressum/Datenschutz/404).
    const consent = getConsent();
    if (consent) {
      if (consent.externeMedien) loadExterneMedien();
      return;
    }

    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    banner.classList.add('visible');

    // Mobile Sticky CTA ausblenden damit Buttons erreichbar sind
    const mobileCta = document.querySelector('.mobile-sticky-cta');
    if (mobileCta) mobileCta.style.display = 'none';

    // Alle akzeptieren
    onBtn('cookieAcceptAll', function () {
      saveConsent(true, true);
      loadExterneMedien();
      hideBanner();
    });

    // Auswahl speichern
    onBtn('cookieSave', function () {
      const statistiken   = document.getElementById('cookieStatistiken')?.checked ?? false;
      const externeMedien = document.getElementById('cookieExterneMedien')?.checked ?? false;
      saveConsent(statistiken, externeMedien);
      if (externeMedien) loadExterneMedien();
      hideBanner();
    });

    // Einstellungen – klappt Checkbox-Bereich auf
    onBtn('cookieIndividual', function () {
      const extra      = document.getElementById('cookieExtra');
      const extraMedia = document.getElementById('cookieExtraMedia');
      const show = extra?.style.display === 'none' || extra?.style.display === '';
      if (extra)      extra.style.display      = show ? 'flex' : 'none';
      if (extraMedia) extraMedia.style.display  = show ? 'flex' : 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
