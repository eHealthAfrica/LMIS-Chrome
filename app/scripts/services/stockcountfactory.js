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
          storageService.insert(storageService.STOCK_COUNT, object).then(function(uuid){
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
          storageService.insert(storageService.WASTE_COUNT, object).then(function(uuid){
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
        reason: function(scope, index){
          if(angular.isUndefined(scope.wasteErrors[scope.productKey])){
            scope.wasteErrors[scope.productKey] = {};
          }
          scope.currentReason = scope.wasteCount.reason[scope.productKey][index];
          if(validate.invalid(scope.currentReason)){
            scope.wasteErrors[scope.productKey][index] = true;
          }
          else{
            delete scope.wasteErrors[scope.productKey][index];
          }

          if(Object.keys(scope.wasteErrors[scope.productKey]).length > 0){
            scope.reasonError = true;
          }
          else{
            scope.reasonError = false;
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

    var load={
      /*
       *
       */
      allStockCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.STOCK_COUNT)
          .then(function(stockCount){
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
       * load a single row from waste count table
       * @param {uuid} .
       * @return {Promise} return promise object
       */

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
       /*
       *
       */
      //TODO: use utility service function
      readableName: function(name) {
        return name.replace(/\-/g,' - ').replace(/([0-9])([a-zA-Z])/g,'$1 $2').replace(/([a-z][a-z])([A-Z])/g,'$1 $2');
      },
       /*
       *
       */
      currentProductObject: function(productObject, index){

        return productObject[[index]];
      },
       /*
       *
       */
      productReadableName: function(productObject, index){

        var productName = this.currentProductObject(productObject, index).name;
        return this.readableName(productName);
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
      errorAlert: function(scope, error){
        if(error){
          scope.productError = true;
          scope.productErrorMsg = 'count value is invalid, at least enter Zero "0" to proceed';
        }
        else{
          scope.productError = false;
          scope.productErrorMsg = '';
        }
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
