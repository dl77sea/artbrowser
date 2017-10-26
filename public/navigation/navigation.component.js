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

      $http.get('/api/artsy')
        .then(function(response) {
          console.log("response from nav: ", response)
        })
        .catch(function(error) {
          console.log("error: ", errror)
        })

    }
  }

}());
