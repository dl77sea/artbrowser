
exports.up = function(knex, Promise) {
  return knex.schema.createTable('artists', (table) => {
    table.increments();
    table.string('name').unique()
    table.json('image_urls')
    table.string('artsy_show_id')
    table.boolean('relevant')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('artists')
};
