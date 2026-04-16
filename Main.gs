// ============================================================
// Main.gs - ROCÍO AGROCONTROL V2
// Punto de entrada de la Web App
// ============================================================

function doGet(e) {
  initGlobalRefs();
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ROCÍO AGROCONTROL')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function initGlobalRefs() {
  try {
    if (typeof setupGlobalReferences === 'function') {
      setupGlobalReferences();
    }
  } catch (e) {
    Logger.log('Warning init: ' + e.message);
  }
}

function initializeOnDeploy() {
  initGlobalRefs();
  initMissingSheets();
  Logger.log('✅ Sistema inicializado');
}