'use strict';

angular.module('i18nMocks', [])
  .value('i18n', function(){});

angular.module('i18nMockedWindow', [])
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
        getMessage: function(key) {
          return key;
        }
      }
    }
  });
