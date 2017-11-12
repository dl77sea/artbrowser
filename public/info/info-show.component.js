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

    // vm.shows = [];

    vm.$onInit = function() {
      //instigate populating shows for curret venue, to trigger repeat per show
      // retrieveService.get


      // vm.shows = [{name: "show1"},{name: "show2"}]

      //use venue artsy id (recieved via binding from parent component) to get populate shows
      retrieveService.getShowsByVenue(vm.venueArtsyId)
        .then(function(response) {
          let shows = [];
          for (show of response) {
            // if(show.show_name)
            shows.push({
              name: show.name,
              artsy_id: show.show_artsy_id,
              from: show.from,
              to: show.to
            })
          }

          vm.shows = shows;
          vm.dateFrom = moment(vm.shows[0].from)
          vm.dateTo = moment(vm.shows[0].to)

          // console.log("************", (vm.shows[0].from))
          // let dateFrom = moment(vm.shows[0].from)
          // let dateFrom = moment(vm.shows[0].from)
          // console.log(dateFrom.format('dddd, MMMM Do YYYY'))
          // console.log(moment.format((vm.shows[0].from)))
        })


        vm.getShowIndex = function(artsyShowId) {
          for(let i=0; i < vm.shows.length; i++) {
            if (vm.shows[i].artsy_id === artsyShowId) {
              return i
            }
          }
        }



        vm.removeShow = function(showArtsyId){
          // console.log("removeShow from info-show numArtistsLeft: ", numArtistsLeft) //, numArtists, artsy_show_id)
          console.log("removeShow from info-show artsyShowId: ", showArtsyId) //, numArtists, artsy_show_id)
          console.log("removeShow from info-show show index: ", vm.getShowIndex(showArtsyId))

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
