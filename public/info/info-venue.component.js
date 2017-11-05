(function() {
  angular.module('app')
    .component('infoVenue', {
      controller: controller,
      templateUrl: './info/info-venue.template.html'
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this
    vm.venues = [{name: "venue1"},{name: "venue2"}]
    vm.$onInit = function() {

    }
  }
}());
