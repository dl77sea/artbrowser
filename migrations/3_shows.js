
exports.up = function(knex, Promise) {
  return knex.schema.createTable('shows', (table) => {
    table.increments();
    table.string('name')
    table.text('press_release')
    table.text('description')
    table.timestamp('from')
    table.timestamp('to')
    table.string('artsy_id').unique()
    table.string('venue_artsy_id')
      .references('artsy_id')
      .inTable('venues')
      .onDelete('CASCADE')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('shows')
};
