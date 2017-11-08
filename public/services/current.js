angular
  .module('app')
  .service('currentService', currentService)

// currentService.$inject = ['$scope'];

function currentService() {
  this.venues;
  // this.cityId = 1 //"sea" default
  this.cityId = 4 //"cph"

  // setVenues(venues) = function(venues) {
  //   this.venues = venues;
  //   // $scope.$broadcast('venuesListener', this.venues);
  // }

}
