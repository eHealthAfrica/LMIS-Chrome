'use strict';

angular.module('lmisChromeApp').service('appConfigService', function ($q, storageService, pouchdb, config, syncService,
                                                                      productProfileFactory, facilityFactory, utility,
                                                                      cacheService, $filter, reminderFactory, growl, i18n, $http) {

  this.APP_CONFIG = storageService.APP_CONFIG;
  var cache = cacheService.getCache();
  var FACILITY_PROFILE_DB = 'app_facility_profile';

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
  this.setup = function (appConfig) {
    var deferred = $q.defer();
    appConfig.reminderDay = parseInt(appConfig.reminderDay); //cast to integer in case it is a string
    load().then(function (existingAppConfig) {
      if(typeof appConfig.dateActivated === 'undefined'){
        appConfig.dateActivated = new Date().toJSON();
      }

      var selectedProductProfileUuids = [];
      for (var index in appConfig.selectedProductProfiles) {
        var productProfile = appConfig.selectedProductProfiles[index];
        selectedProductProfileUuids.push(productProfile.uuid);
      }

      var promise = {
        selectedProductProfiles: productProfileFactory.getBatch(selectedProductProfileUuids)
      };

      $q.all(promise)
          .then(function (result) {
            for (var key in result) {
              appConfig[key] = result[key];
            }

            var promises = [];
            if (typeof existingAppConfig === 'undefined') {
              promises.push(storageService.save(storageService.APP_CONFIG, appConfig));
            } else {
              //over-write appConfig by using existing appConfig uuid for the new appConfig.
              //2014-04-11 - it would be more readable for this to apply individual properties to result rather than uuid to appConfig, that ties storage logic to this
              appConfig.uuid = existingAppConfig.uuid;
              promises.push(storageService.save(storageService.APP_CONFIG, appConfig));
            }

            $q.all(promises)
                .then(function (result) {
                  //cache app config
                  cache.put(storageService.APP_CONFIG, appConfig);
                  //clear data used to plot product-type-info graph and stock count reminder
                  cache.remove(cacheService.PRODUCT_TYPE_INFO);
                  cache.remove(cacheService.STOCK_COUNT_REMINDER);
                  deferred.resolve(result[0]);
                  //sync app config in the back-ground
                  syncService.syncItem(storageService.APP_CONFIG, appConfig);
                })
                .catch(function (reason) {
                  console.log(reason);
                  deferred.reject(reason);
                });
          })
          .catch(function (reason) {
            deferred.reject(reason);
          });
    })
    .catch(function(reason){
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  var load = function () {
    var deferred = $q.defer();
    storageService.get(storageService.APP_CONFIG)
      .then(function(data){
          if(typeof data !== 'undefined'){
            if (Object.keys(data).length === 1) {
              var appConfigUUID = Object.keys(data)[0];//get key of the first and only app config
              var appConfig = data[appConfigUUID];

              cache.put(storageService.APP_CONFIG, appConfig);
              deferred.resolve(appConfig);
            } else {
              throw 'there are more than one app config on this device.';
            }
          }else{
            deferred.resolve(data);
          }
        })
      .catch(function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  this.getAppFacilityProfileByEmail = function(email){
    var deferred = $q.defer();
    var REMOTE_URI = config.api.url+'/facilities/_design/config/_view/template?key="'+email+'"';
    REMOTE_URI = encodeURI(REMOTE_URI);
    $http.get(REMOTE_URI)
        .then(function(res){
          console.info(res);
          var rows = res.data.rows;
          if(rows.length > 0){
            var facilityProfile = rows[0].value;//pick the first facility profile.
            var promises = {
                selectedProductProfiles: productProfileFactory.getBatch(facilityProfile.selectedProductProfiles)
            };
            $q.all(promises)
                .then(function (result) {
                    for (var key in result) {
                        facilityProfile[key] = result[key];
                    }
                    deferred.resolve(facilityProfile);
                })
                .catch(function(reason){
                    deferred.reject(reason);
                });
          }else{
            deferred.reject('profile for given email does not exist.');
          }

        })
        .catch(function(reason){
          console.error(reason);
          deferred.reject(reason);
        });
    return deferred.promise;
  };

  /**
   * This returns current app config from cache, if not available, it loads from storageService
   * @returns {promise|promise|*|promise|promise}
   */
  var getAppConfigFromCacheOrStorage = function() {
    var deferred = $q.defer();
    var appConfig = cache.get(storageService.APP_CONFIG);

    if(typeof appConfig !== 'undefined'){
      deferred.resolve(appConfig);
    }else{
      load().then(function(result){
        deferred.resolve(result);
      })
      .catch(function(err){
        deferred.reject(err);
      });
    }
    return deferred.promise;
  };

    /**
     * expose private function.
     * @returns {promise|promise|*|promise|promise}
     */
  this.getCurrentAppConfig = function(){
    return getAppConfigFromCacheOrStorage();
  };

  this.getProductTypes = function(){
    var deferred = $q.defer();
    getAppConfigFromCacheOrStorage()
      .then(function(appConfig){
        var facilityStockListProductTypes = [];
        var uuidListOfProductTypesAlreadyRecorded = [];
        var DOES_NOT_EXIST = -1;
        for(var index in appConfig.selectedProductProfiles){
          var productType = appConfig.selectedProductProfiles[index].product;
          if(uuidListOfProductTypesAlreadyRecorded.indexOf(productType.uuid) === DOES_NOT_EXIST ){
            uuidListOfProductTypesAlreadyRecorded.push(productType.uuid);
            facilityStockListProductTypes.push(productType);
          }
        }
        deferred.resolve(facilityStockListProductTypes);
      })
      .catch(function(reason){
        deferred.reject(reason);//resolves empty facilityStockListProductTypes
      });
    return deferred.promise;
  };

  var updateAppConfigFromRemote = function(){
    var deferred = $q.defer();
    getAppConfigFromCacheOrStorage()
        .then(function(appConfig){
          if(typeof appConfig === 'undefined'){
            deferred.reject('local copy of appConfig does not exist.');
          }else{
           syncService.updateFromRemote(storageService.APP_CONFIG, appConfig)
               .then(function(result){
                 cache.remove(storageService.APP_CONFIG);//clear cache
                 deferred.resolve(result);
               })
               .catch(function(reason){
                 deferred.reject(reason);
               });
          }
        })
        .catch(function(reason){
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
    var deferred = $q.defer();
    var hasCompletedRemoteUpdateAndBackgroundSyncAttempts = true;
    syncService.canConnect()
        .then(function () {
          updateAppConfigFromRemote()
              .then(function(){
                var DELAY_BEFORE_REMOVAL = 10000;//10 secs
                growl.success(i18n('remoteAppConfigUpdateMsg'), { ttl: DELAY_BEFORE_REMOVAL });
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

});