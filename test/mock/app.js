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
      },
      i18n: {
        getMessage: function() {}
      }
    },
    addEventListener: function() {}
  });
