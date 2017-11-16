(function() {
  'use strict'
  angular.module('app', ['ui.router'])
  .run(['$anchorScroll', function($anchorScroll) {
    $anchorScroll.yOffset = 100;  
  }])
}());
