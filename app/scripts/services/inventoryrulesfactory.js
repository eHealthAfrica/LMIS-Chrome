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
     * @return {Number} the lead time in ms
     * @throws error on an invalid date field
     */
    var leadTime = function(order) {
      var isValidDate = function isValidDate(date) {
        if(Object.prototype.toString.call(date) !== '[object Date]') {
          return false;
        }
        if(isNaN(date.getTime())) {
          throw new Error(date);
        }
      };

      var created = new Date(order.created);
      // jshint camelcase: false
      var received = new Date(order.date_receipt);

      isValidDate(created);
      isValidDate(received);

      if(created > received) {
        throw new Error('Order was created before it was received');
      }

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
    // jshint unused: false
    var consumption = function(facility) {
      // FIXME: Awaiting discussion, see #222
      return 10;
    };

    /**
     * The average consumption during the lead-time period.
     *
     * @param {Object} leadTimes An array of order lead times
     * @param {Object} consumptions An array of consumption levels
     * @return {Number} average LTC in ms
     */
    var leadTimeConsumption = function(leadTimes, consumptions) {
      var average = function(things) {
        var sum = 0;
        for(var i = things.length - 1; i >= 0; i--) {
          sum = sum + things[i];
        }
        return sum / things.length;
      };

      var leadAvg = average(leadTimes),
          consAvg = average(consumptions);

      return leadAvg * consAvg;
    };

    return {
      leadTime: leadTime,
      consumption: consumption,
      leadTimeConsumption: leadTimeConsumption
    };
  });
