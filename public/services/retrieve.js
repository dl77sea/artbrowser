angular
  .module('app')
  .service('retrieveService', retrieveService)

retrieveService.$inject = ['$http', 'currentService', '$window']; //how to get currentService in here so can pull in currentService.relevanceMode ?

function retrieveService($http, currentService, $window) {

  this.reRenderVenues = function() {

    let cityId = currentService.cityId
    const self = this
    this.getVenues(cityId)
      .then(function(venuesResponse) {
        venues = venuesResponse.data;
        return self.getShows(cityId)
      })
      .then(function(responseShows) {
        let venuesWithShows = []
        for(let i=0; i < responseShows.length; i++) {
          // console.log(show.data)
          if(responseShows[i].data.length > 0) {
            venuesWithShows.push(venues[i])
          }
        }
        currentService.venues = venuesWithShows;
        console.log("from info-venue: currentService.venues: ", currentService.venues)
        // $location.hash('venue' + id);
        // $location.hash();
        // $anchorScroll();
        console.log("pageYoffset")
        $window.scrollTo(0,0)
      })
      .catch(function(error) {
        console.log("error retrieving venues by city: ", error)
      })
  }


  this.getVenues = function(cityId) {
    return $http.get('/api/retrieve/city/' + cityId + '/venues')
    // .then(function(venuesResponse) {
    //   return venuesReponse
    // })
  }

  this.getShows = function(cityId) {
    console.log("entered getShows")
    // console.log(cityId)
    // return "snarfffff"
    return $http.get('/api/retrieve/city/' + cityId + '/venues')
      .then(function(venuesResponse) {

        console.log("venuesResponse: ", venuesResponse.data)
        //sample return item from res.send array:
        // {artsy_id: "53d26e7b776f723ccc140100", name: "Mariane Ibrahim Gallery", cities_id: 1}
        // build list of venues with at least one show to populate menu with
        promiseCalls = []
        for (venue of venuesResponse.data) {
          console.log(venue.artsy_id)
          promiseCalls.push($http.post('/api/retrieve/venue/' + venue.artsy_id + '/shows', {relevance: currentService.relevanceMode}))
        }
        venuesWithShows = []
        console.log('return from getShows happening')
        return Promise.all(promiseCalls)
      })
  }

  this.getVenue = function(venueId) {
    return $http.get('/api/retrieve/venue/' + cityId + '/venues')
      .then(function(venuesResponse) {
        // venuesResponse = vr;
        console.log("venuesResponse: ", venuesResponse.data)
        // sample return item from res.send array:
        // {artsy_id: "53d26e7b776f723ccc140100", name: "Mariane Ibrahim Gallery", cities_id: 1}
        // build list of venues with at least one show to populate menu with
        promiseCalls = []
        for (let venue of venuesResponse.data) {
          console.log(venue.artsy_id)
          promiseCalls.push($http.post('/api/retrieve/venue/' + venue.artsy_id + '/shows', {relevance: currentService.relevanceMode}))
        }
        venuesWithShows = []
        return Promise.all(promiseCalls) //figure out how this return gets into following .then
        // Promise.all resolves into a promise? promises resolve to promises? why is this so confusing
      })
  }

  this.getShowsByVenue = function(venueId) {
    return $http.post('/api/retrieve/venue/' + venueId + '/shows', {relevance: currentService.relevanceMode})
      .then(function(responseShows) {
        console.log("**************responseShows DATA*****************", responseShows)
        return responseShows.data
      })
  }

  // this.getArtistsWithShowsByCity = function(CityId) {
  //     return $http.get('/api/retrieve/'+cityId+'/artists')
  //       .then(function(responseArtists) {
  //         return responseArtists.data
  //       })
  // }

  this.getArtistsByShow = function(showId) {
    console.log("check getArtistsByShow gets called venuId: ", showId)
    return $http.post('/api/retrieve/show/' + showId + '/artists', {relevance: currentService.relevanceMode})
      .then(function(responseArtists) {
        console.log("this happened from getArtistsByShow: ", responseArtists)
        return responseArtists.data
      })
  }

  this.getCities = function() {
    return $http.get('/api/retrieve/cities')
      .then(function(responseCities) {
        console.log(" responseCities ", responseCities)
        return responseCities
      })
  }

  this.patchRelevance = function(artistName, artistRelevance) {
    console.log("entered patchRelevance: ", artistName, artistRelevance)
    bodyObj = { name: artistName, relevant: !artistRelevance }
    return $http.patch('/api/retrieve/artist/relevance', bodyObj)
  }

}
