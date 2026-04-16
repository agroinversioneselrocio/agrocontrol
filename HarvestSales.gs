// ============================================================
// HarvestSales.gs - ROCÍO AGROCONTROL V2
// Gestión de Cosechas y Ventas
// ============================================================

// ============================================================
// COSECHAS
// ============================================================

function listCosechas(filtros) {
  var data = getSheetData(CONFIG.HOJAS.COSECHAS);
  var resultados = data;

  if (filtros) {
    if (filtros.campania_id) {
      resultados = resultados.filter(function(r) { return r.campania_id === filtros.campania_id; });
    }
    if (filtros.campo_id) {
      resultados = resultados.filter(function(r) { return r.campo_id === filtros.campo_id; });
    }
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
  }

  return resultados.filter(function(r) { return r.cosecha_id; });
}

function getCosechaById(id) {
  var result = findById(CONFIG.HOJAS.COSECHAS, 'cosecha_id', id);
  return result ? result.data : null;
}

function createCosecha(data) {
  validateCosechaData(data);

  var jabas = parseFloat(data.jabas || 0);
  var pesoBruto = parseFloat(data.peso_bruto_kg || 0);
  var calculos = calculateTotalCosecha(jabas, pesoBruto);

  var ahora = getCurrentTimestamp();
  var nuevo = {
    cosecha_id: generateCosechaId(),
    campania_id: data.campania_id,
    campo_id: data.campo_id,
    fecha_cosecha: data.fecha_cosecha,
    jabas: jabas,
    peso_bruto_kg: pesoBruto,
    tara_kg: calculos.tara_kg,
    peso_neto_kg: calculos.peso_neto_kg,
    trabajadores_ids: data.trabajadores_ids || '',
    costo_cosecha: data.costo_cosecha || 0,
    precio_kg: data.precio_kg || 0,
    total_venta: 0,
    estado: CONFIG.ESTADO_COSECHA.PENDIENTE_VENTA,
    venta_id: '',
    observaciones: data.observaciones || '',
    created_by: data.created_by || '',
    fecha_creacion: ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.COSECHAS, nuevo);
  return nuevo;
}

// FIX: ahora incluye estado y venta_id en updates
function updateCosecha(id, data) {
  var jabas = parseFloat(data.jabas || 0);
  var pesoBruto = parseFloat(data.peso_bruto_kg || 0);
  var calculos = calculateTotalCosecha(jabas, pesoBruto);

  var ahora = getCurrentTimestamp();
  var updates = {
    campania_id: data.campania_id,
    campo_id: data.campo_id,
    fecha_cosecha: data.fecha_cosecha,
    jabas: jabas,
    peso_bruto_kg: pesoBruto,
    tara_kg: calculos.tara_kg,
    peso_neto_kg: calculos.peso_neto_kg,
    trabajadores_ids: data.trabajadores_ids,
    costo_cosecha: data.costo_cosecha,
    precio_kg: data.precio_kg,
    observaciones: data.observaciones,
    fecha_actualizacion: ahora
  };

  // FIX: incluir estado si viene en data
  if (data.estado !== undefined) {
    updates.estado = data.estado;
  }

  // FIX: incluir venta_id si viene en data
  if (data.venta_id !== undefined) {
    updates.venta_id = data.venta_id;
  }

  // FIX: incluir total_venta si viene en data
  if (data.total_venta !== undefined) {
    updates.total_venta = data.total_venta;
  } else if (data.precio_kg) {
    // Recalcular total si hay precio pero no viene total_venta explícito
    var cosecha = getCosechaById(id);
    updates.total_venta = calculos.peso_neto_kg * parseFloat(data.precio_kg || cosecha.precio_kg || 0);
  }

  updateRow(CONFIG.HOJAS.COSECHAS, 'cosecha_id', id, updates);
  return getCosechaById(id);
}

// FIX: usa anularVenta() en lugar de updateVenta() con objeto incompleto
function deleteCosecha(id) {
  var cosecha = getCosechaById(id);
  if (cosecha && cosecha.venta_id) {
    var venta = getVentaById(cosecha.venta_id);
    if (venta && venta.estado !== CONFIG.ESTADO_VENTA.ANULADA) {
      anularVenta(cosecha.venta_id, 'Cosecha eliminada');
    }
  }
  return deleteRow(CONFIG.HOJAS.COSECHAS, 'cosecha_id', id);
}

// ============================================================
// VENTAS
// ============================================================

function listVentas(filtros) {
  var data = getSheetData(CONFIG.HOJAS.VENTAS);
  var resultados = data;

  if (filtros) {
    if (filtros.cosecha_id) {
      resultados = resultados.filter(function(r) { return r.cosecha_id === filtros.cosecha_id; });
    }
    if (filtros.campania_id) {
      resultados = resultados.filter(function(r) { return r.campania_id === filtros.campania_id; });
    }
    if (filtros.estado) {
      resultados = resultados.filter(function(r) { return r.estado === filtros.estado; });
    }
  }

  return resultados.filter(function(r) { return r.venta_id; });
}

function getVentaById(id) {
  var result = findById(CONFIG.HOJAS.VENTAS, 'venta_id', id);
  return result ? result.data : null;
}

// FIX: el updateCosecha interno ahora pasa estado, venta_id y total_venta explícitamente
function createVenta(data) {
  validateVentaData(data);

  var cosecha = getCosechaById(data.cosecha_id);
  if (!cosecha) throw new Error('Cosecha no encontrada: ' + data.cosecha_id);

  if (cosecha.estado !== CONFIG.ESTADO_COSECHA.PENDIENTE_VENTA) {
    throw new Error('La cosecha ya fue vendida o está anulada.');
  }

  var pesoNeto = parseFloat(data.peso_neto_kg || cosecha.peso_neto_kg);
  var precioKg = parseFloat(data.precio_kg);
  var total = pesoNeto * precioKg;

  var ahora = getCurrentTimestamp();
  var nuevo = {
    venta_id: generateVentaId(),
    cosecha_id: data.cosecha_id,
    campania_id: cosecha.campania_id,
    campo_id: cosecha.campo_id,
    fecha_venta: data.fecha_venta,
    comprador: data.comprador,
    peso_neto_kg: pesoNeto,
    precio_kg: precioKg,
    total_venta: total,
    forma_pago: data.forma_pago || 'contado',
    estado: CONFIG.ESTADO_VENTA.REGISTRADA,
    comprobante: data.comprobante || '',
    observaciones: data.observaciones || '',
    created_by: data.created_by || '',
    fecha_creacion: ahora,
    fecha_actualizacion: ahora
  };

  appendRow(CONFIG.HOJAS.VENTAS, nuevo);

  // FIX: pasar estado, venta_id y total_venta explícitamente para que updateCosecha los escriba
  updateCosecha(data.cosecha_id, {
    campania_id: cosecha.campania_id,
    campo_id: cosecha.campo_id,
    fecha_cosecha: cosecha.fecha_cosecha,
    jabas: cosecha.jabas,
    peso_bruto_kg: cosecha.peso_bruto_kg,
    trabajadores_ids: cosecha.trabajadores_ids,
    costo_cosecha: cosecha.costo_cosecha,
    precio_kg: precioKg,
    total_venta: total,
    estado: CONFIG.ESTADO_COSECHA.VENDIDA,
    venta_id: nuevo.venta_id,
    observaciones: cosecha.observaciones
  });

  return nuevo;
}

function updateVenta(id, data) {
  var ahora = getCurrentTimestamp();

  var venta = getVentaById(id);
  if (!venta) throw new Error('Venta no encontrada: ' + id);

  var updates = {
    fecha_venta: data.fecha_venta !== undefined ? data.fecha_venta : venta.fecha_venta,
    comprador: data.comprador !== undefined ? data.comprador : venta.comprador,
    peso_neto_kg: data.peso_neto_kg !== undefined ? data.peso_neto_kg : venta.peso_neto_kg,
    precio_kg: data.precio_kg !== undefined ? data.precio_kg : venta.precio_kg,
    forma_pago: data.forma_pago !== undefined ? data.forma_pago : venta.forma_pago,
    estado: data.estado !== undefined ? data.estado : venta.estado,
    comprobante: data.comprobante !== undefined ? data.comprobante : venta.comprobante,
    observaciones: data.observaciones !== undefined ? data.observaciones : venta.observaciones,
    fecha_actualizacion: ahora
  };

  // Recalcular total con los valores finales
  var peso = parseFloat(updates.peso_neto_kg);
  var precio = parseFloat(updates.precio_kg);
  updates.total_venta = peso * precio;

  updateRow(CONFIG.HOJAS.VENTAS, 'venta_id', id, updates);
  return getVentaById(id);
}

function deleteVenta(id) {
  return deleteRow(CONFIG.HOJAS.VENTAS, 'venta_id', id);
}

function anularVenta(id, motivo) {
  var venta = getVentaById(id);
  if (!venta) throw new Error('Venta no encontrada: ' + id);

  if (venta.estado === CONFIG.ESTADO_VENTA.ANULADA) {
    throw new Error('La venta ya está anulada.');
  }

  var ahora = getCurrentTimestamp();

  // Actualizar venta
  updateRow(CONFIG.HOJAS.VENTAS, 'venta_id', id, {
    estado: CONFIG.ESTADO_VENTA.ANULADA,
    observaciones: (venta.observaciones || '') + '\n[ANULADA: ' + motivo + ']',
    fecha_actualizacion: ahora
  });

  // Revertir cosecha a pendiente
  if (venta.cosecha_id) {
    var cosecha = getCosechaById(venta.cosecha_id);
    if (cosecha) {
      updateCosecha(venta.cosecha_id, {
        campania_id: cosecha.campania_id,
        campo_id: cosecha.campo_id,
        fecha_cosecha: cosecha.fecha_cosecha,
        jabas: cosecha.jabas,
        peso_bruto_kg: cosecha.peso_bruto_kg,
        trabajadores_ids: cosecha.trabajadores_ids,
        costo_cosecha: cosecha.costo_cosecha,
        precio_kg: cosecha.precio_kg,
        observaciones: cosecha.observaciones,
        estado: CONFIG.ESTADO_COSECHA.PENDIENTE_VENTA,
        venta_id: '',
        total_venta: 0
      });
    }
  }

  return getVentaById(id);
}

// ============================================================
// RESÚMENES
// ============================================================

function getCosechasResumenCampania(campaniaId) {
  var cosechas = listCosechas({ campania_id: campaniaId });
  var resumen = {
    total: cosechas.length,
    pendiente: 0,
    vendida: 0,
    anulada: 0,
    totalJabas: 0,
    totalPesoNeto: 0,
    totalVenta: 0
  };

  cosechas.forEach(function(c) {
    if (c.estado === CONFIG.ESTADO_COSECHA.PENDIENTE_VENTA) resumen.pendiente++;
    else if (c.estado === CONFIG.ESTADO_COSECHA.VENDIDA) {
      resumen.vendida++;
      resumen.totalVenta += parseFloat(c.total_venta || 0);
    }
    else if (c.estado === CONFIG.ESTADO_COSECHA.ANULADA) resumen.anulada++;

    resumen.totalJabas += parseFloat(c.jabas || 0);
    resumen.totalPesoNeto += parseFloat(c.peso_neto_kg || 0);
  });

  return resumen;
}

function getVentasResumenCampania(campaniaId) {
  var ventas = listVentas({ campania_id: campaniaId });
  var resumen = {
    total: ventas.length,
    registrada: 0,
    anulada: 0,
    totalVenta: 0
  };

  ventas.forEach(function(v) {
    if (v.estado === CONFIG.ESTADO_VENTA.REGISTRADA) {
      resumen.registrada++;
      resumen.totalVenta += parseFloat(v.total_venta || 0);
    }
    else if (v.estado === CONFIG.ESTADO_VENTA.ANULADA) resumen.anulada++;
  });

  return resumen;
}
