// ── CREATE / UPDATE ──────────────────────────────────────────
function saveCampania(args) {
  try {
    var a = _normalizeArgs(args || {});
    var ahora = new Date().toISOString();

    if (a.campania_id) {
      // UPDATE — sin cambios
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
      return { ok: true, data: actualizado };
    }

    // CREATE
    var id = generateCampaniaId();  // ✅ CORREGIDO (antes: _generarCampaniaId)
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
    return { ok: true, data: nuevo };

  } catch (e) {
    Logger.log('Error saveCampania: ' + e.message);
    return { ok: false, message: e.message, data: null };
  }
}
