'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter, utility, syncService, i18n, reminderFactory) {

    var STOCK_COUNT_DB = storageService.STOCK_COUNT;
      /**
       * gets product types object list
       * @returns {promise}
       * @public
       */
    var productType = function(){
      //TODO: consider deprecating this
      var deferred = $q.defer();
      storageService.get(storageService.PRODUCT_TYPES).then(function(productTypes){

        deferred.resolve(productTypes);
      });
      return deferred.promise;
    };


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

    var addRecord={
      /**
       * Add/Update Stock count
       *
       * @param {object} _stockCount Data object.
       * @return {Promise} return promise object
       * @public
       */
      stock: function(_stockCount){
        var deferred = $q.defer();
        if(_stockCount.countDate instanceof Date){
          _stockCount.countDate = _stockCount.countDate.toJSON();
        }
        validate.stock.countExist(_stockCount.countDate)
            .then(function (stockCount) {
              if (stockCount !== null) {
                _stockCount.uuid = stockCount.uuid;
              }
              storageService.save(storageService.STOCK_COUNT, _stockCount)
                  .then(function (uuid) {
                    deferred.resolve(uuid);
                  })
                  .catch(function (reason) {
                    deferred.reject(reason);
                  });
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        return deferred.promise;
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
    var getStockCountByDate = function (date) {
      var deferred = $q.defer();
      storageService.all(storageService.STOCK_COUNT).then(function (stockCounts) {
        var stockCount = null;
        for (var index in stockCounts) {
          var row = stockCounts[index];
          if (utility.getFullDate(date) === utility.getFullDate(row.countDate)) {
            stockCount = row;
            break;
          }
        }
        deferred.resolve(stockCount);
      }).catch(function(reason){
        deferred.reject(reason);
      });
      return deferred.promise;
    };

    /**
     *
     * @param productObject
     * @param index
     * @returns {object}
     * @private
     */
    var currentProductObject = function(productObject, index){
      var productKey =  (Object.keys(productObject))[index];
      return productObject[productKey];
    };

      /**
       * returns array of stock count objects sorted by count date.
       * @returns {promise|promise|*|promise|promise}
       */
    var getAllStockCount = function(){
      var deferred = $q.defer();
      storageService.all(storageService.STOCK_COUNT)
          .then(function (stockCounts) {
            stockCounts = syncService.addSyncStatus(stockCounts);
            deferred.resolve(stockCounts);
          })
          .catch(function (reason) {
            deferred.reject(reason);
          });
      return deferred.promise;
    };

    var getStockCountListByCreatedDate = function(){
      var deferred = $q.defer();
      var obj = {};
      getAllStockCount()
          .then(function (stockCountList) {
            for (var i = 0; i < stockCountList.length; i++) {
              obj[utility.getFullDate(stockCountList[i].countDate)] = stockCountList[i];
            }
            deferred.resolve(obj);
          })
          .catch(function (reason) {
            deferred.resolve(obj);
          });
      return deferred.promise;
    };

    var load={

      /**
       *
       * @param productObject
       * @param index
       * @returns {{}}
       */
      productReadableName: function(productObject, index){
        //TODO: consider deprecating this
        return currentProductObject(productObject, index);
      },
      /**
       *
       * @param productObject
       * @param index
       * @param productType
       * @returns {{}}
       */
      productTypeCode: function(productObject, index, productType){
        var currentProductUuid = currentProductObject(productObject, index).product;
        return productType[currentProductUuid];
      },
      /**
       *
       * @param scope
       * @param error
       */
      errorAlert: function(scope, error){
        if(error === 1){
          scope.productError = true;
          scope.productErrorMsg = i18n('stockCountErrorMsg');
        }
        else if (error === 2){
          scope.productError = true;
          scope.productErrorMsg = i18n('discardErrorMsg');
        }
        else{
          scope.productError = false;
          scope.productErrorMsg = '';
        }
      },
      /**
       *
       * @param array
       * @returns {{}}
       */
      productObject: function(array){
        return utility.castArrayToObject(array, 'uuid');
      },
      /**
     * This function returns stock counts by the given facility
     *
     * @param facility
     * @returns {promise|promise|*|Function|promise}
     */
      byFacility: function (facility) {
        var deferred = $q.defer();
        var fUuid = typeof facility === 'string' ? facility : facility.uuid;
        getAllStockCount().then(function (result) {
          var res = result.filter(function (e) {
            return e !== 'undefined' && e.facility === fUuid;
          });
          deferred.resolve(res);
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }
    };

    var getMostRecentStockCount = function(){
      var deferred = $q.defer();
      var mostRecentStockCount;
      getAllStockCount()
          .then(function(result){
            for(var index in result){
              var stockCount = result[index];
              if(typeof mostRecentStockCount === 'undefined'){
                mostRecentStockCount = stockCount;
                continue;
              }

              if(new Date(mostRecentStockCount.created).getTime() < new Date(stockCount.created).getTime()){
                mostRecentStockCount = stockCount;
              }

            }
            deferred.resolve(mostRecentStockCount);
          })
          .catch(function(){
            deferred.resolve(mostRecentStockCount);
          });
      return deferred.promise;
    };

    var isStockCountDue = function(stockCountInterval, reminderDay){
      var deferred = $q.defer();
      var isStockCountDue = true;
      this.getMostRecentStockCount()
          .then(function (recentStockCount) {
            var mostRecentDueDate = new Date(getStockCountDueDate(stockCountInterval, reminderDay));
            isStockCountDue = (typeof recentStockCount === 'undefined' || recentStockCount.isComplete !== 1 ||
                (mostRecentDueDate.getTime() > new Date(recentStockCount.countDate).getTime()));

            deferred.resolve(isStockCountDue);
          })
          .catch(function (reason) {
            deferred.reject(reason);
          });
      return deferred.promise;
    };

    return {
      getStockCountDueDate: getStockCountDueDate,
      isStockCountDue: isStockCountDue,
      getMostRecentStockCount: getMostRecentStockCount,
      getStockCountListByDate: getStockCountListByCreatedDate,
      getAll: getAllStockCount,
      productType: productType,
      save:addRecord,
      get:load,
      getStockCountByDate: getStockCountByDate,
      validate: validate,
      STOCK_COUNT_DB: STOCK_COUNT_DB
    };
  });
