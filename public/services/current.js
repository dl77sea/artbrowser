angular
  .module('app')

  .service('currentService', currentService)

function currentService() {
  vm = this;
  this.cities = [];
  this.venues = [];
  this.shows = [];
  this.artists = [];


  this.cityId = 1 //"sea" default
  this.cityName = "";
  this.venueName = "Gallery"

  this.relevanceMode = true;

}
