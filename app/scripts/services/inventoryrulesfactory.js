'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryRulesFactory', function() {

    // (Arrival Date/time - Order Date/time)
    var leadTime = function(orders) {
      return Date.now();
    };

    return {
      leadTime: leadTime
    };
  });
