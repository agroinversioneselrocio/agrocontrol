// ============================================================
// Activities.gs - ROCÍO AGROCONTROL V2
// Gestión de Actividades + sub-módulos (personal, insumos, equipos)
// ============================================================

// ============================================================
// ACTIVIDADES (CABECERA)
// ============================================================

function listActividades(filtros) {
  var data = getSheetData(CONFIG.HOJAS.ACTIVIDADES);
  var resultados = data;

  if (filtros) {
    if (filtros.campo_id) {
      resultados = resultados.filter(function(r) { return r.campo_id === filtros.campo_id; });
    }
    if (filtros.campania_id) {
      resultados = resultados.filter(function(r) { return r.campania_id === filtros.campania_id; });
    }
    if (filtros.estado_actividad) {
      resultados = resultados.filter(function(r) { return r.estado_actividad === filtros.estado_actividad; });
    }
    if (filtros.tipo_actividad) {
      resultados = resultados.filter(function(r) { return r.tipo_actividad === filtros.tipo_actividad; });
    }
    if (filtros.search) {
      var term = String(filtros.search).toLowerCase();
      resultados = resultados.filter(function(r) {
        return String(r.nombre_actividad).toLowerCase().indexOf(term) >= 0;
      });
    }
  }

  return resultados.filter(function(r) { return r.id_actividad; });
}

function getActividadById(id) {
  var result = findById(CONFIG.HOJAS.ACTIVIDADES, 'id_actividad', id);
  return result ? result.data : null;
}

function createActividad(data) {
  validateActividadData(data);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    id_actividad: generateActividadId(),
    codigo_actividad: data.codigo_actividad || '',
    campania_id: data.campania_id || '',
    campo_id: data.campo_id,
    tipo_actividad: data.tipo_actividad,
    nombre_actividad: data.nombre_actividad,
    descripcion_actividad: data.descripcion_actividad || '',
    responsable_operativo_id: data.responsable_operativo_id || '',
    fecha_programada: data.fecha_programada || '',
    fecha_ejecucion: data.fecha_ejecucion || '',
    costo_mano_obra: 0,
    costo_insumos: 0,
    costo_equipos: 0,
    costo_adicional: 0,
    costo_total: 0,
    estado_actividad: data.estado_actividad || CONFIG.ESTADO_ACTIVIDAD.PENDIENTE,
    motivo_observacion: '',
    motivo_anulacion: '',
    creado_por: data.creado_por || '',
    cerrado_por: '',
    anulado_por: '',
    fecha_cierre: '',
    fecha_anulacion: '',
    actualizado_por: '',
    observaciones: '',
    fecha_creacion: ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.ACTIVIDADES, nuevo);
  return nuevo;
}

function updateActividad(id, data) {
  var ahora = getCurrentTimestamp();
  var updates = {
    codigo_actividad: data.codigo_actividad,
    campania_id: data.campania_id,
    campo_id: data.campo_id,
    tipo_actividad: data.tipo_actividad,
    nombre_actividad: data.nombre_actividad,
    descripcion_actividad: data.descripcion_actividad,
    responsable_operativo_id: data.responsable_operativo_id,
    fecha_programada: data.fecha_programada,
    fecha_ejecucion: data.fecha_ejecucion,
    costo_mano_obra: data.costo_mano_obra,
    costo_insumos: data.costo_insumos,
    costo_equipos: data.costo_equipos,
    costo_adicional: data.costo_adicional,
    costo_total: data.costo_total,
    motivo_observacion: data.motivo_observacion,
    observaciones: data.observaciones,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.ACTIVIDADES, 'id_actividad', id, updates);
  return getActividadById(id);
}

function deleteActividad(id) {
  return deleteRow(CONFIG.HOJAS.ACTIVIDADES, 'id_actividad', id);
}

function changeState(id, nuevoEstado, motivo, usuario) {
  var actividad = getActividadById(id);
  if (!actividad) throw new Error('Actividad no encontrada: ' + id);

  var ahora = getCurrentTimestamp();
  var updates = {
    estado_actividad: nuevoEstado,
    fecha_actualizacion: ahora
  };

  if (nuevoEstado === CONFIG.ESTADO_ACTIVIDAD.COMPLETADA) {
    updates.cerrado_por = usuario || '';
    updates.fecha_cierre = ahora;
  } else if (nuevoEstado === CONFIG.ESTADO_ACTIVIDAD.ANULADA) {
    updates.anulado_por = usuario || '';
    updates.fecha_anulacion = ahora;
    updates.motivo_anulacion = motivo || '';
  }

  updateRow(CONFIG.HOJAS.ACTIVIDADES, 'id_actividad', id, updates);
  return getActividadById(id);
}

function calculateTotalCost(id) {
  var actividad = getActividadById(id);
  if (!actividad) return 0;

  var costoPersonal = _getActividadCost(id, CONFIG.HOJAS.ACTIVIDAD_PERSONAL);
  var costoInsumos = _getActividadCost(id, CONFIG.HOJAS.ACTIVIDAD_INSUMOS);
  var costoEquipos = _getActividadCost(id, CONFIG.HOJAS.ACTIVIDAD_EQUIPOS);
  var adicional = parseFloat(actividad.costo_adicional || 0);

  var total = costoPersonal + costoInsumos + costoEquipos + adicional;

  updateActividad(id, { costo_total: total });
  return total;
}

function _getActividadCost(actividadId, hoja) {
  var data = getSheetData(hoja).filter(function(r) {
    return r.id_actividad === actividadId;
  });

  var total = 0;
  data.forEach(function(r) {
    var subtotal = parseFloat(r.subtotal_mano_obra || r.subtotal_insumo || r.subtotal_equipo || 0);
    total += subtotal;
  });
  return total;
}

// ============================================================
// ACTIVIDAD PERSONAL
// ============================================================

function listActividadPersonal(actividadId) {
  var data = getSheetData(CONFIG.HOJAS.ACTIVIDAD_PERSONAL);
  return data.filter(function(r) { return r.id_actividad === actividadId; });
}

function addPersonalToActividad(data) {
  validateRequired(data.id_actividad, 'Actividad');
  validateRequired(data.personal_id, 'Personal');

  var personal = getPersonalById(data.personal_id);
  var ahora = getCurrentTimestamp();

  var nombreCompleto = personal ? personal.nombre + ' ' + personal.apellido : data.nombre_completo;
  var dni = personal ? personal.dni : data.dni;
  var cargo = personal ? personal.cargo : data.cargo;

  var horas = parseFloat(data.horas_trabajadas || 0);
  var tarifa = parseFloat(data.tarifa_jornal || 0);
  var subtotal = horas * tarifa;

  var nuevo = {
    id_actividad_personal: generateId('APP'),
    id_actividad: data.id_actividad,
    personal_id: data.personal_id,
    nombre_completo: nombreCompleto,
    dni: dni,
    cargo: cargo,
    funcion: data.funcion || '',
    horas_trabajadas: horas,
    tarifa_jornal: tarifa,
    subtotal_mano_obra: subtotal,
    estado_pago: 'pendiente',
    observaciones: data.observaciones || '',
    fecha_creacion: ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.ACTIVIDAD_PERSONAL, nuevo);

  // Actualizar costo en actividad
  calculateTotalCost(data.id_actividad);
  return nuevo;
}

function updatePersonalActividad(id, data) {
  var result = findById(CONFIG.HOJAS.ACTIVIDAD_PERSONAL, 'id_actividad_personal', id);
  if (!result) throw new Error('Personal de actividad no encontrado: ' + id);

  var ahora = getCurrentTimestamp();
  var updates = {
    funcion: data.funcion,
    horas_trabajadas: data.horas_trabajadas,
    tarifa_jornal: data.tarifa_jornal,
    subtotal_mano_obra: parseFloat(data.horas_trabajadas || 0) * parseFloat(data.tarifa_jornal || 0),
    estado_pago: data.estado_pago,
    observaciones: data.observaciones,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.ACTIVIDAD_PERSONAL, 'id_actividad_personal', id, updates);
  return result.data;
}

function removePersonalFromActividad(id) {
  var result = findById(CONFIG.HOJAS.ACTIVIDAD_PERSONAL, 'id_actividad_personal', id);
  if (!result) return null;

  var actividadId = result.data.id_actividad;

  var hoja = getSheet(CONFIG.HOJAS.ACTIVIDAD_PERSONAL);
  hoja.deleteRow(result.index);

  calculateTotalCost(actividadId);
  return { ok: true };
}

// ============================================================
// ACTIVIDAD INSUMOS
// ============================================================

function listActividadInsumos(actividadId) {
  var data = getSheetData(CONFIG.HOJAS.ACTIVIDAD_INSUMOS);
  return data.filter(function(r) { return r.id_actividad === actividadId; });
}

function addInsumoToActividad(data) {
  validateRequired(data.id_actividad, 'Actividad');
  validateRequired(data.insumo_id, 'Insumo');

  var insumo = getInsumoById(data.insumo_id);
  var ahora = getCurrentTimestamp();

  var nombreInsumo = insumo ? insumo.nombre : data.nombre_insumo;
  var categoria = insumo ? insumo.categoria : data.categoria;
  var unidad = insumo ? insumo.unidad_medida : data.unidad_medida;

  var cantidad = parseFloat(data.cantidad_usada || 0);
  var precio = parseFloat(data.precio_unitario || 0);
  var subtotal = cantidad * precio;

  var nuevo = {
    id_actividad_insumo: generateId('AI'),
    id_actividad: data.id_actividad,
    insumo_id: data.insumo_id,
    nombre_insumo: nombreInsumo,
    categoria: categoria,
    unidad_medida: unidad,
    cantidad_usada: cantidad,
    cantidad_devuelta: data.cantidad_devuelta || 0,
    precio_unitario: precio,
    subtotal_insumo: subtotal,
    lote: data.lote || '',
    fecha_vencimiento: data.fecha_vencimiento || '',
    periodo_carencia_cumplido: data.periodo_carencia_cumplido || '',
    observaciones: data.observaciones || '',
    fecha_creacion: ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.ACTIVIDAD_INSUMOS, nuevo);

  // Descontar del stock
  if (insumo) {
    updateStockInsumo(data.insumo_id, -cantidad);
  }

  calculateTotalCost(data.id_actividad);
  return nuevo;
}

function updateInsumoActividad(id, data) {
  var result = findById(CONFIG.HOJAS.ACTIVIDAD_INSUMOS, 'id_actividad_insumo', id);
  if (!result) throw new Error('Insumo de actividad no encontrado: ' + id);

  var ahora = getCurrentTimestamp();
  var cantidad = parseFloat(data.cantidad_usada || 0);
  var precio = parseFloat(data.precio_unitario || 0);

  var updates = {
    cantidad_usada: cantidad,
    cantidad_devuelta: data.cantidad_devuelta,
    precio_unitario: precio,
    subtotal_insumo: cantidad * precio,
    lote: data.lote,
    fecha_vencimiento: data.fecha_vencimiento,
    observaciones: data.observaciones,
    fecha_actualizacion: ahora
  };

  updateRow(CONFIG.HOJAS.ACTIVIDAD_INSUMOS, 'id_actividad_insumo', id, updates);
  return result.data;
}

function removeInsumoFromActividad(id) {
  var result = findById(CONFIG.HOJAS.ACTIVIDAD_INSUMOS, 'id_actividad_insumo', id);
  if (!result) return null;

  var actividadId = result.data.id_actividad;
  var hoja = getSheet(CONFIG.HOJAS.ACTIVIDAD_INSUMOS);
  hoja.deleteRow(result.index);

  calculateTotalCost(actividadId);
  return { ok: true };
}

// ============================================================
// ACTIVIDAD EQUIPOS
// ============================================================

function listActividadEquipos(actividadId) {
  var data = getSheetData(CONFIG.HOJAS.ACTIVIDAD_EQUIPOS);
  return data.filter(function(r) { return r.id_actividad === actividadId; });
}

function addEquipoToActividad(data) {
  validateRequired(data.id_actividad, 'Actividad');
  validateRequired(data.equipo_id, 'Equipo');

  var equipo = getEquipoById(data.equipo_id);
  var ahora = getCurrentTimestamp();

  var nombreEquipo = equipo ? equipo.nombre : data.nombre_equipo;
  var tipo = equipo ? equipo.tipo : data.tipo;
  var marca = equipo ? equipo.marca : data.marca;
  var modelo = equipo ? equipo.modelo : data.modelo;

  var horas = parseFloat(data.horas_uso || 0);
  var costoHora = parseFloat(data.costo_hora || equipo?.costo_hora || 0);
  var subtotal = horas * costoHora;

  var combustible = parseFloat(data.combustible_litros || 0);
  var costoCombustible = combustible * 4.50; // Precio aproximado

  var nuevo = {
    id_actividad_equipo: generateId('AE'),
    id_actividad: data.id_actividad,
    equipo_id: data.equipo_id,
    nombre_equipo: nombreEquipo,
    tipo: tipo,
    marca: marca,
    modelo: modelo,
    horas_uso: horas,
    costo_hora: costoHora,
    subtotal_equipo: subtotal,
    operador_id: data.operador_id || '',
    nombre_operador: data.nombre_operador || '',
    combustible_litros: combustible,
    costo_combustible: costoCombustible,
    observaciones: data.observaciones || '',
    fecha_creacion: ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.ACTIVIDAD_EQUIPOS, nuevo);
  calculateTotalCost(data.id_actividad);
  return nuevo;
}

function updateEquipoActividad(id, data) {
  var result = findById(CONFIG.HOJAS.ACTIVIDAD_EQUIPOS, 'id_actividad_equipo', id);
  if (!result) throw new Error('Equipo de actividad no encontrado: ' + id);

  var horas = parseFloat(data.horas_uso || 0);
  var costoHora = parseFloat(data.costo_hora || 0);
  var combustible = parseFloat(data.combustible_litros || 0);

  var updates = {
    horas_uso: horas,
    costo_hora: costoHora,
    subtotal_equipo: horas * costoHora,
    operador_id: data.operador_id,
    nombre_operador: data.nombre_operador,
    combustible_litros: combustible,
    costo_combustible: combustible * 4.50,
    observaciones: data.observaciones,
    fecha_actualizacion: getCurrentTimestamp()
  };

  updateRow(CONFIG.HOJAS.ACTIVIDAD_EQUIPOS, 'id_actividad_equipo', id, updates);
  return result.data;
}

function removeEquipoFromActividad(id) {
  var result = findById(CONFIG.HOJAS.ACTIVIDAD_EQUIPOS, 'id_actividad_equipo', id);
  if (!result) return null;

  var actividadId = result.data.id_actividad;
  var hoja = getSheet(CONFIG.HOJAS.ACTIVIDAD_EQUIPOS);
  hoja.deleteRow(result.index);

  calculateTotalCost(actividadId);
  return { ok: true };
}

// ============================================================
// RESÚMENES
// ============================================================

function getActividadesResumen(filtros) {
  var actividades = listActividades(filtros);
  var resumen = {
    total: actividades.length,
    pendiente: 0,
    en_proceso: 0,
    completada: 0,
    anulada: 0,
    costoTotal: 0
  };

  actividades.forEach(function(a) {
    if (a.estado_actividad === CONFIG.ESTADO_ACTIVIDAD.PENDIENTE) resumen.pendiente++;
    else if (a.estado_actividad === CONFIG.ESTADO_ACTIVIDAD.EN_PROCESO) resumen.en_proceso++;
    else if (a.estado_actividad === CONFIG.ESTADO_ACTIVIDAD.COMPLETADA) {
      resumen.completada++;
      resumen.costoTotal += parseFloat(a.costo_total || 0);
    }
    else if (a.estado_actividad === CONFIG.ESTADO_ACTIVIDAD.ANULADA) resumen.anulada++;
  });

  return resumen;
}