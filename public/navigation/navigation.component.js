(function() {
  angular.module('app')
    .component('navigation', {
      controller: controller,
      templateUrl: './navigation/navigation.template.html'
      // bindings: {venues: '='} //see if this works
    })


  controller.$inject = ['$state', '$http', 'retrieveService', 'currentService', '$scope'];

  function controller($state, $http, retrieveService, currentService, $scope) {
    const vm = this
    vm.venues = [];

    vm.$onInit = function() {
      let venues;
      let testven = "blarffy"
      let cityId = currentService.cityId

      //return venues with shows by city from venues table
      retrieveService.getVenues(cityId)
        .then(function(venuesResponse) {
          console.log(venuesResponse)
          venues = venuesResponse.data;
          return
        })
        .then(function() {
          console.log("entered getVenues then")
          return retrieveService.getShows(cityId)
        })
        .then(function(responseShows) {
          let venuesWithShows = []
          console.log("blarffff")
          console.log("responseShows from retrieveService.getShows: ", responseShows)
          console.log("this should be populated: ", venues)
          for(let i=0; i < responseShows.length; i++) {
            // console.log(show.data)
            if(responseShows[i].data.length > 0) {
              venuesWithShows.push(venues[i])
            }
          }
          console.log(venuesWithShows)
          currentService.venues = venuesWithShows
          vm.venues = currentService.venues
        })
        .catch(function(error) {
          console.log("error retrieving venues by city: ", error)
        })
    }

    // vm.clickVenueItem = function(id) {
    //   $http.get('/api/retrieve/venue/'+id)
    //     .then()
    // }

    //scroll to selected venue
    vm.clickVenueItem = function(id) {
      console.log(id)
      // let arrShows = []
      // // get shows for selected venue
      // $http.get('/api/retrieve/venue/' + id + '/shows')
      //   .then(function(response) {
      //     console.log(response.data)
      //     let shows = response.data
      //
      //     for (let show of shows) {
      //
      //     }
      //
      //   })
      //   .catch(function(error) {
      //     console.log(error)
      //   })
    }


  }

}());
