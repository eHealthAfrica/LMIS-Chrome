'use strict';

angular.module('lmisChromeApp')
  .factory('SyncService', function ($q, $http, $resource, $timeout, $rootScope, storageService) {


            var sync_service = function(){
                var set_for_syncing = [];
                var not_for_syncing = [];
                var tables = function(){
                     var defered = $q.defer();
                        $http.get('scripts/tables.json').success(function(d){
                            defered.resolve(d);
                        });
                    return defered.promise;
                }
                $rootScope.$apply(function(){
                    var promise =tables();
                    if(promise != undefined){
                        promise.then(function(lmis_tables){
                            if(Object.prototype.toString.call(lmis_tables) === '[object Object]'){
                               var tbl_list = Object.keys(lmis_tables);
                                //console.log(tbl_list);
                                if(tbl_list.length > 0){
                                    for(var k in tbl_list){

                                        //var table_data = {};
                                         storageService.get(tbl_list[k]).then(function(tbl_data){
                                            if(tbl_data != undefined){
                                                 $rootScope.table_data = tbl_data;
                                            }
                                           else{
                                                 $rootScope.table_data = {};
                                            }
                                         },
                                         function(reason){
                                             console.log("Failed "+reason);
                                         });
                                        var table_data = $rootScope.table_data;

                                        if(Object.prototype.toString.call(table_data) === '[object Array]'){

                                            for(var row in table_data){
                                                if(table_data[row] != null){
                                                    console.log(table_data[row]);
                                                    var row_key = Object.keys(table_data[row]);
                                                    if(row_key.indexOf('synced') != -1){

                                                        if(table_data[row].synced == 0){
                                                            set_for_syncing.push(table_data[row]);
                                                        }
                                                        table_data[row].synced = 1;
                                                        console.log(table_data.item_name);
                                                        not_for_syncing.push(table_data);
                                                    }
                                                }



                                            }
                                            //console.log('trying to send to url');
                                            var sync_data= set_for_syncing;
                                            var obj_arranged = {};
                                            if (not_for_syncing.length > 0){
                                                obj_arranged[tbl_list[k]]=not_for_syncing;
                                                //chrome.storage.local.set(obj_arranged);
                                                //console.log('data to be saved = '+ angular.toJson(obj_arranged));
                                            }

                                        }


                                    }

                                }
                            }



                        });

                    }
                     //$timeout(sync_service, 10000);
                });


        }

    sync_service();

   var tables = function getTables(){

   }

   return{
        sync: sync_service
   }
  });
