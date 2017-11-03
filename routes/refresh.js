// 'use strict';

const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')
const cheerio = require('cheerio')

const $ = cheerio



var partnersSEA = [
  "53d26e7b776f723ccc140100", //Mariane Ibrahim Gallery
  "545102d5776f72231efe0000", //Greg Kucera Gallery *
  "52b78578139b2159b5000adf", //Koplin Del Rio
  "52a8f1ec139b21fc440001c8", //Winston Wachter Fine Artsy--
  "52cef4b4b202a321ae0000e0", //G.Gibson Gallery--
  "537cb20d9c18dbb4f90003c1", //Traver Gallery
  "52276818ebad644079000123", //Bau Xi Gallery ???
  "52cf2bdf139b21e49f00045a", //Linda Hodges Gallery
  "559da25a72616970f2000249", //Abmeyer + Wood Fine Artsy ???
  "54bfed927261692b4db20100" //Foster/White Gallery
]

let sea = {
  name: "Seattle",
  knex_id: 1,
  partners: partnersSEA
}

let cities = {
  sea
}

var strToken;
var strArtsyApiBaseUrl = "https://api.artsy.net/api/";
// var partners = partnersSEA;

var token;
var shows = [];
var regexAutoCompleteQueryArtist = new RegExp(/\bartist\b/, 'g'); //new RegExp(/\bartist\b|\bart\b/, 'g');
var regexAutoCompleteQueryArt = new RegExp(/\bart\b/, 'g'); //new RegExp(/\bartist\b|\bart\b/, 'g');
var regexAutoCompleteQueryPhotographer = new RegExp(/\bphotographer\b|\bphotos\b|\bphotography\b/, 'g');
var artistTypesToCheckFor = ["+p", "+a"];
var artistTypeRegExps = [regexAutoCompleteQueryPhotographer, regexAutoCompleteQueryArtist, regexAutoCompleteQueryArt];

// url: "https://api.artsy.net/api/shows?partner_id=" + partners[i] + "&status=running",
// url: strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running",

function authenticate(req, res, next) {
  console.log("entered authenticate")

  axios.post('https://api.artsy.net/api/tokens/xapp_token?client_id=4abaf180f92e4b617234&client_secret=4a7d07d8560a37d08c8683be00e3bc4a')
    .then(function(response) {
      token = response.data.token
      // console.log("response from authenticate: ", response.data.token);
      next()
    })
    .catch(function(error) {
      console.log("error from authenticate") //: ", error);
      next()
    });
}
/*--------------------------------------------------*/
//refresh/allcities/venues
//promise all
//over cities table
//insert venues

//refresh/allvenues/shows
//promise.all
//over venues table
//insert shows
router.get('/allvenues/shows', function(req, res, next) {
  //itterate over venues
  let promiseCalls = []
  knex('venues').select('artsy_id')
    .then(function(venues) {
      for (let venue of venues) {
        // console.log("snarf: ", venue.artsy_id)
        let strUrl = 'http://localhost:5000/api/refresh/venue/' + venue.artsy_id + '/shows'
        let options = {
          method: 'GET',
          url: strUrl,
        }
        promiseCalls.push(axios(options))
      }
      return Promise.all(promiseCalls)
    })
    .then(function(results) {
      res.send("allvenues/shows Promise.all completed")
    })
    .catch(function(error) {
      console.log("error from /allvenues/shows: ", error)

      res.send(false)
    })
})

router.get('/allvenues/artists', function(req, res, next) {
  let promiseCalls = []
  knex('shows').select('artsy_id')
    .then(function(shows) {
      for (let show of shows) {
        console.log("/allvenues/artists: shows artsy_id: ", show.artsy_id)
        let strUrl = 'http://localhost:5000/api/refresh/show/' + show.artsy_id + '/artists'
        let options = {
          method: 'GET',
          url: strUrl
        }
        console.log(strUrl)
        promiseCalls.push(axios(options))
      }
      console.log("allvenues/artists/", promiseCalls.length)
      return Promise.all(promiseCalls)
    })
    .then(function(results) {
      res.send("allvenues/artists Promise.all completed")
    })
    .catch(function(error) {
      console.log("error from /allvenues/shows: ", error)
      res.send(false)
    })
})

//id = city
router.get('/city/:id/venues', authenticate, function(req, res, next) {
  let cityId = req.params.id
  var cityName = cities[cityId].name
  let partners = cities[cityId].partners

  //https://api.artsy.net/api/partners/53d26e7b776f723ccc140100
  let axiosCalls = []
  for (partner of partners) {
    let strUrl = strArtsyApiBaseUrl + "partners/" + partner
    let options = {
      method: 'GET',
      url: strUrl,
      headers: {
        'X-Xapp-Token': token
      }
    }
    axiosCalls.push(axios(options))
  }

  Promise.all(axiosCalls)
    .then((responses) => {
      console.log('this happened')
      let venues = []
      for (response of responses) {
        let venue = {
          artsy_id: response.data.id,
          name: response.data.name,
          cities_id: cities[cityId].knex_id
        }
        venues.push(venue)
        // console.log(response.data.name)
        knex('venues')
          .insert({
            artsy_id: response.data.id,
            name: response.data.name,
            cities_id: cities[cityId].knex_id
          }, '*')
          .then((result) => {
            console.log("knex result: ", result)
          })
          .catch((error) => {
            console.log("knex error from /city/:id/venues")
          })
      }
      res.send(venues)
    })
    .catch((error) => {
      console.log('error from get venues: ', error);
    })
})

router.get('/venue/:id/shows', authenticate, function(req, res, next) {
  let partner = req.params.id
  console.log("entered venue/id/shows: ", partner)
  //https://api.artsy.net/api/shows?partner_id=
  //var strArtsyApiBaseUrl = "https://api.artsy.net/api/";
  //https://api.artsy.net/api/shows?partner_id=52b78578139b2159b5000adf&status=running
  let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partner + "&status=running"
  console.log("strUrl from /venue/id/shows: ", strUrl)
  let options = {
    method: 'GET',
    url: strUrl,
    headers: {
      'X-Xapp-Token': token
    }
  }

  axios(options)
    .then(function(response) {
      console.log("this is the response from axios in venue/id/shows: ")
      console.log(response.data._embedded.shows.length)
      if (response.data._embedded.shows.length > 0) {
        // console.log("here: ", response.data._embedded.shows.length)
        // console.log("************")
        // console.log(response.data._embedded.shows)
        //       venue_artsy_id: partner,
        //       artsy_id: show.id,
        //       name: show.name,
        //       from: show.start_at,
        //       to: show.end_at
        let shows = [];
        for (show of response.data._embedded.shows) {
          // console.log("************")
          // console.log(show.id)
          // console.log(show.description)
          // console.log(show.press_release)
          // show.description = 'A selection of landscape paintings by Seattle artist, Philip Govedare that are derived '
          // show.press_release = 'A selection of landscape paintings by Seattle artist, Philip Govedare that are derived from sites'
          // console.log("************")
          let newShow = {
            venue_artsy_id: partner,
            artsy_id: show.id,
            name: show.name,
            // description: show.description,
            // press_release: show.press_release,
            from: show.start_at,
            to: show.end_at
          }
          shows.push(newShow)
        }
        return knex.insert(shows).into('shows')
      } else {
        return
      }
    })
    .then(function(result) {
      res.send(true)
    })
    .catch(function(error) {
      console.log("error from axios catch on /venue/:id/shows/")
      res.send(false)
    })
})

router.get('/show/:id/artists', authenticate, function(req, res, next) {
  console.log("entered /show/:id/artists")
  let showId = req.params.id
  console.log(showId)
  knex('shows').where('artsy_id', showId)
    .then(function(result) {
      console.log(result)
      let show = result[0]

      if (show.name !== null) {
        let possibleNames = extractPossibleNames(show.name)
        // possibleNames = ['Distant Places', 'Pablo Picasso', 'Philip Govedare']
        console.log("FOUND NAMES IN NAMES")
        console.log("-----possibleNames from show/id/artists: ", possibleNames)
        let axiosCalls = getGqsCalls(possibleNames)
        Promise.all(axiosCalls)
          .then(function(results) {
            let names = checkForArtists(possibleNames, results)

            let artists = [];
            if (names.length > 0) {

              for (let name of names) {
                let artist = {
                  name: name,
                  relevant: true,
                  artsy_show_id: showId,
                  image_urls: {
                    images: "blarf"
                  }
                }
                console.log("artist: ", artist)
                artists.push(artist)
              }
              return knex.insert(artists).into('artists')
            } else {
              return
            }
          })
          .then(function(result) {
            res.send(true)
          })
          .catch(function(error) {
            console.log(error)
            res.send(false)
          })
      } else if (show.description !== null) {
        let possibleNames = extractPossibleNames(show.description)
        let axiosCalls = getGqsCalls(possibleNames)
        Promise.all(axiosCalls)
          .then(function(results) {
            let names = checkForArtists(possibleNames, results)

            let artists = [];
            for (let name of names) {

              let artist = {
                first_name: name.split(' ')[0],
                last_name: name.split(' ')[1]
              }
              artists.push(artist)
            }
            return knex.insert(artists).into('artists')
          })
          .then(function(result) {
            res.send(true)
          })
          .catch(function(error) {
            res.send(false)
          })
      } else if (show.press_release !== null) {
        let possibleNames = extractPossibleNames(show.press_release)
        let axiosCalls = getGqsCalls(possibleNames)
        Promise.all(axiosCalls)
          .then(function(results) {
            let names = checkForArtists(possibleNames, results)

            let artists = [];
            for (let name of names) {

              let artist = {
                first_name: name.split(' ')[0],
                last_name: name.split(' ')[1]
              }
              artists.push(artist)
            }
            return knex.insert(artists).into('artists')
          })
          .then(function(result) {
            res.send(true)
          })
          .catch(function(error) {
            res.send(false)
          })
      } else {
        console.log("no names found for this show")
        res.send(false)
      }

    })
    .catch(function(error) {
      console.log("catch bad knex query from /shows/id/artists: ", error)
      res.send(error)
    })
})

router.get('/artist/:id/images', authenticate, function(req, res, next) {

})

//check xml results from GQS for artist hits
function checkForArtists(possibleNames, gqsResults) {
  numPossibleNames = possibleNames.length
  // console.log("-------")
  // console.log("-----possibleNames from checkForArtists: ", possibleNames)
  // console.log("checkForArtists entered. gqsResults: ")
  // for (result of gqsResults)
  //   console.log(result.data)
  // console.log("-------")

  let artists = []
  for (let iPossibleName = 0; iPossibleName < numPossibleNames; iPossibleName++) {
    for (let iType = 0; iType < artistTypesToCheckFor.length; iType++) {
      // console.log("checkForArtists iType: ", iType)
      let gqsXml = gqsResults[(iPossibleName * artistTypesToCheckFor.length) + iType].data
      // console.log("checkForArtists xml: ", gqsXml)
      if (isArtist(gqsXml)) {
        // console.log("found here: ", possibleNames)
        artists.push(possibleNames[iPossibleName])
      }

    }
  }
  return artists
}

function getGqsCalls(possibleNames) {
  console.log("possibleNames ", possibleNames)
  var axiosCalls = []
  //build a list of network calls to check if name is possible artist
  for (const possibleName of possibleNames) {
    //http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=Chris+Engman+p
    let strGoogleQueryBaseUrl = "http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q="
    for (const strArtistType of artistTypesToCheckFor) {
      let strUrl = strGoogleQueryBaseUrl + possibleName.replace(" ", "+") + strArtistType
      let options = {
        method: 'GET',
        url: strUrl,
      }
      console.log(strUrl)
      axiosCalls.push(axios(options))
    }
  }
  return axiosCalls
}

// //id = city
// router.get('/shows_by_city/:id', authenticate, function(req, res, next) {
//     let cityId = req.params.id
//     // var cityName = cities[cityId].name
//     let partners = cities[cityId].partners
//
//     let axiosCalls = [];
//     for (partner of partners) {
//       let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partner + "&status=running"
//       let options = {
//         method: 'GET',
//         url: strUrl,
//         headers: {
//           'X-Xapp-Token': token
//         }
//       }
//       axiosCalls.push(axios(options))
//     }
//
//     Promise.all(axiosCalls)
//       .then((responses) => {
//           for (let i = 0; i < partners.length; i++) {
//             // console.log(responses[i].data._embedded.shows.length)
//             console.log(responses[i].data._embedded.shows.length)
//             if (responses[i].data._embedded.shows.length > 0) {
//               for (let j = 0; j < responses[i].data._embedded.shows.length; j++) {
//
//                 //   console.log("-------------------------------")
//
//                 //     // console.log(responses[i].data._embedded.shows[j])
//                 //     // console.log("artsy_id: ", partners[i])
//                 //     // console.log("name: ", responses[i].data._embedded.shows[j].name)
//                 //     // console.log("from: ", responses[i].data._embedded.shows[j].start_at)
//                 //     // console.log("to: ", responses[i].data._embedded.shows[j].end_at)
//                 knex('shows')
//                   .insert({
//                     venue_artsy_id: partners[i],
//                     name: responses[i].data._embedded.shows[j].name,
//                     from: responses[i].data._embedded.shows[j].start_at,
//                     to: responses[i].data._embedded.shows[j].end_at
//                   }, '*')
//                   .then((result) => {
//                     // console.log("knex result: ", result)
//                     // res.send(venues)
//                   })
//                   .catch((error) => {
//                     console.log("knex error", error)
//                   })
//               }
//             } else {
//               knex('shows')
//                 .insert({
//                   venue_artsy_id: partners[i],
//                   name: null,
//                   from: null,
//                   to: null
//                 }, '*')
//                 .then((result) => {
//                   console.log("knex result: ", result)
//                   // res.send(venues)
//                 })
//                 .catch((error) => {
//                   console.log("knex error", error)
//                 })
//             }
//           }
//         }
//       }
//   })
//   .catch((error) => {
//     console.log('error from get shows promise all: ', error);
//   })
// })
//
//
// /*--------------------------------------------------*/
// //id = city
// router.get('/venues/:id', authenticate, function(req, res, next) {
//   console.log("entered /venues")
//   let cityId = req.params.id
//   console.log("cityId: ", cityId)
//   console.log("cities.cityId: ", cities[cityId])
//
//   var cityName = cities[cityId].name
//   let partners = cities[cityId].partners
//
//   let axiosCalls = [];
//   for (let i = 0; i < partners.length; i++) {
//     let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running"
//     let options = {
//       method: 'GET',
//       url: strUrl,
//       headers: {
//         'X-Xapp-Token': token
//       }
//     }
//     axiosCalls.push(axios(options))
//   }
//
//   Promise.all(axiosCalls).then(function(responses) {
//       console.log("responses.length: ", responses.length)
//       let venuesWithShows = []
//       for (response of responses) {
//         //venues includes only venues with current show(s)
//         if (response.data._embedded.shows.length > 0) {
//           venuesWithShows.push(response.data._embedded.shows[0]._links.partner.href)
//         }
//       }
//
//       return venuesWithShows
//     })
//     .then(function(venuesWithShows) {
//       let axiosCalls = []
//       for (venue of venuesWithShows) {
//         let strUrl = venue
//         let options = {
//           method: 'GET',
//           url: strUrl,
//           headers: {
//             'X-Xapp-Token': token
//           }
//         }
//         axiosCalls.push(axios(options))
//       }
//
//       Promise.all(axiosCalls).then(function(responses) {
//           // console.log(rresponses)
//           // let names = []
//           let venues = []
//           // let venue = {}
//           for (response of responses) {
//             let venue = {}
//
//             venue.id = response.data.id
//             venue.name = response.data.name
//             venue.city = cityName
//
//             venues.push(venue)
//           }
//           console.log("venues: ", venues)
//
//           getShows(venues)
//         })
//         .catch(function(err) {
//           console.log("error from promise all get venue names", err)
//           next()
//         })
//     })
//     .catch(function(err) {
//       console.log("error from get venues promise all: ", err)
//       next();
//     })
//
//   function getShows(venues) {
//     let axiosCalls = [];
//     let shows = {}
//     for (venue of venues) {
//       shows[venue.id] = {}
//       let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + venue.id + "&status=running"
//       let options = {
//         method: 'GET',
//         url: strUrl,
//         headers: {
//           'X-Xapp-Token': token
//         }
//       }
//       // shows.push(show)
//       console.log(strUrl)
//       axiosCalls.push(axios(options))
//     }
//     // console.log(axiosCalls)
//
//     //each response contains a list of shows for a given venue
//     Promise.all(axiosCalls).then(function(responses) {
//         let axiosCalls = []
//
//         for (showsResponse of responses) {
//           let venueIdUrl = showsResponse.data._embedded.shows[0]._links.partner.href
//           let venueId = venueIdUrl.slice(venueIdUrl.length - 24, venueIdUrl.length)
//           shows[venueId].shows = []
//
//           for (let i = 0; i < showsResponse.data._embedded.shows.length; i++) {
//             let show = {}
//             show.name = showsResponse.data._embedded.shows[i].name
//             show.from = showsResponse.data._embedded.shows[i].start_at
//             show.to = showsResponse.data._embedded.shows[i].end_at
//             show.desc = showsResponse.data._embedded.shows[i].description
//             show.press = showsResponse.data._embedded.shows[i].press_release
//             show.artsy_venue_id = venueId
//             shows[venueId].shows.push(show)
//           }
//
//         }
//         //reformat shows object for parsing by get artists
//         //(each show for city will be represented as an object in an array)
//         let allShows = []
//         for (venue in shows) {
//           let showsJson = shows[venue]
//           let arrShows = showsJson.shows;
//           for (show of arrShows) {
//             allShows.push(show)
//           }
//         }
//         // res.send(allShows)
//         getArtists(allShows, res)
//       })
//       .catch(function(err) {
//         console.log("error from getShows: ", err)
//         next()
//       })
//   }
//
// })

//why must send res as an argument here but not in getShows?
function getArtists(shows, res) {
  //append possible people names to each show object in array
  for (show of shows) {
    let possiblePeopleNames = extractPossibleNames(show.name)
    show.name_possible_names = possiblePeopleNames
    possiblePeopleNames = extractPossibleNames(show.desc)
    show.desc_possible_names = possiblePeopleNames
    possiblePeopleNames = extractPossibleNames(show.press)
    show.press_possible_names = possiblePeopleNames
  }

  //append axios calls to GQS to each show object (one array of calls per text source (show, name, desc))
  var axiosCalls = []
  for (show of shows) {
    //show.name_calls = appendShowNameCalls(show.name_possible_names, shows)
    show.desc_calls = appendShowNameCalls(show.desc_possible_names, shows)
    //show.press_calls = appendShowNameCalls(show.press_possible_names, shows)
  }

  res.send(shows)
  // //check for possible artists in order of likely succinctness of list containing the show artist name(s)
  let AllPromises = []
  for (show of shows) {
    AllPromises.push(Promise.all(show.name_calls))

  }

  Promise.all(AllPromises).then((res) => {
    console.log('??????', res);
  })
  // if (show.name_calls.length > 0) {
  //   console.log
  //   Promise.all(show.name_calls).then(function(responses) {
  //     //check each response for artist hit
  //     for (response of responses) {
  //       console.log(response)
  //       // if (isArtist(response)) {
  //       //   console.log("found artist")
  //       // }
  //     }
  //   })
  // } else if (show.desc_calls.length > 0) {
  //
  // } else if (show.press_calsl.length > 0) {
  //
  // }
  // res.send(shows)
}


function extractPossibleNames(str) {
  let possibleNames = [];
  //this will look for person names that are two capitalized contigious strings
  //(can be improved with looking for Middle initials, middle names, nobliary particles)
  let nameRegExp = new RegExp(/[A-Z][\w-]*\s[A-Z][\w-]*/, 'g');

  let possibleName = null;
  while ((possibleName = nameRegExp.exec(str)) !== null) {
    if (possibleNames.includes(possibleName[0]) === false) {
      possibleNames.push(possibleName[0]);
    }
  }
  return possibleNames;
}

function isArtist(strXml) {
  let $xml = $(strXml);

  //iXml test against, set to number of levels deep into xml object to check for string key word matching with regexps
  for (iXml = 0; iXml < 2; iXml++) {
    if ($xml.find('suggestion')[iXml] !== undefined) {
      for (let i = 0; i < artistTypeRegExps.length; i++) {
        if ($xml.find('suggestion')[iXml].attribs.data.match(artistTypeRegExps[i])) {
          return true;
        }
      }
    } else {
      return false;
    }
  }
}



module.exports = router
