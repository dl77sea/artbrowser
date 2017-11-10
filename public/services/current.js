angular
  .module('app')

  .service('currentService', currentService)

// currentService.$inject = [];

function currentService() {
  vm = this;
  this.venues = [];

  this.cityId = 1 //"sea" default
  // this.cityId = 4 //"cph"

  this.relevanceMode = true;
}
