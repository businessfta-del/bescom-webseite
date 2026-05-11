/* =========================================================
   BESCom – Cookie Consent Banner
   Speichert Einwilligung in localStorage
   ========================================================= */

(function () {
  const STORAGE_KEY = 'bescom_cookie_consent';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }

  function saveConsent(statistiken, externeMedien) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      essenziell: true,
      statistiken,
      externeMedien,
      timestamp: Date.now()
    }));
  }

  function hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.remove('visible');
      setTimeout(() => { banner.style.display = 'none'; }, 300);
    }
    // Mobile Sticky CTA wieder einblenden
    const mobileCta = document.querySelector('.mobile-sticky-cta');
    if (mobileCta) mobileCta.style.display = '';
  }

  function initBanner() {
    if (getConsent()) return;

    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    banner.classList.add('visible');

    // Mobile Sticky CTA ausblenden damit Buttons erreichbar sind
    const mobileCta = document.querySelector('.mobile-sticky-cta');
    if (mobileCta) mobileCta.style.display = 'none';

    // Alle akzeptieren
    document.getElementById('cookieAcceptAll')?.addEventListener('click', () => {
      saveConsent(true, true);
      hideBanner();
    });

    // Auswahl speichern
    document.getElementById('cookieSave')?.addEventListener('click', () => {
      const statistiken   = document.getElementById('cookieStatistiken')?.checked ?? false;
      const externeMedien = document.getElementById('cookieExterneMedien')?.checked ?? false;
      saveConsent(statistiken, externeMedien);
      hideBanner();
    });

    // Einstellungen – klappt Checkbox-Bereich auf
    document.getElementById('cookieIndividual')?.addEventListener('click', () => {
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
