(function() {
  angular.module('app')
    .component('posts', {
      controller: controller,
      templateUrl: './posts/posts.template.html'
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this

    vm.$onInit = function() {

    }
  }

}());
