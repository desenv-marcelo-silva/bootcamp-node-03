module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('delivery_problems', ['delivery_id'], {
      type: 'foreign key',
      references: {
        table: 'packages',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint(
      'delivery_problems',
      'delivery_problems_delivery_id_packages_fk'
    );
  },
};
