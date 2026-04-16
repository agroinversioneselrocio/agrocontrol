// ============================================================
// CampaniasAPI.gs - ROCÍO AGROCONTROL V2
// CRUD completo para la hoja 'campanias'
// ============================================================

var CAMPANIAS_SHEET = 'campanias';
var CAMPANIAS_ID    = 'campania_id';

// ── LIST ─────────────────────────────────────────────────────
function listCampanias(args) {
  try {
    var a = _normalizeArgs(args || {});
    var data = getSheetData(CAMPANIAS_SHEET) || [];

    data = data.filter(function(r) {
      return r.estado !== 'eliminado';
    });

    if (a.estado) {
      data = data.filter(function(r) {
        return String(r.estado || '') === String(a.estado);
      });
    }

    return {
      ok: true,
      data: data
    };
  } catch (e) {
    Logger.log('Error listCampanias: ' + e.message);
    return {
      ok: false,
      message: e.message,
      data: []
    };
  }
}

// ── GET ──────────────────────────────────────────────────────
function getCampania(args) {
  try {
    var a = _normalizeArgs(args || {});
    if (!a.id) {
      return { ok: false, message: 'ID requerido.', data: null };
    }

    var data = getSheetData(CAMPANIAS_SHEET) || [];
    var found = null;

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][CAMPANIAS_ID]) === String(a.id)) {
        found = data[i];
        break;
      }
    }

    if (!found) {
      return { ok: false, message: 'Campaña no encontrada.', data: null };
    }

    return {
      ok: true,
      data: found
    };
  } catch (e) {
    Logger.log('Error getCampania: ' + e.message);
    return {
      ok: false,
      message: e.message,
      data: null
    };
  }
}

// ── CREATE / UPDATE ──────────────────────────────────────────
function saveCampania(args) {
  try {
    var a = _normalizeArgs(args || {});
    var ahora = new Date().toISOString();

    if (a.campania_id) {
      // UPDATE
      var actualizado = {
        campania_id:         a.campania_id,
        nombre:              a.nombre || '',
        fecha_inicio:        a.fecha_inicio || '',
        fecha_fin:           a.fecha_fin || '',
        presupuesto:         parseFloat(a.presupuesto || 0),
        costo_real:          parseFloat(a.costo_real || 0),
        ingreso_real:        parseFloat(a.ingreso_real || 0),
        utilidad:            parseFloat(a.utilidad || 0),
        estado:              a.estado || 'planificada',
        observaciones:       a.observaciones || '',
        fecha_actualizacion: ahora
      };

      updateRow(CAMPANIAS_SHEET, CAMPANIAS_ID, a.campania_id, actualizado);

      return {
        ok: true,
        data: actualizado
      };
    }

    // CREATE
    var id = _generarCampaniaId();
    var nuevo = {
      campania_id:         id,
      nombre:              a.nombre || '',
      fecha_inicio:        a.fecha_inicio || '',
      fecha_fin:           a.fecha_fin || '',
      presupuesto:         parseFloat(a.presupuesto || 0),
      costo_real:          parseFloat(a.costo_real || 0),
      ingreso_real:        parseFloat(a.ingreso_real || 0),
      utilidad:            parseFloat(a.utilidad || 0),
      estado:              a.estado || 'planificada',
      observaciones:       a.observaciones || '',
      fecha_creacion:      ahora,
      fecha_actualizacion: ahora
    };

    appendRow(CAMPANIAS_SHEET, nuevo);

    return {
      ok: true,
      data: nuevo
    };
  } catch (e) {
    Logger.log('Error saveCampania: ' + e.message);
    return {
      ok: false,
      message: e.message,
      data: null
    };
  }
}

// ── DELETE ───────────────────────────────────────────────────
function deleteCampania(args) {
  try {
    var a = _normalizeArgs(args || {});
    if (!a.id) {
      return { ok: false, message: 'ID requerido.', data: null };
    }

    deleteRow(CAMPANIAS_SHEET, CAMPANIAS_ID, a.id);

    return {
      ok: true,
      data: null
    };
  } catch (e) {
    Logger.log('Error deleteCampania: ' + e.message);
    return {
      ok: false,
      message: e.message,
      data: null
    };
  }
}

// ── HELPER ID ────────────────────────────────────────────────
function _generarCampaniaId() {
  var data = getSheetData(CAMPANIAS_SHEET) || [];
  var nums = data
    .map(function(r) {
      var match = String(r.campania_id || '').match(/CPN-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(function(n) {
      return n > 0;
    });

  var siguiente = nums.length ? Math.max.apply(null, nums) + 1 : 1;
  return 'CPN-' + String(siguiente).padStart(3, '0');
}
