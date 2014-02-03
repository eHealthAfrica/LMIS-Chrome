'use strict';

angular.module('lmisChromeApp')
  .factory('SyncService', function($q, $http, $resource, $timeout, $rootScope, storageService) {

    var syncService = function() {
      var setForSynching, notForSynching = [];
      var tables = function() {
        var defered = $q.defer();
        $http.get('scripts/tables.json').success(function(d) {
          defered.resolve(d);
        });
        return defered.promise;
      };

      // XXX: this needs refactoring
      $rootScope.$apply(function() {
        var promise = tables();
        if (promise !== undefined) {
          promise.then(function(lmisTables) {
            if (Object.prototype.toString.call(lmisTables) === '[object Object]') {
              var tables = Object.keys(lmisTables);
              if (tables.length > 0) {
                for (var k in tables) {
                  // jshint camelcase: false, loopfunc: true
                  storageService.get(tables[k]).then(
                    function(tableData) {
                      if (tableData !== undefined) {
                        $rootScope.table_data = tableData;
                      } else {
                        $rootScope.table_data = {};
                      }
                    },
                    function(reason) {
                      console.log('Failed ' + reason);
                    });
                  var table_data = $rootScope.table_data;

                  if (Object.prototype.toString.call(table_data) === '[object Array]') {
                    for (var row in table_data) {
                      if (table_data[row] !== null) {
                        console.log(table_data[row]);
                        var row_key = Object.keys(table_data[row]);
                        if (row_key.indexOf('synced') !== -1) {

                          if (table_data[row].synced === 0) {
                            setForSynching.push(table_data[row]);
                          }
                          table_data[row].synced = 1;
                          console.log(table_data.item_name);
                          notForSynching.push(table_data);
                        }
                      }
                    }

                    var obj_arranged = {};
                    if (notForSynching.length > 0) {
                      obj_arranged[tables[k]] = notForSynching;
                      //chrome.storage.local.set(obj_arranged);
                      //console.log('data to be saved = '+ angular.toJson(obj_arranged));
                    }

                  }

                }

              }
            }



          });

        }
        //$timeout(syncService, 10000);
      });

    };

    syncService();

    return {
      sync: syncService
    };
  });
