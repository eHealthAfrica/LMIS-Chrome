'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter, utility, syncService, i18n) {

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

     /**
      *
      * @param _interval
      * @param _reminderDay
      * @param _date
      * @returns {{}}
      * @private
      */
    var getDueDateInfo = function(_interval, _reminderDay, _date){
      var dateObject = angular.isDefined(_date) ? new Date(_date): new Date();
      var reminderDateObject = utility.getWeekRangeByDate(dateObject, _reminderDay);
      var currentReminderDate = angular.isDefined(_date) ? utility.getWeekRangeByDate(new Date(), _reminderDay).reminderDate : angular.copy(reminderDateObject.reminderDate);
      var interval = 1000 * 60 * 60 * 24 * parseInt(_interval, 10);
      return {
        interval: interval,
        reminderDate: reminderDateObject.reminderDate,
        lastDay: reminderDateObject.last,
        firstDay: reminderDateObject.first,
        currentReminderDate: currentReminderDate,
        lastCountDate: new Date(currentReminderDate - interval)
      };
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
     * @param dueDateInfo
     * @returns {Array}
     * @private
     */
    var getCurrentStockCountDueDate = function (stockCountInterval, reminderDay, date){
      var dueDateInfo = getDueDateInfo(stockCountInterval, reminderDay, date);
      if(dueDateInfo.reminderDate.getTime() < new Date().getTime()){
        return dueDateInfo.reminderDate;
      }else{
        return dueDateInfo.lastCountDate;
      }
    };

    /**
     *
     * @param dateActivated
     * @param reminderDay
     * @param interval
     * @returns {{}}
     * @private
     */
    var getStockCountDateByDateActivated = function (dateActivated, reminderDay, interval){
      //TODO: consider deprecating this
      var dueDateInfo = utility.getWeekRangeByDate(new Date(dateActivated), reminderDay);
      if(utility.getFullDate(dueDateInfo.reminderDate.toJSON()) <= utility.getFullDate(dateActivated)){
        return dueDateInfo.reminderDate;
      }else{
        return new Date(dueDateInfo.reminderDate.getTime() - interval);
      }
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
              obj[utility.getFullDate(stockCountList[i].created)] = stockCountList[i];
            }
            deferred.resolve(obj);
          })
          .catch(function (reason) {
            deferred.resolve(obj);
            console.error(reason);
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
       *
       * @param _month
       * @param _year
       * @returns {Array}
       */
      daysInMonth: function (_month, _year){
        //TODO: consider deprecating this
        var now = new Date();
        var year = (_year !== '')?_year: now.getFullYear();
        var month = (_month !== '')?_month: now.getMonth() + 1;
        var numberOfDays = new Date(year, month, 0).getDate();
        var dayArray = [];
        for(var i=0; i<numberOfDays; i++){
          var day = i+1;
          day = day < 10 ? '0'+day : day;
          dayArray.push(day);
        }
        return dayArray;
      }
      ,
      /**
       *
       * @param fromDB
       * @param fromFacilitySelected
       * @returns {Array}
       */
      mergedStockCount: function(fromDB, fromFacilitySelected){
        //TODO: consider deprecating this
        var db = Object.keys(fromDB);
        var dbArr = Object.keys(fromDB);
        for(var i in fromFacilitySelected){
          if(fromFacilitySelected[i] in fromDB){
            var index = db.indexOf(fromFacilitySelected[i]);
            dbArr.pop(index);
          }
        }
        return fromFacilitySelected.concat(dbArr);
      },
      /**
       *
       * @param date
       * @param stockCountByDate
       * @param appConfig
       * @returns {boolean}
       */
      missingEntry: function(date, stockCountByDate, appConfig){
        //TODO: consider deprecating this
        var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay, date);

        if(angular.isUndefined(stockCountByDate[date])){
          var validateDate = ((utility.getFullDate(date) === utility.getFullDate(new Date())) ||
              ((utility.getFullDate(dueDateInfo.lastDay.toJSON()) >= utility.getFullDate(new Date().toJSON())) && parseInt(appConfig.stockCountInterval, 10) !== 1) ||
              (utility.getFullDate(dueDateInfo.lastCountDate.toJSON()) === utility.getFullDate(date) && dueDateInfo.currentReminderDate.getTime() > new Date().getTime()));
          return (!validateDate);
        }
        return (!(stockCountByDate[date].isComplete || utility.getFullDate(date) === utility.getFullDate(new Date())));
      },

      /**
       *
       * @param appConfig
       */
      stockCountByIntervals: function(appConfig){
        //TODO: consider deprecating this
        var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay);
        var lastDate = getStockCountDateByDateActivated(appConfig.dateActivated, appConfig.reminderDay, dueDateInfo.interval);
        var dates = getCurrentStockCountDueDate(dueDateInfo);
        while(dates.length < 10){
          dueDateInfo.currentReminderDate = new Date(dueDateInfo.currentReminderDate.getTime() - dueDateInfo.interval);
          if(dueDateInfo.currentReminderDate.getTime() < lastDate.getTime()){
            break;
          }
          if(parseInt(dates.indexOf(utility.getFullDate(dueDateInfo.currentReminderDate.toJSON())), 10) === -1){
            dates.push(utility.getFullDate(dueDateInfo.currentReminderDate.toJSON()));
          }
        }
        return dates;
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
    var setter= {
      stock: {
        /**
         * this function sets the edit status for selected stock count detail
         * @param date
         * @param appConfig
         */
        editStatus: function(date, appConfig){
          // if the selected stock count date is not equals to today, then check if the last day of the
          // week the date fell is less than today and the count interval must not be daily

          if(utility.getFullDate(new Date()) !== utility.getFullDate(date)){
            var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay, date);
            var validateDate = (
                  utility.getFullDate(dueDateInfo.lastCountDate.toJSON()) === utility.getFullDate(date) &&
                  dueDateInfo.currentReminderDate.getTime() > new Date().getTime()) ||
                  ((utility.getFullDate(dueDateInfo.lastDay.toJSON()) >= utility.getFullDate(new Date())) &&
                      appConfig.stockCountInterval !== 1
                );
            return (!validateDate);
          }
        }
      }
    };

    return {
      getCurrentStockCountDueDate: getCurrentStockCountDueDate,
      getStockCountListByDate: getStockCountListByCreatedDate,
      getAll: getAllStockCount,
      productType: productType,
      save:addRecord,
      get:load,
      set: setter,
      getStockCountByDate: getStockCountByDate,
      validate: validate,
      STOCK_COUNT_DB: STOCK_COUNT_DB
    };
  });
