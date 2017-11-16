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

    vm.relevanceMode = currentService.relevanceMode

    vm.$onInit = function() {
      //instigate populating artists for curret show, to trigger repeat per show
      //use show artsy id (recieved via binding from parent component) to populate artists
      retrieveService.getArtistsByShow(vm.showArtsyId)
        .then(function(response) {

          let artists = [];
          if (response.length > 0) {
            for (artist of response) {
              artists.push({
                name: artist.name,
                image_urls: artist.image_urls.images,
                relevant: artist.relevant,
                artsy_show_id: artist.artsy_show_id
              })
            }
          }
          vm.artists = artists;

          for (let artist of vm.artists) {
            for (let image_url of artist.image_urls) {
            }
          }
        })

    }

    // vm.clickImg = function() {
    //   $(document).ready(function() {
    //     $('.modal').modal();
    //   });
    //   $('#modal1').modal('open');
    // }


    vm.clickRelevance = function(artistName, artistRelevance, i) {
      let artsy_show_id = vm.artists[i].artsy_show_id
      retrieveService.patchRelevance(vm.artists[i].name, vm.artists[i].relevant)
        .then(function(response) {
          vm.artists.splice(i,1);
          if(vm.artists.length === 0) {
            vm.removeShow({showArtsyId: artsy_show_id});
          }
        })

    }

  }
}());
