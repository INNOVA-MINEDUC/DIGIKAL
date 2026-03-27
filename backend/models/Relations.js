import Escuela from "./Escuela.js"
import Departamento from "./Departamento.js"
import Municipio from "./Municipio.js"

// relaciones

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