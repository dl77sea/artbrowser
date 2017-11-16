(function() {
  angular.module('app')
    .component('infoShow', {
      controller: controller,
      templateUrl: './info/info-show.template.html',
      bindings: {
        venueArtsyId: '=',
        removeVenue: '&'
      }
    })

  controller.$inject = ['$state', '$http', 'retrieveService'];

  function controller($state, $http, retrieveService) {
    const vm = this


    vm.$onInit = function() {
      //instigate populating shows for curret venue, to trigger repeat per show
      //use venue artsy id (recieved via binding from parent component) to get populate shows
      retrieveService.getShowsByVenue(vm.venueArtsyId)
        .then(function(response) {
          let shows = [];
          for (show of response) {
            shows.push({
              name: show.name,
              artsy_id: show.show_artsy_id,
              from: show.from,
              to: show.to,
              description: show.description,
              press_release: show.press_release
            })
          }

          vm.shows = shows;
          vm.dateFrom = moment(vm.shows[0].from)
          vm.dateTo = moment(vm.shows[0].to)
        })

        vm.getShowIndex = function(artsyShowId) {
          for(let i=0; i < vm.shows.length; i++) {
            if (vm.shows[i].artsy_id === artsyShowId) {
              return i
            }
          }
        }



        vm.removeShow = function(showArtsyId){
          //get index of this show
          let iShow = vm.getShowIndex(showArtsyId)
          vm.shows.splice(iShow, 1)

          //and remove venue also if no more shows left
          if(vm.shows.length === 0) {
            vm.removeVenue({venueArtsyId: vm.venueArtsyId});
          }
        }


    }


  }
}());
