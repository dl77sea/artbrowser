exports.up = function(knex, Promise) {
  return knex.schema.createTable('venues', (table) => {
    table.increments()
    table.string('artsy_id').unique()
    table.string('name')
    table.integer('cities_id')
      .references('id')
      .inTable('cities')
      .onDelete('CASCADE')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('venues')
};
