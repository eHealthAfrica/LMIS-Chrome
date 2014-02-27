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
    var load={
        allStockCount: function(){
            var deferred = $q.defer();
            storageService.all('stockCount')
                .then(function(stockCount){
                    deferred.resolve(stockCount);
                });
            return deferred.promise;
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
