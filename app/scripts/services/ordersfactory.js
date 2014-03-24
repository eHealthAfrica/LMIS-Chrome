'use strict';

angular.module('lmisChromeApp').factory('ordersFactory', function (storageService, $q) {
  // Public API here
  return {
    save: function (order) {
      var deferred = $q.defer();
      storageService.insert(storageService.ORDERS, order).then(function (result) {
        if (result !== undefined) {
          deferred.resolve(result);
        } else {
          deferred.reject('order saving failed');
        }
      });
      return deferred.promise;
    }
  };
});
