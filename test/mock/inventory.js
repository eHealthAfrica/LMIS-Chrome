'use strict';

angular.module('inventoriesMocks', [])
  .value('inventoriesMock', [
    {
      quantity: 225,
      batch: {
        product: {
          code: 'BCG'
        }
      }
    },
    {
      quantity: 345,
      batch: {
        product: {
          code: 'BCG'
        }
      }
    },
    {
      quantity: 100,
      batch: {
        product: {
          code: 'Men-A'
        }
      }
    }
  ]);
