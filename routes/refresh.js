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
  "4de1179108c1100001005a27" //Galleri Nicolai Wallner
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

  axios.post('https://api.artsy.net/api/tokens/xapp_token?client_id=4abaf180f92e4b617234&client_secret=4a7d07d8560a37d08c8683be00e3bc4a')
    .then(function(response) {
      token = response.data.token
      next()
    })
    .catch(function(error) {
      next()
    });
}

router.get('/allvenues/shows', function(req, res, next) {
  //itterate over venues
  let promiseCalls = []
  knex('venues').select('artsy_id')
    .then(function(venues) {
      for (let venue of venues) {
        // let strUrl = 'https://dl77sea-artbrowser.herokuapp.com/api/refresh/venue/' + venue.artsy_id + '/shows'
        let strUrl = 'http://localhost:5000/api/refresh/venue/' + venue.artsy_id + '/shows'
        let options = {
          method: 'GET',
          url: strUrl,
        }
        promiseCalls.push(axios(options))
      }
      //this will populate current shows (because only current shows were queried from artsy api) into database if venue has show information
      //(from which, only some will contain a name from which an artist is found)
      return Promise.all(promiseCalls)
    })
    .then(function(results) {
      //does not return anything here.. only purpose of this promise all was to populate database
      res.send("allvenues/shows Promise.all completed")
    })
    .catch(function(error) {
      res.send(false)
    })
})


router.get('/allvenues/artists', function(req, res, next) {
  console.log("entered /allvenues/artists")
  let promiseCalls = []
  knex('shows').select('artsy_id')
    .then(function(shows) {
      for (let show of shows) {
        // let strUrl = 'https://dl77sea-artbrowser.herokuapp.com/api/refresh/show/' + show.artsy_id + '/artists'
        let strUrl = 'http://localhost:5000/api/refresh/show/' + show.artsy_id + '/artists'
        let options = {
          method: 'GET',
          url: strUrl
        }
        promiseCalls.push(axios(options))
      }
      return Promise.all(promiseCalls)
    })
    .then(function(results) {
      console.log("/allvenues/artists success")
      res.send("allvenues/artists Promise.all completed")
    })
    .catch(function(error) {
      console.log("/allvenues/artists fail")
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
      let venues = []
      for (response of responses) {
        let venue = {
          artsy_id: response.data.id,
          name: response.data.name,
          cities_id: cities[cityId].knex_id
        }
        //add each venue regardless wheather it has show information or not
        venues.push(venue)
        knex('venues')
          .insert({
            artsy_id: response.data.id,
            name: response.data.name,
            cities_id: cities[cityId].knex_id
          }, '*')
          .then((result) => {
            console.log("/city/:id/venues insert success")
          })
          .catch((error) => {
            console.log("/city/:id/venues insert fail")
          })
      }
      res.send(venues)
    })
    .catch((error) => {
      //note: does not enter just because one of the inserts fails above
      console.log("/city/:id/venues promise all fail")
    })
})

router.get('/venue/:id/shows', authenticate, function(req, res, next) {
  let partner = req.params.id
  //https://api.artsy.net/api/shows?partner_id=
  //var strArtsyApiBaseUrl = "https://api.artsy.net/api/";
  //https://api.artsy.net/api/shows?partner_id=52b78578139b2159b5000adf&status=running
  let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partner + "&status=running"
  let options = {
    method: 'GET',
    url: strUrl,
    headers: {
      'X-Xapp-Token': token
    }
  }

  axios(options)
    .then(function(response) {
      if (response.data._embedded.shows.length > 0) {
        let shows = [];
        for (show of response.data._embedded.shows) {
          let newShow = {
            venue_artsy_id: partner,
            artsy_id: show.id,
            name: show.name,
            description: show.description,
            press_release: show.press_release,
            from: show.start_at,
            to: show.end_at
          }
          //push show if it has show information
          shows.push(newShow)
        }
        //and insert them all into db
        return knex.insert(shows).into('shows')
      } else {
        return
      }
    })
    .then(function(result) {
      console.log("/venue/:id/shows success")
      res.send(true)
    })
    .catch(function(error) {
      console.log("/venue/:id/shows fail")
      res.send(false)
    })
})

/*
test some stuff
replace with paste

router.get('/show/:id/artists', authenticate, function(req, res, next) {
  var bArtistsFound = false;
  let showId = req.params.id
  knex('showfs').where('artsy_id', showId)
    .then(function(result) {
      console.log(result)
    })
    .catch(function(err) {
      console.log("blarf")
    })
  })
*/
//inserts an artist(s) into artists table by artsy show id
router.get('/show/:id/artists', authenticate, function(req, res, next) {
  let showId = req.params.id
  knex('shows').where('artsy_id', showId)
    .then(function(result) {

      let show = result[0]

      //if show has a name, check it for artists
      if (show.name !== null) {
        let possibleNames = extractPossibleNames(show.name)
        let axiosCalls = getGqsCalls(possibleNames)
        //Google Query Search for possible artists from possible names
        //and insert the possible artists into artists table
        let artists = [];
        //process the batch of results from GQS for each possible name
        console.log("right before promise")
        Promise.all(axiosCalls)
          .then(function(gqsResults) {
            console.log("right after promise")
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
            Promise.all(axiosCalls)
              .then(function(responses) {
                for (let i = 0; i < responses.length; i++) {
                  let arrImgUrls = getImgUrls(responses[i])
                  artists[i].image_urls.images.push(arrImgUrls)
                  console.log("name: ", artists[i].name)
                }
                console.log("how many times does this happen")

                knex.insert(artists).into('artists').returning('*')
                  .then(function(arrArtistObjs) {
                    console.log("/show/:id/artists insert success")
                    res.send(arrArtistObjs)
                  })
                  .catch(function(error) {
                    console.log("/show/:id/artists insert fail", error)
                    res.send(false)
                  })
              })
              .catch(function(error) {
                console.log("/show/:id/artists GIS promise all fail")
                res.send(false)
              })
          })
          .catch(function(error) {
            console.log("/show/:id/artists GQS promise all fail")
            res.send(false)
          })
      } else {
        console.log("/show/:id/artists show did not have a name")
        res.send(false)
      }
    })
    .catch(function(error) {
      console.log("/show/:id/artists knex where selection fail")
      res.send(error)
    })
})




//check xml results from GQS for artist hits
function checkForArtists(possibleNames, gqsResults) {
  numPossibleNames = possibleNames.length
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

      axiosCalls.push(axios(options))
    }
  }
  return axiosCalls
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

//get google image search source
function getImgUrls(response) {
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
  return arrImageUrls;

}


module.exports = router
