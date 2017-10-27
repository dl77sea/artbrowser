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

      $http.get('/api/refresh')
        .then(function(response) {
          console.log("response from nav: ", response)
          //sort responses for menu
          let venuesWithPossibleArtists = []
          let venuesWithOutPossibleArtists = []



        })
        .catch(function(error) {
          console.log("error: ", errror)
        })

    }
  }

}());
