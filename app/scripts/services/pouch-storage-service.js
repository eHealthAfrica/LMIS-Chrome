'use strict';

angular.module('lmisChromeApp')
  .service('pouchStorageService', function(pouchdb, utility, config) {
    this.put = function(db, data) {
      db = pouchdb.create(db);
      return db.put(data, data.uuid);
    };

    this.allDocs = function(db) {
      db = pouchdb.create(db);
      return db.allDocs({
        // jshint camelcase: false
        include_docs: true
      })
        .then(function(result) {
          return utility.pluck(result.rows, 'doc');
        });
    };

    this.get = function(db, id) {
      db = pouchdb.create(db);
      return db.get(id);
    };

    this.remove = function(db, id, rev) {
      db = pouchdb.create(db);
      return db.remove(id, rev);
    };

    this.destroy = function(db) {
      db = pouchdb.create(db);
      return db.destroy();
    };

    this.bulkDocs = function(db, docs) {
      db = pouchdb.create(db);
      return db.bulkDocs(docs);
    };

    this.getRemoteDB = function(dbName){
      var REMOTE_URI = [config.user, '@', config.api.url, '/', dbName].join('');
      return pouchdb.create(REMOTE_URI);
    };

    this.compact = function(db){
      db = pouchdb.create(db);
      return db.compact();
    };

    this.viewCleanup = function(db){
      db = pouchdb.create(db);
      return db.viewCleanup();
    };

    this.query = function(db, key, value){
      db = pouchdb.create(db);
      //TODO: fix to use query i.e map reduce. currently map throw error on pouchdb.
      return db.allDocs({include_docs: true})
        .then(function(res){
          return res.rows
            .map(function(r){
              if(r.doc[key] === value && r.doc){
               return r.doc;
              }
            });
        });
    };

  });
