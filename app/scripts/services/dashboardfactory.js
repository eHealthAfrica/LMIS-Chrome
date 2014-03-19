'use strict';

angular.module('lmisChromeApp')
  .factory('dashboardfactory', function($q, $translate) {
    var keys = function() {
      var keys = [
        {
          key: 'below',
          color: 'red'
        },
        {
          key: 'buffer',
          color: 'yellow'
        },
        {
          key: 'safety',
          color: 'black'
        },
        {
          key: 'max',
          color: 'grey'
        }
      ];

      var deferred = $q.defer();

      var promises = [
        $translate('belowBuffer'),
        $translate('buffer'),
        $translate('safetyStock'),
        $translate('max')
      ];

      $q.all(promises)
        .then(function(result) {
          for(var i = result.length - 1; i >= 0; i--) {
            keys[i].label = result[i];
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
      for (var i = 0, len = keys.length; i < len; i++) {
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
