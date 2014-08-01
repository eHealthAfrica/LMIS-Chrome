angular.module('lmisChromeApp')
  .service('memoryStorageService', function ($rootScope, cacheService) {

    $rootScope.memoryStore = {};
    var MEMORY_STORE = 'memory_store';

    this.put = function(dbName, data){
      if(!('uuid' in data)){
        throw 'data should have a uuid that serves as its key.';
      }
      if(typeof dbName !== 'string' || dbName.length === 0){
        throw ['dbName is not a string or is an empty string. db name: ', JSON.stringify(dbName)].join(' ');
      }
      if(typeof $rootScope.memoryStore[dbName] === 'undefined'){
        $rootScope.memoryStore[dbName] = {};
      }
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
     * @param dbName
     * @param db
     */
    this.setDatabase = function(dbName, db){
      //TODO:(discuss) check if db is set already, if set throw an exception that you might over-write the db.
      $rootScope.memoryStore[dbName] = db;
      cacheService.put(MEMORY_STORE, $rootScope.memoryStore);
    };

    this.getDatabase = function(dbName){
      var db = $rootScope.memoryStore[dbName];
      if(typeof db !== 'object'){
        var mem = cacheService.get(MEMORY_STORE);
        db = mem[dbName];
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