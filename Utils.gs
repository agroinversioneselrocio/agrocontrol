// ============================================================
// Utils.gs - ROCÍO AGROCONTROL V2
// Generadores de IDs y utilitários de validación
// ============================================================

// ============================================================
// GENERADORES DE ID
// ============================================================

function generateId(prefix) {
  var uuid = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
  return prefix + '-' + uuid;
}

function generateCampoId() {
  return generateId(CONFIG.ID_PREFIJOS.CAMPO);
}

function generateCampaniaId() {
  return generateId(CONFIG.ID_PREFIJOS.CAMPANIA);
}

function generateActividadId() {
  return generateId(CONFIG.ID_PREFIJOS.ACTIVIDAD);
}

function generatePersonalId() {
  return generateId(CONFIG.ID_PREFIJOS.PERSONAL);
}

function generateInsumoId() {
  return generateId(CONFIG.ID_PREFIJOS.INSUMO);
}

function generateEquipoId() {
  return generateId(CONFIG.ID_PREFIJOS.EQUIPO);
}

function generateGastoId() {
  return generateId(CONFIG.ID_PREFIJOS.GASTO);
}

function generateCosechaId() {
  return generateId(CONFIG.ID_PREFIJOS.COSECHA);
}

function generateVentaId() {
  return generateId(CONFIG.ID_PREFIJOS.VENTA);
}

function generateAlertaId() {
  return generateId(CONFIG.ID_PREFIJOS.ALERTA);
}

function generateAuditoriaId() {
  return generateId(CONFIG.ID_PREFIJOS.AUDITORIA);
}

// ============================================================
// VALIDACIONES
// ============================================================

function validateRequired(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === '') {
    throw new Error(fieldName + ' es obligatorio.');
  }
  return true;
}

function validateNumber(value, fieldName) {
  if (value === null || value === undefined || value === '') return true;
  var num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(fieldName + ' debe ser un número válido.');
  }
  return true;
}

function validatePositiveNumber(value, fieldName) {
  validateNumber(value, fieldName);
  if (parseFloat(value) <= 0) {
    throw new Error(fieldName + ' debe ser mayor a 0.');
  }
  return true;
}

function validateDate(value, fieldName) {
  if (!value) return true;
  var d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error(fieldName + ' debe ser una fecha válida.');
  }
  return true;
}

function validateEmail(value, fieldName) {
  if (!value) return true;
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(value))) {
    throw new Error(fieldName + ' debe ser un email válido.');
  }
  return true;
}

function validateInList(value, fieldName, allowedList) {
  if (!value) return true;
  if (allowedList.indexOf(value) < 0) {
    throw new Error(fieldName + ' debe ser uno de: ' + allowedList.join(', '));
  }
  return true;
}

function validateEntityExists(idColumn, idValue, sheetName) {
  var result = findById(sheetName, idColumn, idValue);
  if (!result) {
    throw new Error('No se encontró el registro con ID: ' + idValue);
  }
  return true;
}

// ============================================================
// VALIDACIONES DE NEGOCIO
// ============================================================

function validateCampoData(data) {
  validateRequired(data.nombre, 'Nombre');
  validateRequired(data.ubicacion, 'Ubicación');
  validatePositiveNumber(data.hectareas, 'Hectáreas');
  validateInList(data.estado, 'Estado', Object.values(CONFIG.ESTADO_CAMPO));
  return true;
}

// ✅ FIX: eliminados campo_id y cultivo como obligatorios
function validateCampaniaData(data) {
  validateRequired(data.nombre, 'Nombre');
  validateDate(data.fecha_inicio, 'Fecha inicio');
  validateDate(data.fecha_fin, 'Fecha fin');
  validateInList(data.estado, 'Estado', Object.values(CONFIG.ESTADO_CAMPANIA));
  return true;
}

function validatePersonalData(data) {
  validateRequired(data.nombre, 'Nombre');
  validateRequired(data.apellido, 'Apellido');
  validateNumber(data.dni, 'DNI');
  if (data.dni && String(data.dni).length !== 8) {
    throw new Error('DNI debe tener 8 dígitos.');
  }
  validateRequired(data.cargo, 'Cargo');
  return true;
}

function validateInsumoData(data) {
  validateRequired(data.nombre, 'Nombre');
  validateRequired(data.categoria, 'Categoría');
  validateRequired(data.unidad_medida, 'Unidad de medida');
  validateNumber(data.stock_actual, 'Stock actual');
  validateNumber(data.stock_minimo, 'Stock mínimo');
  return true;
}

function validateEquipoData(data) {
  validateRequired(data.nombre, 'Nombre');
  validateRequired(data.tipo, 'Tipo');
  validateNumber(data.costo_hora, 'Costo por hora');
  return true;
}

function validateGastoData(data) {
  validateRequired(data.categoria, 'Categoría');
  validateRequired(data.descripcion, 'Descripción');
  validatePositiveNumber(data.monto, 'Monto');
  validateDate(data.fecha_gasto, 'Fecha');
  return true;
}

function validateActividadData(data) {
  validateRequired(data.nombre_actividad, 'Nombre');
  validateRequired(data.campo_id, 'Campo');
  validateRequired(data.tipo_actividad, 'Tipo de actividad');
  validateInList(data.estado_actividad, 'Estado', Object.values(CONFIG.ESTADO_ACTIVIDAD));
  return true;
}

function validateCosechaData(data) {
  validateRequired(data.campania_id, 'Campaña');
  validateRequired(data.campo_id, 'Campo');
  validateDate(data.fecha_cosecha, 'Fecha de cosecha');
  validatePositiveNumber(data.jabas, 'Jabas');
  validatePositiveNumber(data.peso_bruto_kg, 'Peso bruto');
  return true;
}

function validateVentaData(data) {
  validateRequired(data.cosecha_id, 'Cosecha');
  validateRequired(data.comprador, 'Comprador');
  validateDate(data.fecha_venta, 'Fecha de venta');
  validatePositiveNumber(data.peso_neto_kg, 'Peso neto');
  validatePositiveNumber(data.precio_kg, 'Precio por kg');
  return true;
}

// ============================================================
// UTILIDADES
// ============================================================

function calculateTara(jabas) {
  return jabas * CONFIG.TARA_POR_JABA;
}

function calculatePesoNeto(pesoBruto, tara) {
  return pesoBruto - tara;
}

function calculateTotalCosecha(jabas, pesoBruto) {
  var tara = calculateTara(jabas);
  var pesoNeto = calculatePesoNeto(pesoBruto, tara);
  return {
    jabas: jabas,
    peso_bruto_kg: pesoBruto,
    tara_kg: tara,
    peso_neto_kg: pesoNeto
  };
}

function calculateCostoActividad(manoObra, insumos, equipos, adicional) {
  return (manoObra || 0) + (insumos || 0) + (equipos || 0) + (adicional || 0);
}

function formatCurrency(value) {
  if (value === null || value === undefined) return CONFIG.MONEDA_SIMBOLO + ' 0.00';
  var num = parseFloat(value);
  if (isNaN(num)) return CONFIG.MONEDA_SIMBOLO + ' 0.00';
  return CONFIG.MONEDA_SIMBOLO + ' ' + num.toFixed(2);
}