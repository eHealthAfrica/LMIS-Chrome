'use strict';

angular.module('lmisChromeApp')
    .factory('uomFactory', function ($q, storageService, trackingFactory, utility) {

      var getByUuid = function(uuid) {
        var deferred = $q.defer();
        //TODO: attach nested objects
        var uuid = utility.getStringUuid(uuid);
        storageService.find(storageService.UOM, uuid)
            .then(function (data) {
              deferred.resolve(data);
            })
            .catch(function(reason){
              deferred.reject(reason);
              trackingFactory.tracker.sendException(reason, false);
            });
        return deferred.promise;
      };

      var getAllUom = function () {
        var deferred = $q.defer(), uomList = [];
        storageService.all(storageService.UOM).then(function (data) {
          for(var index in data){
            var uom = data[index];
            var uuid =  utility.getStringUuid(uom);
            uomList.push(getByUuid(uuid));
          }

          $q.all(uomList)
              .then(function (results) {
                deferred.resolve(results);
              }).catch(function (reason) {
                deferred.reject(reason);
              });
        });
        return deferred.promise;
      };

      // Public API here
      return {
        getAll: getAllUom,
        get: getByUuid
      };

    });
