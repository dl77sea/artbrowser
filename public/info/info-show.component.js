(function() {
  angular.module('app')
    .component('infoShow', {
      controller: controller,
      templateUrl: './info/info-show.template.html',
      bindings: {venueName: '='}
    })

  controller.$inject = ['$state', '$http', 'retrieveService'];

  function controller($state, $http, retrieveService) {
    const vm = this

    vm.$onInit = function() {
      //instigate populating shows for curret venue, to trigger repeat per show
      // retrieveService.get
      vm.shows = [{name: "show1"},{name: "show2"}]
    }
  }
}());
