'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.addColumn(
          'recipients',
          'created_at',
          {
            type: Sequelize.DATE,
            allowNul: false,
          }
        ),
        queryInterface.addColumn(
          'recipients',
          'updated_at',
          {
            type: Sequelize.DATE,
            allowNul: false
          }
        ),
      ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('recipients', 'created_at'),
      queryInterface.removeColumn('recipients', 'updated_at'),
    ]);
}
};
