angular
  .module('app')
  .factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = { text: "init text from factory" };
    scope.data = { venues: [] };

    return scope;
  });
