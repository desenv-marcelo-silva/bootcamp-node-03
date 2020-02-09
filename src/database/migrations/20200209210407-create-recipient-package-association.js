module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('packages', ['recipient_id'], {
      type: 'foreign key',
      references: {
        table: 'recipients',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint(
      'packages',
      'packages_recipient_id_recipients_fk'
    );
  },
};
