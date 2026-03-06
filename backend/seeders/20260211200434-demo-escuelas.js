'use strict'

import fs from 'fs'
import path from 'path'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
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

    // 🔹 mapa de departamentos
    const departamentosMap = {}
    departamentosDB.forEach(dep => {
      departamentosMap[normalizar(dep.nombre)] = dep.id
    })

    // 🔹 mapa de municipios
    const municipiosMap = {}

    municipiosDB.forEach(mun => {
      const key = `${normalizar(mun.nombre)}_${mun.departamentoId}`
      municipiosMap[key] = mun.id
    })

    const registros = []
    const codigos = new Set()

    for (const row of datos) {

      const codigo = row.codigo_escuela
      if (!codigo) continue
      if (codigos.has(codigo)) continue

      codigos.add(codigo)

      const depNombre = normalizar(row.departamento)
      const munNombre = normalizar(row.municipio)

      const departamentoId = departamentosMap[depNombre]

      if (!departamentoId) {
        console.log(`⚠️ Departamento no encontrado: ${row.departamento}`)
        continue
      }

      const municipioKey = `${munNombre}_${departamentoId}`
      const municipioId = municipiosMap[municipioKey]

      if (!municipioId) {
        console.log(`⚠️ Municipio no encontrado: ${row.municipio}`)
        continue
      }

      const registro = {
        nombreEscuela: row.nombre_escuela || null,
        codigoEscuela: codigo,
        departamentoId,
        municipioId,
        fasePoliticaId: 1,
        direccion: row.direccion || null,
        cantidadEquipoEntregado: row['cantidad de equipo entregado'] || 0,
        cantidadEstudiantesBeneficiados: row['cantidad de estudiantes beneficiados'] || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (row.telefono) registro.telefono = row.telefono
      if (row.correo) registro.correo = row.correo
      if (row.director) registro.director = row.director

      registros.push(registro)

    }

    console.log(`📦 Escuelas listas para insertar: ${registros.length}`)

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