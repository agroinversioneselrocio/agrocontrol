// ============================================================
// CamposAPI.gs - ROCÍO AGROCONTROL V2
// CRUD completo para la hoja 'campos'
// ============================================================

var CAMPOS_SHEET = 'campos';
var CAMPOS_ID    = 'campo_id';

// ── GET ──────────────────────────────────────────────────────
function getCampos() {
  try {
    var data = getSheetData(CAMPOS_SHEET);
    // Excluir eliminados
    var activos = data.filter(function(r) {
      return r.estado !== 'eliminado';
    });
    return { ok: true, data: activos };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

// ── CREATE ───────────────────────────────────────────────────
function createCampo(payload) {
  try {
    var ahora = new Date().toISOString();
    var id    = _generarCampoId();

    var nuevo = {
      campo_id:            id,
      nombre:              payload.nombre              || '',
      ubicacion:           payload.ubicacion           || '',
      hectareas:           parseFloat(payload.hectareas) || 0,
      tipo_cultivo:        payload.tipo_cultivo        || '',
      estado:              payload.estado              || 'activo',
      propietario:         payload.propietario         || '',
      fecha_creacion:      ahora,
      fecha_actualizacion: ahora
    };

    appendRow(CAMPOS_SHEET, nuevo);
    return { ok: true, data: nuevo };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

// ── UPDATE ───────────────────────────────────────────────────
function updateCampo(payload) {
  try {
    var ahora = new Date().toISOString();
    payload.fecha_actualizacion = ahora;
    updateRow(CAMPOS_SHEET, CAMPOS_ID, payload.campo_id, payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

// ── DELETE (lógico) ──────────────────────────────────────────
function deleteCampo(payload) {
  try {
    deleteRow(CAMPOS_SHEET, CAMPOS_ID, payload.campo_id);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

// ── HELPER ID ────────────────────────────────────────────────
function _generarCampoId() {
  var data = getSheetData(CAMPOS_SHEET);
  var nums = data
    .map(function(r) {
      var match = String(r.campo_id).match(/CAM-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(function(n) { return n > 0; });

  var siguiente = nums.length ? Math.max.apply(null, nums) + 1 : 1;
  return 'CAM-' + String(siguiente).padStart(3, '0');
}