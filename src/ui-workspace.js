/* UI 8.5b : navigation et présentation uniquement. Aucun algorithme d'export ni de notation modifié. */
(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const nav = Array.from(document.querySelectorAll('.nav-button[data-view]'));
  const views = Array.from(document.querySelectorAll('.main-panel > .view'));
  const buttons = {
    scorm: byId('generateBtn'),
    multi: byId('generateHtmlBtn'),
    single: byId('singlefileInteractiveBtn')
  };
  const formats = {
    scorm: { title: 'SCORM 1.2', button: 'Convertir en SCORM 1.2', description: 'Paquet ZIP avec notation et reprise dans Moodle ou un LMS compatible.' },
    multi: { title: 'HTML multifichier', button: 'Générer le mini-site ZIP', description: 'Mini-site HTML autonome à publier sur un hébergement web statique compatible.' },
    single: { title: 'HTML monofichier', button: 'Générer le HTML monofichier', description: 'Fichier unique interactif ; compatibilité encore expérimentale selon le type H5P.' }
  };
  const primary = byId('uiGeneratePrimary');
  const formatInputs = Array.from(document.querySelectorAll('input[name="uiExportFormat"]'));
  const scormOptions = byId('scormOptionsPanel');
  const diagnostic = byId('diagnostic');
  const progress = byId('generationProgressWrap');
  const fileInput = byId('h5pFile');
  const help = byId('uiHelp');
  const tech = byId('uiTechnical');
  const format = () => formatInputs.find(input => input.checked)?.value || 'scorm';

  function showView(name, focusHeading) {
    if (!nav.some(button => button.dataset.view === name)) return;
    nav.forEach(button => {
      if (button.dataset.view === name) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    views.forEach(view => {
      const active = view.id === 'view-' + name;
      view.hidden = !active;
      view.classList.toggle('active', active);
    });
    if (name === 'preview') {
      // Game Map et autres bibliothèques H5P calculent leur surface à partir
      // des dimensions du cadre : notifier le changement après navigation.
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
        try { byId('previewFrame')?.contentWindow?.dispatchEvent(new Event('resize')); } catch (_error) { /* sandbox opaque */ }
      });
    }
    if (focusHeading) {
      const heading = byId('title-' + name);
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
      if (window.innerWidth <= 660) byId('mainContent')?.scrollIntoView({block: 'start', behavior: 'auto'});
    }
  }
  nav.forEach(button => button.addEventListener('click', () => showView(button.dataset.view, true)));

  const themeButton = byId('themeToggle');
  const THEME_KEY = 'h5p-converter:theme:v1';
  function applyTheme(next, persist) {
    const theme = next === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    const label = theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair';
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    themeButton.querySelector('use')?.setAttribute('href', theme === 'light' ? '#i-moon' : '#i-sun');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef3f7' : '#0a1020');
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (_error) { /* stockage désactivé */ } }
  }
  let storedTheme = 'dark';
  try { storedTheme = localStorage.getItem(THEME_KEY) || 'dark'; } catch (_error) { /* stockage désactivé */ }
  applyTheme(storedTheme, false);
  themeButton.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true));

  function updateSummary() {
    const file = fileInput?.files?.[0];
    const meta = byId('fileMeta')?.textContent?.trim();
    byId('uiSummaryFile').textContent = file?.name || 'Aucun H5P chargé';
    byId('uiSummaryMeta').textContent = file ? (meta && meta !== 'Aucun fichier chargé.' ? meta : ((file.size / 1048576).toFixed(2) + ' Mio, analyse en cours')) : 'Sélectionnez un fichier pour commencer.';
    const status = diagnostic?.classList?.contains('status-error') ? 'Erreurs de compatibilité détectées.'
      : diagnostic?.classList?.contains('status-warn') ? 'Analyse terminée avec avertissements.'
      : diagnostic?.classList?.contains('status-ok') ? 'Analyse terminée, contenu compatible.'
      : file ? 'Analyse en cours.' : 'En attente d’un fichier H5P.';
    byId('uiSummaryDiagnostic').textContent = status;
    const type = format();
    const disabled = !buttons[type] || buttons[type].disabled;
    primary.disabled = disabled;
    byId('uiSummaryReady').textContent = disabled ? 'Export indisponible : importez un H5P compatible.' : 'Export disponible pour le lecteur H5P qualifié.';
  }
  function updateFormat() {
    const type = format();
    document.querySelectorAll('.format-option').forEach(card => card.classList.toggle('selected', card.dataset.format === type));
    scormOptions.hidden = type !== 'scorm';
    primary.lastChild && (primary.lastChild.textContent = formats[type].button);
    byId('uiFormatNote').textContent = formats[type].description;
    byId('uiSummaryFormat').textContent = formats[type].title;
    updateSummary();
  }
  formatInputs.forEach(input => input.addEventListener('change', updateFormat));
  primary.addEventListener('click', () => {
    const target = buttons[format()];
    if (!target || target.disabled) { updateSummary(); return; }
    target.click();
    // Les actions longues sont exécutées dans app.js. Ne pas simuler de succès.
  });
  fileInput?.addEventListener('change', updateSummary);
  byId('courseTitle')?.addEventListener('input', updateSummary);
  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(updateSummary);
    if (diagnostic) observer.observe(diagnostic, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
    for (const target of Object.values(buttons)) if (target) observer.observe(target, { attributes: true, attributeFilter: ['disabled'] });
  }
  // Conserver l'ancien diagnostic avancé dans l'onglet Importer, sans dupliquer les contrôles.
  tech?.addEventListener('click', () => {
    showView('import', true);
    const advanced = diagnostic?.querySelector('.engine-catalog-details');
    if (advanced) { advanced.open = true; advanced.scrollIntoView({block: 'start', behavior: 'smooth'}); }
    else diagnostic?.scrollIntoView({block: 'start', behavior: 'smooth'});
  });
  help?.addEventListener('click', () => {
    showView('export', true);
    const details = byId('uiCompatibility');
    if (details) { details.open = true; details.scrollIntoView({block: 'nearest'}); }
  });
  // Ne pas perturber les propriétés de l'iframe, les états SCORM ni la progression du moteur.
  updateFormat();
  showView('import', false);
})();
