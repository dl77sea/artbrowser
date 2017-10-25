
exports.up = function(knex, Promise) {
  return knex.schema.createTable('venues', (table) => {
    table.increments();
    table.string('name').notNullable();
    table.integer('city_id').notNullable()
      .references('id')
      .inTable('cities')
      .onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('venues')
};
