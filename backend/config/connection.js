import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('innova', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql', // o 'postgres'
  logging: false, // quita logs en consola (opcional)
});

export default sequelize;
