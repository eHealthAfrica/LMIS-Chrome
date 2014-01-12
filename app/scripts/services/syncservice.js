'use strict';

angular.module('lmisChromeApp')
  .provider('SyncService', function ($http, $timeout, $rootScope) {

            var sync_service = function(){

            $rootScope.$apply(function(){


                chrome.storage.local.get(null, function(storage){

                    if (storage) {
                        $rootScope.chrome_storage = storage;
                    }

                });



                var tbl = {};
                var set_for_syncing = [];
                var not_for_syncing = [];
                var chromedata = $rootScope.chrome_storage;
                if(Object.prototype.toString.call(chromedata) === '[object Object]'){
                    tbl = Object.keys($rootScope.chrome_storage);
                }
                if(tbl.length > 0){
                    for(var k in tbl){
                        if(chromedata[tbl[k]].length > 0){
                            var obj_data = chromedata[tbl[k]];
                            if(Object.prototype.toString.call(obj_data) === '[object Array]'){
                                for(var row in obj_data){
                                    var row_key = Object.keys(obj_data[row]);
                                    if(row_key.indexOf('synced') != -1){

                                        if(chromedata[tbl[k]][row].synced == 0){
                                            set_for_syncing.push(obj_data[row]);
                                        }
                                        chromedata[tbl[k]][row].synced = 1;
                                        console.log(chromedata[tbl[k]][row].item_name);
                                        not_for_syncing.push(chromedata[tbl[k]][row]);
                                    }


                                }

                                //console.log('trying to send to url');
                                var sync_data= set_for_syncing;
                                var obj_arranged = {};
                                if (not_for_syncing.length > 0){
                                    obj_arranged[tbl[k]]=not_for_syncing;
                                    chrome.storage.local.set(obj_arranged);
                                    //console.log('data to be saved = '+ angular.toJson(obj_arranged));
                                }

                            }
                            else{
                                //console.log('we no array here. Data is = '+angular.toJson(chromedata[tbl[k]]) );
                            }


                        }
                    }
                }

                $timeout(sync_service, 1000);
            });
        }

    sync_service();
    // Private variables
    var salutation = 'Hello';

    // Private constructor
    function SyncProvider() {
      this.startSync = function () {
        return salutation;
      };
    }

    // Method for instantiating
    this.$get = function () {
      return new Greeter();
    };
  });
