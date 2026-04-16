// ============================================================
// API.gs - ROCÍO AGROCONTROL V2
// Punto de entrada de todas las llamadas desde el frontend
// ============================================================

// ── Normalizar args ───────────────────────────────────────────
function _normalizeArgs(args) {
  if (!args) return {};
  if (Array.isArray(args) && args.length > 0) return args[0];
  if (typeof args === 'object' && !Array.isArray(args)) return args;
  return {};
}

// ============================================================
// AUTH
// ============================================================

function webAppLogin(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.username || !a.password) {
      return { ok: false, message: 'Usuario y contraseña son requeridos.', data: null };
    }
    return login(a.username, a.password, a.ip || '');
  } catch (e) {
    Logger.log('Error webAppLogin: ' + e.message);
    return { ok: false, message: 'Error interno del servidor.', data: null };
  }
}

function webAppLogout(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.token) return { ok: false, message: 'Token requerido.', data: null };
    return logout(a.token);
  } catch (e) {
    Logger.log('Error webAppLogout: ' + e.message);
    return { ok: false, message: 'Error interno del servidor.', data: null };
  }
}

function webAppCheckSession(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.token) return { ok: false, message: 'Token requerido.', data: null };
    var sesion = getSession(a.token);
    if (!sesion) return { ok: false, message: 'Sesión no válida o expirada.', data: null };
    return { ok: true, message: '', data: sesion };
  } catch (e) {
    Logger.log('Error webAppCheckSession: ' + e.message);
    return { ok: false, message: 'Error interno del servidor.', data: null };
  }
}

function webAppListUsuariosActivos() {
  try {
    var usuarios = getSheetData(CONFIG.HOJAS.USUARIOS);
    var activos = usuarios
      .filter(function(u) { return u.estado === CONFIG.ESTADO_USUARIO.ACTIVO; })
      .map(function(u) {
        return {
          usuario_id: u.usuario_id,
          nombre:     u.nombre,
          apellido:   u.apellido,
          username:   u.username
        };
      });
    return { ok: true, data: activos };
  } catch (e) {
    Logger.log('Error webAppListUsuariosActivos: ' + e.message);
    return { ok: false, message: 'Error al cargar usuarios.', data: [] };
  }
}

// ============================================================
// DASHBOARD
// ============================================================

function webAppGetDashboard() {
  try {
    var actividades = getSheetData(CONFIG.HOJAS.ACTIVIDADES) || [];
    var campos      = getSheetData(CONFIG.HOJAS.CAMPOS)      || [];
    var personal    = getSheetData(CONFIG.HOJAS.PERSONAL)    || [];
    var insumos     = getSheetData(CONFIG.HOJAS.INSUMOS)     || [];

    var actStats = {
      total:      actividades.length,
      pendiente:  actividades.filter(function(a){ return a.estado_actividad === 'pendiente';  }).length,
      en_proceso: actividades.filter(function(a){ return a.estado_actividad === 'en_proceso'; }).length,
      completada: actividades.filter(function(a){ return a.estado_actividad === 'completada'; }).length,
      anulada:    actividades.filter(function(a){ return a.estado_actividad === 'anulada';    }).length
    };

    var camposStats = {
      total:   campos.length,
      activos: campos.filter(function(c){ return c.estado === 'activo'; }).length
    };

    var personalStats = {
      total:   personal.length,
      activos: personal.filter(function(p){ return p.estado === 'activo'; }).length
    };

    var insumosStats = {
      total:      insumos.length,
      bajo_stock: insumos.filter(function(i){
        return parseFloat(i.stock_actual || 0) <= parseFloat(i.stock_minimo || 0);
      }).length
    };

    return {
      ok: true,
      data: {
        actividades: actStats,
        campos:      camposStats,
        personal:    personalStats,
        insumos:     insumosStats
      }
    };
  } catch (e) {
    Logger.log('Error webAppGetDashboard: ' + e.message);
    return { ok: false, message: 'Error al cargar dashboard.', data: null };
  }
}

// ============================================================
// ACTIVIDADES
// ============================================================

function webAppListActividades(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getSheetData(CONFIG.HOJAS.ACTIVIDADES) || [];
    if (a.estado_actividad) {
      data = data.filter(function(act) {
        return act.estado_actividad === a.estado_actividad;
      });
    }
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListActividades: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppGetActividad(args) {
  try {
    var a    = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    var rows = getSheetData(CONFIG.HOJAS.ACTIVIDADES) || [];
    var found = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id_actividad === a.id) { found = rows[i]; break; }
    }
    if (!found) return { ok: false, message: 'Actividad no encontrada.' };
    return { ok: true, data: found };
  } catch (e) {
    Logger.log('Error webAppGetActividad: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppSaveActividad(args) {
  try {
    var a = _normalizeArgs(args);
    return saveActividad(a);
  } catch (e) {
    Logger.log('Error webAppSaveActividad: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteActividad(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    return deleteActividad(a.id);
  } catch (e) {
    Logger.log('Error webAppDeleteActividad: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// CAMPOS
// ============================================================

function webAppListCampos(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getCampos(a);
    return data;
  } catch (e) {
    Logger.log('Error webAppListCampos: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppSaveCampo(args) {
  try {
    var a = _normalizeArgs(args);
    if (a.campo_id) return updateCampo(a);
    return createCampo(a);
  } catch (e) {
    Logger.log('Error webAppSaveCampo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteCampo(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.campo_id) return { ok: false, message: 'ID requerido.' };
    return deleteCampo(a.campo_id);
  } catch (e) {
    Logger.log('Error webAppDeleteCampo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// PERSONAL
// ============================================================

function webAppListPersonal(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getSheetData(CONFIG.HOJAS.PERSONAL) || [];
    if (a.estado) {
      data = data.filter(function(p) { return p.estado === a.estado; });
    }
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListPersonal: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppSavePersonal(args) {
  try {
    var a = _normalizeArgs(args);
    return savePersonal(a);
  } catch (e) {
    Logger.log('Error webAppSavePersonal: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeletePersonal(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    return deletePersonal(a.id);
  } catch (e) {
    Logger.log('Error webAppDeletePersonal: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// INSUMOS
// ============================================================

function webAppListInsumos(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getSheetData(CONFIG.HOJAS.INSUMOS) || [];
    if (a.categoria) {
      data = data.filter(function(i) { return i.categoria === a.categoria; });
    }
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListInsumos: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppSaveInsumo(args) {
  try {
    var a = _normalizeArgs(args);
    return saveInsumo(a);
  } catch (e) {
    Logger.log('Error webAppSaveInsumo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteInsumo(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    return deleteInsumo(a.id);
  } catch (e) {
    Logger.log('Error webAppDeleteInsumo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppRegistrarMovimiento(args) {
  try {
    var a = _normalizeArgs(args);
    return registrarMovimiento(a);
  } catch (e) {
    Logger.log('Error webAppRegistrarMovimiento: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppListMovimientos(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getSheetData(CONFIG.HOJAS.MOVIMIENTOS) || [];
    if (a.insumo_id) {
      data = data.filter(function(m) { return m.insumo_id === a.insumo_id; });
    }
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListMovimientos: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

// ============================================================
// USUARIOS
// ============================================================

function webAppListUsuarios(args) {
  try {
    var data = getSheetData(CONFIG.HOJAS.USUARIOS) || [];
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListUsuarios: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppSaveUsuario(args) {
  try {
    var a = _normalizeArgs(args);
    return saveUsuario(a);
  } catch (e) {
    Logger.log('Error webAppSaveUsuario: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteUsuario(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.usuario_id) return { ok: false, message: 'ID requerido.' };
    return deleteUsuario(a.usuario_id);
  } catch (e) {
    Logger.log('Error webAppDeleteUsuario: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppChangePassword(args) {
  try {
    var a = _normalizeArgs(args);
    return changePassword(a);
  } catch (e) {
    Logger.log('Error webAppChangePassword: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// REPORTES
// ============================================================

function webAppGetReporte(args) {
  try {
    var a = _normalizeArgs(args);
    return getReporte(a);
  } catch (e) {
    Logger.log('Error webAppGetReporte: ' + e.message);
    return { ok: false, message: e.message, data: null };
  }
}

// ============================================================
// CAMPAÑAS  ← NUEVO
// ============================================================

function webAppListCampanias(args) {
  try {
    return listCampanias(_normalizeArgs(args));
  } catch (e) {
    Logger.log('Error webAppListCampanias: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppGetCampania(args) {
  try {
    return getCampania(_normalizeArgs(args));
  } catch (e) {
    Logger.log('Error webAppGetCampania: ' + e.message);
    return { ok: false, message: e.message, data: null };
  }
}

function webAppSaveCampania(args) {
  try {
    return saveCampania(_normalizeArgs(args));
  } catch (e) {
    Logger.log('Error webAppSaveCampania: ' + e.message);
    return { ok: false, message: e.message, data: null };
  }
}

function webAppDeleteCampania(args) {
  try {
    return deleteCampania(_normalizeArgs(args));
  } catch (e) {
    Logger.log('Error webAppDeleteCampania: ' + e.message);
    return { ok: false, message: e.message, data: null };
  }
}
