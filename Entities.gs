// ============================================================
// Entities.gs - ROCÍO AGROCONTROL V2
// CRUD de todas las entidades: Campos, Campañas, Personal, Insumos, Equipos, Gastos
// ============================================================

// ============================================================
// CAMPOS
// ============================================================

function listCampos(filtros) {
  var data = getSheetData(CONFIG.HOJAS.CAMPOS);
  var resultados = data;

  if (filtros) {
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.nombre).toLowerCase().indexOf(term) >= 0 ||
               String(r.ubicacion).toLowerCase().indexOf(term) >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.campo_id; });
}

function getCampoById(id) {
  var result = findById(CONFIG.HOJAS.CAMPOS, 'campo_id', id);
  return result ? result.data : null;
}

function createCampo(data) {
  validateCampoData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    campo_id:            generateCampoId(),
    nombre:              data.nombre,
    ubicacion:           data.ubicacion,
    hectareas:           data.hectareas,
    tipo_cultivo:        data.tipo_cultivo  || '',
    estado:              data.estado        || CONFIG.ESTADO_CAMPO.ACTIVO,
    propietario:         data.propietario   || '',
    fecha_creacion:      ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.CAMPOS, nuevo);
  return nuevo;
}

function updateCampo(id, data) {
  validateCampoData(data);

  var ahora = getCurrentTimestamp();
  var updates = {
    nombre:              data.nombre,
    ubicacion:           data.ubicacion,
    hectareas:           data.hectareas,
    tipo_cultivo:        data.tipo_cultivo,
    estado:              data.estado,
    propietario:         data.propietario,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.CAMPOS, 'campo_id', id, updates);
  return getCampoById(id);
}

function deleteCampo(id) {
  var ahora = getCurrentTimestamp();
  updateRow(CONFIG.HOJAS.CAMPOS, 'campo_id', id, {
    estado:              CONFIG.ESTADO_CAMPO.INACTIVO,
    fecha_actualizacion: ahora
  });
  return true;
}

function saveCampo(data) {
  if (data.campo_id) {
    var updated = updateCampo(data.campo_id, data);
    return { ok: true, data: updated };
  } else {
    var created = createCampo(data);
    return { ok: true, data: created };
  }
}

// ============================================================
// CAMPAÑAS
// ============================================================

function listCampanias(filtros) {
  var data = getSheetData(CONFIG.HOJAS.CAMPANIAS);
  var resultados = data;

  if (filtros) {
    if (filtros.estado) {
      resultados = resultados.filter(function(r) {
        return r.estado === filtros.estado;
      });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.nombre).toLowerCase().indexOf(term) >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.campania_id; });
}

function getCampaniaById(id) {
  var result = findById(CONFIG.HOJAS.CAMPANIAS, 'campania_id', id);
  return result ? result.data : null;
}

function createCampania(data) {
  validateCampaniaData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    campania_id:         generateCampaniaId(),
    nombre:              data.nombre,
    fecha_inicio:        data.fecha_inicio        || '',
    fecha_fin:           data.fecha_fin           || '',
    presupuesto:         parseFloat(data.presupuesto)  || 0,
    costo_real:          parseFloat(data.costo_real)   || 0,
    ingreso_real:        parseFloat(data.ingreso_real) || 0,
    utilidad:            parseFloat(data.utilidad)     || 0,
    estado:              data.estado || CONFIG.ESTADO_CAMPANIA.PLANIFICADA,
    observaciones:       data.observaciones || '',
    fecha_creacion:      ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.CAMPANIAS, nuevo);
  return nuevo;
}

function updateCampania(id, data) {
  var ahora = getCurrentTimestamp();
  var updates = {
    nombre:              data.nombre,
    fecha_inicio:        data.fecha_inicio,
    fecha_fin:           data.fecha_fin,
    presupuesto:         parseFloat(data.presupuesto)  || 0,
    costo_real:          parseFloat(data.costo_real)   || 0,
    ingreso_real:        parseFloat(data.ingreso_real) || 0,
    utilidad:            parseFloat(data.utilidad)     || 0,
    estado:              data.estado,
    observaciones:       data.observaciones,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.CAMPANIAS, 'campania_id', id, updates);
  return getCampaniaById(id);
}

function deleteCampania(id) {
  var ahora = getCurrentTimestamp();
  updateRow(CONFIG.HOJAS.CAMPANIAS, 'campania_id', id, {
    estado:              CONFIG.ESTADO_CAMPANIA.ANULADA,
    fecha_actualizacion: ahora
  });
  return true;
}

function saveCampania(data) {
  if (data.campania_id) {
    var updated = updateCampania(data.campania_id, data);
    return { ok: true, data: updated };
  } else {
    var created = createCampania(data);
    return { ok: true, data: created };
  }
}

// ============================================================
// PERSONAL
// ============================================================

function listPersonal(filtros) {
  var data = getSheetData(CONFIG.HOJAS.PERSONAL);
  var resultados = data;

  if (filtros) {
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
    if (filtros.cargo) {
      resultados = resultados.filter(function(r) { return r.cargo === filtros.cargo; });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.nombre).toLowerCase().indexOf(term)   >= 0 ||
               String(r.apellido).toLowerCase().indexOf(term) >= 0 ||
               String(r.dni).toLowerCase().indexOf(term)      >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.personal_id; });
}

function getPersonalById(id) {
  var result = findById(CONFIG.HOJAS.PERSONAL, 'personal_id', id);
  return result ? result.data : null;
}

function createPersonal(data) {
  validatePersonalData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    personal_id:         generatePersonalId(),
    nombre:              data.nombre,
    apellido:            data.apellido,
    dni:                 data.dni,
    cargo:               data.cargo || '',
    telefono:            data.telefono || '',
    salario_base:        parseFloat(data.salario_base) || 0,
    fecha_ingreso:       data.fecha_ingreso || '',
    estado:              data.estado || 'activo',
    fecha_creacion:      ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.PERSONAL, nuevo);
  return nuevo;
}

function updatePersonal(id, data) {
  validatePersonalData(data);

  var ahora = getCurrentTimestamp();
  var updates = {
    nombre:              data.nombre,
    apellido:            data.apellido,
    dni:                 data.dni,
    cargo:               data.cargo,
    telefono:            data.telefono,
    salario_base:        parseFloat(data.salario_base) || 0,
    fecha_ingreso:       data.fecha_ingreso,
    estado:              data.estado,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.PERSONAL, 'personal_id', id, updates);
  return getPersonalById(id);
}

function deletePersonal(id) {
  var ahora = getCurrentTimestamp();
  updateRow(CONFIG.HOJAS.PERSONAL, 'personal_id', id, {
    estado:              'inactivo',
    fecha_actualizacion: ahora
  });
  return true;
}

function savePersonal(data) {
  if (data.personal_id) {
    var updated = updatePersonal(data.personal_id, data);
    return { ok: true, data: updated };
  } else {
    var created = createPersonal(data);
    return { ok: true, data: created };
  }
}

// ============================================================
// INSUMOS
// ============================================================

function listInsumos(filtros) {
  var data = getSheetData(CONFIG.HOJAS.INSUMOS);
  var resultados = data;

  if (filtros) {
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
    if (filtros.categoria) {
      resultados = resultados.filter(function(r) { return r.categoria === filtros.categoria; });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.nombre).toLowerCase().indexOf(term)    >= 0 ||
               String(r.categoria).toLowerCase().indexOf(term) >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.insumo_id; });
}

function getInsumoById(id) {
  var result = findById(CONFIG.HOJAS.INSUMOS, 'insumo_id', id);
  return result ? result.data : null;
}

function createInsumo(data) {
  validateInsumoData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    insumo_id:              generateInsumoId(),
    nombre:                 data.nombre,
    categoria:              data.categoria || '',
    unidad_medida:          data.unidad_medida || '',
    stock_actual:           parseFloat(data.stock_actual) || 0,
    stock_minimo:           parseFloat(data.stock_minimo) || 0,
    precio_unitario:        parseFloat(data.precio_unitario) || 0,
    proveedor:              data.proveedor || '',
    fecha_vencimiento:      data.fecha_vencimiento || '',
    periodo_carencia_dias:  parseInt(data.periodo_carencia_dias) || 0,
    estado:                 data.estado || 'activo',
    observaciones:          data.observaciones || '',
    fecha_creacion:         ahora,
    fecha_actualizacion:    ahora
  };

  appendRow(CONFIG.HOJAS.INSUMOS, nuevo);
  return nuevo;
}

function updateInsumo(id, data) {
  validateInsumoData(data);

  var ahora = getCurrentTimestamp();
  var updates = {
    nombre:                data.nombre,
    categoria:             data.categoria,
    unidad_medida:         data.unidad_medida,
    stock_actual:          parseFloat(data.stock_actual) || 0,
    stock_minimo:          parseFloat(data.stock_minimo) || 0,
    precio_unitario:       parseFloat(data.precio_unitario) || 0,
    proveedor:             data.proveedor,
    fecha_vencimiento:     data.fecha_vencimiento,
    periodo_carencia_dias: parseInt(data.periodo_carencia_dias) || 0,
    estado:                data.estado,
    observaciones:         data.observaciones,
    fecha_actualizacion:   ahora
  };

  updateRow(CONFIG.HOJAS.INSUMOS, 'insumo_id', id, updates);
  return getInsumoById(id);
}

function deleteInsumo(id) {
  var ahora = getCurrentTimestamp();
  updateRow(CONFIG.HOJAS.INSUMOS, 'insumo_id', id, {
    estado:              'inactivo',
    fecha_actualizacion: ahora
  });
  return true;
}

function saveInsumo(data) {
  if (data.insumo_id) {
    var updated = updateInsumo(data.insumo_id, data);
    return { ok: true, data: updated };
  } else {
    var created = createInsumo(data);
    return { ok: true, data: created };
  }
}

// ============================================================
// EQUIPOS
// ============================================================

function listEquipos(filtros) {
  var data = getSheetData(CONFIG.HOJAS.EQUIPOS);
  var resultados = data;

  if (filtros) {
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
    if (filtros.tipo) {
      resultados = resultados.filter(function(r) { return r.tipo === filtros.tipo; });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.nombre).toLowerCase().indexOf(term) >= 0 ||
               String(r.marca).toLowerCase().indexOf(term)  >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.equipo_id; });
}

function getEquipoById(id) {
  var result = findById(CONFIG.HOJAS.EQUIPOS, 'equipo_id', id);
  return result ? result.data : null;
}

function createEquipo(data) {
  validateEquipoData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    equipo_id:            generateEquipoId(),
    nombre:               data.nombre,
    tipo:                 data.tipo || '',
    marca:                data.marca || '',
    modelo:               data.modelo || '',
    numero_serie:         data.numero_serie || '',
    costo_hora:           parseFloat(data.costo_hora) || 0,
    costo_dia:            parseFloat(data.costo_dia) || 0,
    estado:               data.estado || 'activo',
    ultimo_mantenimiento: data.ultimo_mantenimiento || '',
    fecha_creacion:       ahora,
    fecha_actualizacion:  ahora
  };

  appendRow(CONFIG.HOJAS.EQUIPOS, nuevo);
  return nuevo;
}

function updateEquipo(id, data) {
  validateEquipoData(data);

  var ahora = getCurrentTimestamp();
  var updates = {
    nombre:               data.nombre,
    tipo:                 data.tipo,
    marca:                data.marca,
    modelo:               data.modelo,
    numero_serie:         data.numero_serie,
    costo_hora:           parseFloat(data.costo_hora) || 0,
    costo_dia:            parseFloat(data.costo_dia) || 0,
    estado:               data.estado,
    ultimo_mantenimiento: data.ultimo_mantenimiento,
    fecha_actualizacion:  ahora
  };

  updateRow(CONFIG.HOJAS.EQUIPOS, 'equipo_id', id, updates);
  return getEquipoById(id);
}

function deleteEquipo(id) {
  var ahora = getCurrentTimestamp();
  updateRow(CONFIG.HOJAS.EQUIPOS, 'equipo_id', id, {
    estado:              'inactivo',
    fecha_actualizacion: ahora
  });
  return true;
}

function saveEquipo(data) {
  if (data.equipo_id) {
    var updated = updateEquipo(data.equipo_id, data);
    return { ok: true, data: updated };
  } else {
    var created = createEquipo(data);
    return { ok: true, data: created };
  }
}

// ============================================================
// GASTOS
// ============================================================

function listGastos(filtros) {
  var data = getSheetData(CONFIG.HOJAS.GASTOS);
  var resultados = data;

  if (filtros) {
    if (filtros.campania_id) {
      resultados = resultados.filter(function(r) { return r.campania_id === filtros.campania_id; });
    }
    if (filtros.categoria) {
      resultados = resultados.filter(function(r) { return r.categoria === filtros.categoria; });
    }
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.descripcion).toLowerCase().indexOf(term) >= 0 ||
               String(r.proveedor).toLowerCase().indexOf(term)   >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.gasto_id; });
}

function getGastoById(id) {
  var result = findById(CONFIG.HOJAS.GASTOS, 'gasto_id', id);
  return result ? result.data : null;
}

function createGasto(data) {
  validateGastoData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    gasto_id:            generateGastoId(),
    campania_id:         data.campania_id || '',
    campo_id:            data.campo_id || '',
    categoria:           data.categoria || '',
    descripcion:         data.descripcion || '',
    monto:               parseFloat(data.monto) || 0,
    fecha_gasto:         data.fecha_gasto || '',
    responsable_id:      data.responsable_id || '',
    comprobante:         data.comprobante || '',
    proveedor:           data.proveedor || '',
    estado:              data.estado || 'activo',
    observaciones:       data.observaciones || '',
    fecha_creacion:      ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.GASTOS, nuevo);
  return nuevo;
}

function updateGasto(id, data) {
  validateGastoData(data);

  var ahora = getCurrentTimestamp();
  var updates = {
    campania_id:         data.campania_id,
    campo_id:            data.campo_id,
    categoria:           data.categoria,
    descripcion:         data.descripcion,
    monto:               parseFloat(data.monto) || 0,
    fecha_gasto:         data.fecha_gasto,
    responsable_id:      data.responsable_id,
    comprobante:         data.comprobante,
    proveedor:           data.proveedor,
    estado:              data.estado,
    observaciones:       data.observaciones,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.GASTOS, 'gasto_id', id, updates);
  return getGastoById(id);
}

function deleteGasto(id) {
  var ahora = getCurrentTimestamp();
  updateRow(CONFIG.HOJAS.GASTOS, 'gasto_id', id, {
    estado:              'inactivo',
    fecha_actualizacion: ahora
  });
  return true;
}

function saveGasto(data) {
  if (data.gasto_id) {
    var updated = updateGasto(data.gasto_id, data);
    return { ok: true, data: updated };
  } else {
    var created = createGasto(data);
    return { ok: true, data: created };
  }
}

// ============================================================
// VALIDACIONES
// ============================================================

function validateCampoData(data) {
  validateRequired(data.nombre, 'Nombre del campo');
  validateRequired(data.ubicacion, 'Ubicación');
  validateRequired(data.hectareas, 'Hectáreas');
}

function validateCampaniaData(data) {
  validateRequired(data.nombre, 'Nombre de campaña');
}

function validatePersonalData(data) {
  validateRequired(data.nombre, 'Nombre');
  validateRequired(data.apellido, 'Apellido');
  validateRequired(data.dni, 'DNI');
}

function validateInsumoData(data) {
  validateRequired(data.nombre, 'Nombre del insumo');
  validateRequired(data.unidad_medida, 'Unidad de medida');
}

function validateEquipoData(data) {
  validateRequired(data.nombre, 'Nombre del equipo');
}

function validateGastoData(data) {
  validateRequired(data.descripcion, 'Descripción');
  validateRequired(data.monto, 'Monto');
  validateRequired(data.fecha_gasto, 'Fecha del gasto');
}