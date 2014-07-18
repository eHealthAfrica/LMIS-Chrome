'use strict';

angular.module('lmisChromeApp')
  .service('memoryStorageService', function ($rootScope, cacheService) {

    $rootScope.memoryStore = {};
    var MEMORY_STORE = 'memory_store';

    var initialize = function(dbName){
      if(typeof $rootScope.memoryStore[dbName] === 'undefined'){
        $rootScope.memoryStore[dbName] = {};
      }
    };

    var initMemoryStore = function(){
      if(typeof $rootScope.memoryStore === 'undefined'){
        $rootScope.memoryStore = {};
      }
    };

    this.put = function(dbName, data){
      if(typeof data.uuid !== 'string' || data.uuid === ''){
        throw 'data.uuid is NOT a non-empty string..';
      }
      if(typeof dbName !== 'string' || dbName === ''){
        throw ['dbName is NOT a non-empty string. db name: ', String(dbName)].join(' ');
      }
      initialize(dbName);
      $rootScope.memoryStore[dbName][data.uuid] = data;
      cacheService.put(MEMORY_STORE, $rootScope.memoryStore);
    };

    this.get = function(dbName, key){
      if(typeof $rootScope.memoryStore !== 'object'){
        console.error('memory store is not available.');
      }
      if(Object.keys($rootScope.memoryStore).length === 0){
        console.error('memory store is empty.');
      }
      dbName = String(dbName);
      key = String(key);
      var db = $rootScope.memoryStore[String(dbName)];
      if(typeof db !== 'object'){
        console.error('dbName: '+dbName+', does not exist, key: '+key+', db: '+db);
        $rootScope.memoryStore = cacheService.get(MEMORY_STORE);//reload memory store from cache.
        db = $rootScope.memoryStore[String(dbName)];
      }
      var record = db[key];
      return record;
    };

    this.delete = function(dbName, key){
      delete $rootScope.memoryStore[dbName][key];
      cacheService.put(MEMORY_STORE, $rootScope.memoryStore);
    };

    /**
     * This sets a complete database on the memory storage.
     *  WARNING: call this only during app start up i.e inside fixture-loader-service.loadFiles
     *  else you risk over-writing a database;
     *
     * @param {String} dbName
     * @param {Object} db
     */
    this.setDatabase = function(dbName, db){
      initMemoryStore();
      $rootScope.memoryStore[dbName] = db;
      cacheService.put(MEMORY_STORE, $rootScope.memoryStore);
    };

    this.getDatabase = function(dbName) {
      var db = $rootScope.memoryStore[dbName];
      if (typeof db !== 'object') {
        var mem = cacheService.get(MEMORY_STORE);
        if (typeof mem !== 'undefined') {
          db = mem[dbName];
        }
      }
      return db;
    };

    this.deleteDatabase = function(dbName){
      delete $rootScope.memoryStore[dbName];
      cacheService.put(MEMORY_STORE, $rootScope.memoryStore);
    };

    this.clearAll = function(){
      $rootScope.memoryStore = {};
      cacheService.put(MEMORY_STORE, $rootScope.memoryStore);
    };

  });
