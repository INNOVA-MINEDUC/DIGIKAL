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
      console.log('No se encontró el archivo geodata.json')
      return
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (!jsonData.departamentos) {
      console.log('El JSON no contiene departamentos')
      return
    }

    const municipios = jsonData.departamentos.flatMap(dep =>
      dep.municipios.map(mun => ({
        // id: mun.id,
        nombre: mun.nombreCorregido,
        departamentoId: dep.id, 
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    await queryInterface.bulkInsert('municipios', municipios)

    console.log(`✅ ${municipios.length} municipios insertados`)
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('municipios', null, {})

  }

}