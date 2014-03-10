'use strict';

angular.module('ordersMocks', [])
  // jshint camelcase: false
  .value('ordersMock', [
    {
      created: '2014-03-04T12:00:00Z',
      date_receipt: '2014-03-08',
      consumption: 10
    }
  ]);
