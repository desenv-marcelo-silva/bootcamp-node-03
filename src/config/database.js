require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.APP_DBHOST,
  username: process.env.APP_DBUSER,
  password: process.env.APP_DBPASS,
  database: process.env.APP_DBNAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
