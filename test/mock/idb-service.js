'use strict';

angular.module('idbServiceMocks', [])
  .factory('idbMock', function($window) {
    $window.indexedDB = {
      webkitGetDatabaseNames: function() { return {}; },
      deleteDatabase: function() { return {}; }
    };
    return $window;
  });
