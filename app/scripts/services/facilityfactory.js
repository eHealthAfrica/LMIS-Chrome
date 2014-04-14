'use strict';

angular.module('lmisChromeApp').factory('facilityFactory', function ($q, $rootScope, storageService) {

  /**
   * This returns facility object of a given facility uuid.
   *
   * @param uuid
   * @returns {promise|promise|*|Function|promise}
   */
  var getByUUID = function (uuid) {
    var deferred = $q.defer();
    storageService.find(storageService.FACILITY, uuid).then(function (data) {
      var facility = data;
      if (facility !== undefined) {
        //TODO: add nested attributes such as facility type, location etc when their factories are ready
      }
      deferred.resolve(facility);
    });
    return deferred.promise;
  };

  var decorate = function(facility)
  {
    facility.stockCounts = stockCountFactory.getByFacilityUUID(facility.uuid);
  }

  /**
   * This function returns a collection of facility objects.
   *
   * @returns {promise|promise|*|Function|promise}
   */
  var getAllFacilities = function () {
    var deferred = $q.defer();

    storageService.all(storageService.FACILITY).then(function (facilities) {
      deferred.resolve(facilities);
    }, function(error){
      deferred.reject(error);
    });

    return deferred.promise;
  };

  // Public API here
  return {
    getAll: getAllFacilities,
    get: getByUUID
  };
});
