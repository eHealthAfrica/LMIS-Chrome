'use strict';

angular.module('seriesMocks', [])
  .value('seriesKeysMock', [
    {
      key: 'below',
      label: 'Below buffer',
      color: 'red'
    },
    {
      key: 'buffer',
      label: 'Buffer',
      color: 'yellow'
    },
    {
      key: 'safety',
      label: 'Safety stock',
      color: 'black'
    },
    {
      key: 'max',
      label: 'Max',
      color: 'grey'
    }
  ])
  .value('seriesValuesMock', [
    {
      label: 'BCG',
      below: -19,
      buffer: 405,
      safety: 0,
      _max: 1000
    },
    {
      label: 'TT',
      below: 0,
      buffer: 348,
      safety: 384,
      _max: 1500
    },
    {
      label: 'Penta',
      below: 0,
      buffer: 310,
      safety: 272,
      _max: 1200
    }
  ])
  .value('$window', {
    chrome: {
      storage: {
        local: {
          get: function() {},
          set: function() {},
          clear: function() {},
          remove: function() {}
        }
      },
      i18n: {
        getMessage: function() {}
      },
    },
    addEventListener: function() {}
  });
