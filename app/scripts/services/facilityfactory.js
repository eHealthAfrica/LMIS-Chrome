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

  /**
   * This function returns a collection of facility objects.
   *
   * @returns {promise|promise|*|Function|promise}
   */
  var getAllFacilities = function () {
    var deferred = $q.defer(),
        facilities = [];

    storageService.all(storageService.FACILITY).then(function (data) {
      angular.forEach(data, function (datum) {
        if (datum !== undefined) {
          facilities.push(getByUUID(datum.uuid).then(function (facility) {
            deferred.notify(datum);
            return facility;
          }));
        }
      });

      $q.all(facilities).then(function (results) {
        deferred.resolve(results);
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    });
    return deferred.promise;
  };

  /**
   * This return facility facility of logged in user.
   *
   * @returns {promise|promise|*|Function|promise}
   */
  var getCurrentFacility = function () {
    //TODO: replace with facility of current logged in user when we have the
    //session and authentication working.
    var deferred = $q.defer();
    getByUUID('d48a39fb-6d37-4472-9983-bc0720403719').then(function (data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  };

  // Public API here
  return {
    getAll: getAllFacilities,
    get: getByUUID,
    getCurrentFacility: getCurrentFacility
  };
});
