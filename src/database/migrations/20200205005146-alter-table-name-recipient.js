module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('recipient', 'recipients');
  },

  down: queryInterface => {
    return queryInterface.renameTable('recipients', 'recipient');
  },
};
