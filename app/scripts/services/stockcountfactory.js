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
          new Date(sc.dateSynced) >= new Date(sc.modified));
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
          var date = $filter('date')(stockCountList[i]['countDate'], 'yyyy-MM-dd');
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
        var reminderDate = utility.getWeekRangeByDate(new Date(date), scope.reminderDay);
        var lastDay = reminderDate.last;
        if(angular.isUndefined(scope.stockCountByDate[date])){
          if($filter('date')(date, 'yyyy-MM-dd') === $filter('date')(new Date(), 'yyyy-MM-dd')){
              return false;
           }
          else if ($filter('date')(lastDay.toJSON(), 'yyyy-MM-dd') >= $filter('date')(new Date().toJSON(),'yyyy-MM-dd')){
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
        var current = reminderDate.reminderDate;

        while(dates.length < scope.maxList){
          if($filter('date')(current.toJSON(), 'yyyy-MM-dd') <= $filter('date')(new Date(), 'yyyy-MM-dd')){
            dates.push($filter('date')(current.toJSON(), 'yyyy-MM-dd'));
          }
          current = new Date(current.getTime() - interval);
          if($filter('date')(current.toJSON(), 'yyyy-MM-dd') < $filter('date')(scope.dateActivated, 'yyyy-MM-dd')){
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
          var res = res.filter( function(e) { return e !== 'undefined' && e.facility === fUuid } );
          deferred.resolve(res);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

    };

    return {
      monthList: months,
      productType: productType,
      save:addRecord,
      get:load,
      getStockCountByDate: getStockCountByDate,
      validate: validate,
    };
  });
