'use strict'

angular.module('lmisChromeApp').service('appConfigService', function ($q, storageService) {

  this.stockCountIntervals = [
    {name: 'Daily', value: 1},
    {name: 'Weekly', value: 7},
    {name: 'Bi-Weekly', value: 14},
    {name: 'Monthly', value: 30}
  ];

  var createAppConfig = function (appConfig) {
    var deferred = $q.defer();
    storageService.insert(storageService.APP_CONFIG, appConfig).then(function (insertionResult) {
      deferred.resolve(insertionResult);
    }, function (reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  /**
   * This function setups or configures the app, it checks if a configuration exist then over-writes it, else,
   * it creates a new configuration.
   *
   * @param appConfig
   * @returns {promise|promise|*|Function|promise}
   */
  this.setup = function (appConfig) {
    var deferred = $q.defer();
    this.load().then(function (result) {
      if (result === undefined) {
        //app config does not exist already
        createAppConfig(appConfig).then(function (result) {
          deferred.resolve(result);
        }, function (reason) {
          deferred.reject(reason);
        });

      } else {
        //over-write appConfig by using existing appConfig uuid for the new appConfig.
        appConfig['uuid'] = result.uuid;
        createAppConfig(appConfig).then(function (result) {
          deferred.resolve(result);
        }, function (reason) {
          deferred.reject(reason);
        });
      }
    });
    return deferred.promise;
  };

  this.load = function () {
    var deferred = $q.defer();
    storageService.get(storageService.APP_CONFIG).then(function (data) {
      if (data === undefined) {
        deferred.resolve(data);
        return;
      }
      if (Object.keys(data).length === 1) {
        var appConfigUUID = Object.keys(data)[0];//get key of the first and only app config
        deferred.resolve(data[appConfigUUID ]);
      } else {
        throw 'there are more than one app config on this app.';
      }
    }, function (error) {
      deferred.reject(error);
    });
    return deferred.promise;
  };

});