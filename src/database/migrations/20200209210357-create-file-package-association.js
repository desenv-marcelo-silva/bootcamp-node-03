module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('packages', ['signature_id'], {
      type: 'foreign key',
      references: {
        table: 'files',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint(
      'packages',
      'packages_signature_id_files_fk'
    );
  },
};
