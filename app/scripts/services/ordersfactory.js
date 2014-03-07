'use strict';

angular.module('lmisChromeApp')
  .factory('ordersFactory', function (storageService, $q) {

    // Public API here
    return {
      save: function(order){
        var deferred = $q.defer();
        storageService.insert(storageService.ORDERS, order).then(function(result){
          (result !== undefined)? deferred.resolve(result): deferred.reject("order saving failed");
        });
        return deferred.promise;
      }
    };
  });
