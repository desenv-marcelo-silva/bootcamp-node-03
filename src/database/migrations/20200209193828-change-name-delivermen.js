module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('delivermen', 'delivermens');
  },

  down: queryInterface => {
    return queryInterface.renameTable('delivermens', 'delivermen');
  },
};
