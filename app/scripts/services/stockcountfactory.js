'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http) {

    var discardedReasons = {
      '0': 'VVM Stage 3',
      '1': 'Broken Vial',
      '2': 'Label Missing',
      '3': 'Unopened Expiry',
      '4': 'Opened Expiry',
      '5': 'Suspected Freezing',
      '6': 'Other'
    };

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

    var programProducts= [
      'BCG doses',
      'BCG Diluent',
      'Hep.B doses',
      'OPV doses',
      'PENTA doses',
      'PCV doses',
      'Measles doses',
      'Measles Diluent',
      'Yellow Fever doses',
      'Yellow Fever Diluent',
      'CSM doses',
      'CSM Diluent',
      'Tetanus Toxoid doses',
      'BCG Syringes',
      'Auto Disable Syringes',
      '5mls Syringes',
      'Safety boxes'
    ];
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

        storageService.insert('stockCount', object).then(function(uuid){
          deferred.resolve(uuid);
        });
        return deferred.promise;
      },
      /**
       * Add/Update Stock wastage count
       *
       * @param {object} Stock wastage Data.
       * @return {Promise} return promise object
       */
      wastage: function(object){
        var deferred = $q.defer();

        storageService.insert('wastageCount', object).then(function(uuid){
          deferred.resolve(uuid);
        });
        return deferred.promise;
      }
    };

    var openedProductCount = function(StockObject, facility, year, month, _day, product){
      var day = _day < 10 ? '0' + _day : _day;
      var key = facility+year+month+day;
      //return key;
      var row = StockObject[key];
      if(Object.prototype.toString.call(row) === '[object Object]'){
        if(Object.keys(row).indexOf('opened') !== -1){
          if(Object.keys(row['opened']).indexOf(product.toString()) !== -1){
            return row['opened'][product.toString()];
          }
        }
      }
    };

    var unOpenedProductCount = function(StockObject, facility, year, month, _day, product){
      var day = _day < 10 ? '0' + _day : _day;
      var key = facility+year+month+day;
      var row = StockObject[key];
      if(Object.prototype.toString.call(row) === '[object Object]'){
        if(Object.keys(row).indexOf('unopened') !== -1){
          if(Object.keys(row['unopened']).indexOf(product.toString()) !== -1){
            return row['unopened'][product.toString()];
          }
        }
      }
    };

    var validate = {
     /*
      * I'm going to assume any value entered that is not a number is invalid
      */
      invalid: function(entry){
        return !!((entry === '' || angular.isUndefined(entry) || !angular.isNumber(parseInt(entry)) || entry < 0));
      }
    };

    var load={
      allStockCount: function(){
        var deferred = $q.defer();
        storageService.all('stockCount')
          .then(function(stockCount){
            deferred.resolve(stockCount);
          });
        return deferred.promise;
      },
      createStockObject: function(stockCount){
        var stockObject = {};
        for(var i in stockCount){
          var key = stockCount[i].facility+stockCount[i].year.toString()+stockCount[i].month.toString()+stockCount[i].day.toString();
          stockObject[key] = stockCount[i];
        }
        return stockObject;
      },
      stockCountColumnData: function(programProducts, StockObject, facility, year, month, day){

        var html = '<td>'+day+'</td>';
        for(var i=0; i<programProducts.length; i++){
          var opened = openedProductCount(StockObject, facility, year, month, day, i);
          var unopened = unOpenedProductCount(StockObject, facility, year, month, day, i);
          opened = angular.isUndefined(opened)?'':opened;
          unopened = angular.isUndefined(unopened)?'':unopened;
          //html += '<td>'+opened+'</td>';
          html += '<td>'+unopened+'</td>';
        }
        return html;
      },
      stockCountRow: function(uuid){
        var deferred = $q.defer();
        storageService.get('stockCount', uuid)
          .then(function(stockCount){
            deferred.resolve(stockCount);
          });
        return deferred.promise;
      },
      allWasteCount: function(){
        var deferred = $q.defer();
        storageService.all('wastageCount')
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
      wasteCountRow: function(uuid){
        var deferred = $q.defer();
        storageService.get('wastageCount', uuid)
          .then(function(wastageCount){
            deferred.resolve(wastageCount);
          });
        return deferred.promise;
      },
      userFacilities: function(){
        /*
         * load some none standard fixtures
         * @param {void}.
         * @return {Promise} return promise object
         */
        var deferred = $q.defer();
        var fileUrl = 'scripts/fixtures/user_related_facilities.json';
        $http.get(fileUrl).success(function (data) {
          deferred.resolve(data);
        });
        return deferred.promise;
      },
      locations: function(){
        var deferred = $q.defer();
        var fileUrl = 'scripts/fixtures/locations.json';
        $http.get(fileUrl).success(function (data){
          deferred.resolve(data);
        });
        return deferred.promise;
      }
    };
    return {
      programProducts: programProducts,
      monthList: months,
      discardedReasons: discardedReasons,
      save:addRecord,
      get:load,
      validate: validate
    };
  });
