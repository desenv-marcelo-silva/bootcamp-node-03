'use strict';

module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkUpdate('users', {
      is_admin: true,
    }, {
      email: 'admin@fastfeet.com', 
    },
  );
  },

  down: () => {},
};

