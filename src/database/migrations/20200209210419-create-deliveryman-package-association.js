module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('packages', ['deliveryman_id'], {
      type: 'foreign key',
      references: {
        table: 'delivermens',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint(
      'packages',
      'packages_deliveryman_id_delivermens_fk'
    );
  },
};
