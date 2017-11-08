const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')
const cheerio = require('cheerio')
const $ = cheerio

router.get('/city/:id/venues', function(req, res, next) {
  console.log("entered ('/api/retrieve/city/' + cityId + '/venues') ")
  // let cityIata = req.params.id
  let cityId = req.params.id
  knex('venues').where('cities_id', cityId)
    .then(function(venues) {
      res.send(venues)
    })
    .catch(function(error) {
      res.send(error)
    })
})

// router.get('/venue/:id', function(req, res, next) {
//   let venueId = req.params.id
//   knex('venues').where('artsy_id', venueId)
//     .then(function(venues) {
//       res.send(venues)
//     })
//     .catch(function(error) {
//       res.send(error)
//     })
// })

router.get('/venue/:id/shows', function(req, res, next) {
  let venueId = req.params.id
  console.log("check this from venue/id/shows: ")
  // knex('shows')
    // .innerJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')
    // .where('venue_artsy_id', venueId)

    knex('shows').select('*','shows.name as shows_name').innerJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')

    // .leftJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')
    .where('venue_artsy_id', venueId)

    .then(function(shows) {
      console.log("check this from venue/id/shows: ", shows)
      res.send(shows)
    })
    .catch(function(error) {
      console.log(error)
      res.send(error)
    })
})

router.get('/show/:id/artists', function(req, res, next) {
  let showId = req.params.id
  console.log("from show/id/artists: ", showId)
  knex('artists').where('artsy_show_id', showId)
    .then(function(artists) {
      res.send(artists)
    })
    .catch(function(error) {
      res.send(error)
    })
})

module.exports = router
