'use strict';

angular.module('lmisChromeAppMocks', [])
  .value('$window', {
    chrome: {
      i18n: {
        getMessage: function() {}
      },
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
