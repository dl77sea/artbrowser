angular
  .module('app')
  .service('retrieveService', retrieveService)

retrieveService.$inject = ['$http'];

function retrieveService($http) {

  this.getVenues = function(cityId) {

    return $http.get('/api/retrieve/city/' + cityId + '/venues')
    // .then(function(venuesResponse) {
    //   return venuesReponse
    // })
  }

  this.getShows = function(cityId) {
    // console.log(cityId)
    // return "snarfffff"
    return $http.get('/api/retrieve/city/' + cityId + '/venues')
      .then(function(vr) {
        venuesResponse = vr;
        console.log("venuesResponse: ", venuesResponse.data)
        //sample return item from res.send array:
        // {artsy_id: "53d26e7b776f723ccc140100", name: "Mariane Ibrahim Gallery", cities_id: 1}
        // build list of venues with at least one show to populate menu with
        promiseCalls = []
        for (venue of venuesResponse.data) {
          console.log(venue.artsy_id)
          promiseCalls.push($http.get('/api/retrieve/venue/' + venue.artsy_id + '/shows'))
        }
        venuesWithShows = []
        return Promise.all(promiseCalls) //figure out how this return gets into following .then
        // Promise.all resolves into a promise? promises resolve to promises? why is this so confusing
      })
  }

}
