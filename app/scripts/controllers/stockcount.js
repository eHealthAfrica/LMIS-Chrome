'use strict';

angular.module('lmisChromeApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('stockCountIndex', {
        data:{
          label:'Stock Count'
        },
        url:'/stockCountIndex?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/index.html',
        controller:'StockCountCtrl',
        resolve:{
          appConfig: function(appConfigService){
            return appConfigService.load();
          }
        }
      })
      .state('stockCountStepForm', {
        data:{
          label:'Stock Count Form'
        },
        url:'/stockCountStepForm?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/step_entry_form.html',
        controller: 'StockCountStepsFormCtrl',
        resolve:{
          appConfig: function(appConfigService){
            return appConfigService.load();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      })
      .state('wasteCountForm', {
        data:{
          label:'Waste Count Form'
        },
        url: '/wasteCountForm?facility&reportMonth&reportYear',
        templateUrl: 'views/stockcount/waste-count-form.html',
        controller:'WasteCountFormCtrl',
        resolve: {
          appConfig: function(appConfigService){
            return appConfigService.load();
          },
          productType: function(stockCountFactory){
            return stockCountFactory.productType();
          }
        }
      })
      .state('syncStockCount', {
        abstract: true,
        templateUrl: 'views/stockcount/sync.html',
      })
      .state('syncStockCount.detail', {
        data: {
          label: 'Sync stock count'
        },
        url: '/sync-stock-count',
        resolve: {
          localDocs: function(pouchdb) {
            var db = pouchdb.create('stockcount');
            // XXX: db#info returns incorrect doc_count, see item:333
            return db.allDocs();
          }
        },
        views: {
          'stats': {
            templateUrl: 'views/stockcount/sync/stats.html',
            controller: function($log, $scope, $translate, config, pouchdb, localDocs, alertsFactory) {
              $scope.local = {
                // jshint camelcase: false
                doc_count: localDocs.total_rows
              };

              $scope.remoteSyncing = true;
              var remote = pouchdb.create(config.apiBaseURI + '/stockcount');
              remote.info()
                .then(function(info) {
                  $scope.remote = info;
                  $scope.remoteSyncing = false;
                })
                .catch(function(reason) {
                  $log.error(reason);
                });

              $scope.sync = function() {
                $scope.syncing = true;
                var cb = {complete: function() {
                  $translate('syncSuccess')
                    .then(function(syncSuccess) {
                      alertsFactory.success(syncSuccess);
                    })
                    .catch(function(reason) {
                      $log.error(reason);
                    })
                    .finally(function() {
                      $scope.syncing = false;
                    });
                }};
                var db = pouchdb.create('stockcount');
                db.replicate.sync(remote, cb);
              };
            }
          },
          'status': {
            templateUrl: 'views/stockcount/sync/status.html',
            controller: function($log, $scope, localDocs, config, pouchdb) {
              $scope.locals = localDocs.rows.map(function(local) {
                return local.id;
              });

              $scope.compare = function() {
                $scope.syncing = true;
                var remote = pouchdb.create(config.apiBaseURI + '/stockcount');
                remote.allDocs()
                  .then(function(remotes) {
                    remotes = remotes.rows.map(function(remote) {
                      return remote.id;
                    });
                    $scope.synced = [];
                    $scope.unsynced = {
                      local: [],
                      remote: []
                    };

                    for (var i = 0, len = $scope.locals.length; i < len; i++) {
                      if(remotes.indexOf($scope.locals[i]) !== -1) {
                        $scope.synced.push($scope.locals[i]);
                      }
                      else {
                        $scope.unsynced.local.push($scope.locals[i]);
                      }
                    }

                    for (var j = remotes.length - 1; j >= 0; j--) {
                      if($scope.locals.indexOf(remotes[j]) === -1) {
                        $scope.unsynced.remote.push(remotes[j]);
                      }
                    }
                  })
                  .catch(function(reason) {
                    $log.error(reason);
                  })
                  .finally(function() {
                    $scope.syncing = false;
                  });
              };
            }
          }
        }
      });
  })
/*
 * Landing page controller
 */

  .controller('StockCountCtrl', function($scope, $stateParams, stockCountFactory, appConfig) {

  })

/*
 * Wastage Count Controller
 */
  .controller('WasteCountFormCtrl', function($scope, stockCountFactory, alertsFactory, $stateParams, currentFacility,$state, productType, $log, $translate, pouchdb, config){

    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    $scope.products = stockCountFactory.programProducts;
    $scope.productType = productType;

    $scope.step = 0;
    $scope.monthList = stockCountFactory.monthList;
    /*
     * get url parameters
     */
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();
    $scope.currentDay = day;

    $scope.wasteCount = {};
    $scope.wasteCount.discarded = {};
    $scope.wasteCount.reason = {};

    $scope.wasteCount.countDate ='';

    $scope.facilityProducts = stockCountFactory.facilityProducts(); // selected products for current facility
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];
    for(var i=0; i<$scope.facilityProductsKeys.length; i++){
      $scope.wasteCount.reason[$scope.facilityProductsKeys[i]]={};
    }
    for(var i in  $scope.discardedReasons){
      $scope.wasteCount.reason[$scope.facilityProductsKeys[$scope.step]][i]={};
    }
    //set maximum steps
    if($scope.facilityProductsKeys.length>0){
      $scope.maxStep =  $scope.facilityProductsKeys.length-1;
    }
    else{
      $scope.maxStep =0;
    }

    $scope.edit = function(index){
      $scope.step = index;
      $scope.productKey = $scope.facilityProductsKeys[$scope.step];
      $scope.preview = false;
      $scope.editOn = true;
    };

    $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
    $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    $scope.redirect = true; //initialize redirect as true
    $scope.wasteCount.isComplete = 1; //and stock count entry as completed
    $scope.wasteCount.lastPosition = 0;
    var timezone = stockCountFactory.get.timezone();

    //load existing count for the day if any.
    var date = $scope.reportYear+'-'+$scope.reportMonth+'-'+$scope.currentDay;
    stockCountFactory.getWasteCountByDate(date).then(function(wasteCount){
      if(wasteCount !== null){
        $scope.wasteCount = wasteCount;
        $scope.editOn = true; // enable edit mode
      }
    });

    $scope.save = function(){
      var dbName = 'wastecount';
      $scope.wasteCount.facility = $scope.facilityUuid;
      $scope.wasteCount.countDate = new Date($scope.reportYear, parseInt($scope.reportMonth)-1, $scope.currentDay, timezone);

      stockCountFactory.save.waste($scope.wasteCount)
        .then(function() {
          if($scope.redirect) {
            $translate('stockCountSaved')
              .then(function(stockCountSaved) {
                alertsFactory.success(stockCountSaved);
              })
              .then(function() {
                var db = pouchdb.create(name);
                var obj = $scope.wasteCount;
                obj._id = obj.uuid;
                db.put(obj)
                  .then(function() {
                    var cb = {complete: function() {
                      $translate('syncSuccess')
                        .then(function(syncSuccess) {
                          alertsFactory.success(syncSuccess);
                        })
                        .then(function() {
                          if($scope.redirect) {
                            var msg = [
                              'You have completed waste count for',
                              $scope.currentDay,
                              $scope.monthList[$scope.reportMonth],
                              $scope.reportYear
                            ];
                            alertsFactory.success(msg.join(' '));
                            $scope.go('home.index.mainActivity', {
                              'facility': $scope.facilityUuid,
                              'reportMonth': $scope.reportMonth,
                              'reportYear': $scope.reportYear,
                              'stockResult': msg
                            });
                          }
                        })
                        .catch(function(reason) {
                          $log.error(reason);
                        });
                    }};
                    var db = pouchdb.create(name);
                    db.replicate.to(config.apiBaseURI + '/' + dbName, cb);
                  })
                  .catch(function(reason) {
                    if(reason.message) {
                      alertsFactory.danger(reason.message);
                    }
                    $log.error(reason);
                  });
              });
          }
          $scope.redirect = true; // always reset to true after every save
          $scope.wasteCount.isComplete = 1;
        });
    };


    $scope.changeState = function(direction){
      $scope.currentEntry = $scope.wasteCount.discarded[$scope.facilityProductsKeys[$scope.step]];
      if(stockCountFactory.validate.invalid($scope.currentEntry) && direction !== 0){
        alertsFactory.danger($scope.alertMsg);
      }
      else{
        if(direction !== 2){
          $scope.step = direction === 0? $scope.step-1 : $scope.step + 1;
        }
        else{
          $scope.preview = true;
        }
        $scope.productKey = $scope.facilityProductsKeys[$scope.step];
        //TODO: this is best done with $timeout to auto save data when interface is idle for x mount of time
        $scope.redirect = false;// we don't need to redirect when this fn calls save()
        $scope.wasteCount.isComplete = 0;// when saved from this fn its not complete yet
        $scope.save();
      }
      $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
      $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    };

  })
  .controller('StockCountStepsFormCtrl', function($scope, stockCountFactory, $state, alertsFactory, $stateParams, appConfig, productType, $log, $translate, pouchdb, config){
    var now = new Date();
    var day = now.getDate();
    day = day < 10 ? '0' + day : day;

    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    $scope.productType = productType;

    $scope.step = 0;
    $scope.monthList = stockCountFactory.monthList;
    /*
     * get url parameters
     */
    $scope.facilityObject = appConfig.appFacility;
    $scope.facilityUuid = ($stateParams.facility !== null)?$stateParams.facility:$scope.facilityObject.uuid;
    $scope.reportMonth = ($stateParams.reportMonth !== null)?$stateParams.reportMonth:month;
    $scope.reportYear = ($stateParams.reportYear !== null)?$stateParams.reportYear: now.getFullYear();

    $scope.currentDay = day;

    $scope.preview = false;
    $scope.editOn = false;


    $scope.stockCount = {};
    $scope.stockCount.unopened = {};

    $scope.stockCount.countDate = '';
    $scope.alertMsg = 'stock count value is invalid, at least enter Zero "0" to proceed';
    $scope.facilityProducts = stockCountFactory.facilityProducts(); // selected products for current facility
    $scope.facilityProductsKeys = Object.keys($scope.facilityProducts); //facility products uuid list
    $scope.productKey = $scope.facilityProductsKeys[$scope.step];

    //set maximum steps
    if($scope.facilityProductsKeys.length>0){
      $scope.maxStep =  $scope.facilityProductsKeys.length-1;
    }
    else{
      $scope.maxStep =0;
    }

    $scope.edit = function(index){
      $scope.step = index;
      $scope.productKey = $scope.facilityProductsKeys[$scope.step];
      $scope.preview = false;
      $scope.editOn = true;
    };

    $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
    $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    $scope.redirect = true; //initialize redirect as true
    $scope.stockCount.isComplete = 1; //and stock count entry as completed
    var timezone = stockCountFactory.get.timezone();

    //load existing count for the day if any.
    var date = $scope.reportYear+'-'+$scope.reportMonth+'-'+$scope.currentDay;
    stockCountFactory.getStockCountByDate(date).then(function(stockCount){
      if(stockCount !== null){
        $scope.stockCount = stockCount;
        $scope.editOn = true; // enable edit mode
      }
    });

    $scope.save = function(){
      var dbName = 'stockcount';
      $scope.stockCount.facility = $scope.facilityUuid;
      $scope.stockCount.countDate = new Date($scope.reportYear, parseInt($scope.reportMonth)-1, $scope.currentDay, timezone);

      stockCountFactory.save.stock($scope.stockCount)
        .then(function() {
          if($scope.redirect) {
            $translate('stockCountSaved')
              .then(function(stockCountSaved) {
                alertsFactory.success(stockCountSaved);
              })
              .then(function() {
                var db = pouchdb.create(name);
                var obj = $scope.stockCount;
                obj._id = obj.uuid;
                db.put(obj)
                  .then(function() {
                    var cb = {complete: function() {
                      $translate('syncSuccess')
                        .then(function(syncSuccess) {
                          alertsFactory.success(syncSuccess);
                        })
                        .then(function() {
                          if($scope.redirect) {
                            var msg = [
                              'You have completed stock count for',
                              $scope.currentDay,
                              $scope.monthList[$scope.reportMonth],
                              $scope.reportYear
                            ].join(' ');
                            alertsFactory.success(msg);
                            $state.go('home.index.mainActivity', {
                              'facility': $scope.facilityUuid,
                              'reportMonth': $scope.reportMonth,
                              'reportYear': $scope.reportYear,
                              'stockResult': msg
                            });
                          }
                        })
                        .catch(function(reason) {
                          $log.error(reason);
                        });
                    }};
                    var db = pouchdb.create(name);
                    db.replicate.to(config.apiBaseURI + '/' + dbName, cb);
                  })
                  .catch(function(reason) {
                    if(reason.message) {
                      alertsFactory.danger(reason.message);
                    }
                    $log.error(reason);
                  });
              });
          }
          $scope.redirect = true; // always reset to true after every save
          $scope.stockCount.isComplete = 1;
        });
    };

    $scope.changeState = function(direction){
      $scope.currentEntry = $scope.stockCount.unopened[$scope.facilityProductsKeys[$scope.step]];
      if(stockCountFactory.validate.invalid($scope.currentEntry) && direction !== 0){
        alertsFactory.danger($scope.alertMsg);
      }
      else{
        if(direction !== 2){
          $scope.step = direction === 0? $scope.step-1 : $scope.step + 1;
        }
        else{
          $scope.preview = true;
        }
        $scope.productKey = $scope.facilityProductsKeys[$scope.step];
        //TODO: this is best done with $timeout to auto save data when interface is idle for x mount of time
        $scope.redirect = false;// we don't need to redirect when this fn calls save()
        $scope.stockCount.isComplete = 0;// when saved from this fn its not complete yet
        $scope.save();
      }
      $scope.selectedFacility = stockCountFactory.get.productReadableName($scope.facilityProducts, $scope.step);
      $scope.productTypeCode = stockCountFactory.get.productTypeCode($scope.facilityProducts, $scope.step, $scope.productType);
    };
  });
