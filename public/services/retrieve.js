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
          if(responseShows[i].data.length > 0) {
            venuesWithShows.push(venues[i])
          }
        }
        currentService.venues = venuesWithShows;
        $window.scrollTo(0,0)
      })
      .catch(function(error) {
        console.log("error retrieving venues by city: ", error)
      })
  }


  this.getVenues = function(cityId) {
    return $http.get('/api/retrieve/city/' + cityId + '/venues')
  }

  this.getShows = function(cityId) {
    return $http.get('/api/retrieve/city/' + cityId + '/venues')
      .then(function(venuesResponse) {

        promiseCalls = []
        for (venue of venuesResponse.data) {
          promiseCalls.push($http.post('/api/retrieve/venue/' + venue.artsy_id + '/shows', {relevance: currentService.relevanceMode}))
        }
        venuesWithShows = []
        return Promise.all(promiseCalls)
      })
  }

  this.getVenue = function(venueId) {
    return $http.get('/api/retrieve/venue/' + cityId + '/venues')
      .then(function(venuesResponse) {
        console.log("venuesResponse: ", venuesResponse.data)
        promiseCalls = []
        for (let venue of venuesResponse.data) {
          console.log(venue.artsy_id)
          promiseCalls.push($http.post('/api/retrieve/venue/' + venue.artsy_id + '/shows', {relevance: currentService.relevanceMode}))
        }
        venuesWithShows = []
        return Promise.all(promiseCalls)
      })
  }

  this.getShowsByVenue = function(venueId) {
    return $http.post('/api/retrieve/venue/' + venueId + '/shows', {relevance: currentService.relevanceMode})
      .then(function(responseShows) {
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
