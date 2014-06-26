'use strict';

angular.module('lmisChromeApp').service('appConfigService', function ($q, storageService, pouchdb, config, syncService, analyticsSyncService,
                                                                      productProfileFactory, facilityFactory, utility,
                                                                      cacheService, $filter, reminderFactory, growl, i18n, $http, memoryStorageService) {

  this.APP_CONFIG = storageService.APP_CONFIG;

  this.stockCountIntervals = [
    {name: 'Daily', value: reminderFactory.DAILY},
    {name: 'Weekly', value: reminderFactory.WEEKLY},
    {name: 'Bi-Weekly', value: reminderFactory.BI_WEEKLY},
    {name: 'Monthly', value: reminderFactory.MONTHLY}
  ];

  this.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * This function setups or configures the app, it checks if a configuration exist then over-writes it, else,
   * it creates a new configuration.
   *
   * @param appConfig
   * @returns {promise|promise|*|Function|promise}
   */
  var saveAppConfig = function (appConfig, shouldSync) {
    var deferred = $q.defer();

    appConfig.facility.reminderDay = parseInt(appConfig.facility.reminderDay); //cast to integer in case it is a string
    appConfig.facility.stockCountInterval = parseInt(appConfig.facility.stockCountInterval);
    var appConfigCopy;
    getAppConfigFromMemoryOrStorage().then(function (existingAppConfig) {
      if(typeof existingAppConfig === 'undefined'){
        appConfigCopy = appConfig;
      }else{
        //update app config by merging both fields.
        appConfigCopy = utility.copy(appConfig, existingAppConfig);
      }

      if(typeof appConfigCopy.dateActivated === 'undefined'){
        appConfigCopy.dateActivated = new Date().toJSON();
      }

      storageService.save(storageService.APP_CONFIG, appConfigCopy)
        .then(function(){
          //update memory copy.
          memoryStorageService.put(storageService.APP_CONFIG, appConfigCopy);

          deferred.resolve(appConfigCopy);

          if (shouldSync !== false) {
            //sync app config in the background.
            syncService.syncItem(storageService.APP_CONFIG, appConfigCopy);
          }

        })
        .catch(function(reason){
          deferred.reject(reason);
        });
    })
    .catch(function(reason){
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  this.setup = function(appConfig, shouldSync){
    return saveAppConfig(appConfig, shouldSync);
  };

  var getAppConfigFromMemory = function () {
    var appConfigDb = memoryStorageService.getDatabase(storageService.APP_CONFIG);
    var appConfig;
    if(typeof appConfigDb === 'undefined'){
      return appConfig;
    }
    var keys = Object.keys(appConfigDb);
    if (keys.length === 1) {
      var key = keys[0];
      appConfig = appConfigDb[key];
    } else if (keys.length > 1) {
      throw 'there should be only one app config on this device.';
    }
    return appConfig;
  };

  this.getAppFacilityProfileByEmail = function (email) {
    var deferred = $q.defer();
    var REMOTE_URI = config.api.url + '/facilities/_design/config/_view/template?key="' + email + '"';
    REMOTE_URI = encodeURI(REMOTE_URI);
    $http.get(REMOTE_URI)
      .then(function (res) {
        var rows = res.data.rows;
        if (rows.length > 0) {
          var facilityProfile = rows[0].value;//pick the first facility profile.
          facilityProfile.selectedProductProfiles = productProfileFactory.getBatch(facilityProfile.selectedProductProfiles);
          deferred.resolve(facilityProfile);
        } else {
          deferred.reject('profile for given email does not exist.');
        }

      })
      .catch(function (reason) {
        deferred.reject(reason);
      });
    return deferred.promise;
  };

  var getAppConfigFromStorage = function(){
    var deferred = $q.defer();
    storageService.get(storageService.APP_CONFIG)
      .then(function (data) {
        if (typeof data !== 'undefined') {
          if (Object.keys(data).length === 1) {
            var appConfigUUID = Object.keys(data)[0];//get key of the first and only app config
            var appConfig = data[appConfigUUID];

            if(typeof appConfig !== 'undefined'){
              appConfig.facility.selectedProductProfiles = productProfileFactory.getBatch(appConfig.facility.selectedProductProfiles);
              //add app config to memory
              memoryStorageService.put(storageService.APP_CONFIG, appConfig);
            }else{
              console.error('app config is undefined.');
            }
            deferred.resolve(appConfig);

          } else {
            throw 'there are more than one app config on this device.';
          }
        } else {
          deferred.resolve(data);
        }
      })
      .catch(function(reason){
        deferred.reject(reason);
      });
    return deferred.promise;
  };

  var getAppConfigFromMemoryOrStorage = function(){
    var deferred = $q.defer();
    var appConfig = getAppConfigFromMemory();
    if (typeof appConfig !== 'undefined') {
      deferred.resolve(appConfig);
    } else {
      getAppConfigFromStorage()
        .then(function (res) {
          deferred.resolve(res);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
    }
    return deferred.promise;
  };

  this.getCurrentAppConfig = function(){
    return getAppConfigFromMemoryOrStorage();
  };

  /**
   * this returns current app config product types.
   *
   * */
  this.getProductTypes = function(){
    var deferred = $q.defer();
    getAppConfigFromMemoryOrStorage()
      .then(function(appConfig){
        var facilityStockListProductTypes = [];
        var uuidListOfProductTypesAlreadyRecorded = [];
        var DOES_NOT_EXIST = -1;
        if (typeof appConfig === 'object') {
          var facilityProductProfiles = appConfig.facility.selectedProductProfiles;
          if(angular.isArray(facilityProductProfiles)){
            for(var index in facilityProductProfiles){
              var productProfile = facilityProductProfiles[index];
              var productType = productProfile.product;
              if(typeof productType !== 'object'){
                throw 'product profile\'s  product type is not an object.'+productType;
              }
              var uuid = utility.getStringUuid(productType);

              if(uuidListOfProductTypesAlreadyRecorded.indexOf(uuid) === DOES_NOT_EXIST){
                uuidListOfProductTypesAlreadyRecorded.push(uuid);
                facilityStockListProductTypes.push(productType);
              }
            }
          }else{
            console.error('facility selected product profile is not an array but: '+(typeof facilityProductProfiles));
          }
        } else {
          console.error('app config: '+appConfig+' is not an object.');
          deferred.resolve(facilityStockListProductTypes);
        }
        deferred.resolve(facilityStockListProductTypes);
      })
      .catch(function(reason){
        deferred.reject(reason);//resolves empty facilityStockListProductTypes
      });
    return deferred.promise;
  };

  var updateAppConfigFromRemote = function () {
    //TODO: refactor this to pull in facility profile from remote, pull in app config, ccu and product profile,
    //TODO: let it pull in all the latest, run a check to see that all the entities exist, then update app config, else rollback any transaction already in place.
    var deferred = $q.defer();
    getAppConfigFromMemoryOrStorage()
      .then(function (appConfig) {
        if (typeof appConfig === 'undefined') {
          deferred.reject('local copy of appConfig does not exist.');
        } else {

          //TODO: get from remote here and use saveAppConfig to save remote app config.
          //TODO: create a transaction that makes sure remote app config required product type, ccu and product profile
          //TODO: exists locally, else rollback because it will break the app. also watch out for sync loop.
          syncService.updateFromRemote(storageService.APP_CONFIG, appConfig)
            .then(function () {
              getAppConfigFromStorage()
                .then(function(appCfg){
                  appCfg.lastUpdated = new Date().toJSON();
                  var shouldSync = false;
                  saveAppConfig(appCfg, shouldSync)
                    .then(function(res){
                      deferred.resolve(res);
                    })
                    .catch(function (reason) {
                      console.log(reason);
                      deferred.reject(reason);
                    });
                })
                .catch(function(reason){
                  console.error(reason);
                  deferred.reject(reason);
                });
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        }
      })
      .catch(function (reason) {
        deferred.reject(reason);
      });
    return deferred.promise;
  };

  /**
   * This function obtains device/app connection status, if the app can connect to remote server, it does the following:
   * 1) try to update local copy of app-config from remote server if both have different revision number.
   * 2) triggers background syncing upon completion of app-config update.
   *
   * @returns {promise|Function|promise|promise|promise|*}
   */
  this.updateAppConfigAndStartBackgroundSync = function(){
    //TODO: set a flag when this starts, and prevent further background sync attempts.
    var deferred = $q.defer();
    var hasCompletedRemoteUpdateAndBackgroundSyncAttempts = true;
    syncService.canConnect()
        .then(function () {
          updateAppConfigFromRemote()
              .then(function(){
                growl.success(i18n('remoteAppConfigUpdateMsg'), { ttl: -1 });
              })
              .finally(function () {
                syncService.backgroundSync()
                    .finally(function () {
                      deferred.resolve(hasCompletedRemoteUpdateAndBackgroundSyncAttempts);
                    });
              });
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
    return deferred.promise;
  };
  
  //analytics syncing bit
  this.syncOfflineAnalytics = function(){

            //try to get this work first!
           analyticsSyncService.syncClicks();
//           analyticsSyncService.syncExceptions();
//           analyticsSyncService.syncPageViews(); 

  };

});
