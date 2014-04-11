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



          var reasonSum = load.sumReasonObject(scope.wasteCount.reason[scope.productKey]);
          var wasteCountEntry = scope.wasteCount.discarded[scope.productKey];
          var currentReason = scope.wasteCount.reason[scope.productKey][index];
          if(validate.invalid(wasteCountEntry)){
            wasteCountEntry = 0;
          }
          //compare the sum of all values entered for reason with total count, if -
          //reason is greater, then throw error msg
          var sumError = !!((reasonSum > wasteCountEntry));

          var entryError = (validate.invalid(currentReason))?true:false;
          var errorMsg = [];

          if(sumError){

            if(angular.isUndefined(scope.sumErrorIndex)){
              scope.sumErrorIndex = {};
            }
            if(currentReason !== 0 && currentReason !== null){
              if(angular.isUndefined(scope.sumErrorIndex[scope.productKey])){
                scope.sumErrorIndex[scope.productKey] = []
              }
              scope.sumErrorIndex[scope.productKey].push(index);
              errorMsg.push("Please check entry: Reason figure can not be than waste count ");
            }

          }
          else{
            if(angular.isDefined(scope.sumErrorIndex)){
              if(angular.isDefined(scope.sumErrorIndex[scope.productKey])){
                for(var i in scope.sumErrorIndex[scope.productKey]){
                  delete scope.wasteErrorMsg[scope.productKey][i];
                  delete scope.wasteErrors[scope.productKey][i];
                }
              }
            }

          }
          if(entryError){
            errorMsg.push("invalid entry");
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
            if(!validate.invalid(wasteCountEntry)){
              scope.productErrorMsg = '';
              scope.productError = false;
            }
            delete scope.wasteErrors[scope.productKey];
            delete scope.wasteErrorMsg[scope.productKey];
            scope.reasonError = false;
            scope.redirect = false;
            scope.wasteCount.lastPosition = scope.step;
            scope.save();
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

    var addSyncStatus= function(stockCount)
    {
      return stockCount.map(function (sc) { 
        
        console.log(sc.dateSynced +' '+ sc.modified);
        sc.synced = isSynced(sc); 
        return sc; 
      });
    }

    var isSynced = function(sc)
    { 
      /* TODO: decide on the best way of determining this. If dateSynced is set in the db
        we can be pretty sure it's accurate but right now there's no db feedback being saved
        localy */
      return (sc.dateSynced && sc.modified && 
          new Date(sc.dateSynced) >= new Date(sc.modified));
    }

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
          if(object[i] != null && !isNaN(parseInt(object[i]))){
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
          day = day < 10 ? "0"+day : day;
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
        console.log(stockCountList);
        var obj = {};
        for(var i=0; i < stockCountList.length; i++){
          var date = $filter('date')(stockCountList[i]['countDate'], 'yyyy-MM-dd');
          obj[date] = stockCountList[i];
        }
        return obj;
      }
    };
    return {
      monthList: months,
      productType: productType,
      discardedReasons: discardedReasons,
      save:addRecord,
      get:load,
      getStockCountByDate: getStockCountByDate,
      getWasteCountByDate: getWasteCountByDate,
      validate: validate
    };
  });