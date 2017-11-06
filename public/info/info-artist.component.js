(function() {
  angular.module('app')
    .component('infoArtist', {
      controller: controller,
      templateUrl: './info/info-artist.template.html',
      bindings: {
        showArtsyId: '='
      }
    })

  controller.$inject = ['$state', '$http', 'retrieveService'];

  function controller($state, $http, retrieveService) {
    const vm = this

    vm.$onInit = function() {
      console.log("from info-artist showArtsyId: ", vm.showArtsyId)
      //instigate populating artists for curret show, to trigger repeat per show
      // vm.artists = [{name: "artist1"},{name: "artist2"}]

      //use show artsy id (recieved via binding from parent component) to populate artists
      retrieveService.getArtistsByShow(vm.showArtsyId)
        .then(function(response) {
          console.log("***", response)
          let artists = [];
          if (response.length > 0) {
            for (artist of response) {
              console.log("************* ", artist.name)
              artists.push({
                name: artist.name
              })
            }
          }
          // console.log("response from getShowsByVenue from show-info: ", shows)
          vm.artists = artists;
        })

    }
  }
}());
