angular
  .module('app')

  .service('currentService', currentService)

// currentService.$inject = [];

function currentService() {
  vm = this;
  this.venues = [];
  this.shows = [];
  this.artists = [];


  this.cityId = 1 //"sea" default
  // this.cityId = 4 //"cph"

  this.relevanceMode = true;

  this.removeArtist = function(index){
    console.log(index)
    this.artists.splice(index,1);
    console.log(this.artists);
  }
}
