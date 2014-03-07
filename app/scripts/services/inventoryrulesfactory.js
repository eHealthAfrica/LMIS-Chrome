'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryRulesFactory', function() {

    // Arrival Date/time - Order Date/time
    var leadTime = function(order) {
      var created = new Date(order.created);
      // jshint camelcase: false
      var received = new Date(order.date_receipt);
      return received - created;
    };

    // Faciity consumption level
    var consumption = function(order) {
      return order.consumption;
    };

    // Average Consumption * Average Lead Time
    var leadTimeConsumption = function(leadTime, consumption) {
      return leadTime * consumption;
    };

    return {
      leadTime: leadTime,
      consumption: consumption,
      leadTimeConsumption: leadTimeConsumption
    };
  });
