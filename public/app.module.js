(function() {
  'use strict'
  angular.module('app', ['ui.router'])
  .run(['$anchorScroll', function($anchorScroll) {
    $anchorScroll.yOffset = 250;   // always scroll by 50 extra pixels
  }])
}());
