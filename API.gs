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
    var a = _normalizeArgs(args);
    return { ok: true, data: listCampos(a) };
  } catch (e) {
    Logger.log('Error webAppListCampos: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppGetCampo(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    var data = getCampoById(a.id);
    if (!data) return { ok: false, message: 'Campo no encontrado.' };
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppGetCampo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppSaveCampo(args) {
  try {
    var a = _normalizeArgs(args);
    return saveCampo(a);
  } catch (e) {
    Logger.log('Error webAppSaveCampo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteCampo(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    deleteCampo(a.id);
    return { ok: true, data: null };
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
    var a = _normalizeArgs(args);
    return { ok: true, data: listPersonal(a) };
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
    deletePersonal(a.id);
    return { ok: true, data: null };
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
    var a = _normalizeArgs(args);
    return { ok: true, data: listInsumos(a) };
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
    deleteInsumo(a.id);
    return { ok: true, data: null };
  } catch (e) {
    Logger.log('Error webAppDeleteInsumo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// EQUIPOS
// ============================================================

function webAppListEquipos(args) {
  try {
    var a = _normalizeArgs(args);
    return { ok: true, data: listEquipos(a) };
  } catch (e) {
    Logger.log('Error webAppListEquipos: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppSaveEquipo(args) {
  try {
    var a = _normalizeArgs(args);
    return saveEquipo(a);
  } catch (e) {
    Logger.log('Error webAppSaveEquipo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteEquipo(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    deleteEquipo(a.id);
    return { ok: true, data: null };
  } catch (e) {
    Logger.log('Error webAppDeleteEquipo: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// COSECHAS
// ============================================================

function webAppListCosechas(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getSheetData(CONFIG.HOJAS.COSECHAS) || [];
    if (a.campania_id) {
      data = data.filter(function(c) {
        return c.campania_id === a.campania_id;
      });
    }
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListCosechas: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppGetCosecha(args) {
  try {
    var a    = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    var rows = getSheetData(CONFIG.HOJAS.COSECHAS) || [];
    var found = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].cosecha_id === a.id) { found = rows[i]; break; }
    }
    if (!found) return { ok: false, message: 'Cosecha no encontrada.' };
    return { ok: true, data: found };
  } catch (e) {
    Logger.log('Error webAppGetCosecha: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppSaveCosecha(args) {
  try {
    var a = _normalizeArgs(args);
    return saveCosecha(a);
  } catch (e) {
    Logger.log('Error webAppSaveCosecha: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// VENTAS
// ============================================================

function webAppListVentas(args) {
  try {
    var a    = _normalizeArgs(args);
    var data = getSheetData(CONFIG.HOJAS.VENTAS) || [];
    if (a.campania_id) {
      data = data.filter(function(v) {
        return v.campania_id === a.campania_id;
      });
    }
    return { ok: true, data: data };
  } catch (e) {
    Logger.log('Error webAppListVentas: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppGetVenta(args) {
  try {
    var a    = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    var rows = getSheetData(CONFIG.HOJAS.VENTAS) || [];
    var found = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].venta_id === a.id) { found = rows[i]; break; }
    }
    if (!found) return { ok: false, message: 'Venta no encontrada.' };
    return { ok: true, data: found };
  } catch (e) {
    Logger.log('Error webAppGetVenta: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppSaveVenta(args) {
  try {
    var a = _normalizeArgs(args);
    return saveVenta(a);
  } catch (e) {
    Logger.log('Error webAppSaveVenta: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// GASTOS
// ============================================================

function webAppListGastos(args) {
  try {
    var a = _normalizeArgs(args);
    return { ok: true, data: listGastos(a) };
  } catch (e) {
    Logger.log('Error webAppListGastos: ' + e.message);
    return { ok: false, message: e.message, data: [] };
  }
}

function webAppSaveGasto(args) {
  try {
    var a = _normalizeArgs(args);
    return saveGasto(a);
  } catch (e) {
    Logger.log('Error webAppSaveGasto: ' + e.message);
    return { ok: false, message: e.message };
  }
}

function webAppDeleteGasto(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.id) return { ok: false, message: 'ID requerido.' };
    deleteGasto(a.id);
    return { ok: true, data: null };
  } catch (e) {
    Logger.log('Error webAppDeleteGasto: ' + e.message);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// REPORTES / UTILIDADES
// ============================================================

function webAppGetResumenCampania(args) {
  try {
    var a = _normalizeArgs(args);
    if (!a.campania_id) return { ok: false, message: 'campania_id requerido.' };

    var cosechas    = getSheetData(CONFIG.HOJAS.COSECHAS)    || [];
    var ventas      = getSheetData(CONFIG.HOJAS.VENTAS)      || [];
    var actividades = getSheetData(CONFIG.HOJAS.ACTIVIDADES) || [];

    var misCosechas    = cosechas.filter(function(c)   { return c.campania_id === a.campania_id; });
    var misVentas      = ventas.filter(function(v)     { return v.campania_id === a.campania_id; });
    var misActividades = actividades.filter(function(act) { return act.campania_id === a.campania_id; });

    var totalPesoKg = misCosechas.reduce(function(sum, c) {
      return sum + parseFloat(c.peso_neto_kg || 0);
    }, 0);

    var totalVentaS = misVentas.reduce(function(sum, v) {
      return sum + parseFloat(v.total_venta || 0);
    }, 0);

    var totalCostoS = misActividades.reduce(function(sum, act) {
      return sum + parseFloat(act.costo_total || 0);
    }, 0);

    return {
      ok: true,
      data: {
        campania_id:     a.campania_id,
        total_cosechas:  misCosechas.length,
        total_peso_kg:   totalPesoKg.toFixed(2),
        total_ventas_s:  totalVentaS.toFixed(2),
        total_costo_s:   totalCostoS.toFixed(2),
        utilidad_neta_s: (totalVentaS - totalCostoS).toFixed(2)
      }
    };
  } catch (e) {
    Logger.log('Error webAppGetResumenCampania: ' + e.message);
    return { ok: false, message: e.message };
  }
}