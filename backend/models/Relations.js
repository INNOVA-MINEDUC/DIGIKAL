import Escuela from "./Escuela.js"
import Departamento from "./Departamento.js"
import Municipio from "./Municipio.js"
import User from "./User.js"
import Role from "./Role.js"
import TipoEquipo from "./TipoEquipo.js"
import ModeloEquipo from "./ModeloEquipo.js"
import Equipo from "./Equipo.js"
import Dotacion from "./Dotacion.js"
import DotacionEquipo from "./DotacionEquipo.js";
import Beneficiario from "./Beneficiado.js"
import Acta from "./Acta.js"
import DotacionImagen from "./DotacionImagen.js";
import Proyecto from "./Proyecto.js";

Dotacion.belongsTo(Proyecto, {
  foreignKey: 'id_proyecto',
  as: 'proyecto'
})

Proyecto.hasMany(Dotacion, {
  foreignKey: 'id_proyecto',
  as: 'dotaciones'
})

Dotacion.hasMany(DotacionImagen, {
  foreignKey: 'dotacion_id',
  as: 'imagenes'
});

DotacionImagen.belongsTo(Dotacion, {
  foreignKey: 'dotacion_id',
  as: 'dotacion'
});

Dotacion.hasOne(Acta, {
  foreignKey: 'dotacion_id',
  as: 'acta'
});

Acta.belongsTo(Dotacion, {
  foreignKey: 'dotacion_id',
  as: 'dotacion'
});

Dotacion.belongsToMany(Equipo, {
  through: DotacionEquipo,
  foreignKey: 'dotacion_id',
  otherKey: 'equipo_id',
  as: 'equipos'
});

Equipo.belongsToMany(Dotacion, {
  through: DotacionEquipo,
  foreignKey: 'equipo_id',
  otherKey: 'dotacion_id',
  as: 'dotaciones'
});

Dotacion.belongsTo(Escuela, {
  foreignKey: 'id_escuela',
  as: 'escuela'
});

Escuela.hasMany(Dotacion, {
  foreignKey: 'id_escuela',
  as: 'dotaciones'
});

Escuela.hasMany(Beneficiario, {
  foreignKey: 'escuela_id',
  as: 'beneficiarios'
});

Beneficiario.belongsTo(Escuela, {
  foreignKey: 'escuela_id',
  as: 'escuela'
});

ModeloEquipo.belongsTo(TipoEquipo, {
  foreignKey: "tipo_id",
  as: "tipo"
})


TipoEquipo.hasMany(ModeloEquipo, {
  foreignKey: "tipo_id",
  as: "modelos"
})

Equipo.belongsTo(ModeloEquipo, {
  foreignKey: "modelo_id",
  as: "modelo"
})

ModeloEquipo.hasMany(Equipo, {
  foreignKey: "modelo_id",
  as: "equipos"
})

User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role"
})

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users"
})

Escuela.belongsTo(Departamento, {
  foreignKey: "departamentoId",
  as: "departamento"
})

Escuela.belongsTo(Municipio, {
  foreignKey: "municipioId",
  as: "municipio"
})

Departamento.hasMany(Escuela, {
  foreignKey: "departamentoId",
  as: "escuelas"
})

Municipio.hasMany(Escuela, {
  foreignKey: "municipioId",
  as: "escuelas"
})