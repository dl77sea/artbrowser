// connects development or production environment to knexfile
module.exports = require('knex')(require('./knexfile')[process.env.NODE_ENV || 'development'])
