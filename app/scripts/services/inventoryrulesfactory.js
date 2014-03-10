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

    /**
     * Consumption.
     *
     * The amount of its inventory a facility consumes per the forecasting
     * interval.
     *
     * @param {Object} facility The facility object.
     * @return {Number} the consumption level.
     */
    var consumption = function(facility) {
      // FIXME: Awaiting discussion, see #222
      return 10;
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
