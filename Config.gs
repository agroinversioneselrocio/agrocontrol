// ============================================================
// Config.gs - ROCÍO AGROCONTROL V2
// Configuración global
// ============================================================

var CONFIG = {
  // -----------------------------------------------------------
  // IDENTIDAD
  // -----------------------------------------------------------
  EMPRESA: 'Agroinversiones El Rocío EIRL',
  VERSION: '2.0.0',
  AMBIENTE: 'produccion',

  // -----------------------------------------------------------
  // HOJAS
  // -----------------------------------------------------------
  HOJAS: {
    CAMPOS:              'campos',
    CAMPANIAS:           'campanias',
    ACTIVIDADES:         'actividades',
    ACTIVIDAD_PERSONAL:  'actividad_personal',
    ACTIVIDAD_INSUMOS:   'actividad_insumos',
    ACTIVIDAD_EQUIPOS:   'actividad_equipos',
    CATALOGO_TIPOS:      'catalogo_tipos_actividad',
    INSUMOS:             'insumos',
    PERSONAL:            'personal',
    EQUIPOS:             'equipos',
    GASTOS:              'gastos',
    USUARIOS:            'usuarios',
    COSECHAS:            'cosechas',
    VENTAS:              'ventas',
    ALERTAS:             'alertas',
    AUDITORIA:           'auditoria',
    SESIONES:            'sesiones'
  },

  // -----------------------------------------------------------
  // PREFIJOS DE IDs
  // -----------------------------------------------------------
  ID_PREFIJOS: {
    CAMPO:     'CAM',
    CAMPANIA:  'CPN',
    ACTIVIDAD: 'ACT',
    INSUMO:    'INS',
    PERSONAL:  'PER',
    EQUIPO:    'EQP',
    GASTO:     'GAS',
    USUARIO:   'USR',
    COSECHA:   'COS',
    VENTA:     'VEN',
    ALERTA:    'ALT',
    AUDITORIA: 'AUD',
    SESION:    'SES'
  },

  // -----------------------------------------------------------
  // CONFIGURACIÓN DE NEGOCIO
  // -----------------------------------------------------------
  TARA_POR_JABA:      1.65,
  SESSION_TTL_HOURS:  8,
  SESSION_TTL_CACHE:  28800,

  // -----------------------------------------------------------
  // ESTADOS
  // -----------------------------------------------------------
  ESTADO_CAMPO: {
    ACTIVO:     'activo',
    INACTIVO:   'inactivo',
    EN_COSECHA: 'en_cosecha'
  },

  ESTADO_CAMPANIA: {
    PLANIFICADA: 'planificada',
    EN_PROGRESO: 'en_progreso',
    FINALIZADA:  'finalizada',
    ANULADA:     'anulada'
  },

  ESTADO_COSECHA: {
    PENDIENTE_VENTA: 'pendiente_venta',
    VENDIDA:         'vendida',
    ANULADA:         'anulada'
  },

  ESTADO_VENTA: {
    REGISTRADA: 'registrada',
    ANULADA:    'anulada'
  },

  ESTADO_ACTIVIDAD: {
    PENDIENTE:   'pendiente',
    EN_PROCESO:  'en_proceso',
    COMPLETADA:  'completada',
    ANULADA:     'anulada'
  },

  ESTADO_ALERTA: {
    ACTIVA:   'activa',
    RESUELTA: 'resuelta',
    IGNORADA: 'ignorada'
  },

  ESTADO_USUARIO: {
    ACTIVO:    'activo',
    INACTIVO:  'inactivo',
    BLOQUEADO: 'bloqueado'
  },

  ESTADO_SESION: {
    ACTIVA:   'activa',
    EXPIRADA: 'expirada',
    CERRADA:  'cerrada'
  },

  // -----------------------------------------------------------
  // SEGURIDAD
  // -----------------------------------------------------------
  MAX_INTENTOS:    5,
  LOCKOUT_MINUTES: 30,

  // -----------------------------------------------------------
  // ROLES
  // -----------------------------------------------------------
  ROLES: {
    ADMIN:      'admin',
    SUPERVISOR: 'supervisor',
    OPERARIO:   'operario'
  },

  PERMISOS: {
    admin: [
      'cosechas.read',   'cosechas.write',   'cosechas.delete',
      'ventas.read',     'ventas.write',     'ventas.delete',
      'campanias.read',  'campanias.write',  'campanias.delete',
      'campos.read',     'campos.write',     'campos.delete',
      'personal.read',   'personal.write',
      'gastos.read',     'gastos.write',
      'usuarios.read',   'usuarios.write',
      'reportes.read',   'dashboard.read',
      'alertas.read',    'alertas.write'
    ],
    supervisor: [
      'cosechas.read',  'cosechas.write',
      'ventas.read',    'ventas.write',
      'campanias.read', 'campanias.write',
      'campos.read',
      'personal.read',
      'gastos.read',    'gastos.write',
      'reportes.read',  'dashboard.read',
      'alertas.read'
    ],
    operario: [
      'cosechas.read', 'cosechas.write',
      'ventas.read',
      'campanias.read',
      'campos.read',
      'personal.read',
      'alertas.read'
    ]
  },

  // -----------------------------------------------------------
  // MONEDA
  // -----------------------------------------------------------
  MONEDA:         'PEN',
  MONEDA_SIMBOLO: 'S/',
  DECIMALES:      2,
  ZONA_HORARIA:   'America/Lima'
};

// ============================================================
// TOKEN_SECRET_KEY — leer desde PropertiesService
// Nunca hardcodear en el código fuente.
// Para configurar: GAS → Configuración del proyecto →
// Propiedades del script → TOKEN_SECRET_KEY = 'tu-clave'
// ============================================================
function getSecretKey() {
  var key = PropertiesService.getScriptProperties().getProperty('TOKEN_SECRET_KEY');
  if (!key) {
    throw new Error(
      'TOKEN_SECRET_KEY no configurada. ' +
      'Ve a GAS → Configuración del proyecto → Propiedades del script ' +
      'y agrega la clave TOKEN_SECRET_KEY.'
    );
  }
  return key;
}