'use strict';

angular.module('lmisChromeApp')
  .factory('utility', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      getUUID:function() {
        var now = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (now + Math.random()*16)%16 | 0;
            now = Math.floor(now/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
      }
    };
  });
