(function() {
  angular.module('app')
    .component('infoVenue', {
      controller: controller,
      templateUrl: './info/info-venue.template.html',
      bindings: {venuesNavigation: '='}
    })

  controller.$inject = ['$state', '$http', 'retrieveService', 'currentService'];

  function controller($state, $http, retrieveService, currentService) {
    const vm = this
    vm.currentService = currentService;

    vm.$onInit = function() {
      // let cityId = currentService.cityId
      //replace tcurrhis with access to vm.venues from navigation component
      //return venues with shows by city from venues table
      //use artsy_id of venue to start info nested view chain
      // retrieveService.reRenderVenues()
      // vm.venues = currentService.venues
      console.log('IN VENUES component', vm.venues);
    }

    vm.removeVenue = function(venueArtsyId) {
      console.log("this venue: ", currentService.venues)
      console.log("this venue venue artsy_id: ", venueArtsyId)

      let thisVenueIndex = vm.getVenueIndex(venueArtsyId)
      console.log("index of this venue in venues: ", thisVenueIndex )
      currentService.venues.splice(thisVenueIndex, 1)

    }

    vm.getVenueIndex = function(venueArtsyId) {
      for(let i=0; i < currentService.venues.length; i++) {
        if (currentService.venues[i].artsy_id === venueArtsyId) {
          return i
        }
      }
    }

  }
}());
