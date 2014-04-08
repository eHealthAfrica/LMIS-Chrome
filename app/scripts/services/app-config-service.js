'use strict'

angular.module('lmisChromeApp').service('appConfigService', function ($q, storageService, pouchdb, config) {

  this.APP_CONFIG = storageService.APP_CONFIG;
  var FACILITY_PROFILE_DB = 'app_facility_profile';

  this.stockCountIntervals = [
    {name: 'Daily', value: 1},
    {name: 'Weekly', value: 7},
    {name: 'Bi-Weekly', value: 14},
    {name: 'Monthly', value: 30}
  ];

  var createAppConfig = function (appConfig) {
    var deferred = $q.defer();
    storageService.save(storageService.APP_CONFIG, appConfig).then(function (insertionResult) {
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

  var removeProductProfileFrom =  function(productProfile, selectedProductProfiles) {
    return selectedProductProfiles.filter(function (prodProf) {
      return prodProf.uuid !== productProfile.uuid;
    });
  };

  this.addProductProfile = function(selection, selectedProductProfiles){
   var productProfile = JSON.parse(selection);
   if(productProfile.deSelected === undefined){
     selectedProductProfiles.push(productProfile);
     return selectedProductProfiles;
   }
   return removeProductProfileFrom(productProfile, selectedProductProfiles);
  };

  this.getAppFacilityProfileByEmail = function(email){
    var deferred = $q.defer();
    var REMOTE = config.api.url + '/' + FACILITY_PROFILE_DB;
    var remoteDB = pouchdb.create(REMOTE);
    remoteDB.info()
      .then(function(result){
        console.log(result);
        remoteDB.get('national_store@gmail.com')
        .then(function(appFacilityProfile){
          deferred.resolve(appFacilityProfile);
          console.log('found');
        }, function(reason){
          console.log('not found');
          deferred.reject(reason);
        });
      }, function(reason){
          console.log('error here');
        deferred.reject(reason);
      });
    return deferred.promise;
  };


});