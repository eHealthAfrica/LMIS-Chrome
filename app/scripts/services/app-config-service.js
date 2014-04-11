'use strict'

angular.module('lmisChromeApp').service('appConfigService', function ($q, storageService, pouchdb, config, cacheConfig,
                                                                      productProfileFactory, facilityFactory,
                                                                      $cacheFactory) {

  this.APP_CONFIG = storageService.APP_CONFIG;
  this.cache = $cacheFactory(cacheConfig.id);
  var FACILITY_PROFILE_DB = 'app_facility_profile';

  this.stockCountIntervals = [
    {name: 'Daily', value: 1},
    {name: 'Weekly', value: 7},
    {name: 'Bi-Weekly', value: 14},
    {name: 'Monthly', value: 30}
  ];

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
      var promises = [];
      if (result === undefined) {
        promises.push(storageService.save(storageService.APP_CONFIG, appConfig));
      } else {
        //over-write appConfig by using existing appConfig uuid for the new appConfig.
        appConfig['uuid'] = result.uuid;
        promises.push(storageService.save(storageService.APP_CONFIG, appConfig));
      }

       $q.all(promises).then(function(results) {
        deferred.resolve(results);
       });
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
        remoteDB.get(email)
        .then(function(appFacilityProfile){

          var promises = {
              appFacility: facilityFactory.get(appFacilityProfile.appFacility),
              selectedProductProfiles: productProfileFactory.getBatch(appFacilityProfile.selectedProductProfiles)
          };

          $q.all(promises).then(function(result) {
            for(var key in result) {
              appFacilityProfile[key] = result[key];
            }
            deferred.resolve(appFacilityProfile);
          });

        }, function(reason){
          deferred.reject(reason);
        })
      }, function(reason){
        deferred.reject(reason);
      });
    return deferred.promise;
  };

    /**
   * copies an source array to target associate array(object array or key-pair )
   * @param source
   * @param target
   */
  this.generateAssociativeArray =  function(source){
    var target = {};
    for (var index in source) {
     var object = source[index];
     target[object.uuid] = object;
    }
    return target;
  };

  /**
   * This returns current app config from cache, if not available, it loads from storageService
   * @returns {promise|promise|*|promise|promise}
   */
  this.getCurrentAppConfig = function(){
    var deferred = $q.defer();
    var appConfig = this.cache.get(storageService.APP_CONFIG);
    console.log('app config'+JSON.stringify(appConfig));
    if(appConfig !== undefined){
      deferred.resolve(appConfig);
      console.log('pulled from cache');
    }else{
      console.log('pulled from storage service');
      storageService.get(storageService.APP_CONFIG).then(function (data) {
        if (data === undefined) {
          deferred.resolve(data);
        }else if (Object.keys(data).length === 1) {
          var appConfigUUID = Object.keys(data)[0];//get key of the first and only app config
          deferred.resolve(data[appConfigUUID ]);
        } else {
          throw 'there are more than one app config on this app.';
        }
      }, function (error) {
        deferred.reject(error);
      });
    }
    return deferred.promise
  };

});