'use strict';

angular.module('lmisChromeApp').service('appConfigService', function ($q, storageService, pouchdb, config, syncService,
                                                                      productProfileFactory, facilityFactory, utility,
                                                                      cacheService, $filter, reminderFactory) {

  this.APP_CONFIG = storageService.APP_CONFIG;
  var cache = cacheService.getCache();
  var FACILITY_PROFILE_DB = 'app_facility_profile';
  var stockCountIntervals = [
    {name: 'Daily', value: 1},
    {name: 'Weekly', value: 7},
    {name: 'Bi-Weekly', value: 14},
    {name: 'Monthly', value: 30}
  ];

  this.stockCountIntervals = stockCountIntervals;

  this.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var getCorrectWeeklyDateInfo = function(currentWeekDateInfo){
    if ($filter('date')(new Date(), 'yyyy-MM-dd') < $filter('date')(currentWeekDateInfo.reminderDate, 'yyyy-MM-dd')) {
      var previousReminderDate =
          new Date(currentWeekDateInfo.reminderDate.getFullYear(), currentWeekDateInfo.reminderDate.getMonth(),
              currentWeekDateInfo.reminderDate.getDate() - stockCountIntervals[1].value);

      return utility.getWeekRangeByDate(previousReminderDate, currentWeekDateInfo.reminderDate.getDay());
    }
    return currentWeekDateInfo;
  };

  /**
   * This function uses appConfig reminderDay for stockCount to check if stock count has been carried out within the
   * current date week. it will return TRUE if
   * 1) current date is greater than reminderDay of current week and
   * 2) current date is less than last day of the week and
   * 3) stock count does not exist for the week or has not been completed.
   * @param reminderDay
   * @returns {promise|promise|*|promise|promise}
   */
  this.isStockCountDue = function(reminderDay){
    var deferred = $q.defer();
    storageService.all(storageService.STOCK_COUNT)
      .then(function (results) {
        var now = new Date();
        var currentWeekDateInfo = utility.getWeekRangeByDate(now, reminderDay);
        currentWeekDateInfo = getCorrectWeeklyDateInfo(currentWeekDateInfo);
        var today = $filter('date')(now, 'yyyy-MM-dd');

        //get stock-counts within current and week date range
        var stockCountsWithInRange = results.filter(function (stockCount) {
          return (stockCount.isComplete === 1) &&
                  (!reminderFactory.isWeeklyReminderDue(stockCount, 'countDate', currentWeekDateInfo.reminderDate));
        });
        var isStockCountReminderDue = (today >= $filter('date')(currentWeekDateInfo.reminderDate, 'yyyy-MM-dd')) &&
                (stockCountsWithInRange.length === 0);
        deferred.resolve(isStockCountReminderDue);
      })
      .catch(function(){
        deferred.resolve(false);
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
    appConfig.reminderDay = parseInt(appConfig.reminderDay); //cast to integer incase it is a string
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
                  syncService.syncItem(storageService.APP_CONFIG, appConfig)
                      .then(function (syncResult) {
                        console.log('app config sync result ' + syncResult);
                      })
                      .catch(function (error) {
                        console.log('app config error: ' + error);
                      });
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

  var removeObjFromCollection = function(obj, collection, key){
    collection = collection.filter(function (item) {
      if(typeof item[key] === 'undefined' || typeof obj[key] === 'undefined'){
        throw 'both objects that are being compared must have the property(key) being compared.';
      }
      return item[key] !== obj[key];
    });
    return collection;
  };

  this.addObjectToCollection = function(obj, collections, key){
    var _obj = JSON.parse(obj);
    if (_obj.deSelected === undefined) {
      collections.push(_obj);
      return collections;
    }
    return removeObjFromCollection(_obj, collections, key);
  };

  this.getAppFacilityProfileByEmail = function(email){
    var deferred = $q.defer();
    var REMOTE = config.api.url + '/' + FACILITY_PROFILE_DB;
    var remoteDB = pouchdb.create(REMOTE);
    remoteDB.info()
        .then(function () {
          remoteDB.get(email)
              .then(function (appFacilityProfile) {
                var promises = {
                  appFacility: facilityFactory.get(appFacilityProfile.appFacility),
                  selectedProductProfiles: productProfileFactory.getBatch(appFacilityProfile.selectedProductProfiles)
                };

                $q.all(promises).then(function (result) {
                  for (var key in result) {
                    appFacilityProfile[key] = result[key];
                  }
                  deferred.resolve(appFacilityProfile);
                });
              }, function (reason) {
                deferred.reject(reason);
              });
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
    return deferred.promise;
  };

    /**
   * copies an source array to target associate array(object array or key-pair )
   * @param source
   * @param key - property of object that will be used as key
   */
  this.generateAssociativeArray =  utility.castArrayToObject;

  /**
   * This returns current app config from cache, if not available, it loads from storageService
   * @returns {promise|promise|*|promise|promise}
   */
  this.getCurrentAppConfig = function() {
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

  this.getProductTypes = function(){
    var deferred = $q.defer();
    this.getCurrentAppConfig()
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

});