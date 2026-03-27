'use strict'

import fs from 'fs'
import path from 'path'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🔥 NORMALIZACIÓN MEJORADA (quita tildes)
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .trim()
}

export default {

  async up(queryInterface, Sequelize) {

    const filePath = path.resolve(__dirname, '../helpers/dotaciones/resultado_final.xlsx')

    if (!fs.existsSync(filePath)) {
      console.log('⚠️ No se encontró el archivo Excel')
      return
    }

    const workbook = xlsx.readFile(filePath)
    const hoja = workbook.Sheets[workbook.SheetNames[0]]
    const datos = xlsx.utils.sheet_to_json(hoja)

    console.log(`📄 Filas encontradas en Excel: ${datos.length}`)

    // traer departamentos
    const departamentosDB = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM departamentos`,
      { type: Sequelize.QueryTypes.SELECT }
    )

    // traer municipios
    const municipiosDB = await queryInterface.sequelize.query(
      `SELECT id, nombre, departamentoId FROM municipios`,
      { type: Sequelize.QueryTypes.SELECT }
    )

    // 🔹 mapas
    const departamentosMap = {}
    departamentosDB.forEach(dep => {
      departamentosMap[normalizar(dep.nombre)] = dep.id
    })

    const municipiosMap = {}
    municipiosDB.forEach(mun => {
      const key = `${normalizar(mun.nombre)}_${mun.departamentoId}`
      municipiosMap[key] = mun.id
    })

    const registros = []
    const codigos = new Set()

    // 🔥 CONTADORES
    let sinCodigo = 0
    let duplicados = 0
    let sinDepartamento = 0
    let sinMunicipio = 0

    for (const row of datos) {

      const codigo = row.codigo_escuela

      // ❌ sin código
      if (!codigo) {
        sinCodigo++
        console.log("❌ Sin código:", row)
        continue
      }

      // 🔁 duplicado
      if (codigos.has(codigo)) {
        duplicados++
        console.log("🔁 Duplicado:", codigo)
        continue
      }

      codigos.add(codigo)

      const depNombre = normalizar(row.departamento)
      const munNombre = normalizar(row.municipio)

      const departamentoId = departamentosMap[depNombre]

      // ❌ departamento no encontrado
      if (!departamentoId) {
        sinDepartamento++
        console.log(`⚠️ Departamento no encontrado: [${row.departamento}]`)
        continue
      }

      const municipioKey = `${munNombre}_${departamentoId}`
      const municipioId = municipiosMap[municipioKey]

      // ❌ municipio no encontrado
      if (!municipioId) {
        sinMunicipio++
        console.log(`⚠️ Municipio no encontrado: [${row.municipio}] | DEP: [${row.departamento}]`)
        continue
      }

      const registro = {
        nombreEscuela: row.nombre_escuela || null,
        codigoEscuela: codigo,
        departamentoId,
        municipioId,
        direccion: row.direccion || null,
        cantidadEquipoEntregado: row['Cantidad de Equipo entregado'],
        cantidadEstudiantesBeneficiados: row['Cantidad de Estudiantes beneficiados'],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (row.telefono) registro.telefono = row.telefono
      if (row.correo) registro.correo = row.correo
      if (row.director) registro.director = row.director

      registros.push(registro)
    }

    console.log(`📦 Escuelas listas para insertar: ${registros.length}`)

    // 🔥 RESUMEN FINAL
    console.log("\n====== RESUMEN ======")
    console.log("❌ Sin código:", sinCodigo)
    console.log("🔁 Duplicados:", duplicados)
    console.log("⚠️ Sin departamento:", sinDepartamento)
    console.log("⚠️ Sin municipio:", sinMunicipio)
    console.log("=====================\n")

    if (registros.length > 0) {
      await queryInterface.bulkInsert('escuelas', registros)
      console.log(`✅ ${registros.length} escuelas insertadas`)
    } else {
      console.log('⚠️ No hay escuelas para insertar')
    }

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('escuelas', null, {})
  }

}