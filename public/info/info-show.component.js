(function() {
  angular.module('app')
    .component('infoShow', {
      controller: controller,
      templateUrl: './info/info-show.template.html',
      bindings: {venueName: '='}
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this
    vm.shows = [{name: "show1"},{name: "show2"}]
    vm.$onInit = function() {

    }
  }
}());
