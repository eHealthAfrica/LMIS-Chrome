'use strict'

angular.module('lmisChromeApp').service('appConfigService', function () {

  this.stockCountIntervals = [
    {name: 'Daily', value: 1},
    {name: 'Weekly', value: 7},
    {name: 'Bi-Weekly', value: 14},
    {name: 'Monthly', value: 30}
  ];

  this.setup = function (appConfig) {
    console.log(appConfig);
  };
});