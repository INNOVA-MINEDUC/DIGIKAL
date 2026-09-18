-- ============================================================================
--  Ciudadanía Digikal — Solicitudes de cambio de número de serie
--  Base: la MISMA base del servicio de tablets (la que tiene `dispositivos`,
--        `dispositivos_docentes` y `establecimientos`).
--
--  Qué resuelve
--  ------------
--  Una OPF / dirección detecta que la serie registrada de una tableta no
--  coincide con la del equipo físico. Para corregirla envía una solicitud
--  adjuntando un documento FIRMADO Y SELLADO por el director que autoriza el
--  cambio. El documento se guarda en el bucket (COSMO) y aquí sólo queda su
--  URL. Al aprobarse, el backend actualiza la serie real en `dispositivos` o
--  `dispositivos_docentes`, y esta fila conserva la CONSTANCIA de cuál era la
--  serie anterior.
--
--  Por qué no hay FK hacia la tableta
--  ----------------------------------
--  La "tableta" vive en DOS tablas distintas con claves primarias compuestas
--  diferentes:
--      dispositivos          → PK (cod_pers, cod_estab_reportado)
--      dispositivos_docentes → PK (num_empleado, cod_estab_reportado)
--  Una FK sólo puede apuntar a una tabla, así que en su lugar se guardan las
--  coordenadas de la fila a corregir (`tipo_beneficiario` dice en qué tabla
--  buscar, `cod_persona` es la primera mitad de esa PK) y se indexan juntas.
--  La única FK real es hacia `establecimientos`, que sí es una tabla única con
--  PK simple.
--
--  Nota sobre `campo_serie`
--  ------------------------
--  Un docente puede tener DOS equipos en la misma fila (`serie` y `serie_2`),
--  así que hay que saber cuál de las dos columnas se está corrigiendo. Para
--  estudiantes siempre es 'serie'.
--
--  Ejecutar UNA sola vez. No modifica ninguna tabla existente.
-- ============================================================================

CREATE TABLE IF NOT EXISTS `solicitudes_cambio_serie` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,

  -- ── Qué tableta se corrige (coordenadas de la fila, ver nota arriba) ──────
  `tipo_beneficiario`   ENUM('estudiante','docente') NOT NULL,
  -- dispositivos.cod_pers  |  dispositivos_docentes.num_empleado
  `cod_persona`         VARCHAR(20)  NOT NULL,
  `cod_estab_reportado` VARCHAR(20)  NOT NULL,
  -- Cuál de las dos columnas de serie se corrige ('serie_2' sólo en docentes)
  `campo_serie`         ENUM('serie','serie_2') NOT NULL DEFAULT 'serie',

  -- ── Constancia del cambio ────────────────────────────────────────────────
  -- `serie_anterior` se copia en el momento de crear la solicitud y NO se
  -- vuelve a tocar: es la prueba de qué decía el registro antes.
  `serie_anterior`      VARCHAR(60)  NOT NULL,
  `serie_nueva`         VARCHAR(60)  NOT NULL,
  -- Se marcan cuando el UPDATE sobre dispositivos/_docentes ya se ejecutó.
  `serie_aplicada`      TINYINT(1)   NOT NULL DEFAULT 0,
  `aplicada_en`         DATETIME     DEFAULT NULL,

  -- ── Documento firmado y sellado por el director ──────────────────────────
  -- URL pública del bucket (COSMO) o `local:<carpeta>/<archivo>` si el bucket
  -- no estaba disponible y se guardó en disco (ver services/bucketService.js).
  `documento_url`       VARCHAR(500) NOT NULL,
  `documento_nombre`    VARCHAR(255) DEFAULT NULL,   -- nombre original subido
  `documento_mime`      VARCHAR(100) DEFAULT NULL,
  `documento_tamano`    INT          DEFAULT NULL,   -- bytes

  -- ── Verificación: ¿la serie escrita coincide con la del documento? ───────
  `verificado`          TINYINT(1)   NOT NULL DEFAULT 0,
  `verificado_en`       DATETIME     DEFAULT NULL,
  `verificado_por`      VARCHAR(255) DEFAULT NULL,
  `verificacion_nota`   VARCHAR(500) DEFAULT NULL,

  -- ── Flujo de la solicitud ────────────────────────────────────────────────
  `estado`              ENUM('pendiente','no_coincide','verificada','aprobada','rechazada')
                        NOT NULL DEFAULT 'pendiente',
  `motivo`              VARCHAR(500) DEFAULT NULL,   -- por qué se pide el cambio
  `motivo_rechazo`      VARCHAR(500) DEFAULT NULL,

  -- ── Quién la envía (datos de contacto, no del beneficiario) ──────────────
  `solicitante_nombre`   VARCHAR(255) DEFAULT NULL,
  `solicitante_email`    VARCHAR(255) DEFAULT NULL,
  `solicitante_telefono` VARCHAR(30)  DEFAULT NULL,

  -- ── Quién la revisa (personal con sesión en DIGIKAL) ─────────────────────
  `revisado_por_id`     INT          DEFAULT NULL,
  `revisado_por_nombre` VARCHAR(255) DEFAULT NULL,
  `revisado_por_email`  VARCHAR(255) DEFAULT NULL,
  `revisado_en`         DATETIME     DEFAULT NULL,

  `creado_en`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  -- Localizar rápido la fila de dispositivo a actualizar al aprobar.
  KEY `ix_sol_dispositivo` (`tipo_beneficiario`, `cod_persona`, `cod_estab_reportado`),
  -- Buscar solicitudes por cualquiera de las dos series (antes / después).
  KEY `ix_sol_serie_anterior` (`serie_anterior`),
  KEY `ix_sol_serie_nueva`    (`serie_nueva`),
  -- Bandeja de revisión: "las pendientes, más nuevas primero".
  KEY `ix_sol_estado` (`estado`, `creado_en`),
  KEY `ix_sol_estab`  (`cod_estab_reportado`),

  CONSTRAINT `fk_sol_estab`
    FOREIGN KEY (`cod_estab_reportado`) REFERENCES `establecimientos` (`codigo`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
