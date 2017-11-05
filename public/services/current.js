angular
  .module('app')
  .service('currentService', currentService)

// retrieveService.$inject = ['$http'];

function currentService() {

  //venues with shows
  this.venues;
  // ths.currentVenue

  // this.getVenues = function(cityId) {
  //   return $http.get('/api/retrieve/city/' + cityId + '/venues')
  // }

}
