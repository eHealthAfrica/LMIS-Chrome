'use strict';

angular.module('inventoriesMocks', [])
  // jshint camelcase: false
  .value('inventoriesMock', [
    {
      created: '2014-02-12T09:17:08Z',
      date_receipt: '2014-02-13',
      quantity: 225,
      batch: {
        product: {
          code: 'BCG'
        }
      }
    },
    {
      created: '2014-03-09',
      date_receipt: '2014-04-01',
      quantity: 345,
      batch: {
        product: {
          code: 'BCG'
        }
      }
    },
    {
      created: '2014-01-01',
      date_receipt: '2014-02-01',
      quantity: 100,
      batch: {
        product: {
          code: 'Men-A'
        }
      }
    }
  ]);
