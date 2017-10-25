
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('cities').del()
    .then(function () {
      // Inserts seed entries
      return knex('cities').insert([
        {id: 1, name: 'Seattle'},
        {id: 2, name: 'San Francisco'},
        {id: 3, name: 'Los Angeles'}
      ]);
    });
};
