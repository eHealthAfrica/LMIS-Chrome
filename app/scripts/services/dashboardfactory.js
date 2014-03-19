'use strict';

angular.module('lmisChromeApp')
  .factory('dashboardfactory', function($q, $translate) {
    var keys = function() {
      var keys = {
        below: {
          color: 'red'
        },
        buffer: {
          color: 'yellow'
        },
        safety: {
          color: 'black'
        },
        max: {
          color: 'grey'
        }
      };

      var deferred = $q.defer();

      var promises = {
        below: $translate('belowBuffer'),
        buffer: $translate('buffer'),
        safety: $translate('safetyStock'),
        max: $translate('max')
      };

      $q.all(promises)
        .then(function(result) {
          for(var key in result) {
            keys[key].label = result[key];
          }
          deferred.resolve(keys);
        })
        .catch(function(reason) {
          deferred.reject('Unable to translate chart keys, see: ' + reason);
        });

      return deferred.promise;
    };

    var series = function() {
      return {};
    };

    var chart = function() {
      return [];
    };

    return {
      keys: keys,
      series: series,
      chart: chart
    };
  });
