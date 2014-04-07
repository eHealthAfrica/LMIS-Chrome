'use strict'

angular.module('lmisChromeApp').service('syncService', function ($q, $log, storageService, pouchdb, config) {

  var getDB = function(dbUrl){
    var db  = pouchdb.create(dbUrl);
    return db;
  };

  var getRemote = function(dbName){
    var REMOTE = config.apiBaseURI + '/' + dbName;
    return pouchdb.create(REMOTE);
  };

  this.syncItem = function(dbName, item){
    var defer = $q.defer();
    var remoteDB = getRemote(dbName);
    var localDB = getDB(dbName);

    var onComplete = function(){
      console.log('syncing completed');
    };

    //console.log(remoteDB.replicate.to);

    remoteDB.info().then(function(response){
      console.log(response);
//      localDB.replicate.to(remoteDB, {complete: onComplete}).then(function(result){
//        console.log('Result = '+result);
//      }, function(reason){
//        console.log('Reason' + reason);
//      });
    }, function(error){
      console.log('error '+error);
    });

//    localDB.get(item.uuid).then(function(response){
//      localDB.put(response, response._id, response._rev)
//        .then(function(result){
//            console.log(result);
//            console.log(response);
//        }, function(reason){
//            console.log(reason);
//      });
//      defer.resolve(response);
//    }, function(error){
//      defer.reject(error);
//    });

//    localDB.put(item, item.uuid).then(function(response){
//      defer.resolve(response);
//      console.log(response);
//    }, function(error){
//      defer.reject(error);
//      console.log(error);
//    });


//    item._id = item.uuid;
//    remoteDB.put(item).then (function(response) {
//      defer.resolve(response);
//      console.log(response);
//    }, function(error){
//      defer.reject(error);
//      console.log(error);
//    });
    return defer.promise;
  };

});