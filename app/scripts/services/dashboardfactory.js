'use strict';

angular.module('lmisChromeApp')
  .factory('dashboardfactory', function(i18n, inventoryRulesFactory) {
    var keys = [
      {
        key: 'below',
        color: 'red',
        label: i18n('belowBuffer')
      },
      {
        key: 'buffer',
        color: 'yellow',
        label: i18n('buffer')
      },
      {
        key: 'safety',
        color: 'black',
        label: i18n('safetyStock')
      },
      {
        key: 'max',
        color: 'grey',
        label: i18n('max')
      }
    ];

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

    // FIXME: integrate with inventory rules
    var aggregateInventory = function(inventories, settings) {
      var aggregate = [], code = '', unique = {}, inventory = {};
      var buffers = inventoryRulesFactory.bufferStock(inventories);

      for(var i = buffers.length - 1; i >= 0; i--) {
        inventory = buffers[i];
        code = inventory.batch.product.code;
        if(!(code in unique)) {
          unique[code] = {
            label: code,
            below: 0,
            buffer: inventory.buffer,
            safety: 100,
            _max: settings.inventory.products[code].max
          };
        }
        else {
          unique[code].buffer = unique[code].buffer + inventory.buffer / 2;
        }
      }

      for(var key in unique) {
        aggregate.push(unique[key]);
      }

      return aggregate;
    };

    return {
      keys: keys,
      series: series,
      chart: chart,
      aggregateInventory: aggregateInventory
    };
  });
