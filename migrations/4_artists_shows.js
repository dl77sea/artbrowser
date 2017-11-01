exports.up = function(knex, Promise) {
  return knex.schema.createTable('artists_shows', (table) => {
    table.increments();
    table.integer('artist_id')
      .references('id')
      .inTable('artists')
      .onDelete('CASCADE')
    table.integer('show_id')
      .references('id')
      .inTable('shows')
      .onDelete('CASCADE')
    table.boolean('is_relevant').defaultTo(true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('artists_shows')
};
