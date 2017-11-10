(function() {
  angular.module('app')
    .component('infoArtist', {
      controller: controller,
      templateUrl: './info/info-artist.template.html',
      bindings: {
        showArtsyId: '='
      }
    })

  controller.$inject = ['$state', '$http', 'retrieveService', 'currentService'];

  function controller($state, $http, retrieveService, currentService) {
    const vm = this
    vm.currentService = currentService;

    console.log("@@@@@@",currentService.relevanceMode)

    vm.relevanceMode = currentService.relevanceMode

    vm.$onInit = function() {
      console.log("from info-artist showArtsyId: ", vm.showArtsyId)
      //instigate populating artists for curret show, to trigger repeat per show
      // vm.artists = [{name: "artist1"},{name: "artist2"}]

      //use show artsy id (recieved via binding from parent component) to populate artists
      retrieveService.getArtistsByShow(vm.showArtsyId)
        .then(function(response) {

          let artists = [];
          if (response.length > 0) {
            for (artist of response) {
              // console.log("artist of response: ", artist.image_urls.images)
              artists.push({
                name: artist.name,
                image_urls: artist.image_urls.images,
                relevant: artist.relevant
                // image_urls: artist.image_urls
              })
            }
          }
          // console.log("response from getShowsByVenue from show-info: ", shows)
          vm.artists = artists;
          for (let artist of vm.artists) {
            console.log("artist name: ", artist.name)
            console.log("artist images: ")
            for (let image_url of artist.image_urls) {
              console.log("--: ", image_url)
            }
          }
        })
    }

    vm.clickRelevance = function(artistName, artistRelevance, i) {
      console.log("entered clickRelevance")
      retrieveService.patchRelevance(artistName, artistRelevance)
      .then(function (result) {
        console.log("result from retrieveService.patchRelevance: ", result)
        vm.artists[i].relevant = result.data[0].relevant
        retrieveService.reRenderVenues()
      })
    }

  }
}());
