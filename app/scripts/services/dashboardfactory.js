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

    // Transposes chart values into nvd3 chart values format (an array of
    // [x, y] data points).
    var transposeValues = function(key, values) {
      var value = {}, _values = [];
      for(var i = values.length - 1; i >= 0; i--) {
        value = values[i];
        if (key === 'max') {
          value[key] = value._max - (value.buffer + value.safety);
        }
        _values.push([value.label, value[key]]);
      }
      return _values;
    };

    var series = function(key, values) {
      var series = {
        key: key.label,
        color: key.color,
        values: transposeValues(key.key, values)
      };

      return series;
    };

    var chart = function(keys, values) {
      var chart = [];
      for(var i = keys.length - 1; i >= 0; i--) {
        chart.push(series(keys[i], values));
      }
      return chart;
    };

    return {
      keys: keys,
      series: series,
      chart: chart
    };
  });
