'use strict';

angular.module('chromeStorageAPIMocks', [])
  .value('$window', {
    chrome: {
      storage: {
        local: {
          set: function() { },
          get: function() { },
          remove: function() { },
          clear: function() { }
        }
      }
    },
    addEventListener: function () {
    }
  });
