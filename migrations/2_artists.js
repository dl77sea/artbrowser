
exports.up = function(knex, Promise) {
  return knex.schema.createTable('artists', (table) => {
    table.increments();
    table.string('first_name')
    table.string('last_name')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('artists')
};
