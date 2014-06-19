'use strict';

angular.module('lmisChromeApp')
  .factory('locationFactory', function($q, $window, $rootScope) {

    var getGeoLocation = function(){
      var deferred = $q.defer();
      if('geolocation' in $window.navigator){
        var geoLocation = $window.navigator.geolocation;
        deferred.resolve(geoLocation);
      }else{
        deferred.reject('geo-location is not available on this device.');
      }
      return deferred.promise;
    };

    var getCurrentPosition = function () {
      var deferred = $q.defer();

      getGeoLocation()
        .then(function (geoLocation) {
          var onSuccess = function (position) {
            deferred.resolve(position);
          };

          var onError = function (error) {
            deferred.reject(error);
          };

          geoLocation.getCurrentPosition(onSuccess, onError);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var getMiniGeoPosition = function(geoPos){
      var miniGeoPosInfo  = {
        latitude: geoPos.coords.latitude,
        longitude: geoPos.coords.longitude,
        accuracy: geoPos.coords.accuracy
      };
      return miniGeoPosInfo;
    };

    var NO_GEO_POS = { latitude: NaN, longitude: NaN, accuracy: NaN };

    return {
      NO_GEO_POS: NO_GEO_POS,
      getCurrentPosition: getCurrentPosition,
      getMiniGeoPosition: getMiniGeoPosition
    };

  });
