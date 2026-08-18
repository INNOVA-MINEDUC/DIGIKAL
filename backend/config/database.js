import sequelize from './connection.js'
import logger from '../utils/logger.js';



async function main() {
  try {
    await sequelize.authenticate()
    logger.info('Conectado 🚀')

    await sequelize.sync({ alter: true })
    logger.info('Tablas creadas correctamente ✅')

  } catch (error) {
    logger.error(error)
  }
}

main()
