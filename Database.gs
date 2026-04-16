// ============================================================
// Database.gs - ROCÍO AGROCONTROL V2
// Setup + Helpers para acceso a hojas de cálculo
// ============================================================

// ============================================================
// SCHEMA - Definición de hojas y columnas
// ============================================================

function getSheetSchemaConfig() {
  return {

    // ── SISTEMA ──────────────────────────────────────────────
    'usuarios': [
      'usuario_id', 'username', 'password',
      'nombre', 'apellido', 'email',
      'rol', 'estado', 'intentos_fallidos', 'fecha_bloqueo', 'ultimo_acceso',
      'created_by', 'fecha_creacion', 'fecha_actualizacion'
    ],
    'sesiones': [
      'sesion_id', 'usuario_id', 'token', 'rol',
      'ip_referencia', 'fecha_inicio', 'fecha_expira',
      'fecha_ultimo_acceso', 'estado', 'fecha_cierre'
    ],
    'auditoria': [
      'auditoria_id', 'usuario_id', 'accion',
      'entidad', 'entidad_id',
      'datos_anteriores', 'datos_nuevos',
      'ip_referencia', 'timestamp', 'resultado'
    ],
    'alertas': [
      'alerta_id', 'tipo', 'titulo', 'mensaje',
      'entidad', 'entidad_id', 'prioridad', 'estado',
      'usuario_destino', 'fecha_creacion', 'fecha_resolucion'
    ],

    // ── MAESTROS ─────────────────────────────────────────────
    'campos': [
      'campo_id', 'nombre', 'ubicacion', 'hectareas',
      'tipo_cultivo', 'estado', 'propietario',
      'fecha_creacion', 'fecha_actualizacion'
    ],
    'personal': [
      'personal_id', 'nombre', 'apellido', 'dni',
      'cargo', 'telefono', 'salario_base',
      'fecha_ingreso', 'estado',
      'fecha_creacion', 'fecha_actualizacion'
    ],
    'insumos': [
      'insumo_id', 'nombre', 'categoria',
      'unidad_medida', 'stock_actual', 'stock_minimo',
      'precio_unitario', 'proveedor', 'fecha_vencimiento',
      'periodo_carencia_dias', 'estado', 'observaciones',
      'fecha_creacion', 'fecha_actualizacion'
    ],
    'equipos': [
      'equipo_id', 'nombre', 'tipo', 'marca', 'modelo',
      'numero_serie', 'costo_hora', 'costo_dia',
      'estado', 'ultimo_mantenimiento',
      'fecha_creacion', 'fecha_actualizacion'
    ],
    'catalogo_tipos_actividad': [
      'id_tipo', 'codigo', 'nombre', 'categoria', 'descripcion',
      'requiere_personal', 'requiere_insumos', 'requiere_equipos',
      'aplica_planilla', 'impacta_costos',
      'color', 'icono', 'estado'
    ],

    // ── CAMPAÑAS (modelo global — sin campo_id ni cultivo) ───
    'campanias': [
      'campania_id', 'nombre',
      'fecha_inicio', 'fecha_fin',
      'presupuesto', 'costo_real', 'ingreso_real', 'utilidad',
      'estado', 'observaciones',
      'fecha_creacion', 'fecha_actualizacion'
    ],

    // ── OPERACIONES ──────────────────────────────────────────
    'actividades': [
      'id_actividad', 'codigo_actividad',
      'campania_id', 'campo_id',
      'tipo_actividad', 'nombre_actividad', 'descripcion_actividad',
      'responsable_operativo_id',
      'fecha_programada', 'fecha_ejecucion',
      'costo_mano_obra', 'costo_insumos', 'costo_equipos',
      'costo_adicional', 'costo_total',
      'estado_actividad',
      'motivo_observacion', 'motivo_anulacion',
      'creado_por', 'cerrado_por', 'anulado_por',
      'fecha_cierre', 'fecha_anulacion', 'actualizado_por',
      'observaciones', 'fecha_creacion', 'fecha_actualizacion'
    ],
    'actividad_personal': [
      'id_actividad_personal', 'id_actividad',
      'personal_id', 'nombre_completo', 'dni', 'cargo', 'funcion',
      'horas_trabajadas', 'tarifa_jornal', 'subtotal_mano_obra',
      'estado_pago', 'observaciones',
      'fecha_creacion', 'fecha_actualizacion'
    ],
    'actividad_insumos': [
      'id_actividad_insumo', 'id_actividad',
      'insumo_id', 'nombre_insumo', 'categoria',
      'unidad_medida', 'cantidad_usada', 'cantidad_devuelta',
      'precio_unitario', 'subtotal_insumo',
      'lote', 'fecha_vencimiento', 'periodo_carencia_cumplido',
      'observaciones', 'fecha_creacion', 'fecha_actualizacion'
    ],
    'actividad_equipos': [
      'id_actividad_equipo', 'id_actividad',
      'equipo_id', 'nombre_equipo', 'tipo', 'marca', 'modelo',
      'horas_uso', 'costo_hora', 'subtotal_equipo',
      'operador_id', 'nombre_operador',
      'combustible_litros', 'costo_combustible',
      'observaciones', 'fecha_creacion', 'fecha_actualizacion'
    ],

    // ── PRODUCCIÓN Y FINANZAS ────────────────────────────────
    'cosechas': [
      'cosecha_id', 'campania_id', 'campo_id',
      'fecha_cosecha', 'jabas',
      'peso_bruto_kg', 'tara_kg', 'peso_neto_kg',
      'trabajadores_ids', 'costo_cosecha',
      'precio_kg', 'total_venta',
      'estado', 'venta_id', 'observaciones',
      'created_by', 'fecha_creacion', 'fecha_actualizacion'
    ],
    'ventas': [
      'venta_id', 'cosecha_id', 'campania_id', 'campo_id',
      'fecha_venta', 'comprador',
      'peso_neto_kg', 'precio_kg', 'total_venta',
      'forma_pago', 'estado', 'comprobante', 'observaciones',
      'created_by', 'fecha_creacion', 'fecha_actualizacion'
    ],
    'gastos': [
      'gasto_id', 'campania_id', 'campo_id',
      'categoria', 'descripcion', 'monto',
      'fecha_gasto', 'responsable_id', 'comprobante',
      'proveedor', 'estado', 'observaciones',
      'fecha_creacion', 'fecha_actualizacion'
    ]

  };
}

function getSchemaBySheet(sheetName) {
  var schema = getSheetSchemaConfig();
  return schema[sheetName] || null;
}

// ============================================================
// SETUP - Inicialización de base de datos
// ============================================================

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schema = getSheetSchemaConfig();

  Logger.log('Iniciando setupDatabase()...');

  // Eliminar hojas existentes excepto la primera
  var sheets = ss.getSheets();
  sheets.forEach(function(sheet, index) {
    if (index > 0) ss.deleteSheet(sheet);
  });

  // Renombrar primera hoja
  var firstSheetName = Object.keys(schema)[0];
  ss.getSheets()[0].setName(firstSheetName);
  ss.getSheets()[0].getRange(1, 1, 1, schema[firstSheetName].length)
    .setValues([schema[firstSheetName]]);

  // Crear resto de hojas
  Object.keys(schema).forEach(function(sheetName, index) {
    if (index === 0) return;
    var sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, schema[sheetName].length)
         .setValues([schema[sheetName]]);
  });

  _insertarDatosSemilla(ss);

  Logger.log('✅ setupDatabase() completado. ' + Object.keys(schema).length + ' hojas creadas.');
}

function initMissingSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schema = getSheetSchemaConfig();
  var results = [];

  Object.keys(schema).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, schema[sheetName].length)
           .setValues([schema[sheetName]]);
      results.push({ hoja: sheetName, accion: 'CREADA' });
    } else {
      var lastCol = Math.max(sheet.getLastColumn(), schema[sheetName].length);
      var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var needsUpdate = false;

      schema[sheetName].forEach(function(col, i) {
        if (headerRow[i] !== col) needsUpdate = true;
      });

      if (needsUpdate) {
        sheet.getRange(1, 1, 1, schema[sheetName].length)
             .setValues([schema[sheetName]]);
        results.push({ hoja: sheetName, accion: 'ENCABEZADOS_ACTUALIZADOS' });
      } else {
        results.push({ hoja: sheetName, accion: 'OK' });
      }
    }
  });

  Logger.log('initMissingSheets: ' + JSON.stringify(results));
  return results;
}

function validateIntegrity() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schema = getSheetSchemaConfig();
  var errores = [];

  Object.keys(schema).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      errores.push('FALTA: ' + sheetName);
      return;
    }

    var headers = sheet.getRange(1, 1, 1, schema[sheetName].length).getValues()[0];
    schema[sheetName].forEach(function(col, i) {
      if (headers[i] !== col) {
        errores.push(
          sheetName + ' col[' + (i + 1) + ']: esperado="' + col +
          '" encontrado="' + (headers[i] || 'VACÍO') + '"'
        );
      }
    });
  });

  Logger.log('validateIntegrity: ' + JSON.stringify({ integra: errores.length === 0, errores: errores }));
  return { integra: errores.length === 0, errores: errores };
}

// ============================================================
// HELPERS - Acceso a datos
// ============================================================

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Hoja no encontrada: "' + sheetName + '". Ejecutar initMissingSheets() primero.');
  }
  return sheet;
}

function getSheetData(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function findById(sheetName, idColumn, idValue) {
  var data = getSheetData(sheetName);
  for (var i = 0; i < data.length; i++) {
    if (data[i][idColumn] === idValue) {
      return { data: data[i], index: i + 2 }; // +2: fila 1 = headers
    }
  }
  return null;
}

function appendRow(sheetName, dataObj) {
  var sheet = getSheet(sheetName);
  var schema = getSchemaBySheet(sheetName);
  if (!schema) throw new Error('Schema no definido para: ' + sheetName);

  var row = schema.map(function(col) {
    return dataObj[col] !== undefined ? dataObj[col] : '';
  });

  sheet.appendRow(row);
  return row;
}

function updateRow(sheetName, idColumn, idValue, dataObj) {
  var result = findById(sheetName, idColumn, idValue);
  if (!result) throw new Error('Registro no encontrado: ' + idValue);

  var sheet = getSheet(sheetName);
  var schema = getSchemaBySheet(sheetName);
  var rowNum = result.index;

  schema.forEach(function(col, i) {
    if (dataObj[col] !== undefined) {
      sheet.getRange(rowNum, i + 1).setValue(dataObj[col]);
    }
  });

  return result.data;
}

function deleteRow(sheetName, idColumn, idValue) {
  var result = findById(sheetName, idColumn, idValue);
  if (!result) throw new Error('Registro no encontrado: ' + idValue);

  var sheet = getSheet(sheetName);
  var schema = getSchemaBySheet(sheetName);
  var estadoIdx = schema.indexOf('estado');

  if (estadoIdx >= 0) {
    sheet.getRange(result.index, estadoIdx + 1).setValue('anulada');
  } else {
    sheet.deleteRow(result.index);
  }

  return true;
}

function searchRows(sheetName, filters) {
  var data = getSheetData(sheetName);
  var results = data;

  if (filters) {
    Object.keys(filters).forEach(function(key) {
      if (filters[key]) {
        results = results.filter(function(row) {
          return String(row[key]).toLowerCase()
                 .indexOf(String(filters[key]).toLowerCase()) >= 0;
        });
      }
    });
  }

  return results;
}

function countRows(sheetName, estadoFilter) {
  var data = getSheetData(sheetName);
  if (!estadoFilter) return data.length;

  return data.filter(function(row) {
    return row.estado === estadoFilter;
  }).length;
}

// ============================================================
// DATOS SEMILLA
// ============================================================

function _insertarDatosSemilla(ss) {
  var ahora = new Date().toISOString();

  // Usuario admin
  var sheetUsuarios = ss.getSheetByName('usuarios');
  sheetUsuarios.appendRow([
    'USR-001', 'admin', 'Admin123',
    'Admin', 'Sistema', 'admin@rocio.com',
    'admin', 'activo', 0, '', '',
    'sistema', ahora, ahora
  ]);

  // Campo demo
  var sheetCampos = ss.getSheetByName('campos');
  sheetCampos.appendRow([
    'CAM-001', 'Campo Demo', 'Sector Norte', 5.5,
    'Espárrago', 'activo', '',
    ahora, ahora
  ]);

  // Campaña demo — modelo global (sin campo_id ni cultivo)
  var sheetCampanias = ss.getSheetByName('campanias');
  sheetCampanias.appendRow([
    'CPN-001', 'Campaña 2026',
    ahora, '',
    5000, 0, 0, 0,
    'planificada', 'Campaña de prueba inicial',
    ahora, ahora
  ]);

  Logger.log('✅ Datos semilla insertados.');
}