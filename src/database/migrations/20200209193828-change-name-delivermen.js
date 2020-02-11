module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('deliveryman', 'delivermens');
  },

  down: queryInterface => {
    return queryInterface.renameTable('deliveryman', 'delivermen');
  },
};
