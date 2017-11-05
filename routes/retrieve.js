const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')
const cheerio = require('cheerio')
const $ = cheerio

router.get('/city/:id/venues', function(req, res, next) {
  console.log("entered ('/api/retrieve/city/' + cityId + '/venues') ")
  let cityId = req.params.id
  knex('venues').select()
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
  knex('shows').where('venue_artsy_id', venueId)
    .then(function(shows) {
      console.log(shows)
      res.send(shows)
    })
    .catch(function(error) {
      res.send(error)
    })
})


router.get('/show/:id/artists', function(req, res, next) {
  let showId = req.params.id
  knex('artists').where('artsy_show_id', showId)
    .then(function(artists) {
      res.send(artists)
    })
    .catch(function(error) {
      res.send(error)
    })
})

module.exports = router
