'use strict';

angular.module('deviceInfoMocks', [])
  .value('$window', {
    cordova: {
      require: function() {}
    }
  });
