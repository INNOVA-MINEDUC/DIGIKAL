'use strict'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {

  async up(queryInterface, Sequelize) {

    const filePath = path.resolve(__dirname, '../helpers/geodata.json')

    if (!fs.existsSync(filePath)) {
      console.log('⚠️ No se encontró el archivo muni.json')
      return
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (!jsonData.departamentos) {
      console.log('⚠️ El JSON no tiene departamentos')
      return
    }

    const departamentos = jsonData.departamentos.map(dep => ({
      id: dep.id,
      nombre: dep.nombreCorregido,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    await queryInterface.bulkInsert('departamentos', departamentos)

    console.log(`✅ ${departamentos.length} departamentos insertados`)
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('departamentos', null, {})

  }

}