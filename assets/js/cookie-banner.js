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
  }

  function initBanner() {
    if (getConsent()) return; // Bereits entschieden

    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    banner.classList.add('visible');

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

    // Individuelle Einstellungen – klappt Checkbox-Bereich auf (bereits sichtbar)
    document.getElementById('cookieIndividual')?.addEventListener('click', () => {
      const extra = document.getElementById('cookieExtra');
      if (extra) extra.style.display = extra.style.display === 'none' ? 'flex' : 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
