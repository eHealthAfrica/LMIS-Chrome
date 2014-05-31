'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter, utility, syncService, i18n) {

    var STOCK_COUNT_DB = storageService.STOCK_COUNT;
      /**
       *
       * @type {{}}
       */
    var months = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December'
    };
      /**
       * gets product types object list
       * @returns {promise}
       * @public
       */
    var productType = function(){
      var deferred = $q.defer();
      storageService.get(storageService.PRODUCT_TYPES).then(function(productTypes){

        deferred.resolve(productTypes);
      });
      return deferred.promise;
    };
     /**
      * this function converts any date format to yyyy-MM-dd format
      * @param _date
      * @returns {*}
      * @private
      */
    var isoDate = function(_date){
      var date = (angular.isDefined(_date)) ? new Date(_date) : new Date();
      return $filter('date')(date, 'yyyy-MM-dd');
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
          var stockCountDate = isoDate(row.countDate);
          date = isoDate(date);
          if (date === stockCountDate) {
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
    var getFirstDate = function (dueDateInfo){
      var dates = [];
      if(dueDateInfo.reminderDate.getTime() < new Date().getTime()){
        dates.push(isoDate(dueDateInfo.reminderDate.toJSON()));
      }
      if(dueDateInfo.reminderDate.getTime() > new Date().getTime()){
        dates.push(isoDate(dueDateInfo.lastCountDate.toJSON()));
      }
      return dates;
    };
    /**
     *
     * @param dateActivated
     * @param reminderDay
     * @param interval
     * @returns {{}}
     * @private
     */
    var getLastDate = function (dateActivated, reminderDay, interval){
      var dueDateInfo = utility.getWeekRangeByDate(new Date(dateActivated), reminderDay);
      return isoDate(dueDateInfo.reminderDate.toJSON()) <= isoDate(dateActivated) ? dueDateInfo.reminderDate : new Date(dueDateInfo.reminderDate.getTime() - interval);
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
    var load={
      /**
       *
       * @returns {promise}
       * @public
       */
      allStockCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.STOCK_COUNT)
          .then(function(stockCounts){
            stockCounts = syncService.addSyncStatus(stockCounts);
            deferred.resolve(stockCounts);
          });
        return deferred.promise;
      },

      /**
       *
       * @param productObject
       * @param index
       * @returns {{}}
       */
      productReadableName: function(productObject, index){
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
       * @returns {number}
       */
      timezone: function(){
        return utility.getTimeZone();
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
      },
      /**
       *
       * @returns {promise}
       */
      stockCountListByDate: function(){
        var deferred = $q.defer();
        var obj = {};
        this.allStockCount()
            .then(function(stockCountList){
              for(var i=0; i < stockCountList.length; i++){
                obj[isoDate(stockCountList[i].countDate)] = stockCountList[i];
              }
              deferred.resolve(obj);
            })
            .catch(function(reason){
              deferred.resolve(obj);
              console.error(reason);
            });

        return deferred.promise;
      },
      /**
       *
       * @param fromDB
       * @param fromFacilitySelected
       * @returns {Array}
       */
      mergedStockCount: function(fromDB, fromFacilitySelected){
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
        var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay, date);

        if(angular.isUndefined(stockCountByDate[date])){
          var validateDate = ((isoDate(date) === isoDate()) ||
              ((isoDate(dueDateInfo.lastDay.toJSON()) >= isoDate(new Date().toJSON())) && parseInt(appConfig.stockCountInterval, 10) !== 1) ||
              (isoDate(dueDateInfo.lastCountDate.toJSON()) === isoDate(date) && dueDateInfo.currentReminderDate.getTime() > new Date().getTime()));
          return (!validateDate);
        }
        return (!(stockCountByDate[date].isComplete || isoDate(date) === isoDate()));
      },

      /**
       *
       * @param appConfig
       */
      stockCountByIntervals: function(appConfig){
        var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay);
        var lastDate = getLastDate(appConfig.dateActivated, appConfig.reminderDay, dueDateInfo.interval);
        var dates = getFirstDate(dueDateInfo);
        while(dates.length < 10){
          dueDateInfo.currentReminderDate = new Date(dueDateInfo.currentReminderDate.getTime() - dueDateInfo.interval);
          if(dueDateInfo.currentReminderDate.getTime() < lastDate.getTime()){
            break;
          }
          if(parseInt(dates.indexOf(isoDate(dueDateInfo.currentReminderDate.toJSON())), 10) === -1){
            dates.push(isoDate(dueDateInfo.currentReminderDate.toJSON()));
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
      byFacility: function(facility)
      {
        var deferred = $q.defer();
        var fUuid = typeof facility === 'string' ? facility : facility.uuid;
        this.allStockCount().then(function(result){
          var res = result.filter( function(e) { return e !== 'undefined' && e.facility === fUuid; } );
          deferred.resolve(res);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      /**
       * this return default day if none was provided via url
       * @param dayFromUrlParams
       * @param appConfig
       * @returns {number}
       */
      reminderDayFromDate: function(dayFromUrlParams, appConfig){
        if(dayFromUrlParams === null){
          var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay);
          // if the selected stock count date is not equals to today, then check if the last day of the
          // week the date fell is less than today and the count interval must not be daily
          if(isoDate() < isoDate(dueDateInfo.reminderDate.toJSON())){
            var newDate = new Date(dueDateInfo.reminderDate.getTime() - dueDateInfo.interval);
            return $filter('date')(newDate.toJSON(), 'dd');
          }
          else{
            return $filter('date')(dueDateInfo.reminderDate.toJSON(), 'dd');
          }
        }
        return dayFromUrlParams;
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
          var editOff = false;
          if(isoDate() !== isoDate(date)){
            var dueDateInfo = getDueDateInfo(appConfig.stockCountInterval, appConfig.reminderDay, date);
            var validateDate = (
                  isoDate(dueDateInfo.lastCountDate.toJSON()) === isoDate(date) &&
                  dueDateInfo.currentReminderDate.getTime() > new Date().getTime()) ||
                  ((isoDate(dueDateInfo.lastDay.toJSON()) >= isoDate()) && appConfig.stockCountInterval !== 1
                );
            editOff = (!validateDate);
          }
          return editOff;
        }
      }
    };

    return {
      monthList: months,
      productType: productType,
      save:addRecord,
      get:load,
      set: setter,
      getStockCountByDate: getStockCountByDate,
      validate: validate,
      STOCK_COUNT_DB: STOCK_COUNT_DB
    };
  });
