'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter, utility, syncService, i18n, reminderFactory) {

    var STOCK_COUNT_DB = storageService.STOCK_COUNT;

    var getStockCountDueDate = function(interval, reminderDay, date){
      var today = new Date();
      var currentDate = date || today;
      var countDate;
      interval = parseInt(interval);

      switch (interval) {
        case reminderFactory.DAILY:
          countDate = new Date(utility.getFullDate(currentDate));
          break;
        case reminderFactory.WEEKLY:
          countDate = utility.getWeekRangeByDate(currentDate, reminderDay).reminderDate;
          if(currentDate.getTime() < countDate.getTime()){
            //current week count date is not yet due, return previous week count date..
            countDate = new Date(countDate.getFullYear(), countDate.getMonth(), countDate.getDate() - interval);
          }
          break;
        case reminderFactory.BI_WEEKLY:
          countDate = utility.getWeekRangeByDate(currentDate, reminderDay).reminderDate;
          if (currentDate.getTime() < countDate.getTime()) {
            //current week count date is not yet due, return last bi-weekly count date
            countDate = new Date(countDate.getFullYear(), countDate.getMonth(), countDate.getDate() - interval);
          }
          break;
        case reminderFactory.MONTHLY:
          var monthlyDate = (currentDate.getTime() === today.getTime())? 1 : currentDate.getDate();
          countDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), monthlyDate);
          break;
        default:
          throw 'unknown stock count interval.';
      }
      return countDate
    };
    function generateSMSMsg(count){
        return {

        }
    }
    var addRecord={
      /**
       * Add/Update Stock count
       *
       * @param {object} stockCount Data object.
       * @return {Promise} return promise object
       * @public
       */
      stock: function(stockCount) {

        if (stockCount.countDate instanceof Date) {
          stockCount.countDate = stockCount.countDate.toJSON();
        }

        return storageService.save(storageService.STOCK_COUNT, stockCount)

      }
    };

    var validate = {
     /*
      * I'm going to assume any value entered that is not a number is invalid
      */
      invalid: function(entry){
        //TODO: consider moving this to utility
        return !!((entry === '' || angular.isUndefined(entry) || isNaN(entry) || entry < 0));
      },
      stock: {
        countExist: function(date){
          //TODO: this not necessary why not call getStockCountByDate(date); directly, remove this.
          return getStockCountByDate(date);
        }
      }

    };
      /**
       *
       * @param date
       * @returns {promise}
       * @public
       */
      var getStockCountByDate = function(date) {
        return storageService.all(storageService.STOCK_COUNT)
          .then(function(stockCounts) {
            var stockCount = null;
            for (var index in stockCounts) {
              var row = stockCounts[index];
              if (utility.getFullDate(date) === utility.getFullDate(row.countDate)) {
                stockCount = row;
                break;
              }
            }
            return stockCount;
          });
      };

      /**
       * returns array of stock count objects sorted by count date.
       * @returns {promise|promise|*|promise|promise}
       */
      var getAllStockCount = function() {
        return storageService.all(storageService.STOCK_COUNT)
          .then(function(stockCounts) {
            return syncService.addSyncStatus(stockCounts);
          });
      };

    var load={
      /**
       *
       * @param scope
       * @param error
       */
      errorAlert: function(scope, error){
        if (error === 1) {
          scope.productError = true;
          scope.productErrorMsg = i18n('stockCountErrorMsg');
        } else if (error === 2) {
          scope.productError = true;
          scope.productErrorMsg = i18n('discardErrorMsg');
        } else {
          scope.productError = false;
          scope.productErrorMsg = '';
        }
      },
      /**
     * This function returns stock counts by the given facility
     *
     * @param facility
     * @returns {promise|promise|*|Function|promise}
     */
      byFacility: function(facility) {
        var fUuid = typeof facility === 'string' ? facility : facility.uuid;
        return getAllStockCount().then(function(result) {
          var res = result.filter(function(e) {
            return e !== 'undefined' && e.facility === fUuid;
          });
          return res;
        });
      }
    };

    var getLatestStockCount = function(complete) {
      var mostRecentStockCount;
      return getAllStockCount()
        .then(function(result) {
          for (var index in result) {
            var stockCount = result[index];

            if (complete === true && stockCount.isComplete !== 1) {
              continue;
            }

            if (typeof mostRecentStockCount === 'undefined') {
              mostRecentStockCount = stockCount;
              continue;
            }

            if (new Date(mostRecentStockCount.created).getTime() < new Date(stockCount.created).getTime()) {
              mostRecentStockCount = stockCount;
            }

          }
          return mostRecentStockCount;
        });
    };

    var getMostRecentStockCount = function() {
      var shouldBeComplete = false;
      return getLatestStockCount(shouldBeComplete);
    };

    var isStockCountDue = function(stockCountInterval, reminderDay) {
      var isStockCountDue = true;
      return this.getLatestCompleteStockCount()
        .then(function(recentStockCount) {
          var mostRecentDueDate = new Date(getStockCountDueDate(stockCountInterval, reminderDay));

          isStockCountDue = (typeof recentStockCount === 'undefined' || recentStockCount.isComplete !== 1 ||
            (new Date(recentStockCount.countDate).getTime()) < mostRecentDueDate.getTime());

          return isStockCountDue;
        });
    };

    var getByUuid = function(uuid){
      return storageService.find(STOCK_COUNT_DB, uuid)
        .then(function(stockCount){
          return syncService.getSyncStatus(stockCount);
        });
    };

    var isEditable = function(stockCount, mostRecentStockCount, scInterval, reminderDay) {
      scInterval = parseInt(scInterval);
      reminderDay = parseInt(reminderDay);

      var nextStockCountDueDate = getStockCountDueDate(scInterval, reminderDay);
      var isMostRecentStockCount = (typeof mostRecentStockCount !== 'undefined') && (mostRecentStockCount.uuid === stockCount.uuid);
      return isMostRecentStockCount && new Date(stockCount.countDate).getTime() >= new Date(nextStockCountDueDate).getTime();
    };

    var getLatestCompleteStockCount = function() {
      var shouldBeComplete = true;
      return getLatestStockCount(shouldBeComplete);
    };

    return {
      getStockCountDueDate: getStockCountDueDate,
      isStockCountDue: isStockCountDue,
      getMostRecentStockCount: getMostRecentStockCount,
      getLatestCompleteStockCount: getLatestCompleteStockCount,
      getAll: getAllStockCount,
      getByUuid: getByUuid,
      isEditable: isEditable,
      save:addRecord,
      get:load,
      getStockCountByDate: getStockCountByDate,
      validate: validate,
      STOCK_COUNT_DB: STOCK_COUNT_DB
    };
  });
