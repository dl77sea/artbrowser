angular
  .module('app')
  .service('currentService', currentService)

// currentService.$inject = ['$scope'];

function currentService() {
  this.venues;
  this.cityId = "sea" //default

  // setVenues(venues) = function(venues) {
  //   this.venues = venues;
  //   // $scope.$broadcast('venuesListener', this.venues);
  // }

}
