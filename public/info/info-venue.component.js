(function() {
  angular.module('app')
    .component('infoVenue', {
      controller: controller,
      templateUrl: './info/info-venue.template.html',
      bindings: {venuesNavigation: '='}
    })

  controller.$inject = ['$state', '$http', 'retrieveService'];

  function controller($state, $http, retrieveService) {
    const vm = this

    vm.$onInit = function() {
      //instigate populating venues to trigger repeat per venue
      //(figure out how to populate this with a binding from navigation component instead.. maybe from currentService?)
      // console.log("********",venues)
      vm.venues = [{name: "venue1"},{name: "venue2"}]
    }
  }
}());
