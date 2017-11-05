(function() {
  'use strict'

  angular.module('app').config(config)
    //.service('authService', authService)

  config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider']

  function config($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true)

    $stateProvider
      .state({
        name: 'navigation',
        abstract: true,
        component: 'navigation'
      })
      .state({
        name: 'info',
        url: '/',
        parent: 'navigation',
        component: 'infoVenue'
      })
      // .state({
      //   name: 'admin',
      //   url: '/admin',
      //   parent: 'nav',
      //   component: 'admin'
      // })
  }

}());
