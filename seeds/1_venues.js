exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('venues').del()
    .then(function () {
      // Inserts seed entries
      return knex('venues').insert([
        {
          id: 1,
          name: 'Venue A',
          city_id: 1
        },
        {
          id: 2,
          name: 'Venue B',
          city_id: 1
        },
        {
          id: 3,
          name: 'Venue C',
          city_id: 1
        }
      ]);
    });
};
