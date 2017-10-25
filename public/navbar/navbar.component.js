(function() {
  angular.module('app')
    .component('navbar', {
      controller: controller,
      templateUrl: './navbar/navbar.template.html'
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this

    vm.$onInit = function() {

    }
  }

}());
