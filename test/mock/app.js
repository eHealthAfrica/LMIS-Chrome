'use strict';

angular.module('lmisChromeAppMocks', [])
  .value('$window', {
    chrome: {
      storage: {
        local: {
          get: function() {},
          set: function() {},
          clear: function() {},
          remove: function() {}
        }
      }
    },
    addEventListener: function() {}
  });
