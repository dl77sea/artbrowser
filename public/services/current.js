angular
  .module('app')

  .service('currentService', currentService)

currentService.$inject = ['retrieveService'];

function currentService(retrieveService) {


  vm = this;
  this.venues = [];



  this.cityId = 1 //"sea" default
  // this.cityId = 4 //"cph"
  this.relevanceMode = true;
  // setVenues(venues) = function(venues) {
  //   this.venues = venues;
  //   // $scope.$broadcast('venuesListener', this.venues);
  // }

  this.reRenderVenues = function() {
    let cityId = vm.cityId
    retrieveService.getVenues(cityId)
      .then(function(venuesResponse) {
        venues = venuesResponse.data;
        return
      })
      .then(function() {
        return retrieveService.getShows(cityId)
      })
      .then(function(responseShows) {
        let venuesWithShows = []
        for(let i=0; i < responseShows.length; i++) {
          // console.log(show.data)
          if(responseShows[i].data.length > 0) {
            venuesWithShows.push(venues[i])
          }
        }
        // vm.venues = venuesWithShows
        // console.log("venuesWithShows: ", venuesWithShows)
        vm.venues = venuesWithShows;
        console.log("from info-venue: ", vm.venues)
      })
      .catch(function(error) {
        console.log("error retrieving venues by city: ", error)
      })
  }




}
