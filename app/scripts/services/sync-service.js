'use strict'

angular.module('lmisChromeApp').service('syncService', function ($q, $log, storageService, pouchdb, config) {

  var getDB = function(dbUrl){
    var db  = pouchdb.create(dbUrl);
    return db;
  };

  var getRemote = function(dbName){
    var REMOTE = config.apiBaseURI + '/' + dbName;
    return REMOTE;
  };

  this.sync = function(dbName){
    var _remote = getRemote(dbName);
    console.log(_remote);
    var remoteDb = getDB(_remote);

    remoteDb.info().then(function(info){
       $log.info(info);
    }).catch(function(error){
      console.error(error);
    });
  };

});