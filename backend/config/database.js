import sequelize from './connection.js'



async function main() {
  try {
    await sequelize.authenticate()
    console.log('Conectado 🚀')

    await sequelize.sync({ alter: true })
    console.log('Tablas creadas correctamente ✅')

  } catch (error) {
    console.error(error)
  }
}

main()
