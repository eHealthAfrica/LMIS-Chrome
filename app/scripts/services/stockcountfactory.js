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
          var stockCountDate = $filter('date')(new Date(row.countDate), 'yyyy-MM-dd');
          date = $filter('date')(new Date(date), 'yyyy-MM-dd');
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
          if(sc !== 'undefined')
            sc.synced = isSynced(sc);
          return sc;
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
         $filter('date')(sc.dateSynced, 'yyyy-MM-dd') >= $filter('date')(sc.modified, 'yyyy-MM-dd'));
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
       /*
       *
       */
      locations: function(){
        var deferred = $q.defer();
        var fileUrl = 'scripts/fixtures/locations.json';
        $http.get(fileUrl).success(function (data){
          deferred.resolve(data);
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
       /*
       *
       */
      productTypeCode: function(productObject, index, productType){
        var currentProductUuid = this.currentProductObject(productObject, index).product;
        return productType[currentProductUuid];
      },
      /*
       *
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
        var currentReminderDate = utility.getWeekRangeByDate(new Date(), scope.reminderDay).reminderDate;
        var reminderDate = utility.getWeekRangeByDate(new Date(date), scope.reminderDay);
        var lastDay = reminderDate.last;
        var lastCountDate = new Date(currentReminderDate.getTime() - (1000 * 60 * 60 * 24 * scope.countInterval));

        if(angular.isUndefined(scope.stockCountByDate[date])){
          if($filter('date')(date, 'yyyy-MM-dd') === $filter('date')(new Date(), 'yyyy-MM-dd')){
            return false;
          }
          else if ((isoDate(lastDay.toJSON()) >= isoDate(new Date().toJSON())) && parseInt(scope.countInterval) !== 1){
            return false;
          }
          else if(isoDate(lastCountDate.toJSON()) === isoDate(date) && currentReminderDate.getTime() > new Date().getTime()){
            return false;
          }
          else{
            return true;
          }
        }
        else{
          if(scope.stockCountByDate[date].isComplete || $filter('date')(date, 'yyyy-MM-dd') === $filter('date')(new Date(), 'yyyy-MM-dd')){
            return false;
          }
          return true;
        }
      },
      /**
       *
       * @param scope
       */
      stockCountByIntervals: function(scope){

        var dates = [];
        var interval = 1000 * 60 * 60 * 24 * parseInt(scope.countInterval);

        var reminderDate = utility.getWeekRangeByDate(new Date(), scope.reminderDay).reminderDate;
        var currentReminderDate = angular.copy(reminderDate);
        var lastCountDate = new Date(currentReminderDate.getTime() - 1000 * 60 * 60 * 24 * parseInt(scope.countInterval));
        if(reminderDate.getTime() < new Date().getTime()){
          dates.push(isoDate(reminderDate.toJSON()));
        }
        if(reminderDate.getTime() > new Date().getTime()){
          dates.push(isoDate(lastCountDate.toJSON()));
        }
        while(dates.length < scope.maxList){
          currentReminderDate = new Date(currentReminderDate.getTime() - interval);
          if(currentReminderDate.getTime() < new Date(scope.dateActivated).getTime()){
            break;
          }
          dates.push(isoDate(currentReminderDate.toJSON()));
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
          var interval = 1000 * 60 * 60 * 24 * parseInt(appConfig.stockCountInterval); //convert interval to day
          var reminderDate = utility.getWeekRangeByDate(new Date(), appConfig.reminderDay);
          // if the selected stock count date is not equals to today, then check if the last day of the
          // week the date fell is less than today and the count interval must not be daily
          if($filter('date')(new Date().toJSON(), 'yyyy-MM-dd') < $filter('date')(reminderDate.reminderDate.toJSON(), 'yyyy-MM-dd')){
            var newDate = new Date(reminderDate.reminderDate.getTime() - interval);
            return $filter('date')(newDate.toJSON(), 'dd');
          }
          else{
            return $filter('date')(reminderDate.reminderDate.toJSON(), 'dd');
          }
        }
        return dayFromUrlParams;
      }

    };
    var setter= {
      stock: {
        /**
         * this function sets the edit status for selected stock count detail
         * @param scope
         */
        editStatus: function(scope, date){
          // if the selected stock count date is not equals to today, then check if the last day of the
          // week the date fell is less than today and the count interval must not be daily

          if(isoDate() !== isoDate(scope.stockCount.countDate)){
            var currentReminderDate = utility.getWeekRangeByDate(new Date(), scope.reminderDay).reminderDate;
            var reminderDate = utility.getWeekRangeByDate(new Date(scope.stockCount.countDate), scope.reminderDay);
            var lastDay = reminderDate.last;
            var lastCountDate = new Date(currentReminderDate.getTime() - (1000 * 60 * 60 * 24 * scope.countInterval));
            if (($filter('date')(lastDay.toJSON(), 'yyyy-MM-dd') >= $filter('date')(new Date().toJSON(),'yyyy-MM-dd')) && parseInt(scope.countInterval) !== 1){
              scope.editOff = false;
            }
            else if (isoDate(lastCountDate.toJSON()) === isoDate(date) && currentReminderDate.getTime() > new Date().getTime()){
              scope.editOff = false;
            }
            else{
              scope.editOff = true;
            }
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
