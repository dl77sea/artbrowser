(function() {
  angular.module('app')
    .component('infoArtist', {
      controller: controller,
      templateUrl: './info/info-artist.template.html',
      bindings: {
        showArtsyId: '=',
        removeShow: '&'
      }
    })
    // .directive('modalInit', function() {
    //   return {
    //     link: function($scope, element, attrs) {
    //       $(document).ready(function() {
    //         $('.modal').modal();
    //       });
    //     }
    //   }
    // });

  controller.$inject = ['$state', '$http', 'retrieveService', 'currentService'];

  function controller($state, $http, retrieveService, currentService) {
    const vm = this
    vm.currentService = currentService;
    vm.strDisclaim = "Images that may represent artwork by "

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
                relevant: artist.relevant,
                artsy_show_id: artist.artsy_show_id
              })
            }
          }
          // console.log("response from getShowsByVenue from show-info: ", shows)
          vm.artists = artists;

          console.log(vm.artists);
          for (let artist of vm.artists) {
            console.log("artist name: ", artist.name)
            console.log("artist images: ")
            for (let image_url of artist.image_urls) {
              console.log("--: ", image_url)
            }
          }
        })

    }

    vm.clickImg = function() {
      console.log("ok")
      $(document).ready(function() {
        $('.modal').modal();
      });
      $('#modal1').modal('open');
    }


    vm.clickRelevance = function(artistName, artistRelevance, i) {
      console.log("entered clickRelevance")
      console.log("-----------------------------------------")
      console.log("vm.artists: ", vm.artists)
      console.log("vm.showArtsyId: ", vm.showArtsyId)
      console.log("currentService.venues: ", currentService.venues)
      console.log("-----------------------------------------")

      let artsy_show_id = vm.artists[i].artsy_show_id
      console.log("----------rel---++++++++",vm.artists[i].relevant)
      console.log("-------name------++++++++", vm.artists[i].name)
      //patchRelevance = function(artistName, artistRelevance)
      retrieveService.patchRelevance(vm.artists[i].name, vm.artists[i].relevant)
        .then(function(response) {
          vm.artists.splice(i,1);
          console.log("artist got removed", vm.artists.length)
          if(vm.artists.length === 0) {
            vm.removeShow({showArtsyId: artsy_show_id});
          }
        })

      // retrieveService.
      // retrieveService.patchRelevance(artistName, artistRelevance)
      // .then(function (result) {
      //   console.log("result from retrieveService.patchRelevance: ", result)
      //   vm.artists[i].relevant = result.data[0].relevant
      //   retrieveService.reRenderVenues()
      // })
    }

  }
}());
