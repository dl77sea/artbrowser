(function() {
  angular.module('app')
    .component('navigation', {
      controller: controller,
      templateUrl: './navigation/navigation.template.html'
      // bindings: {venues: '='} //see if this works
    })



  controller.$inject = ['$state', '$http', 'retrieveService', 'currentService', '$scope', '$location', '$anchorScroll'];
  // app.controller("first", function($scope, sharedScope) {
  //     $scope.data1 = sharedScope.data;
  // });

  function controller($state, $http, retrieveService, currentService, $scope, $location, $anchorScroll) {
    const vm = this
    vm.currentService = currentService;
    vm.buttonTriangle = '&#x25E2;'
    // vm.venues = [];
    // vm.cities = [];

    vm.$onInit = function() {
      let venues;
      moment().format();
      let testven = "blarffy"
      let cityId = currentService.cityId

      retrieveService.getCities()
        .then(function(cities) {
          console.log("cities from navigation: ", cities)
          for(city of cities.data) {
            console.log ("****", city);

            if(currentService.cityId === city.id) {currentService.cityName = city.name}
          }
          currentService.cities = cities.data
          console.log("$$$", currentService.cityName)
        })

      retrieveService.reRenderVenues()

    }

    vm.clickCityItem = function(id, name) {
      console.log(id)
      currentService.cityId = id
      currentService.cityName = name
      retrieveService.reRenderVenues()
    }

    vm.clickVenueItem = function(id) {
      console.log(id)
      console.log("$http: ", $http)
      console.log("$location: ", $location)
      //use id to trigger scroll to
      // var scrollToHash = 'venue' + id;
      $location.hash('venue' + id);
      // $location.hash();
      $anchorScroll();
    }

    vm.clickRelevanceMode = function() {
      currentService.relevanceMode = !currentService.relevanceMode
      retrieveService.reRenderVenues()
    }

  }

}());
