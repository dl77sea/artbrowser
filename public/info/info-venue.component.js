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

    vm.$onInit = function() {
      let cityId = currentService.cityId
      //instigate populating venues to trigger repeat per venue
      //(figure out how to populate this with a binding from navigation component instead.. maybe from currentService?)
      // console.log("********",venues)

      // $scope.$on('venuesListener', function (event, data) {
      //   console.log(data); // 'Data to send'
      // });

      // vm.venues = [{name: "venue1"},{name: "venue2"}]

      //replace this with access to vm.venues from navigation component
      //return venues with shows by city from venues table
      //use artsy_id of venue to start info nested view chain
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
          vm.venues = venuesWithShows
          console.log("from info-venue: ", venuesWithShows)
        })
        .catch(function(error) {
          console.log("error retrieving venues by city: ", error)
        })


    }
  }
}());