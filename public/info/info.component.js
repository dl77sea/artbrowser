(function() {
  angular.module('app')
    .component('info', {
      controller: controller,
      templateUrl: './info/info.template.html'
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this

    vm.$onInit = function() {

    }
  }
}());
