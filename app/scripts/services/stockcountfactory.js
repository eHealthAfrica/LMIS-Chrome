'use strict';

angular.module('lmisChromeApp')
    .factory('stockCountFactory', function ($q, storageService) {

    var discarded_reasons = {
        "0": "VVM Stage 3",
        "1": "Broken Vial",
        "2": "Label Missing",
        "3": "Unopened Expiry",
        "4": "Opened Expiry",
        "5": "Suspected Freezing",
        "6": "Other"
    }
    var program_products= [
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
    ]
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
       * @public
       */
        wastage: function(object){
           var deferred = $q.defer();

            storageService.insert('wastageCount', object).then(function(uuid){
                console.log(object);
                deferred.resolve(uuid);
            });
            return deferred.promise;
        }
    }
    var openedProductCount = function(StockObject, facility, year, month, day, product){
             var day = day < 10 ? '0' + day : day;
             var key = facility+year+month+day;
              //return key;
             var row = StockObject[key];
             if(Object.prototype.toString.call(row) === '[object Object]'){
                  if(Object.keys(row).indexOf('used_opened') !== -1){
                      if(Object.keys(row['used_opened']).indexOf(product.toString()) !== -1){
                        return row['used_opened'][product.toString()]
                      }
                  }
             }
        }
        var unOpenedProductCount = function(StockObject, facility, year, month, day, product){
               var day = day < 10 ? '0' + day : day;
                 var key = facility+year+month+day;
                  //return key;
                 var row = StockObject[key];
                 if(Object.prototype.toString.call(row) === '[object Object]'){
                      if(Object.keys(row).indexOf('used_unopened') !== -1){
                          if(Object.keys(row['used_unopened']).indexOf(product.toString()) !== -1){
                            return row['used_unopened'][product.toString()]
                          }
                      }
                 }
            }
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
                html += '<td>'+opened+'</td>';
                html += '<td>'+unopened+'</td>';
            }
            return html;
        },
        stockCountRow: function(uuid){
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
        wasteCountRow: function(uuid){
            var deferred = $q.defer();
            storageService.get('wastageCount', uuid)
                .then(function(wastageCount){
                    deferred.resolve(wastageCount);
                });
            return deferred.promise;
        }

    }

    return {
        programProducts: program_products,
        discardedReasons: discarded_reasons,
        save:addRecord,
        get:load
    };
  });
