'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryRulesFactory', function() {

    /**
     * Order lead time.
     *
     * The duration between the time an order is authorized and the time the
     * bundle arrives at the facility, measured in days.
     *
     * @param {Object} order An order object with created & date_receipt fields
     * @return {Number} the lead time in ms, otherwise NaN
     */
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
