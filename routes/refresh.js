// 'use strict';

const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')
const cheerio = require('cheerio')

const $ = cheerio

var partnersCPH = [
  "4df220a64c0f46000100d3f2", //Nils StÃ¦rk //Nils Stærk
  "50776cfefdab6100020001e6", //Andersen's Contemporary
  "594260972a893a206eeb9218", //Milsted Andersen
  "5537ec3a776f7272c7800000", //In The Gallery
  "50776cf5fdab610002000162", //Galleri Bo Bjerggaard
  "52e9197f8b3b816ce400000a", //V1 Gallery
  "4fb40f03d120120001000d41", //David Risley Gallery
  "515348ffc38e12392600010c", //Dansk MÃ¸belkunst Gallery
  "555b8a8f72616967c1900000", //Galleri Feldt
  "53d69995776f722929950000", //Martin AsbÃ¦k Gallery
  "56e82995275b2479430039e8", //SABSAY
  "4de1179108c1100001005a27"  //Galleri Nicolai Wallner
]

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

let cph = {
  name: "Copenhagen",
  knex_id: 4,
  partners: partnersCPH
}

let cities = {
  sea,
  cph
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
var artistTypesSearchWords = ["photos", "art"]

var artistTypeRegExps = [regexAutoCompleteQueryPhotographer, regexAutoCompleteQueryArtist, regexAutoCompleteQueryArt];

// url: "https://api.artsy.net/api/shows?partner_id=" + partners[i] + "&status=running",
// url: strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running",

function authenticate(req, res, next) {
  //console.log("entered authenticate")

  axios.post('https://api.artsy.net/api/tokens/xapp_token?client_id=4abaf180f92e4b617234&client_secret=4a7d07d8560a37d08c8683be00e3bc4a')
    .then(function(response) {
      token = response.data.token
      // //console.log("response from authenticate: ", response.data.token);
      next()
    })
    .catch(function(error) {
      //console.log("error from authenticate") //: ", error);
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
        // //console.log("snarf: ", venue.artsy_id)
        let strUrl = 'https://dl77sea-artbrowser.herokuapp.com/api/refresh/venue/' + venue.artsy_id + '/shows'
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
      //console.log("error from /allvenues/shows: ", error)

      res.send(false)
    })
})

router.get('/allvenues/artists', function(req, res, next) {
  console.log("entered /allvenues/artists")
  let promiseCalls = []
  knex('shows').select('artsy_id')
    .then(function(shows) {
      for (let show of shows) {
        //console.log("/allvenues/artists: shows artsy_id: ", show.artsy_id)
        let strUrl = 'https://dl77sea-artbrowser.herokuapp.com/api/refresh/show/' + show.artsy_id + '/artists'
        let options = {
          method: 'GET',
          url: strUrl
        }
        //console.log(strUrl)
        promiseCalls.push(axios(options))
      }
      //console.log("allvenues/artists/", promiseCalls.length)
      return Promise.all(promiseCalls)
    })
    .then(function(results) {
      res.send("allvenues/artists Promise.all completed")
    })
    .catch(function(error) {
      //console.log("error from /allvenues/shows: ", error)
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
      //console.log('this happened')
      let venues = []
      for (response of responses) {
        let venue = {
          artsy_id: response.data.id,
          name: response.data.name,
          cities_id: cities[cityId].knex_id
        }
        venues.push(venue)
        // //console.log(response.data.name)
        knex('venues')
          .insert({
            artsy_id: response.data.id,
            name: response.data.name,
            cities_id: cities[cityId].knex_id
          }, '*')
          .then((result) => {
            //console.log("knex result: ", result)
          })
          .catch((error) => {
            //console.log("knex error from /city/:id/venues")
          })
      }
      res.send(venues)
    })
    .catch((error) => {
      //console.log('error from get venues: ', error);
    })
})

router.get('/venue/:id/shows', authenticate, function(req, res, next) {
  let partner = req.params.id
  //console.log("entered venue/id/shows: ", partner)
  //https://api.artsy.net/api/shows?partner_id=
  //var strArtsyApiBaseUrl = "https://api.artsy.net/api/";
  //https://api.artsy.net/api/shows?partner_id=52b78578139b2159b5000adf&status=running
  let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partner + "&status=running"
  //console.log("strUrl from /venue/id/shows: ", strUrl)
  let options = {
    method: 'GET',
    url: strUrl,
    headers: {
      'X-Xapp-Token': token
    }
  }

  axios(options)
    .then(function(response) {
      //console.log("this is the response from axios in venue/id/shows: ")
      //console.log(response.data._embedded.shows.length)
      if (response.data._embedded.shows.length > 0) {
        // //console.log("here: ", response.data._embedded.shows.length)
        // //console.log("************")
        // //console.log(response.data._embedded.shows)
        //       venue_artsy_id: partner,
        //       artsy_id: show.id,
        //       name: show.name,
        //       from: show.start_at,
        //       to: show.end_at
        let shows = [];
        for (show of response.data._embedded.shows) {
          // //console.log("************")
          // //console.log(show.id)
          // //console.log(show.description)
          // //console.log(show.press_release)
          // show.description = 'A selection of landscape paintings by Seattle artist, Philip Govedare that are derived '
          // show.press_release = 'A selection of landscape paintings by Seattle artist, Philip Govedare that are derived from sites'
          // //console.log("************")
          let newShow = {
            venue_artsy_id: partner,
            artsy_id: show.id,
            name: show.name,
            description: show.description,
            press_release: show.press_release,
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
      //console.log("error from axios catch on /venue/:id/shows/")
      res.send(false)
    })
})

//inserts an artist(s) into artists table by artsy show id
router.get('/show/:id/artists', authenticate, function(req, res, next) {
  var bArtistsFound = false;
  console.log("entered /show/id/artists")
  //console.log("entered /show/:id/artists")
  let showId = req.params.id
  //console.log(showId)
  knex('shows').where('artsy_id', showId)
    .then(function(result) {
      //console.log(result)
      console.log("entered then for /show/id/artists")
      let show = result[0]

      if (show.name !== null) {
        console.log("entered then for /show/id/artists on name")
        let possibleNames = extractPossibleNames(show.name)
        let axiosCalls = getGqsCalls(possibleNames)
        //Google Query Search for possible artists from possible names
        //and insert the possible artists into artists table
        let artists = [];

        Promise.all(axiosCalls)
          .then(function(gqsResults) {
            let axiosCalls = []
            //gqsResults in same order as possibleNames
            //checkForArtists returns array of objects of names and GQS search string name found to be artist on
            let arrArtistObjs = checkForArtists(possibleNames, gqsResults)
            //submit artists to artists table if checkForArtists found artists
            if (arrArtistObjs.length > 0) {
              //from data returned from checkForArtists, build artist objects representing row in artists table
              for (let artistObj of arrArtistObjs) {
                let artist = {
                  name: artistObj.name,
                  found_on: artistObj.found_on,
                  relevant: true,
                  artsy_show_id: showId,
                  image_urls: {
                    images: []
                  }
                }
                artists.push(artist)
              }
              //if artists were found, get image urls for them
              //for each artist found, build a Google Image Search query urls
              //https://www.google.com/search?safe=active&q=bo+christian+art+&tbm=isch
              for (let artistObj of artists) {
                let strGisBaseUrl = "https://www.google.com/search?safe=active&q="
                let strGisEndUrl = "&tbm=isch"

                console.log('artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)', artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)])
                let searchWord = artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)]
                // var artistTypesToCheckFor = ["+p", "+a"];
                // var artistTypesSearchWords = ["photos", "art"]
                let strUrl = strGisBaseUrl + (artistObj.name.replace(' ', '+')) + '+' + searchWord + strGisEndUrl
                console.log(">>>>>>>>>>!!!", strUrl)
                let options = {
                  method: 'GET',
                  url: strUrl,
                  headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
                  }
                }
                axiosCalls.push(axios(options))
              }
            }

            //get urls for each artist with promise all
            //(order maintained, 1:1 with artists)
            //map urls to artists
            return Promise.all(axiosCalls) //should this be returned?
          })
          .then(function(responses) {
            for (let i = 0; i < responses.length; i++) {
              let arrImgUrls = getImgUrls(responses[i])
              artists[i].image_urls.images.push(arrImgUrls)
            }
            bArtistsFound = true;
            return knex.insert(artists).into('artists').returning('*')
          })
          .then(function(arrArtistObjs) {
            // does not matter if insert was empty
            res.send(arrArtistsObjs)
          })
          .catch(function(error) {
            res.send(false)
          })
      } else if (show.description !== null && bArtistsFound === false) {
        console.log("entered then for /show/id/artists on desc")
        let possibleNames = extractPossibleNames(show.description)
        let axiosCalls = getGqsCalls(possibleNames)
        //Google Query Search for possible artists from possible names
        //and insert the possible artists into artists table
        let artists = [];

        Promise.all(axiosCalls)
          .then(function(gqsResults) {
            let axiosCalls = []
            //gqsResults in same order as possibleNames
            //checkForArtists returns array of objects of names and GQS search string name found to be artist on
            let arrArtistObjs = checkForArtists(possibleNames, gqsResults)
            //submit artists to artists table if checkForArtists found artists
            if (arrArtistObjs.length > 0) {
              //from data returned from checkForArtists, build artist objects representing row in artists table
              for (let artistObj of arrArtistObjs) {
                let artist = {
                  name: artistObj.name,
                  found_on: artistObj.found_on,
                  relevant: true,
                  artsy_show_id: showId,
                  image_urls: {
                    images: []
                  }
                }
                artists.push(artist)
              }
              //if artists were found, get image urls for them
              //for each artist found, build a Google Image Search query urls
              //https://www.google.com/search?safe=active&q=bo+christian+art+&tbm=isch
              for (let artistObj of artists) {
                let strGisBaseUrl = "https://www.google.com/search?safe=active&q="
                let strGisEndUrl = "&tbm=isch"

                console.log('artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)', artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)])
                let searchWord = artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)]
                // var artistTypesToCheckFor = ["+p", "+a"];
                // var artistTypesSearchWords = ["photos", "art"]
                let strUrl = strGisBaseUrl + (artistObj.name.replace(' ', '+')) + '+' + searchWord + strGisEndUrl
                console.log(">>>>>>>>>>!!!", strUrl)
                let options = {
                  method: 'GET',
                  url: strUrl,
                  headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
                  }
                }
                axiosCalls.push(axios(options))
              }
            }

            //get urls for each artist with promise all
            //(order maintained, 1:1 with artists)
            //map urls to artists
            return Promise.all(axiosCalls) //should this be returned?
          })
          .then(function(responses) {
            for (let i = 0; i < responses.length; i++) {
              let arrImgUrls = getImgUrls(responses[i])
              artists[i].image_urls.images.push(arrImgUrls)
            }
            bArtistsFound = true;
            return knex.insert(artists).into('artists').returning('*')
          })
          .then(function(arrArtistObjs) {
            // does not matter if insert was empty
            console.log()
            res.send(true)
          })
          .catch(function(error) {
            res.send(false)
          })
      } else if (show.press_release !== null && bArtistsFound === false) {
        console.log("entered then for /show/id/artists on press")
        let possibleNames = extractPossibleNames(show.press_release)
        let axiosCalls = getGqsCalls(possibleNames)
        //Google Query Search for possible artists from possible names
        //and insert the possible artists into artists table
        let artists = [];

        Promise.all(axiosCalls)
          .then(function(gqsResults) {
            let axiosCalls = []
            //gqsResults in same order as possibleNames
            //checkForArtists returns array of objects of names and GQS search string name found to be artist on
            let arrArtistObjs = checkForArtists(possibleNames, gqsResults)
            //submit artists to artists table if checkForArtists found artists
            if (arrArtistObjs.length > 0) {
              //from data returned from checkForArtists, build artist objects representing row in artists table
              for (let artistObj of arrArtistObjs) {
                let artist = {
                  name: artistObj.name,
                  found_on: artistObj.found_on,
                  relevant: true,
                  artsy_show_id: showId,
                  image_urls: {
                    images: []
                  }
                }
                artists.push(artist)
              }
              //if artists were found, get image urls for them
              //for each artist found, build a Google Image Search query urls
              //https://www.google.com/search?safe=active&q=bo+christian+art+&tbm=isch
              for (let artistObj of artists) {
                let strGisBaseUrl = "https://www.google.com/search?safe=active&q="
                let strGisEndUrl = "&tbm=isch"

                console.log('artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)', artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)])
                let searchWord = artistTypesSearchWords[artistTypesToCheckFor.indexOf(artistObj.found_on)]
                // var artistTypesToCheckFor = ["+p", "+a"];
                // var artistTypesSearchWords = ["photos", "art"]
                let strUrl = strGisBaseUrl + (artistObj.name.replace(' ', '+')) + '+' + searchWord + strGisEndUrl
                console.log(">>>>>>>>>>!!!", strUrl)
                let options = {
                  method: 'GET',
                  url: strUrl,
                  headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
                  }
                }
                axiosCalls.push(axios(options))
              }
            }

            //get urls for each artist with promise all
            //(order maintained, 1:1 with artists)
            //map urls to artists
            return Promise.all(axiosCalls) //should this be returned?
          })
          .then(function(responses) {
            for (let i = 0; i < responses.length; i++) {
              let arrImgUrls = getImgUrls(responses[i])
              artists[i].image_urls.images.push(arrImgUrls)
            }
            return knex.insert(artists).into('artists').returning('*')
          })
          .then(function(arrArtistObjs) {
            // does not matter if insert was empty
            res.send(true)
          })
          .catch(function(error) {
            res.send(false)
          })
      } else {
        //console.log("no names found for this show")
        res.send(false)
      }

    })
    .catch(function(error) {
      //console.log("catch bad knex query from /shows/id/artists: ", error)
      res.send(error)
    })
})

// router.get('/artist/:id/images', authenticate, function(req, res, next) {
//
// })

//check xml results from GQS for artist hits
//return it to
function checkForArtists(possibleNames, gqsResults) {
  numPossibleNames = possibleNames.length
  //console.log("numPossibleNames: ", numPossibleNames)

  let artists = []
  for (let iPossibleName = 0; iPossibleName < numPossibleNames; iPossibleName++) {
    for (let iType = 0; iType < artistTypesToCheckFor.length; iType++) {
      let gqsXml = gqsResults[(iPossibleName * artistTypesToCheckFor.length) + iType].data
      if (isArtist(gqsXml)) {
        artists.push({
          name: possibleNames[iPossibleName],
          found_on: artistTypesToCheckFor[iType]
        })
        iType = artistTypesToCheckFor.length //avoid duplicate pushes on multiple type hits
      }
    }
  }
  //console.log("length of artists obj array: ", artists.length)
  return artists
}

function getGqsCalls(possibleNames) {
  //console.log("possibleNames ", possibleNames)
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
      //console.log(strUrl)
      axiosCalls.push(axios(options))
    }
  }
  return axiosCalls
}

// //why must send res as an argument here but not in getShows?
// function getArtists(shows, res) {
//   //append possible people names to each show object in array
//   for (show of shows) {
//     let possiblePeopleNames = extractPossibleNames(show.name)
//     show.name_possible_names = possiblePeopleNames
//     possiblePeopleNames = extractPossibleNames(show.desc)
//     show.desc_possible_names = possiblePeopleNames
//     possiblePeopleNames = extractPossibleNames(show.press)
//     show.press_possible_names = possiblePeopleNames
//   }
//
//   //append axios calls to GQS to each show object (one array of calls per text source (show, name, desc))
//   var axiosCalls = []
//   for (show of shows) {
//     //show.name_calls = appendShowNameCalls(show.name_possible_names, shows)
//     show.desc_calls = appendShowNameCalls(show.desc_possible_names, shows)
//     //show.press_calls = appendShowNameCalls(show.press_possible_names, shows)
//   }
//
//   res.send(shows)
//   // //check for possible artists in order of likely succinctness of list containing the show artist name(s)
//   let AllPromises = []
//   for (show of shows) {
//     AllPromises.push(Promise.all(show.name_calls))
//
//   }
//
//   Promise.all(AllPromises).then((res) => {
//     //console.log('??????', res);
//   })
//   // if (show.name_calls.length > 0) {
//   //   //console.log
//   //   Promise.all(show.name_calls).then(function(responses) {
//   //     //check each response for artist hit
//   //     for (response of responses) {
//   //       //console.log(response)
//   //       // if (isArtist(response)) {
//   //       //   //console.log("found artist")
//   //       // }
//   //     }
//   //   })
//   // } else if (show.desc_calls.length > 0) {
//   //
//   // } else if (show.press_calsl.length > 0) {
//   //
//   // }
//   // res.send(shows)
// }
//
//
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

//get google image search source
function getImgUrls(response) {
  // //console.log("***from getGisSrc: ", artistObj.name)
  // // sample GIS url: https://www.google.com/search?safe=active&q=andreas+gursky+photos&tbm=isch
  // let strGisBaseUrl = "https://www.google.com/search?q=" //"https://www.google.com/search?safe=active&q="
  // let strGisEndUrl = "&tbm=isch"
  // let strUrl = strGisBaseUrl + artistObj.name.replace(' ', '+') + "+photos" + strGisEndUrl
  // //console.log(">>>>>>", strUrl)
  // let options = {
  //   method: 'GET',
  //   url: strUrl,
  //   headers: {
  //     // 'accept': 'text/html,application/xhtml+xml,application/xml',
  //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  //     // 'X-Xapp-Token': token
  //   }
  // }
  // axios(options)
  //   .then(function(response) {
  //     //console.log("result from GIS axios: ", response.data)

  //pattern for finding start of image urls in GIS response
  let imgUrlPatRe = new RegExp('"ou":', 'g')

  //harvest image urls
  let arrImageUrls = []
  //get the first 3 image urls
  let numUrls = 3;
  while (imgUrlPatRe.exec(response.data) !== null && numUrls > 0) {
    //console.log("this is happening")
    let iStr = imgUrlPatRe.lastIndex
    let subStr = response.data.substring(iStr)

    if (subStr.substring(0, 5) === '"http') {
      let retUrl = subStr.match(/"http.*?"/)
      let retUrlLength = retUrl[0].length

      //get rid of eztra quotes on either end of url string
      retUrl = retUrl[0].slice(1, retUrlLength - 1)

      arrImageUrls.push(retAsciiFromUnicodeStr(retUrl));

      numUrls--;
    }
  }

  //this helper function courtesy of https://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
  function retAsciiFromUnicodeStr(str) {
    var r = /\\u([\d\w]{4})/gi;
    str = str.replace(r, function(match, grp) {
      return String.fromCharCode(parseInt(grp, 16));
    });
    str = unescape(str);
    return str;
  }
  // //console.log("from getGisSrc axios.then>>>>>>>>", arrImageUrls)
  //console.log(">>>>>>%%%%%%%%>>>>>>>>", arrImageUrls)
  return arrImageUrls;

}


module.exports = router
