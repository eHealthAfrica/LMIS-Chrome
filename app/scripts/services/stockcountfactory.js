'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter, utility) {
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
       *
       * @returns {promise}
       */
    var productType = function(){
      var deferred = $q.defer();
      storageService.get(storageService.PRODUCT_TYPES).then(function(productTypes){

        deferred.resolve(productTypes);
      });
      return deferred.promise;
    };
    var isoDate = function(_date){
      var date = (angular.isDefined(_date)) ? new Date(_date) : new Date();
      return $filter('date')(date, 'yyyy-MM-dd');
    };

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
       * @param {object} Stock Data.
       * @return {Promise} return promise object
       * @public
       */
      stock: function(object){
        var deferred = $q.defer();
        if(object.countDate instanceof Date){
          object.countDate = object.countDate.toJSON();
        }
        validate.stock.countExist(object.countDate)
            .then(function (stockCount) {
              if (stockCount !== null) {
                object.uuid = stockCount.uuid;
              }
              storageService.save(storageService.STOCK_COUNT, object)
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

    var addSyncStatus= function(stockCounts)
    {
      if(stockCounts !== 'undefined')
      {
        stockCounts = stockCounts.map(function (sc) {
          if(sc !== 'undefined'){
            sc.synced = isSynced(sc);
            return sc;
          }
        });
      }
      return stockCounts;
    };

    var isSynced = function(sc)
    {
      /* TODO: decide on the best way of determining this. If dateSynced is set in the db
        we can be pretty sure it's accurate but right now there's no db feedback being saved
        locally */
      return (sc.dateSynced && sc.modified &&
        isoDate(sc.dateSynced) >=isoDate(sc.modified));
    };

    var load={
      /**
       *
       * @returns {promise}
       */
      allStockCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.STOCK_COUNT)
          .then(function(stockCount){
            stockCount = addSyncStatus(stockCount);
            deferred.resolve(stockCount);
          });
        return deferred.promise;
      },
      /**
       *
       * @param productObject
       * @param index
       * @returns {object}
       */
      currentProductObject: function(productObject, index){
        var productKey =  (Object.keys(productObject))[index];
        return productObject[productKey];
      },
      /**
       *
       * @param productObject
       * @param index
       * @returns {string}
       */
      productReadableName: function(productObject, index){
        var productName = this.currentProductObject(productObject, index).name;
        return utility.getReadableProfileName(productName);
      },
      /**
       *
       * @param productObject
       * @param index
       * @param productType
       * @returns {{}}
       */
      productTypeCode: function(productObject, index, productType){
        var currentProductUuid = this.currentProductObject(productObject, index).product;
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
          scope.productErrorMsg = 'count value is invalid, at least enter Zero "0" to proceed';
        }
        else if (error === 2){
          scope.productError = true;
          scope.productErrorMsg = 'please fix errors in reason selection';
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
       * @returns {Array}
       */
      yearRange: function(){
        var yearRangeArray = [];
        var currentYear = new Date().getFullYear();
        var rangeDiff = 3;
        for(var i=currentYear-rangeDiff; i<currentYear+1; i++){
          yearRangeArray.push(i);
        }
        return yearRangeArray;
      },
      /**
      *
       */
      productProfile: function(){
        return storageService.get(storageService.PRODUCT_PROFILE);
      },
      /**
       *
       * @param stockCountList
       * @returns {{}}
       */
      stockCountListByDate: function(stockCountList){
        var obj = {};
        for(var i=0; i < stockCountList.length; i++){
          var date = $filter('date')(stockCountList[i].countDate, 'yyyy-MM-dd');
          obj[date] = stockCountList[i];
        }
        return obj;
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
       * @param scope
       * @returns {boolean}
       */
      missingEntry: function(date, scope){
        var dueDateInfo = getDueDateInfo(scope.countInterval, scope.reminderDay, date);

        if(angular.isUndefined(scope.stockCountByDate[date])){
          var validateDate = ((isoDate(date) === isoDate()) ||
              ((isoDate(dueDateInfo.lastDay.toJSON()) >= isoDate(new Date().toJSON())) && parseInt(scope.countInterval, 10) !== 1) ||
              (isoDate(dueDateInfo.lastCountDate.toJSON()) === isoDate(date) && dueDateInfo.currentReminderDate.getTime() > new Date().getTime()));
          return (!validateDate);
        }
        return (!(scope.stockCountByDate[date].isComplete || isoDate(date) === isoDate()));
      },
      /**
       *
       * @param dueDateInfo
       * @returns {Array}
       */
      firstDate: function (dueDateInfo){
        var dates = [];
        if(dueDateInfo.reminderDate.getTime() < new Date().getTime()){
          dates.push(isoDate(dueDateInfo.reminderDate.toJSON()));
        }
        if(dueDateInfo.reminderDate.getTime() > new Date().getTime()){
          dates.push(isoDate(dueDateInfo.lastCountDate.toJSON()));
        }
        return dates;
      },
      /**
       *
       * @param dateActivated
       * @param reminderDay
       * @param interval
       * @returns {{}}
       */
      lastDate: function (dateActivated, reminderDay, interval){
        var dueDateInfo = utility.getWeekRangeByDate(new Date(dateActivated), reminderDay);
        return isoDate(dueDateInfo.reminderDate.toJSON()) <= isoDate(dateActivated) ? dueDateInfo.reminderDate : new Date(dueDateInfo.reminderDate.getTime() - interval);
      },
      /**
       *
       * @param scope
       */
      stockCountByIntervals: function(scope){
        var dueDateInfo = getDueDateInfo(scope.countInterval, scope.reminderDay);
        var lastDate = load.lastDate(scope.dateActivated, scope.reminderDay, dueDateInfo.interval);
        var dates = load.firstDate(dueDateInfo);
        while(dates.length < scope.maxList){
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
     * @param facility>
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
         * @param scope
         */
        editStatus: function(scope, date){
          // if the selected stock count date is not equals to today, then check if the last day of the
          // week the date fell is less than today and the count interval must not be daily

          if(isoDate() !== isoDate(scope.stockCount.countDate)){
            var dueDateInfo = getDueDateInfo(scope.countInterval, scope.reminderDay, date);
            var validateDate = (
                  isoDate(dueDateInfo.lastCountDate.toJSON()) === isoDate(date) &&
                  dueDateInfo.currentReminderDate.getTime() > new Date().getTime()) ||
                  ((isoDate(dueDateInfo.lastDay.toJSON()) >= isoDate()) && scope.countInterval !== 1
                );
            scope.editOff = (!validateDate) ;
          }
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
      validate: validate
    };
  });
