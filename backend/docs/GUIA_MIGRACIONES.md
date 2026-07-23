# 📦 Guía de Migraciones y Seeders — DIGIKAL Backend

> **Última actualización:** Mayo 2026
> **Stack:** Node.js 20 · Sequelize 6 · MySQL · ESM (`"type": "module"`)

---

## 📖 Tabla de Contenidos

1. [Conceptos Clave](#-conceptos-clave)
2. [Reglas de Oro](#-reglas-de-oro)
3. [Agregar una Columna](#-agregar-una-columna)
4. [Eliminar una Columna](#-eliminar-una-columna)
5. [Renombrar una Columna](#-renombrar-una-columna)
6. [Cambiar Tipo de Dato](#-cambiar-tipo-de-dato)
7. [Crear una Tabla Nueva](#-crear-una-tabla-nueva)
8. [Seeders (Datos Iniciales)](#-seeders-datos-iniciales)
9. [Comandos Útiles](#-comandos-útiles)
10. [Workflow CI/CD](#-workflow-cicd)
11. [Errores Comunes](#-errores-comunes)
12. [Checklist de Cambios](#-checklist-de-cambios)

---

## 🧠 Conceptos Clave

| Concepto | Descripción |
|----------|-------------|
| **Migración** | Un archivo que describe un cambio estructural en la base de datos (agregar tabla, columna, etc.) |
| **Seeder** | Un archivo que inserta datos iniciales o de prueba en las tablas |
| **Modelo** | El archivo en `models/` que le dice a Node.js qué campos tiene una tabla |
| **SequelizeMeta** | Tabla interna donde Sequelize registra qué migraciones ya se ejecutaron |

### ¿Cómo funciona?

```
models/         → Lo que Node.js CREE que tiene la base de datos
migrations/     → Lo que la base de datos REALMENTE tiene
seeders/        → Los datos iniciales que se insertan
```

**Los tres deben estar siempre sincronizados.**

---

## 🔒 Reglas de Oro

> [!CAUTION]
> **NUNCA edites una migración que ya se ejecutó en el servidor.**
> Sequelize ya la marcó como "aplicada" y no la volverá a leer.

> [!IMPORTANT]
> **Siempre crea una NUEVA migración para cualquier cambio en la base de datos.**

> [!WARNING]
> **Este proyecto usa ES Modules (`"type": "module"`).**
> Usa `export default` en lugar de `module.exports` en todas las migraciones y seeders.

### ✅ Correcto (ESM)
```javascript
export default {
  async up(queryInterface, Sequelize) {
    // ...
  },
  async down(queryInterface) {
    // ...
  }
}
```

### ❌ Incorrecto (CommonJS)
```javascript
// ESTO CAUSARÁ ERROR: "module is not defined in ES module scope"
module.exports = {
  up: async (queryInterface, Sequelize) => { },
  down: async (queryInterface) => { }
}
```

---

## ➕ Agregar una Columna

### Paso 1: Generar la migración

```bash
npx sequelize-cli migration:generate --name add-telefono-to-beneficiarios
```

### Paso 2: Escribir el cambio

```javascript
// migrations/XXXXXX-add-telefono-to-beneficiarios.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('beneficiarios', 'telefono', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('beneficiarios', 'telefono')
  }
}
```

### Paso 3: Actualizar el modelo

```javascript
// models/Beneficiado.js → Agregar el campo nuevo
telefono: {
  type: DataTypes.STRING,
  allowNull: true,
},
```

### Paso 4: Commit y Push

```bash
git add .
git commit -m "feat(db): agregar campo telefono a beneficiarios"
git push origin develop
```

---

## ➖ Eliminar una Columna

```bash
npx sequelize-cli migration:generate --name remove-otros-from-beneficiarios
```

```javascript
export default {
  async up(queryInterface) {
    await queryInterface.removeColumn('beneficiarios', 'otros')
  },

  async down(queryInterface, Sequelize) {
    // Siempre define cómo REVERTIR el cambio
    await queryInterface.addColumn('beneficiarios', 'otros', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    })
  }
}
```

> [!TIP]
> **No olvides quitar el campo también del modelo** en `models/`.

---

## ✏️ Renombrar una Columna

```bash
npx sequelize-cli migration:generate --name rename-otros-to-otros_pueblos
```

```javascript
export default {
  async up(queryInterface) {
    await queryInterface.renameColumn('beneficiarios', 'otros', 'otros_pueblos')
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('beneficiarios', 'otros_pueblos', 'otros')
  }
}
```

---

## 🔄 Cambiar Tipo de Dato

```bash
npx sequelize-cli migration:generate --name change-telefono-type
```

```javascript
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('beneficiarios', 'telefono', {
      type: Sequelize.TEXT,      // Era STRING, ahora es TEXT
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('beneficiarios', 'telefono', {
      type: Sequelize.STRING,    // Revertir al tipo original
      allowNull: true,
    })
  }
}
```

---

## 🆕 Crear una Tabla Nueva

```bash
npx sequelize-cli migration:generate --name create-tabla-reportes
```

```javascript
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reportes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Siempre incluir timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reportes')
  }
}
```

> [!IMPORTANT]
> Después de crear la tabla, crea el modelo correspondiente en `models/`.

---

## 🌱 Seeders (Datos Iniciales)

Los seeders insertan datos que la aplicación necesita para funcionar (roles, departamentos, etc.).

### Regla importante para seeders

Como nuestro workflow ejecuta `db:seed:all` en **cada deploy**, los seeders deben ser **idempotentes** (que no fallen si los datos ya existen).

### ✅ Seeder correcto (idempotente)

```javascript
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { id: 1, nombre: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: 'user', createdAt: new Date(), updatedAt: new Date() },
    ], { ignoreDuplicates: true })  // ← CLAVE: ignora si ya existen
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {})
  }
}
```

### ❌ Seeder que fallará en el segundo deploy

```javascript
// Sin ignoreDuplicates → ERROR: Validation error (duplicados)
await queryInterface.bulkInsert('roles', [...])
```

---

## 🛠️ Comandos Útiles

### En desarrollo local

```bash
# Ejecutar todas las migraciones pendientes
npx sequelize-cli db:migrate

# Revertir la última migración
npx sequelize-cli db:migrate:undo

# Revertir TODAS las migraciones (¡CUIDADO! Borra todas las tablas)
npx sequelize-cli db:migrate:undo:all

# Ejecutar todos los seeders
npx sequelize-cli db:seed:all

# Revertir todos los seeders
npx sequelize-cli db:seed:undo:all

# Reset completo (borrar todo y reconstruir)
npm run reset

# Generar una nueva migración vacía
npx sequelize-cli migration:generate --name nombre-descriptivo

# Generar un nuevo seeder vacío
npx sequelize-cli seed:generate --name nombre-descriptivo
```

### Ver el estado actual

```bash
# Ver qué migraciones están pendientes
npx sequelize-cli db:migrate:status
```

---

## 🚀 Workflow CI/CD

Nuestro pipeline en GitHub Actions (`backend-ci.yml`) ejecuta automáticamente:

```
git push origin develop
       ↓
GitHub Actions construye la imagen Docker
       ↓
Se conecta al servidor por SSH
       ↓
docker compose pull        → Descarga la imagen nueva
docker compose up -d       → Reinicia los contenedores
docker compose exec -T backend npx sequelize-cli db:migrate    → Aplica migraciones
docker compose exec -T backend npx sequelize-cli db:seed:all   → Ejecuta seeders
```

### Flujo visual

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Desarrolla │     │  git push    │     │  GitHub      │
│  localmente │ ──→ │  a develop   │ ──→ │  Actions     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │  Servidor desarrollo  │
                                    │  1. Pull imagen       │
                                    │  2. Restart container │
                                    │  3. db:migrate  ✅    │
                                    │  4. db:seed:all ✅    │
                                    └───────────────────────┘
```

> [!NOTE]
> **Las migraciones corren automáticamente**, no necesitas conectarte al servidor.
> Solo asegúrate de que tu archivo de migración esté commiteado y pusheado.

---

## ❌ Errores Comunes

### 1. `module is not defined in ES module scope`
**Causa:** Usaste `module.exports` en vez de `export default`.
**Solución:** Reescribir con sintaxis ESM.

### 2. `Unknown column 'tabla.columna' in 'field list'`
**Causa:** El modelo referencia un campo que no existe en la base de datos.
**Solución:** Crear una nueva migración con `addColumn` para agregar el campo faltante.

### 3. `Validation error` en seeders
**Causa:** Se intentó insertar datos duplicados (el seeder corrió más de una vez).
**Solución:** Agregar `{ ignoreDuplicates: true }` al `bulkInsert`.

### 4. `Table already exists`
**Causa:** La migración intenta crear una tabla que ya existe.
**Solución:** Verificar con `db:migrate:status` si la migración ya fue aplicada.

### 5. Edité una migración vieja pero no se reflejan los cambios
**Causa:** Sequelize ya registró esa migración en `SequelizeMeta` y no la vuelve a ejecutar.
**Solución:** Crear una migración **nueva** con el cambio incremental.

---

## ✅ Checklist de Cambios

Antes de hacer push con un cambio en la base de datos, verifica:

- [ ] Creé una **nueva migración** (no edité una existente)
- [ ] Usé **`export default`** (no `module.exports`)
- [ ] Definí la función **`down`** para poder revertir el cambio
- [ ] Actualicé el **modelo** en `models/` para que coincida
- [ ] Si es un seeder, usé **`{ ignoreDuplicates: true }`**
- [ ] Probé localmente con `npx sequelize-cli db:migrate`
- [ ] El commit describe claramente el cambio: `feat(db): agregar campo X a tabla Y`

---

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── config.cjs          # Configuración de conexión a BD
├── migrations/              # Cambios estructurales (CREATE, ALTER, DROP)
│   ├── 10260305175045-departamentos.js
│   ├── 20260325205255-beneficiarios.js
│   └── 20260512XXXXXX-add-campo-nuevo.js   ← Siempre agregar aquí
├── models/                  # Definiciones de tablas para Node.js
│   ├── Beneficiado.js
│   └── Relations.js
├── seeders/                 # Datos iniciales
│   ├── 10260305181235-departamentos.js
│   └── 20260420163459-demo-roles.js
└── docs/
    └── GUIA_MIGRACIONES.md  ← Este archivo
```

---

> **¿Dudas?** Consulta la [documentación oficial de Sequelize](https://sequelize.org/docs/v6/other-topics/migrations/) para casos avanzados.
