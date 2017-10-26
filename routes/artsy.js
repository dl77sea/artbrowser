const express = require('express')
const router = express.Router()
const knex = require('../knex')
const axios = require('axios')



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

var strToken;
var strArtsyApiBaseUrl = "https://api.artsy.net/api/";
var partners = partnersSEA;

var token;
var shows = [];
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

router.get('/', authenticate, function(req, res, next) {
  console.log('entered get')
  // xhr.setRequestHeader('X-Xapp-Token', strToken);
  var axiosCalls = [];
  console.log("partners length: ", partners.length)

  for (let i = 0; i < partners.length; i++) {
    console.log("hello")
    let strUrl = strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running"
    let options = {
      method: 'GET',
      url: strUrl,
      headers: {
        'X-Xapp-Token': token
      }
    }

    axiosCalls.push(axios(options))
    console.log('for loop');
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
        shows.push({
          name: responses[i].data._embedded.shows[0].name,
          description: responses[i].data._embedded.shows[0].description,
          pressRelease: responses[i].data._embedded.shows[0].press_release,
          venueNameHref: responses[i].data._embedded.shows[0]._links.partner.href //figure out better way to store this
          // venueName: getGalleryName(responseData._embedded.shows[i]._links.partner.href).then(function(response) { return response })
        })
      }
    }
    // console.log(shows)
    res.send(shows)
  })
  .catch(function(error) { console.log("error: ", error) })
})




module.exports = router
