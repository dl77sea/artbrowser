const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')
const cheerio = require('cheerio')
const $ = cheerio

//***show venues with shows***
router.get('/city/:id/venues', function(req, res, next) {
  // //console.log("entered ('/api/retrieve/city/' + cityId + '/venues') ")
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

// knex('artists')
//   .where()
//
// knex('shows').select('*','shows.name as shows_name').innerJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')
//
// // .leftJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')
// .where('venue_artsy_id', venueId)

//proper way to do this? (get shows for venue.
//return only shows with artists.
//but do not return duplicates of same show (happens on select aliasing))
//artbrowser_dev=# select shows.name as show_name from shows left join artists on artists.artsy_show_id = shows.artsy_id where artists.name is not null and shows.venue_artsy_id = '52cef4b4b202a321ae0000e0' group by shows.name;
// router.get('/venue/:id/shows', function(req, res, next) {
//   let venueId = req.params.id
//   // let allShows = []
//   // let retShows = []
//   // //console.log("check this from venue/id/shows: ")
//   knex('shows').where('venue_artsy_id', venueId)
//     .then(function(shows) {
//       // //console.log("entered shows then", shows) //returned as array
//       // shows includes shows for venueId
//       // does artsy_id for each show returned from above, have an artist?
//       // if so, include it in send, otherwise, remove it from send.
//     //   let promiseCalls = []
//     //   for (let show of shows) {
//     //     allShows.push(show)
//     //     promiseCalls.push(knex('artists').where('artsy_show_id', show.artsy_id))
//     //   }
//     //   return Promise.all(promiseCalls)
//     // })
//     // .then(function(artists) {
//       // //console.log("entered artists then", artists)
//
//       // for (let show of allShows) {
//         // //console.log("show.artsy_id: ", show.artsy_id)
//         // if (artists.length > 0) {
//           // for (let artist of artists) {
//             // //console.log("artist.artsy_show_id: ", artist.artsy_show_id)
//             // //console.log(artist[0].id)
//             // if(artist[0] === undefined) {
//               //console.log("------------------")
//               //console.log("artist: ", artist)
//               //console.log("show: ", show)
//               //console.log("------------------")
//             // }
//           //   if (show.artsy_id === artist[0].artsy_show_id) {
//           //     retShows.push(show)
//           //   }
//           // }
//         // }
//       // }
//       //console.log("check this from venue/id/shows: ", retShows)
//       res.send(shows)
//     })
//   //how to do this?
//   // .catch(function(error) {
//   //   //console.log(error)
//   //   res.send(error)
//   // })
//
// })



// select shows.name as show_name from shows
// left join artists on artists.artsy_show_id = shows.artsy_id
// where artists.name is not null
// and shows.venue_artsy_id = '52cef4b4b202a321ae0000e0' group by shows.name;
router.get('/venue/:id/shows', function(req, res, next) {
  let venueId = req.params.id
  console.log("enter venue id shows")
  knex('shows')
    .select( 'shows.artsy_id as show_artsy_id')
    .distinct('shows.name')
    .leftJoin('artists', 'artists.artsy_show_id', 'shows.artsy_id')
    .whereNotNull('artists.name')
    .andWhere('shows.venue_artsy_id', venueId)
    // .groupBy('shows.name')
    .then(function(shows) {
      console.log(shows)
      //get venues with shows
      res.send(shows)
    })
    .catch(function (error) {
      console.log(error)
      res.send(error)
    })
})




router.get('/show/:id/artists', function(req, res, next) {
  let showId = req.params.id
  // //console.log("from show/id/artists: ", showId)
  knex('artists').where('artsy_show_id', showId)
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

module.exports = router
