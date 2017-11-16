const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')
const cheerio = require('cheerio')
const $ = cheerio

//***show venues with shows***
router.get('/city/:id/venues', function(req, res, next) {
  let cityId = req.params.id
  knex('venues').where('cities_id', cityId)
    .then(function(venues) {
      res.send(venues)
    })
    .catch(function(error) {
      res.send(error)
    })
})




// select shows.name as show_name from shows
// left join artists on artists.artsy_show_id = shows.artsy_id
// where artists.name is not null
// and shows.venue_artsy_id = '52cef4b4b202a321ae0000e0' group by shows.name;
router.post('/venue/:id/shows', function(req, res, next) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@", req.body)
  let venueId = req.params.id
  console.log("enter venue id shows")
  knex('shows')
    .select( 'shows.artsy_id as show_artsy_id')
    .distinct('shows.name')
    .distinct('shows.from')
    .distinct('shows.to')
    .distinct('shows.description')
    .distinct('shows.press_release')
    .leftJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')
    .whereNotNull('artists.name')
    .andWhere('artists.relevant', req.body.relevance)
    .andWhere('shows.venue_artsy_id', venueId)
    // .groupBy('shows.name')
    .then(function(shows) {
      console.log("SHOWS******",shows)
      //get venues with shows
      res.send(shows)
    })
    .catch(function (error) {
      console.log(error)
      res.send(error)
    })
})




router.post('/show/:id/artists', function(req, res, next) {
  let showId = req.params.id
  console.log(req.body)
  knex('artists').where('artsy_show_id', showId)
    .where('artists.relevant', req.body.relevance)
    .then(function(artists) {
      res.send(artists)
    })
    .catch(function(error) {
      res.send(error)
    })
})

router.get('/cities', function(req, res, next) {
    knex('cities')
      .then(function(cities) {
        res.send(cities)
      })
})

router.patch('/artist/relevance', function(req, res, next) {
  console.log("entered artist/relevance patch: ")
  let artistName = req.body.name
  knex('artists')
    .where('artists.name', artistName)
    .first()
    .then(function(rowArtist) {
      if(!rowArtist) {
        throw new Error("artist not found")
      }
      rowArtist.relevant = req.body.relevant
      return knex('artists')
        .where('artists.name', artistName)
        .update(rowArtist)
        .returning('*')
    })
    .then(function(rowArtist) {
      res.send(rowArtist)
    })
    .catch(function(error) {
      console.log(error)
      next(error)
    })
})


module.exports = router
