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
      //replace this with access to vm.venues from navigation component
      //return venues with shows by city from venues table
      //use artsy_id of venue to start info nested view chain
      retrieveService.reRenderVenues()
      vm.venues = currentService.venues
      console.log('IN VENUES component', vm.venues);
    }


  }
}());
