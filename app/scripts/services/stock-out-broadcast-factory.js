'use strict';

angular.module('lmisChromeApp').factory('stockOutBroadcastFactory', function(storageService, $q) {

  var saveStockOut = function(stockOut){
    var deferred = $q.defer();
    storageService.insert(storageService.STOCK_OUT, stockOut).then(function(result){
      deferred.resolve(result);
    }, function(reason){
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  return {
    save: saveStockOut
  };

});
