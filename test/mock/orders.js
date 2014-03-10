'use strict';

angular.module('ordersMocks', [])
  // jshint camelcase: false
  .value('ordersMock', [
    {
      created: '2014-03-04T12:00:00Z',
      date_receipt: '2014-03-08'
    },
    {
      created: '2012-01-02',
      date_receipt: '2012-02-07'
    }
  ]);
