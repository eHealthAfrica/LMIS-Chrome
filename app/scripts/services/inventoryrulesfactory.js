'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryRulesFactory', function ($q, $rootScope, storageService, productProfileFactory, stockCountFactory) {

    // Returns the average of a list of numbers
    var average = function(things) {
      var sum = 0;
      for(var i = things.length - 1; i >= 0; i--) {
        sum = sum + things[i];
      }
      return sum / things.length;
    };

    var randInterval = function(min, max) {
      return Math.floor(Math.random()*(max-min+1)+min);
    };

    /**
     * This function returns the current amount of productType at facility
     * maaaaan this would be a lot easier with a relational datasource or ORM
     * TODO: this has no concept of unit - dose/vial, also don't know how to deal with opened vials
     * TODO: very big, could be broken up
     * @param facility 
     * @param productType
     * @returns {promise|promise|*|Function|promise}
     */  
    var getStockLevel = function(facility, productType)
    {
      var deferred = $q.defer();
      var profileIds = [];
      var promises = [];
      promises.push(stockCountFactory.get.byFacility(facility));
      promises.push(productProfileFactory.getByProductType(productType));
      $q.all(promises).then(
        function(res){
          var stockCounts = res[0];
          var profiles = res[1];
          var profileIds = profiles.map(function(pp){ return pp.uuid });
          console.log(profileIds);
          var count = 0;
          //find the most recent stockCount mentioning ANY of the above profileIds. 
          if(typeof stockCounts !== 'undefined')
          {
            var stockCounts = stockCounts.filter(function(stockCount) {
                return Object.keys(stockCount.unopened)
                  .some(function (ppid) { return profileIds.indexOf(ppid) != -1 });
            });
            if(stockCounts.length > 0)
            {
              stockCounts = stockCounts
                .sort(function(stockCount) { return new Date(stockCount.countDate); });
              var mostRecent = stockCounts[0];
              var profileCounts = [];
              if(typeof mostRecent !== 'undefined')
              {
                count = Object.keys(mostRecent.unopened)
                  .filter(function (ppid) { return profileIds.indexOf(ppid) != -1; })
                  .map( function (ppid) { return mostRecent.unopened[ppid]; })
                  .reduce( function (total, current) { return total + current; });
              }
            }
          }
          deferred.resolve(count);
        }, 
        function(err) { deferred.reject(err); }
      );
      
      return deferred.promise;
    };

    /** 
    * Average lead time for a given product type
    * Should be calculated from past lead times of orders for given product type
    * @param {String} uuid of product type for which to get lead time data
    * @return {Number} average lead time for product type in days
    */
    var getLeadTimeAvg = function (productTypeUuid)
    {
      var avgLeadTimeMocks = {

      };
      return avgLeadTimeMocks[productTypeUuid];
    }

    /** 
    * Standard deviation of lead time for given product type
    * Should be calculated from past lead times of orders for given product type
    * @param {String} uuid of product type for which to get lead time data
    * @return {Number} standard deviation of lead times for product type in days
    */
    var getLeadTimeStd = function (productTypeUuid)
    {
      var stdLeadTimeMocks = {

      };
      return stdLeadTimeMocks[productTypeUuid];
    }

    /** 
    * Average consumption for given product type
    * Should be calculated from past consumption of given product type
    * @param {String} uuid of product type for which to get consumption data
    * @return {Number} consumption average in standard units for product type / day
    */
    var getConsumptionAvg = function (productTypeUuid)
    {
      var avgConsumptionMocks = {

      };
      return avgConsumptionMocks[productTypeUuid];
    }

    /** 
    * Standard deviation of consumption for given product type
    * Should be calculated from past consumption of given product type
    * @param {String} uuid of product type for which to get consumption data
    * @return {Number} consumption standard deviation in standard units for product type / day
    */
    var getConsumptionStd = function (productTypeUuid)
    {
      var stdConsumptionMocks = {

      };
      return stdConsumptionMocks[productTypeUuid];
    }

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
      var leadAvg = average(leadTimes),
      consAvg = average(consumptions);

      return leadAvg * consAvg;
    };

    /**
     * Service factor.
     *
     * The desired level (availability) of facility service expressed as a
     * percentage.
     *
     * @param {Number} serviceLevel A facility's desired service level.
     * @return {Number} the service factor as a decimal
     */
     var serviceFactor = function(serviceLevel) {
      var serviceFactor = serviceLevel;
      // TODO: bring in actual normsinv function (JStat?)
      serviceFactor = 1.28;
      return serviceFactor;
    };

    /**
     * Buffer stock.
     *
     * The minimum level of each product profile a facility must maintain on
     * site at all times given its supply access, consumption patterns, and
     * desired service level.
     *
     * @param {Object[]} inventories The inventory held at a facility
     * @param {Number} serviceFactor The facility's service factor
     * @return {Number[]} the buffer levels for each product
     */
     var bufferStock = function(inventories, serviceFactor, consumption) {
      // var leadTimes = [];
      // inventories.forEach(function(inventory) {
      //   leadTimes.push(leadTime(inventory));
      // });
      // var avgLeadTime = average(leadTimes);

      // var first = Math.pow(avgLeadTime * consumption, 2),
      //     second = Math.pow(consumption, 2) * Math.pow(avgLeadTime, 2);
      // var buffer = serviceFactor * Math.sqrt(first + second);

      // TODO: calculate real buffer
      inventories.forEach(function(inventory) {
        inventory.buffer = randInterval(100, 300);
      });
      return inventories;
    };

    /**
     * Reorder point.
     *
     * The inventory level for each item in a facility stock list at which a
     * refill of supplies must be ordered.
     *
     * @param {Object} inventories The facility's inventory
     * @return {Object} the facility's inventory
     */
     var reorderPoint = function(inventory) {
      inventory.min = inventory.buffer + 10;
      return inventory;
    };

    return {
      leadTime: leadTime,
      consumption: consumption,
      leadTimeConsumption: leadTimeConsumption,
      serviceFactor: serviceFactor,
      bufferStock: bufferStock,
      reorderPoint: reorderPoint,
      getStockLevel: getStockLevel
    };
  });
