-- ============================================================================
--  BASE DE PRUEBAS LOCAL — réplica de la base `tablets` (Ciudadanía Digikal)
--
--  Para qué es
--  -----------
--  Probar el flujo de solicitudes de cambio de número de serie (crear →
--  verificar → aprobar, que hace un UPDATE real sobre el equipo) SIN tocar la
--  base de producción (122.8.187.48).
--
--  Trae sólo las tablas que ese flujo necesita, con la MISMA estructura que
--  producción (mismos tipos, claves y charset):
--      establecimientos → estudiantes / docentes → dispositivos / _docentes
--      solicitudes_cambio_serie
--  Las tablas del proceso de carga de archivos (archivos_*, entregas,
--  incidencias, filas_descartadas) no hacen falta aquí y se omiten.
--
--  Cómo usarlo
--  -----------
--      mysql -u root -p < backend/sql/tablets_pruebas_local.sql
--
--  Después, en backend/.env, apuntar el servicio de tablets a esta base:
--      TABLETS_DB_HOST=127.0.0.1
--      TABLETS_DB_PUERTO=3306
--      TABLETS_DB_NOMBRE=tablets_pruebas
--      TABLETS_DB_USUARIO=root
--      TABLETS_DB_PASSWORD=<tu clave local>
--  y reiniciar el backend. Para volver a producción, restaurar esas 5 líneas.
--
--  Es seguro re-ejecutarlo: todo es IF NOT EXISTS / INSERT IGNORE, así que no
--  borra nada de lo que ya haya. Si quiere empezar de cero, descomente el DROP.
-- ============================================================================

-- DROP DATABASE IF EXISTS tablets_pruebas;   -- descomentar para reiniciar limpio

CREATE DATABASE IF NOT EXISTS tablets_pruebas
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tablets_pruebas;

-- ── Catálogo de establecimientos ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS establecimientos (
    codigo          VARCHAR(20)  NOT NULL,
    departamento    VARCHAR(80),
    municipio       VARCHAR(80),
    departamental   VARCHAR(80),
    nombre          VARCHAR(255),
    jornada         VARCHAR(40),
    inscritos_4to   INT,
    lote            VARCHAR(20),
    beneficiado     TINYINT      NOT NULL DEFAULT 0,
    correo_contacto VARCHAR(255),
    director        VARCHAR(255),
    PRIMARY KEY (codigo),
    KEY ix_estab_depto (departamento),
    KEY ix_estab_benef (beneficiado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Estudiantes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estudiantes (
    cod_pers     VARCHAR(20)  NOT NULL,
    cod_estab    VARCHAR(20)  NOT NULL,
    nombre       VARCHAR(255) NOT NULL,
    nombres      VARCHAR(255),
    apellidos    VARCHAR(255),
    sexo         VARCHAR(20),
    fnac         DATE,
    correo       VARCHAR(255),
    password     VARCHAR(60),
    estado       VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
    observacion  TEXT,
    intentos     INT          NOT NULL DEFAULT 0,
    creado_en    DATETIME,
    reserva      VARCHAR(120),
    reservado_en DATETIME,
    avisado_en   DATETIME,
    PRIMARY KEY (cod_pers),
    UNIQUE KEY ux_est_correo (correo),
    KEY ix_est_estab  (cod_estab),
    KEY ix_est_estado (estado),
    CONSTRAINT fk_est_estab FOREIGN KEY (cod_estab)
        REFERENCES establecimientos (codigo) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Docentes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS docentes (
    num_empleado   VARCHAR(20)  NOT NULL,
    correlativo    INT          NOT NULL,
    correo         VARCHAR(255) NOT NULL,
    password       VARCHAR(60),
    nombre         VARCHAR(255) NOT NULL,
    nombres        VARCHAR(255),
    apellidos      VARCHAR(255),
    cui            VARCHAR(30),
    cod_estab      VARCHAR(20)  NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
    observacion    TEXT,
    intentos       INT          NOT NULL DEFAULT 0,
    creado_en      DATETIME,
    reserva        VARCHAR(120),
    reservado_en   DATETIME,
    avisado_en     DATETIME,
    PRIMARY KEY (num_empleado),
    UNIQUE KEY ux_doc_correlativo (correlativo),
    UNIQUE KEY ux_doc_correo (correo),
    KEY ix_doc_estab (cod_estab),
    CONSTRAINT fk_doc_estab FOREIGN KEY (cod_estab)
        REFERENCES establecimientos (codigo) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tabletas de estudiantes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispositivos (
    cod_pers            VARCHAR(20) NOT NULL,
    cod_estab_reportado VARCHAR(20) NOT NULL,
    nombre_reportado    VARCHAR(255),
    grado_seccion       VARCHAR(120),
    tutor               VARCHAR(255),
    cui_tutor           VARCHAR(30),
    marca               VARCHAR(60),
    modelo              VARCHAR(60),
    serie               VARCHAR(60),
    telefono            VARCHAR(20),
    form_pra            VARCHAR(10),
    carta_compromiso    VARCHAR(10),
    estado_registro     VARCHAR(60),
    observaciones       TEXT,
    origen              VARCHAR(255),
    cargado_en          DATETIME,
    PRIMARY KEY (cod_pers, cod_estab_reportado),
    KEY ix_disp_serie (serie),
    CONSTRAINT fk_disp_est FOREIGN KEY (cod_pers)
        REFERENCES estudiantes (cod_pers) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tabletas de docentes (dual-SIM: dos IMEI en serie y serie_2) ────────────
CREATE TABLE IF NOT EXISTS dispositivos_docentes (
    num_empleado        VARCHAR(20) NOT NULL,
    cod_estab_reportado VARCHAR(20) NOT NULL,
    nombre_reportado    VARCHAR(255),
    cui                 VARCHAR(30),
    marca               VARCHAR(60),
    modelo              VARCHAR(60),
    serie               VARCHAR(60),
    serie_2             VARCHAR(60),
    telefono            VARCHAR(20),
    form_pra            VARCHAR(10),
    carta_compromiso    VARCHAR(10),
    estado_registro     VARCHAR(60),
    observaciones       TEXT,
    origen              VARCHAR(255),
    cargado_en          DATETIME,
    PRIMARY KEY (num_empleado, cod_estab_reportado),
    KEY ix_dispdoc_serie (serie),
    CONSTRAINT fk_dispdoc_doc FOREIGN KEY (num_empleado)
        REFERENCES docentes (num_empleado) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Solicitudes de cambio de serie (idéntica a producción) ──────────────────
CREATE TABLE IF NOT EXISTS solicitudes_cambio_serie (
    id                  BIGINT NOT NULL AUTO_INCREMENT,

    tipo_beneficiario   ENUM('estudiante','docente') NOT NULL,
    cod_persona         VARCHAR(20)  NOT NULL,
    cod_estab_reportado VARCHAR(20)  NOT NULL,
    tipo_cambio         ENUM('correccion','garantia','robo_extravio') NOT NULL,

    serie_anterior      VARCHAR(60)  NOT NULL,
    serie_2_anterior    VARCHAR(60)  DEFAULT NULL,
    serie_nueva         VARCHAR(60)  NOT NULL,
    serie_2_nueva       VARCHAR(60)  DEFAULT NULL,
    marca_nueva         VARCHAR(60)  DEFAULT NULL,
    modelo_nuevo        VARCHAR(60)  DEFAULT NULL,
    serie_aplicada      TINYINT(1)   NOT NULL DEFAULT 0,
    aplicada_en         DATETIME     DEFAULT NULL,

    documento_url       VARCHAR(500) NOT NULL,
    documento_nombre    VARCHAR(255) DEFAULT NULL,
    documento_mime      VARCHAR(100) DEFAULT NULL,
    documento_tamano    INT          DEFAULT NULL,
    documento_garantia_url VARCHAR(500) DEFAULT NULL,

    estado              ENUM('pendiente','no_coincide','verificada','aprobada','rechazada')
                        NOT NULL DEFAULT 'pendiente',
    motivo              VARCHAR(500) DEFAULT NULL,
    motivo_rechazo      VARCHAR(500) DEFAULT NULL,
    verificado_en       DATETIME     DEFAULT NULL,
    verificado_por      VARCHAR(255) DEFAULT NULL,
    verificacion_nota   VARCHAR(500) DEFAULT NULL,

    solicitante_nombre   VARCHAR(255) DEFAULT NULL,
    solicitante_email    VARCHAR(255) DEFAULT NULL,
    solicitante_telefono VARCHAR(30)  DEFAULT NULL,

    revisado_por_id     INT          DEFAULT NULL,
    revisado_por_nombre VARCHAR(255) DEFAULT NULL,
    revisado_por_email  VARCHAR(255) DEFAULT NULL,
    revisado_en         DATETIME     DEFAULT NULL,

    creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

    activa TINYINT GENERATED ALWAYS AS
        (CASE WHEN estado IN ('pendiente','verificada') THEN 1 ELSE NULL END) STORED,

    PRIMARY KEY (id),
    UNIQUE KEY ux_sol_activa (tipo_beneficiario, cod_persona, cod_estab_reportado, activa),
    KEY ix_sol_dispositivo (tipo_beneficiario, cod_persona, cod_estab_reportado),
    KEY ix_sol_serie_anterior (serie_anterior),
    KEY ix_sol_serie_2_anterior (serie_2_anterior),
    KEY ix_sol_serie_nueva (serie_nueva),
    KEY ix_sol_tipo_estado (tipo_cambio, estado),
    KEY ix_sol_estado (estado, creado_en),
    KEY ix_sol_estab (cod_estab_reportado),
    CONSTRAINT fk_sol_estab FOREIGN KEY (cod_estab_reportado)
        REFERENCES establecimientos (codigo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Series retiradas: las que salieron de circulación por garantía o extravío.
CREATE OR REPLACE VIEW v_series_retiradas AS
SELECT serie_anterior AS serie, tipo_beneficiario, cod_persona, cod_estab_reportado,
       tipo_cambio, aplicada_en
  FROM solicitudes_cambio_serie
 WHERE tipo_cambio IN ('garantia','robo_extravio') AND serie_aplicada = 1
UNION ALL
SELECT serie_2_anterior, tipo_beneficiario, cod_persona, cod_estab_reportado,
       tipo_cambio, aplicada_en
  FROM solicitudes_cambio_serie
 WHERE tipo_cambio IN ('garantia','robo_extravio') AND serie_aplicada = 1
   AND serie_2_anterior IS NOT NULL AND serie_2_anterior <> '';

-- ============================================================================
--  DATOS DE PRUEBA
--  Series fáciles de teclear y de reconocer. Los departamentos se repiten a
--  propósito para que el mapa y el ranking de la vista tengan algo que mostrar.
-- ============================================================================

INSERT IGNORE INTO establecimientos
  (codigo, departamento, municipio, nombre, jornada, inscritos_4to, lote, beneficiado, director) VALUES
  ('01-01-0001-46', 'GUATEMALA',    'GUATEMALA',       'INSTITUTO NACIONAL DE EDUCACION DIVERSIFICADA', 'MATUTINA', 120, 'L1', 1, 'Ana Lucía Morales'),
  ('02-03-0022-46', 'ALTA VERAPAZ', 'COBAN',           'INSTITUTO NORMAL MIXTO DEL NORTE',              'MATUTINA',  85, 'L2', 1, 'Carlos Enrique Pop'),
  ('07-05-0113-45', 'QUETZALTENANGO','QUETZALTENANGO', 'ESCUELA NACIONAL DE CIENCIAS COMERCIALES',      'VESPERTINA', 64, 'L1', 1, 'María José Herrera'),
  ('16-02-0044-43', 'SOLOLA',       'PANAJACHEL',      'INSTITUTO POR COOPERATIVA DE PANAJACHEL',        'MATUTINA',  41, 'L3', 1, 'Luis Fernando Tzoc');

INSERT IGNORE INTO estudiantes (cod_pers, cod_estab, nombre, nombres, apellidos, sexo, correo, estado) VALUES
  ('A100001', '01-01-0001-46', 'LOPEZ GARCIA, Maria Jose',   'Maria Jose', 'Lopez Garcia',  'F', 'a100001@prueba.edu.gt', 'creada'),
  ('A100002', '01-01-0001-46', 'PEREZ RAMOS, Juan Carlos',   'Juan Carlos','Perez Ramos',   'M', 'a100002@prueba.edu.gt', 'creada'),
  ('A200001', '02-03-0022-46', 'CAAL CHUB, Ana Beatriz',     'Ana Beatriz','Caal Chub',     'F', 'a200001@prueba.edu.gt', 'creada'),
  ('A200002', '02-03-0022-46', 'QUINONEZ SOLIS, Diego',      'Diego',      'Quinonez Solis','M', 'a200002@prueba.edu.gt', 'creada'),
  ('A300001', '07-05-0113-45', 'GONZALEZ MEJIA, Sofia',      'Sofia',      'Gonzalez Mejia','F', 'a300001@prueba.edu.gt', 'creada'),
  ('A400001', '16-02-0044-43', 'TZOC SAMINEZ, Pedro Luis',   'Pedro Luis', 'Tzoc Saminez',  'M', 'a400001@prueba.edu.gt', 'creada');

INSERT IGNORE INTO docentes (num_empleado, correlativo, correo, nombre, cui, cod_estab, estado) VALUES
  ('370001111', 1, 'prof00001@prueba.edu.gt', 'RAMIREZ LOPEZ, Jorge Mario',  '1234567890101', '01-01-0001-46', 'creada'),
  ('370002222', 2, 'prof00002@prueba.edu.gt', 'CHOC BOTZOC, Elena Maria',    '2345678901202', '02-03-0022-46', 'creada'),
  ('370003333', 3, 'prof00003@prueba.edu.gt', 'DE LEON PAZ, Ricardo Andres', '3456789012303', '07-05-0113-45', 'creada');

-- Tabletas de estudiantes: UN número de serie por equipo.
INSERT IGNORE INTO dispositivos
  (cod_pers, cod_estab_reportado, nombre_reportado, grado_seccion, marca, modelo, serie, estado_registro, origen, cargado_en) VALUES
  ('A100001', '01-01-0001-46', 'LOPEZ GARCIA, Maria Jose', '4to A', 'Lenovo',  'Tab M10',   'PRUEBA-EST-0001', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('A100002', '01-01-0001-46', 'PEREZ RAMOS, Juan Carlos', '4to A', 'Lenovo',  'Tab M10',   'PRUEBA-EST-0002', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('A200001', '02-03-0022-46', 'CAAL CHUB, Ana Beatriz',   '4to B', 'Samsung', 'Galaxy A9',  'PRUEBA-EST-0003', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('A200002', '02-03-0022-46', 'QUINONEZ SOLIS, Diego',    '4to B', 'Samsung', 'Galaxy A9',  'PRUEBA-EST-0004', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('A300001', '07-05-0113-45', 'GONZALEZ MEJIA, Sofia',    '4to C', 'Huawei',  'MatePad T10','PRUEBA-EST-0005', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('A400001', '16-02-0044-43', 'TZOC SAMINEZ, Pedro Luis', '4to A', 'Lenovo',  'Tab M10',   'PRUEBA-EST-0006', 'ENTREGADA', 'carga_prueba.xlsx', NOW());

-- Tabletas de docentes: dual-SIM, DOS IMEI por equipo (serie y serie_2).
-- El tercero deja serie_2 vacío a propósito, para probar el caso de un solo número.
INSERT IGNORE INTO dispositivos_docentes
  (num_empleado, cod_estab_reportado, nombre_reportado, marca, modelo, serie, serie_2, estado_registro, origen, cargado_en) VALUES
  ('370001111', '01-01-0001-46', 'RAMIREZ LOPEZ, Jorge Mario',  'Samsung', 'Galaxy Tab A9', 'PRUEBA-DOC-1001', 'PRUEBA-DOC-1002', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('370002222', '02-03-0022-46', 'CHOC BOTZOC, Elena Maria',    'Samsung', 'Galaxy Tab A9', 'PRUEBA-DOC-2001', 'PRUEBA-DOC-2002', 'ENTREGADA', 'carga_prueba.xlsx', NOW()),
  ('370003333', '07-05-0113-45', 'DE LEON PAZ, Ricardo Andres', 'Lenovo',  'Tab M10',       'PRUEBA-DOC-3001', NULL,              'ENTREGADA', 'carga_prueba.xlsx', NOW());

-- ── Resumen de lo cargado ───────────────────────────────────────────────────
SELECT 'establecimientos' AS tabla, COUNT(*) AS filas FROM establecimientos
UNION ALL SELECT 'estudiantes',           COUNT(*) FROM estudiantes
UNION ALL SELECT 'docentes',              COUNT(*) FROM docentes
UNION ALL SELECT 'dispositivos',          COUNT(*) FROM dispositivos
UNION ALL SELECT 'dispositivos_docentes', COUNT(*) FROM dispositivos_docentes
UNION ALL SELECT 'solicitudes',           COUNT(*) FROM solicitudes_cambio_serie;
