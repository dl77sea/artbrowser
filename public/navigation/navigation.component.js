(function() {
  angular.module('app')
    .component('navigation', {
      controller: controller,
      templateUrl: './navigation/navigation.template.html'
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this

    vm.$onInit = function() {
      let getCityId = "sea"

      $http.get('/api/refresh/venues/' + getCityId)
        .then(function(response) {
          let venues = response
          return venues
        })
        .then(function(venues) {
          console.log("venues blarf: ", venues.data)
          // let submitVenues = "{ venues: "blarf" }"
          $http.post('/api/refresh/shows', {venues: venues.data})
            .then(function(responseFromShows) {
              console.log("response from nav get shows: ", responseFromShows)
            })
        })
        .catch(function(error) {
          console.log("error: ", errror)
        })

    }
  }

}());
