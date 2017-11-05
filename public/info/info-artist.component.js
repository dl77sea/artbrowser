(function() {
  angular.module('app')
    .component('infoArtist', {
      controller: controller,
      templateUrl: './info/info-artist.template.html',
      bindings: {showName: '='}
    })

  controller.$inject = ['$state', '$http'];

  function controller($state, $http) {
    const vm = this
    vm.artists = [{name: "artist1"},{name: "artist2"}]
    vm.$onInit = function() {

    }
  }
}());
