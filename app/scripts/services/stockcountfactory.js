'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter, utility) {

    var discardedReasons = [
      'VVM Stage 3',
      'Broken Vial',
      'Label Missing',
      'Unopened Expiry',
      'Opened Expiry',
      'Suspected Freezing',
      'Other'
    ];

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

    var productType = function(){
      var deferred = $q.defer();
      storageService.get(storageService.PRODUCT_TYPES).then(function(productTypes){

        deferred.resolve(productTypes);
      });
      return deferred.promise;
    };

    /**
     * https://github.com/angular/angular.js/blob/master/src/ng/filter/filters.js#L238
     * @param year
     * @returns {Date}
     */
    function getFirstThursdayOfYear(year) {
        // 0 = index of January
        var dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
        // 4 = index of Thursday (+1 to account for 1st = 5)
        // 11 = index of *next* Thursday (+1 account for 1st = 12)
        return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
    }

    /**
     * https://github.com/angular/angular.js/blob/master/src/ng/filter/filters.js#L246
     * @param datetime
     * @returns {Date}
     */
    function getThursdayThisWeek(datetime) {
        return new Date(datetime.getFullYear(), datetime.getMonth(),
        // 4 = index of Thursday
        datetime.getDate() + (4 - datetime.getDay()));
    }

    /**
     * https://github.com/angular/angular.js/blob/master/src/ng/filter/filters.js#L252
     * @param date
     * @returns {number}
     */
    function getWeekNumber(date) {
       var firstThurs = getFirstThursdayOfYear(date.getFullYear()),
       thisThurs = getThursdayThisWeek(date);

       var diff = +thisThurs - +firstThurs,
       result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week

       return result;
    }


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
        validate.stock.countExist(object.countDate).then(function(stockCount){
          if(stockCount !== null){
            object.uuid = stockCount.uuid;
          }
          storageService.save(storageService.STOCK_COUNT, object).then(function(uuid){
            deferred.resolve(uuid);
          });
        });
        return deferred.promise;
      },
      /**
       * Add/Update Stock wastage count
       *
       * @param {object} Stock wastage Data.
       * @return {Promise} return promise object
       */
      waste: function(object){
        var deferred = $q.defer();
        if(object.countDate instanceof Date){
          object.countDate = object.countDate.toJSON();
        }
        validate.waste.countExist().then(function(wasteCount){
          if(wasteCount !== null){
            object.uuid = wasteCount.uuid;
          }
          storageService.save(storageService.WASTE_COUNT, object).then(function(uuid){
            deferred.resolve(uuid);
          });

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
      },
      waste: {
        countExist: function(date){
          return getWasteCountByDate(date);
        },
        /**
         * this function validate reason and save the current value if no error
         * @param scope
         * @param index
         */
        reason: function(scope, index){


          var currentReason = scope.wasteCount.reason[scope.productKey][index];

          var entryError = (validate.invalid(currentReason))?true:false;
          var errorMsg = [];


          if(entryError){
            errorMsg.push('invalid entry');
          }

          if(errorMsg.length > 0){
            scope.wasteErrors[scope.productKey][index] = true;
            scope.wasteErrorMsg[scope.productKey][index]= errorMsg.join('<br>');
          }
          else{
            delete scope.wasteErrors[scope.productKey][index];
            delete scope.wasteErrorMsg[scope.productKey][index];
          }
          //if any form field contain invalid data we need to indicate it indefinitely
          if(Object.keys(scope.wasteErrors[scope.productKey]).length > 0){
            scope.reasonError = true;
          }
          else{

            delete scope.wasteErrors[scope.productKey];
            delete scope.wasteErrorMsg[scope.productKey];
            scope.reasonError = false;
            scope.redirect = false;
            scope.wasteCount.lastPosition = scope.step;
            scope.wasteCount.discarded[scope.productKey] =  load.sumReasonObject(scope.wasteCount.reason[scope.productKey]);
            if(scope.wasteCount.reason[scope.productKey][index] === null){
              scope.wasteCount.reason[scope.productKey][index] = 0;
            }
            scope.save();
          }
        },
        changeState: function(scope, direction){
          scope.productKey = scope.facilityProductsKeys[scope.step];
          scope.currentEntry = scope.wasteCount.discarded[scope.productKey];
          if(validate.invalid(scope.currentEntry) && direction !== 0){
            load.errorAlert(scope, 1);
          }
          else if (scope.reasonError){
            load.errorAlert(scope, 2);
          }
          else{
            load.errorAlert(scope, 0);
            if(direction !== 2){
              scope.step = direction === 0? scope.step-1 : scope.step + 1;
              scope.open = false;
            }
            else{
              scope.preview = true;
              scope.wasteCount.isComplete = 1;
            }
          }
          scope.wasteCount.lastPosition = scope.step;
          scope.productKey = scope.facilityProductsKeys[scope.step];
          scope.selectedFacility = load.productReadableName(scope.facilityProducts, scope.step);
          scope.productTypeCode = load.productTypeCode(scope.facilityProducts, scope.step, scope.productType);
          if(angular.isUndefined(scope.wasteCount.reason[scope.productKey])){
            scope.wasteCount.reason[scope.productKey] = {};
          }
          for(var i in scope.discardedReasons){
            if(angular.isUndefined(scope.wasteCount.reason[scope.productKey][i])){
              scope.wasteCount.reason[scope.productKey][i] = 0;
            }
          }
          if(angular.isUndefined(scope.wasteCount.discarded[scope.productKey])){
            scope.wasteCount.discarded[scope.productKey] = 0;
          }
        }
      }

    };

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
      });
      return deferred.promise;
    };

    var getWasteCountByDate = function (date) {
      var deferred = $q.defer();
      storageService.all(storageService.WASTE_COUNT).then(function (wasteCounts) {
        var wasteCount = null;
        for (var index in wasteCounts) {
          var row = wasteCounts[index];
          var wasteCountDate = $filter('date')(new Date(row.countDate), 'yyyy-MM-dd');
          date = $filter('date')(new Date(date), 'yyyy-MM-dd');
          if (date === wasteCountDate) {
            wasteCount = row;
            break;
          }
        }
        deferred.resolve(wasteCount);
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
    }

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
      allWasteCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.WASTE_COUNT)
          .then(function(wastageCount){
            deferred.resolve(wastageCount);
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
       * @param object
       * @returns {number}
       */
      sumReasonObject: function (object){
        var sum = 0;
        for(var i in object){
          if(object[i] !== null && !isNaN(parseInt(object[i]))){
            sum += parseInt(object[i]);
          }
        }
        return sum;
      },

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
      yearRange: function(){
        var yearRangeArray = [];
        var currentYear = new Date().getFullYear();
        var rangeDiff = 3;
        for(var i=currentYear-rangeDiff; i<currentYear+1; i++){
          yearRangeArray.push(i);
        }
        return yearRangeArray;
      },
      productProfile: function(){
        return storageService.get(storageService.PRODUCT_PROFILE);
      },
      stockCountListByDate: function(stockCountList){
        var obj = {};
        for(var i=0; i < stockCountList.length; i++){
          var date = $filter('date')(stockCountList[i]['countDate'], 'yyyy-MM-dd');
          obj[date] = stockCountList[i];
        }
        return obj;
      },
      wasteCountByType: function(wasteCount){
        var arr = [];
        if(toString.call(wasteCount) === '[object Object]'){
          for(var i in wasteCount['discarded']){
            arr.push({
              header: true,
              value: wasteCount['discarded'][i],
              key: i
            });
            if((Object.keys(wasteCount['reason'][i])).length > 0){
              for(var j in wasteCount['reason'][i]){
                if(wasteCount['reason'][i][j] !== 0){
                  arr.push(
                    {
                      header: false,
                      value: wasteCount['reason'][i][j],
                      key: j
                    }
                  );
                }
              }
            }
          }
        }
        return arr;
      },
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
      missingEntry: function(date, scope){
        var reminderDate = utility.getWeekRangeByDate(new Date(date), scope.reminderDay);
        var lastDay = reminderDate.last;
        if(angular.isUndefined(scope.stockCountByDate[date])){
          if($filter('date')(date, 'yyyy-MM-dd') === $filter('date')(new Date(), 'yyyy-MM-dd')){
              return false;
           }
          else if (($filter('date')(lastDay.toJSON(), 'yyyy-MM-dd') >= $filter('date')(new Date().toJSON(),'yyyy-MM-dd')) && parseInt(scope.countInterval) !== 1){
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

        var reminderDate = utility.getWeekRangeByDate(new Date(), scope.reminderDay);
        var currentReminderDate = reminderDate.reminderDate;

        while(dates.length < scope.maxList){
          if($filter('date')(currentReminderDate.toJSON(), 'yyyy-MM-dd') <= $filter('date')(new Date(), 'yyyy-MM-dd')){
            dates.push($filter('date')(currentReminderDate.toJSON(), 'yyyy-MM-dd'));
          }
          currentReminderDate = new Date(currentReminderDate.getTime() - interval);
          if($filter('date')(currentReminderDate.toJSON(), 'yyyy-MM-dd') < $filter('date')(scope.dateActivated, 'yyyy-MM-dd')){
            break;
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
        this.allStockCount().then(function(res){
          var res = res.filter( function(e) { return e !== 'undefined' && e.facility == fUuid } );
          deferred.resolve(res);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      reminderDayFromDate: function(dayFromUrlParams, appConfig){
        if(dayFromUrlParams === null){
          var interval = 1000 * 60 * 60 * 24 * parseInt(appConfig.stockCountInterval);
          var reminderDate = utility.getWeekRangeByDate(new Date(), appConfig.reminderDay);
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
    var watchDiscardedEntries = function(scope){
      scope.$watchCollection('wasteCount.reason[productKey]', function(newValues, oldValues){
        if((Object.keys(newValues)).length > 0){
          for(var i in newValues){
            if(newValues[i] !== oldValues[i]){
              scope.checkInput(i);
            }
          }
        }
      });
    }
    return {
      monthList: months,
      productType: productType,
      discardedReasons: discardedReasons,
      save:addRecord,
      get:load,
      getStockCountByDate: getStockCountByDate,
      getWasteCountByDate: getWasteCountByDate,
      validate: validate,
      watchDiscarded: watchDiscardedEntries
    };
  });
