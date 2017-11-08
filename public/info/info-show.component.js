(function() {
  angular.module('app')
    .component('infoShow', {
      controller: controller,
      templateUrl: './info/info-show.template.html',
      bindings: {venueArtsyId: '='}
    })

  controller.$inject = ['$state', '$http', 'retrieveService'];

  function controller($state, $http, retrieveService) {
    const vm = this
    // vm.shows = [];

    vm.$onInit = function() {
      //instigate populating shows for curret venue, to trigger repeat per show
      // retrieveService.get


      // vm.shows = [{name: "show1"},{name: "show2"}]

      //use venue artsy id (recieved via binding from parent component) to get populate shows
      retrieveService.getShowsByVenue(vm.venueArtsyId)
        .then(function(response) {
          let shows = [];
          for(show of response) {
            shows.push({name: show.shows_name, artsy_id: show.artsy_id})
          }
          vm.shows = shows;
        })

    }


  }
}());
