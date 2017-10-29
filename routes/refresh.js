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
var regexAutoCompleteQueryPhotographer = new RegExp(/\bphotographer\b|\bphotos\b|\bphotography\b/, 'g');
var artistTypesToCheckFor = ["+p", "+a"];
var artistTypeRegExps = [regexAutoCompleteQueryPhotographer, regexAutoCompleteQueryArtist];



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

//pass list of venues to get shows for in req body
// router.get('/shows', authenticate, function(req, res, next) {
//   let venues = req.body
//   console.log(req.body)
//   res.send("ok")
// })

//get venue IDs from req.body
router.post('/shows', authenticate, function(req, res, next) {
  console.log("hello from /shows")
  // console.log("/shows req.body: ", req.body)

  let venues = req.body.venues

  let axiosCalls = [];

  for (venue of venues) {
    let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + venue.id + "&status=running"
    let options = {
      method: 'GET',
      url: strUrl,
      headers: {
        'X-Xapp-Token': token
      }
    }
    console.log(strUrl)
    axiosCalls.push(axios(options))
  }
  // console.log(axiosCalls)
  Promise.all(axiosCalls).then(function(responses) {
    for (response of responses) {
      // let show = {}
      // show.venue = venue.name
      // show.from =
      // show.to =
      // show.name =
      // show.desc =
      // show.press =
      // console.log(response.data)
    }
  })

  res.send("okok")
})


router.get('/venues/:id', authenticate, function(req, res, next) {
  console.log("entered /venues")
  let cityId = req.params.id
  console.log("cityId: ", cityId)
  console.log("cities.cityId: ", cities[cityId])

  var cityName = cities[cityId].name
  let partners = cities[cityId].partners

  let axiosCalls = [];
  for (let i = 0; i < partners.length; i++) {
    let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running"
    let options = {
      method: 'GET',
      url: strUrl,
      headers: {
        'X-Xapp-Token': token
      }
    }
    axiosCalls.push(axios(options))
  }

  Promise.all(axiosCalls).then(function(responses) {
      console.log("responses.length: ", responses.length)
      let venuesWithShows = []
      for (response of responses) {
        if (response.data._embedded.shows.length > 0) {
          venuesWithShows.push(response.data._embedded.shows[0]._links.partner.href)
        }
      }

      return venuesWithShows
    })
    .then(function(venuesWithShows) {
      let axiosCalls = []
      for (venue of venuesWithShows) {
        let strUrl = venue
        let options = {
          method: 'GET',
          url: strUrl,
          headers: {
            'X-Xapp-Token': token
          }
        }
        axiosCalls.push(axios(options))
      }

      Promise.all(axiosCalls).then(function(responses) {
          // console.log(rresponses)
          // let names = []
          let venues = []
          // let venue = {}
          for (response of responses) {
            let venue = {}

            venue.id = response.data.id
            venue.name = response.data.name,
              venue.city = cityName

            venues.push(venue)
          }
          console.log("venues: ", venues)
          res.send(venues)
          // return res.json(venues)
        })
        .catch(function(err) {
          console.log("error from promise all get venue names", err)
          next()
        })
    })
    .catch(function(err) {
      console.log("error from get venues promise all: ", err)
      next();
    })
})



/*
//add venue names to shows objects
.then(function(shows) {
  let axiosCalls = [];
  for (let i = 0; i < shows.length; i++) {
    let strUrl = shows[i].venueNameHref
    let options = {
      method: 'GET',
      url: strUrl,
      headers: {
        'X-Xapp-Token': token
      }
    }
    axiosCalls.push(axios(options))
  }

venueNameHref: responses[i].data._embedded.shows[j]._links.partner.href //figure out better way to store this
*/
/*
router.get('/', authenticate, function(req, res, next) {
  console.log('entered get')
  // xhr.setRequestHeader('X-Xapp-Token', strToken);
  var axiosCalls = [];
  console.log("partners length: ", partners.length)

  for (let i = 0; i < partners.length; i++) {

    let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running"
    let options = {
      method: 'GET',
      url: strUrl,
      headers: {
        'X-Xapp-Token': token
      }
    }
    axiosCalls.push(axios(options))
  }
  // console.log("axiosCalls: ", axiosCalls)
  Promise.all(axiosCalls).then(function(responses) {
      console.log("promise.all cb")
      console.log(responses.length)
      // console.log("promise.all cb responses: ", responses)
      // console.log(responses[0].data)
      for (let i = 0; i < responses.length; i++) {
        console.log(responses[i].data._embedded.shows.length)
        if (responses[i].data._embedded.shows.length > 0) {
          for (let j = 0; j < responses[i].data._embedded.shows.length; j++) {
            shows.push({
              name: responses[i].data._embedded.shows[j].name,
              description: responses[i].data._embedded.shows[j].description,
              pressRelease: responses[i].data._embedded.shows[j].press_release,
              venueNameHref: responses[i].data._embedded.shows[j]._links.partner.href //figure out better way to store this
            })
          }
        }
      }
      return shows;
    })
    //add venue names to shows objects
    .then(function(shows) {
      let axiosCalls = [];
      for (let i = 0; i < shows.length; i++) {
        let strUrl = shows[i].venueNameHref
        let options = {
          method: 'GET',
          url: strUrl,
          headers: {
            'X-Xapp-Token': token
          }
        }
        axiosCalls.push(axios(options))
      }

      return Promise.all(axiosCalls).then(function(responses) {
        for (let i = 0; i < shows.length; i++) {
          shows[i].venueName = responses[i].data.name
          // console.log(responses[i].data.name)
        }
        // res.send(shows)
        return shows;
      })

    })
    //associate possible artists (or none) with shows
    .then(function(shows) {

      for (let i = 0; i < shows.length; i++) {
        shows[i].name_possible_names = extractPossibleNames(shows[i].name)
        shows[i].description_possible_names = extractPossibleNames(shows[i].description)
        shows[i].press_release_possible_names = extractPossibleNames(shows[i].press_release)
        console.log(shows[i].name_possible_names)
      }


      //get likely artist names showing in this show.
      //the thinking here is, the most concise list of possible artist names showing in the show,
      //are likely to turn up in the show name first, followed by the show description,
      //followed by the press release. So return from finding likely names on first hit(s)
      //from any of those sources, in that order.

      //for each type of artist from filter-in key words, do a google query search

      //todo: load these from db
      let strCorsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";
      let strGoogleQueryBaseUrl = "http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=";

      let axiosCalls = []

      for (let i = 0; i < shows.length; i++) {
        shows[i].axiosCalls = []
        for (let j = 0; j < shows[i].name_possible_names.length; j++) {
          for (let k = 0; k < artistTypesToCheckFor.length; k++) {
            if (shows[i].name_possible_names.length > 0) {
              let name = shows[i].name_possible_names[j]
              let strUrl = strGoogleQueryBaseUrl + name.replace(" ", "+") + artistTypesToCheckFor[k];
              let options = {
                method: 'GET',
                url: strUrl
              }
              console.log(strUrl)
              shows[i].axiosCalls.push(axios(options))

            }
          }
        }

      }
      res.send(shows)
      //return shows
      // showsToProcess = []
      // for (let i = 0; i < shows.length; i++) {
      //   showsToProcess.push(processShows(shows[i]))
      // }
    })
    .catch(function(error) {
      console.log("error: ", error)
      next()
    })
  // .then(function(shows) {
  //   res.send(shows)
  // })
})
*/
function processShows(show) {

}

function extractPossibleNames(str) {
  possibleNames = [];
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
//
// function checkForNames(responseObject) {
//   //console.log("entered checkForNames")
//   //check  gallery object text for names
//   var strPressReleaseAndDescriptionAndShowName = "";
//
//   if (responseObject._embedded.shows.length > 0) {
//     snarf = responseObject;
//
//     var objGallery = {};
//     //give priority to pres release textstrPressReleaseOrDescription = responseData._embedded.shows.press_description;
//
//     strPressReleaseAndDescriptionAndShowName+= responseObject._embedded.shows[0].name;
//     strPressReleaseAndDescriptionAndShowName+= " "+responseObject._embedded.shows[0].press_release;
//     strPressReleaseAndDescriptionAndShowName+= " "+responseObject._embedded.shows[0].description;
//     console.log("strPressReleaseAndDescriptionAndShowName: ", strPressReleaseAndDescriptionAndShowName)
//     objGallery.showName = responseObject._embedded.shows[0].name;
//     objGallery.showPressRelease = responseObject._embedded.shows[0].press_release;
//     objGallery.showDescription = responseObject._embedded.shows[0].description;
//
//
//     if (strPressReleaseAndDescriptionAndShowName !== "") {
//       console.log(strPressReleaseAndDescriptionAndShowName)
//       //text info was found so check it for names
//       let arrayAllNames = [];
//       arrayAllNames = extractProbableNames(strPressReleaseAndDescriptionAndShowName);
//
//       if(arrayAllNames.length > 0) {
//         //console.log(arrayAllNames)
//         //names found so..
//         checkForArtists(arrayAllNames, responseObject, objGallery)
//       } else {
//         console.log("no names found from extractProbableNames")
//       }
//     } else {
//       console.log("no name, press release or description text found")
//     }
//   } else {
//     console.log("no shows found")
//   }
// }
//



module.exports = router
