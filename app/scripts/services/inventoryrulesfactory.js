'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryRulesFactory', function($q, utility, $rootScope, bundleService, storageService, productProfileFactory, stockCountFactory) {

    // Returns the average of a list of numbers
    var average = function(things) {
      var sum = 0;
      for (var i = things.length - 1; i >= 0; i--) {
        sum = sum + things[i];
      }
      return sum / things.length;
    };

    var randInterval = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    Number.prototype.clamp = function(min, max) {
      return Math.min(Math.max(this, min), max);
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
    var getStockLevel = function(facility, productType) {
      var deferred = $q.defer();
      var promises = [];
      promises.push(stockCountFactory.get.byFacility(facility));
      promises.push(productProfileFactory.getByProductType(productType));
      $q.all(promises).then(
        function(res) {
          var stockCounts = res[0];
          var profiles = res[1];
          var profileIds = profiles.map(function(pp) {
            return pp.uuid;
          });
          var count = 0;
          //find the most recent stockCount mentioning ANY of the above profileIds.
          if (typeof stockCounts !== 'undefined') {
            stockCounts = stockCounts.filter(function(stockCount) {
              return stockCount.isComplete === 1;
            });
            if (stockCounts.length > 0) {
              stockCounts = stockCounts
                .sort(function(a, b) {
                  //desc
                  return -(new Date(a.created).getTime() - new Date(b.created).getTime());
                });
              var mostRecent = stockCounts[0];
              if (Object.keys(mostRecent.unopened).length === 0 ) {
                console.info('culprit');
              }
              if (typeof mostRecent !== 'undefined') {
                count = Object.keys(mostRecent.unopened)
                  .filter(function(ppid) {
                    return profileIds.indexOf(ppid) !== -1;
                  })
                  .map(function(ppid) {
                    return mostRecent.unopened[ppid];
                  });
                if(count.length !== 0){
                  count =  count.reduce(function(total, current) {
                    return total + current;
                  });
                } else {
                  count = 0;
                }

              }
            }
          }
          deferred.resolve(count);
        }, function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };

    var getLedgerStockBalFrom = function(facId, date) {
      var facBundles = [];
      var sendingUuid, receiverUuid;
      var pTypeBalances = {};
      return bundleService.getBundlesByDate(date)
        .then(function(bundles) {
          facBundles = bundles
            .filter(function(b) {
              return (b.sendingFacility === facId || b.receivingFacility === facId);
            });
          return bundleService.getBundleSummaries(facBundles, productProfileFactory.getAll());
        });
    };

    //TODO move these into a stat class like stats(productype).leadtime.avg() etc
    /**
     * Average lead time for a given product type
     * Should be calculated from past lead times of orders for given product type
     * @param {String} uuid of product type for which to get lead time data
     * @return {Number} average lead time for product type in days
     */
    var leadTimeAvgByProductType = function(productTypeUuid) {
      var avgLeadTimeMocks = {
        '00f987e4-54e1-46f0-820b-b249a6d38759': 6.8,
        '0930b906-4802-4a65-8516-057bd839db3e': 5.13,
        '111fbb51-0c5a-492a-97f6-2c7664e23d01': 5.13,
        '1203c362-b7a8-499a-b7ba-b842bace7920': 5.13,
        '19e16c20-04b7-4e06-a679-7f7b60d976be': 6.8,
        '251fc8c2-0273-423f-a519-4ea20fc74832': 5.27,
        '2fee31f0-7757-4f06-9914-d16c5ca9cc5f': 5.27,
        '367f3f7f-a1cc-4266-8a0a-020722576cc9': 5,
        '401f8608-e232-4c5a-b32d-032d632abf88': 5,
        '939d5e05-2aa4-4883-9246-35c60dfa06a5': 5.13,
        'abe41e88-ab4a-4c6f-b7a4-4549e13fb758': 6.8,
        'db513859-4491-4db7-9343-4980a16c8b04': 6.8,
        'e55e1452-b0ab-4046-9d7e-3a98f1f968d0': 6.8,
        'f7675c7e-856a-45e8-b2af-d50f42950ac1': 5.27
      };

      return avgLeadTimeMocks[productTypeUuid];
    };

    /**
     * Standard deviation of lead time for given product type
     * Should be calculated from past lead times of orders for given product type
     * @param {String} uuid of product type for which to get lead time data
     * @return {Number} standard deviation of lead times for product type in days
     */
    var leadTimeStdByProductType = function(productTypeUuid) {
      var stdLeadTimeMocks = {
        '00f987e4-54e1-46f0-820b-b249a6d38759': 2.83,
        '0930b906-4802-4a65-8516-057bd839db3e': 2.68,
        '111fbb51-0c5a-492a-97f6-2c7664e23d01': 2.68,
        '1203c362-b7a8-499a-b7ba-b842bace7920': 2.68,
        '19e16c20-04b7-4e06-a679-7f7b60d976be': 2.83,
        '251fc8c2-0273-423f-a519-4ea20fc74832': 2.64,
        '2fee31f0-7757-4f06-9914-d16c5ca9cc5f': 2.64,
        '367f3f7f-a1cc-4266-8a0a-020722576cc9': 2,
        '401f8608-e232-4c5a-b32d-032d632abf88': 2,
        '939d5e05-2aa4-4883-9246-35c60dfa06a5': 2.68,
        'abe41e88-ab4a-4c6f-b7a4-4549e13fb758': 2.83,
        'db513859-4491-4db7-9343-4980a16c8b04': 2.83,
        'e55e1452-b0ab-4046-9d7e-3a98f1f968d0': 2.83,
        'f7675c7e-856a-45e8-b2af-d50f42950ac1': 2.64
      };
      return stdLeadTimeMocks[productTypeUuid];
    };

    /**
     * Average consumption for given product type
     * Should be calculated from past consumption of given product type
     * @param {String} uuid of product type for which to get consumption data
     * @return {Number} consumption average in standard units for product type / day
     */
    var consumptionAvgByProductType = function(productTypeUuid) {
      var avgConsumptionMocks = {
        '00f987e4-54e1-46f0-820b-b249a6d38759': 150.29,
        '0930b906-4802-4a65-8516-057bd839db3e': 150.39,
        '111fbb51-0c5a-492a-97f6-2c7664e23d01': 150.29,
        '1203c362-b7a8-499a-b7ba-b842bace7920': 150.39,
        '19e16c20-04b7-4e06-a679-7f7b60d976be': 150.29,
        '251fc8c2-0273-423f-a519-4ea20fc74832': 750,
        '2fee31f0-7757-4f06-9914-d16c5ca9cc5f': 187.1,
        '367f3f7f-a1cc-4266-8a0a-020722576cc9': 75,
        '401f8608-e232-4c5a-b32d-032d632abf88': 750,
        '939d5e05-2aa4-4883-9246-35c60dfa06a5': 187.1,
        'abe41e88-ab4a-4c6f-b7a4-4549e13fb758': 187.39,
        'db513859-4491-4db7-9343-4980a16c8b04': 187.39,
        'e55e1452-b0ab-4046-9d7e-3a98f1f968d0': 187.39,
        'f7675c7e-856a-45e8-b2af-d50f42950ac1': 187.29
      };
      return avgConsumptionMocks[productTypeUuid];
    };

    /**
     * Standard deviation of consumption for given product type
     * Should be calculated from past consumption of given product type
     * @param {String} uuid of product type for which to get consumption data
     * @return {Number} consumption standard deviation in standard units for product type / day
     */
    var consumptionStdByProductType = function(productTypeUuid) {
      var stdConsumptionMocks = {
        '00f987e4-54e1-46f0-820b-b249a6d38759': 100,
        '0930b906-4802-4a65-8516-057bd839db3e': 150.09,
        '111fbb51-0c5a-492a-97f6-2c7664e23d01': 100,
        '1203c362-b7a8-499a-b7ba-b842bace7920': 150.09,
        '19e16c20-04b7-4e06-a679-7f7b60d976be': 100,
        '251fc8c2-0273-423f-a519-4ea20fc74832': 500,
        '2fee31f0-7757-4f06-9914-d16c5ca9cc5f': 130.68,
        '367f3f7f-a1cc-4266-8a0a-020722576cc9': 50,
        '401f8608-e232-4c5a-b32d-032d632abf88': 500,
        '939d5e05-2aa4-4883-9246-35c60dfa06a5': 130.68,
        'abe41e88-ab4a-4c6f-b7a4-4549e13fb758': 150.09,
        'db513859-4491-4db7-9343-4980a16c8b04': 150.09,
        'e55e1452-b0ab-4046-9d7e-3a98f1f968d0': 150.09,
        'f7675c7e-856a-45e8-b2af-d50f42950ac1': 100
      };
      return stdConsumptionMocks[productTypeUuid];
    };

    /**
     * Temporary version of per-producttype LTC
     */
    var leadTimeConsumptionByProductType = function(productTypeUuid) {
      return leadTimeAvgByProductType(productTypeUuid) * consumptionAvgByProductType(productTypeUuid);
    };

    /**
     * Temporary version of per-producttype buffer stock
     */
    var bufferByProductType = function(productTypeUuid) {
      return serviceFactor() * Math.sqrt(
        leadTimeAvgByProductType(productTypeUuid) * Math.pow(leadTimeStdByProductType(productTypeUuid), 2.0) +
          Math.pow(consumptionAvgByProductType(productTypeUuid), 2.0) *
            Math.pow(leadTimeStdByProductType(productTypeUuid), 2.0));
    };

    /**
     * Temporary version of per-producttype rop
     */
    var reorderPointByProductType = function(productTypeUuid) {
      return bufferByProductType(productTypeUuid) + leadTimeConsumptionByProductType(productTypeUuid);
    };

    var reorderPointByProductTypeDays = function(productTypeUuid) {
      return bufferByProductType(productTypeUuid) / consumptionAvgByProductType(productTypeUuid);
    };

    /**
     * Temporary version of days to reorder point per product (stock - rop) / consumption
     * @returns {promise|promise|*|Function|promise}
     */
    var daysToReorderPoint = function(facility, productTypeUuid) {
      var deferred = $q.defer();
      getStockLevel(facility, productTypeUuid).then(function(stockLevel) {
          var days = (stockLevel - reorderPointByProductType(productTypeUuid)) / consumptionAvgByProductType(productTypeUuid);
          deferred.resolve(Math.floor(days));
        },
        function(err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    };

    var daysOfStock = function(facility, productTypeUuid) {
      var deferred = $q.defer();
      getStockLevel(facility, productTypeUuid).then(function(stockLevel) {
        var days = stockLevel / consumptionAvgByProductType(productTypeUuid);
        deferred.resolve(days);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

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
        if (Object.prototype.toString.call(date) !== '[object Date]') {
          return false;
        }
        if (isNaN(date.getTime())) {
          throw new Error(date);
        }
      };

      var created = new Date(order.created);
      // jshint camelcase: false
      var received = new Date(order.date_receipt);

      isValidDate(created);
      isValidDate(received);

      if (created > received) {
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
    var bufferStock = function(facility, productTypeUuid) {
      // HACK: Calculates based on some target pop BS and a bunch of back-of-a-napkin calculations
      // As we add rules for dry goods they will show up in graph also.
      // TODO: Actual adaptive model

      // product types:
      // 251fc8c2-0273-423f-a519-4ea20fc74832    ADS-0.05ml
      // 367f3f7f-a1cc-4266-8a0a-020722576cc9    SB-2.5L
      // 401f8608-e232-4c5a-b32d-032d632abf88    Syr-Dil-2ml
      // db513859-4491-4db7-9343-4980a16c8b04    OPV
      // 00f987e4-54e1-46f0-820b-b249a6d38759    Measles
      // 0930b906-4802-4a65-8516-057bd839db3e    HepB
      // 1203c362-b7a8-499a-b7ba-b842bace7920    Penta
      // 19e16c20-04b7-4e06-a679-7f7b60d976be    YF
      // 939d5e05-2aa4-4883-9246-35c60dfa06a5    TT
      // e55e1452-b0ab-4046-9d7e-3a98f1f968d0    BCG
      // f7675c7e-856a-45e8-b2af-d50f42950ac1    Men-A
      // abe41e88-ab4a-4c6f-b7a4-4549e13fb758    HPV
      // 111fbb51-0c5a-492a-97f6-2c7664e23d01    HepA
      // f96946be-7dac-438e-9220-efc386276481    Penta //TODO: wrong Penta
      // 2fee31f0-7757-4f06-9914-d16c5ca9cc5f    DT

      var deferred = $q.defer();
      if (typeof facility.bw_target_pop !== 'undefined') {
        var targetpop = facility.bw_target_pop[productTypeUuid];
        var targetPopCoverage = targetpop * 0.83;
        var factors = {
          'e55e1452-b0ab-4046-9d7e-3a98f1f968d0': { popFactor: 0.5, usageFactor: 0.25}, //bcg
          '00f987e4-54e1-46f0-820b-b249a6d38759': { popFactor: 0.3, usageFactor: 0.25}, //measles
          '19e16c20-04b7-4e06-a679-7f7b60d976be': { popFactor: 0.3, usageFactor: 0.25}, //yf
          'db513859-4491-4db7-9343-4980a16c8b04': { popFactor: 0.75, usageFactor: 1.0}, //opv
          '939d5e05-2aa4-4883-9246-35c60dfa06a5': { popFactor: 0.75, usageFactor: 0.25}, //tt
          //TODO: wrong penta: 'f96946be-7dac-438e-9220-efc386276481': { popFactor: 0.75, usageFactor: 0.75}, //penta
          '0930b906-4802-4a65-8516-057bd839db3e': { popFactor: 0.75, usageFactor: 0.25},  //hbv
          '1203c362-b7a8-499a-b7ba-b842bace7920': { popFactor: 0.75, usageFactor: 0.75} //correct penta
        };
        //don't need a promise using rule-based hacks but will for proper adaptive rules
        var factor = factors[productTypeUuid];
        if (typeof factor !== 'undefined')
          deferred.resolve(Math.ceil(targetPopCoverage / factor.popFactor * factor.usageFactor));
        else
          deferred.resolve(-1);
      } else
        deferred.resolve(-1);

      return deferred.promise;
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

    var daysAboveReorder = function(daysOfStock, reorderPoint) {
      var above = (daysOfStock - reorderPoint).clamp(0, daysOfStock);
      return Math.floor(above);
    };

    var daysBelowReorder = function(daysOfStock, reorderPoint) {
      var below = daysOfStock.clamp(0, reorderPoint);
      return Math.floor(below);
    };

    var stockAboveReorder = function(stockLevel, bufferStock) {
      var above = (stockLevel - bufferStock).clamp(0, stockLevel);
      return Math.floor(above);
    }

    var stockBelowReorder = function(stockLevel, bufferStock) {
      var below = stockLevel.clamp(0, bufferStock);
      return Math.floor(below);
    }

    return {
      leadTime: leadTime,
      consumption: consumption,
      leadTimeConsumption: leadTimeConsumption,
      serviceFactor: serviceFactor,
      bufferStock: bufferStock,
      reorderPoint: reorderPoint,
      getStockLevel: getStockLevel,
      daysToReorderPoint: daysToReorderPoint,
      daysOfStock: daysOfStock,
      reorderPointByProductType: reorderPointByProductTypeDays,
      daysAboveReorder: daysAboveReorder,
      daysBelowReorder: daysBelowReorder,
      stockAboveReorder: stockAboveReorder,
      stockBelowReorder: stockBelowReorder,
      getStockBalance: getLedgerStockBalFrom
    };
  });
