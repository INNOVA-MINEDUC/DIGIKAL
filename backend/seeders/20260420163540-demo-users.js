'use strict';

import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {

const password1 = await bcrypt.hash('Guatemala/2026.25', 10);
const password2 = await bcrypt.hash('Guatemala/2026.25', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'superAdmin',
        email: 'superAdmin@mineduc.edu.gt',
        password: password1,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'brandon',
        email: 'panaverto@gmail.com',
        password: password2,
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