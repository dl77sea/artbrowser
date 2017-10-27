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

      // let showNamePsblNames = extractPossibleNames(shows.name)
      // let showDescPsblNames = extractPossibleNames(shows.description)
      // let showPresPsblNames = extractPossibleNames(shows.press_release)

      //get likely artist names showing in this show.
      //the thinking here is, the most concise list of possible artist names showing in the show,
      //are likely to turn up in the show name first, followed by the show description,
      //followed by the press release. So return from finding likely names on first hit(s)
      //from any of those sources, in that order.

      //for each type of artist from filter-in key words, do a google query search

      //todo: load these from db
      // let strCorsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";
      // let strGoogleQueryBaseUrl = "http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=";
      //
      // var regexAutoCompleteQueryArtist = new RegExp(/\bartist\b/, 'g'); //new RegExp(/\bartist\b|\bart\b/, 'g');
      // var regexAutoCompleteQueryPhotographer = new RegExp(/\bphotographer\b|\bphotos\b|\bphotography\b/, 'g');
      // var artistTypesToCheckFor = ["+p", "+a"];
      // var artistTypeRegExps = [regexAutoCompleteQueryPhotographer, regexAutoCompleteQueryArtist];
      //
      // let axiosCalls = []
      //
      // let strName;
      // for (let i = 0; i < showNamePsblNames.length; i++) {
      //   strNme = showNamePsblNames[i]
      //   for (let j = 0; j < artistTypesToCheckFor.length; j++) {
      //     let strUrl = strCorsAnywhereUrl + strGoogleQueryBaseUrl + strName.replace(" ", "+") + artistTypesToCheckFor[i];
      //     let options = {
      //       method: 'GET',
      //       url: strUrl
      //       // headers: {
      //       //   'X-Xapp-Token': token
      //       // }
      //     }
      //     axiosCalls.push(axios(options))
      //   }
      // }
      // Promise.all(axiosCalls).then(function(responses) {
      //
      // })

      // }) //end query for artist types
      res.send(shows)
    })
    .catch(function(error) {
      console.log("error: ", error)
    })
})
//
// function extractPossibleNames(str) {
//   possibleNames = [];
//   //this will look for person names that are two capitalized contigious strings
//   //(can be improved with looking for Middle initials, middle names, nobliary particles)
//   let nameRegExp = new RegExp(/[A-Z][\w-]*\s[A-Z][\w-]*/, 'g');
//
//   let possibleName = null;
//   while ((possibleName = nameRegExp.exec(str)) !== null) {
//     if (possibleNames.includes(possibleName[0]) === false) {
//       possibleNames.push(possibleName[0]);
//     }
//   }
//   return possibleNames;
// }


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
