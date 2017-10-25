(function() {
  'use strict'

  angular.module('app').config(config)
    //.service('authService', authService)

  config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider']

  function config($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true)

    $stateProvider
      .state({
        name: 'nav',
        abstract: true,
        component: 'navbar'
      })
      .state({
        name: 'posts',
        url: '/',
        parent: 'nav',
        component: 'posts'
      })
      // .state({
      //   name: 'admin',
      //   url: '/admin',
      //   parent: 'nav',
      //   component: 'admin'
      // })
  }

}());
