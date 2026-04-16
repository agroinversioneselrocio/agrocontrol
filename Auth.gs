// ============================================================
// Auth.gs - ROCÍO AGROCONTROL V2
// Autenticación y gestión de sesiones
// ============================================================

// FIX: eliminadas variables sueltas MAX_INTENTOS y LOCKOUT_MINUTES.
// Ahora se leen desde CONFIG.MAX_INTENTOS y CONFIG.LOCKOUT_MINUTES
// para tener una única fuente de verdad.

var SESSION_PREFIX = 'session_';

// ============================================================
// LOGIN
// ============================================================

function login(username, password, ip) {
  try {
    validateRequired(username, 'Usuario');
    validateRequired(password, 'Contraseña');

    var usuarios = getSheetData(CONFIG.HOJAS.USUARIOS);
    var usuario  = null;

    for (var i = 0; i < usuarios.length; i++) {
      if (String(usuarios[i].username).toLowerCase() === String(username).toLowerCase()) {
        usuario = usuarios[i];
        break;
      }
    }

    if (!usuario) {
      return { ok: false, message: 'Usuario o contraseña incorrectos.', data: null };
    }

    if (usuario.estado !== CONFIG.ESTADO_USUARIO.ACTIVO) {
      return { ok: false, message: 'Usuario inactivo o bloqueado.', data: null };
    }

    // Verificar bloqueo por intentos
    var intentos = parseInt(usuario.intentos_fallidos) || 0;
    if (intentos >= CONFIG.MAX_INTENTOS) {
      var fechaBloqueo = usuario.fecha_bloqueo ? new Date(usuario.fecha_bloqueo) : null;
      if (fechaBloqueo) {
        var minutosPasados = (new Date() - fechaBloqueo) / 60000;
        if (minutosPasados < CONFIG.LOCKOUT_MINUTES) {
          var restantes = Math.ceil(CONFIG.LOCKOUT_MINUTES - minutosPasados);
          return {
            ok: false,
            message: 'Cuenta bloqueada. Intente en ' + restantes + ' minutos.',
            data: null
          };
        } else {
          // Reset intentos si ya pasó el tiempo de bloqueo
          updateRow(CONFIG.HOJAS.USUARIOS, 'usuario_id', usuario.usuario_id, {
            intentos_fallidos: 0,
            fecha_bloqueo: ''
          });
          intentos = 0;
        }
      }
    }

    // Verificar contraseña
    var passIngresada = String(password).trim();
    var passCorrecta  = String(usuario.password || '').trim();

    if (passIngresada !== passCorrecta) {
      var nuevosIntentos = intentos + 1;
      var nuevaFechaBloqueo = nuevosIntentos >= CONFIG.MAX_INTENTOS
        ? getCurrentTimestamp()
        : '';

      updateRow(CONFIG.HOJAS.USUARIOS, 'usuario_id', usuario.usuario_id, {
        intentos_fallidos: nuevosIntentos,
        fecha_bloqueo:     nuevaFechaBloqueo
      });

      var restantesMsg = CONFIG.MAX_INTENTOS - nuevosIntentos;
      var msg = 'Usuario o contraseña incorrectos.';
      if (restantesMsg > 0) {
        msg += ' Intentos restantes: ' + restantesMsg + '.';
      } else {
        msg = 'Cuenta bloqueada por ' + CONFIG.LOCKOUT_MINUTES + ' minutos.';
      }
      return { ok: false, message: msg, data: null };
    }

    // Login exitoso — reset intentos
    updateRow(CONFIG.HOJAS.USUARIOS, 'usuario_id', usuario.usuario_id, {
      intentos_fallidos: 0,
      fecha_bloqueo:     '',
      ultimo_acceso:     getCurrentTimestamp()
    });

    // Generar token y guardar sesión
    var token     = _generarToken(usuario.usuario_id);
    var sesionData = {
      token:      token,
      usuario_id: usuario.usuario_id,
      username:   usuario.username,
      nombre:     usuario.nombre,
      apellido:   usuario.apellido,
      rol:        usuario.rol,
      permisos:   CONFIG.PERMISOS[usuario.rol] || [],
      ip:         ip || '',
      creado_en:  getCurrentTimestamp()
    };

    _guardarSesion(token, sesionData);
    _registrarSesionEnHoja(sesionData);

    return {
      ok:      true,
      message: 'Bienvenido, ' + usuario.nombre + '.',
      token:   token,
      usuario: {
        usuario_id: usuario.usuario_id,
        username:   usuario.username,
        nombre:     usuario.nombre,
        apellido:   usuario.apellido,
        rol:        usuario.rol
      },
      data: sesionData
    };

  } catch (e) {
    Logger.log('Error en login(): ' + e.message);
    return { ok: false, message: 'Error interno al iniciar sesión.', data: null };
  }
}

// ============================================================
// LOGOUT
// ============================================================

function logout(token) {
  try {
    if (!token) return { ok: false, message: 'Token requerido.', data: null };

    var cache = CacheService.getScriptCache();
    cache.remove(SESSION_PREFIX + token);

    // Marcar sesión como cerrada en la hoja
    try {
      var sesiones = getSheetData(CONFIG.HOJAS.SESIONES);
      for (var i = 0; i < sesiones.length; i++) {
        if (sesiones[i].token === token && sesiones[i].estado === 'activa') {
          updateRow(CONFIG.HOJAS.SESIONES, 'token', token, {
            estado:       CONFIG.ESTADO_SESION.CERRADA,
            fecha_cierre: getCurrentTimestamp()
          });
          break;
        }
      }
    } catch (e2) {
      Logger.log('Warning logout hoja: ' + e2.message);
    }

    return { ok: true, message: 'Sesión cerrada.', data: null };
  } catch (e) {
    Logger.log('Error en logout(): ' + e.message);
    return { ok: false, message: 'Error al cerrar sesión.', data: null };
  }
}

// ============================================================
// SESIÓN
// ============================================================

function getSession(token) {
  if (!token) return null;
  try {
    var cache = CacheService.getScriptCache();
    var raw   = cache.get(SESSION_PREFIX + token);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    Logger.log('Error en getSession(): ' + e.message);
    return null;
  }
}

function requireSession(token) {
  var sesion = getSession(token);
  if (!sesion) {
    throw new Error('Sesión no válida o expirada. Por favor inicie sesión nuevamente.');
  }
  return sesion;
}

// FIX: permisos es un array — usar indexOf en lugar de acceso por clave []
function requirePermission(token, permiso) {
  var sesion = requireSession(token);
  var permisos = sesion.permisos || [];
  if (!Array.isArray(permisos) || permisos.indexOf(permiso) === -1) {
    throw new Error('No tiene permisos para realizar esta acción.');
  }
  return sesion;
}

// ============================================================
// PRIVADOS
// ============================================================

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function _generarToken(usuarioId) {
  var raw = usuarioId + '_' + new Date().getTime() + '_' + Math.random().toString(36);
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    raw,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    var h = (b & 0xFF).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

function _guardarSesion(token, sesionData) {
  var cache = CacheService.getScriptCache();
  cache.put(
    SESSION_PREFIX + token,
    JSON.stringify(sesionData),
    CONFIG.SESSION_TTL_CACHE || 28800
  );
}

function _registrarSesionEnHoja(sesionData) {
  try {
    var expiresIn   = CONFIG.SESSION_TTL_HOURS || 8;
    var fechaExpira = new Date();
    fechaExpira.setHours(fechaExpira.getHours() + expiresIn);

    appendRow(CONFIG.HOJAS.SESIONES, {
      sesion_id:           generateId(CONFIG.ID_PREFIJOS.SESION || 'SES'),
      usuario_id:          sesionData.usuario_id,
      token:               sesionData.token,
      rol:                 sesionData.rol        || '',
      ip_referencia:       sesionData.ip         || '',
      fecha_inicio:        sesionData.creado_en,
      fecha_expira:        fechaExpira.toISOString(),
      fecha_ultimo_acceso: sesionData.creado_en,
      estado:              CONFIG.ESTADO_SESION.ACTIVA,
      fecha_cierre:        ''
    });
  } catch (e) {
    Logger.log('Warning _registrarSesionEnHoja: ' + e.message);
  }
}
