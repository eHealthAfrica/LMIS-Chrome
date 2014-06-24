angular.module('lmisChromeApp')
  .service('memoryStorageService', function () {

    var memoryStore = {};

    this.put = function(dbName, data){
      if(!('uuid' in data)){
        throw 'data should have a uuid that serves as its key.';
      }
      if(typeof dbName !== 'string' || dbName.length === 0){
        throw ['dbName is not a string or is an empty string. db name: ', JSON.stringify(dbName)].join(' ');
      }
      if(typeof memoryStore[dbName] === 'undefined'){
        memoryStore[dbName] = {};
      }
      memoryStore[dbName][data.uuid] = data;
    };

    this.get = function(dbName, key){
      var db = memoryStore[dbName];
      if(typeof db !== 'object'){
        console.error('dbName: '+dbName+', does not exist, key: '+key+', db: '+db);
      }
      var record = db[String(key)];
      return record;
    };

    this.delete = function(dbName, key){
      delete memoryStore[dbName][key];
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
      //TODO: check if db is set already, if set throw an exception that you might over-write the db.
      memoryStore[dbName] = db;
    };

    this.getDatabase = function(dbName){
      return memoryStore[dbName];
    };

    this.deleteDatabase = function(dbName){
      delete memoryStore[dbName];
    };

    this.clearAll = function(){
      memoryStore = {};
    };

  });