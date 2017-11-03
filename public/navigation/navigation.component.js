(function() {
  angular.module('app')
    .component('navigation', {
      controller: controller,
      templateUrl: './navigation/navigation.template.html'
    })


  controller.$inject = ['$state', '$http', 'retrieveService', 'currentService'];

  function controller($state, $http, retrieveService) {
    const vm = this
    vm.venues = [];


    vm.$onInit = function() {
      let venues;
      let cityId = "sea"

      //return venues by city from venues table

      retrieveService.getVenues(cityId)
        .then(function(venuesResponse) {
          console.log(venuesResponse)
          // vm.venues = venuesReponse
          venues = venuesResponse.data;
          return
        })
        .then(function() {
          // console.log(venuesResponse)
          //for each venue check for shows and push the venues name to vm.venues for ng-repeat
          return retrieveService.getShows(cityId)
        })
        .then(function(responseShows) {
          let venuesWithShows = []
          console.log(responseShows)
          console.log("this should be populated: ", venues)
          for(let i=0; i < responseShows.length; i++) {
            // console.log(show.data)
            if(responseShows[i].data.length > 0) {
              venuesWithShows.push(venues[i])
            }
          }
          console.log(venuesWithShows)
          currentService.venues = venuesWithShows
          vm.venues = currentService.venues
        })



        // .then(function(showsResponses) {
        //
        //
        //   for(let showsResponse of showsResponses) {
        //     // console.log("snarf: ", showsResponses)
        //     if (showsResponse.data.length > 0) {
        //       console.log("has shows: ", showsResponse.data)
        //       // for(let show of showsResponse.data) {
        //       //   venuesWithShows.push(show)
        //       // }
        //       venuesWithShows.push()
        //     }
        //   }
        //
        //   // for (let i = 0; i < venuesResponse.length; i++) {
        //   //   if (showsResponses[i].length > 0) {
        //   //     venuesWithShows.push(venuesResponse[i])
        //   //   }
        //   // }
        //
        //   //populate dropdown with venues
        //   vm.venues = venuesWithShows
        //   console.log("venuesWithShows: ", venuesWithShows)
        //   // console.log("this is vm.venues: ", vm.venues)
        //   // return vm.venues
        //
        //   //check venues with shows for found artists (for now, only display those options)
        //
        //   vm.venues = venuesWithShows
        //
        // })
        .catch(function(error) {
          console.log("error retrieving venues by city: ", error)
        })

      // vm.venues=[{name: "snarf1"},{name: "snarf2"}]
    }

    // vm.setVenuesDropDown = function (arrVenues) {
    //   console.log("vm.venues1: ", vm.venues)
    //   console.log("arrVenues: ", arrVenues)
    //   vm.venues=arrVenues
    //   console.log("vm.venues2: ", vm.venues)
    // }

    vm.retrieveShowsByVenue = function(id) {
      console.log(id)
      let arrShows = []
      // get shows for selected venue
      $http.get('/api/retrieve/venue/' + id + '/shows')
        .then(function(response) {
          console.log(response.data)
          let shows = response.data

          for (let show of shows) {

          }

        })
        .catch(function(error) {
          console.log(error)
        })
    }

  }

}());
