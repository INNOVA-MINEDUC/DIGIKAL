'use strict';

import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {

    const passwordHash = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'admin',
        email: 'admin@gmail.com',
        password: passwordHash,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'brandon',
        email: 'brandon@gmail.com',
        password: passwordHash,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'julio',
        email: 'julio@gmail.com',
        password: passwordHash,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};