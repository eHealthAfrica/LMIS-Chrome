'use strict';

angular.module('lmisChromeApp')
  .service('pouchStorageService', function(pouchdb, idbService, utility) {
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
      return pouchdb.destroy(db);
    };

    this.clear = function() {
      return idbService.clear('_pouch_');
    };

    this.bulkDocs = function(db, docs) {
      db = pouchdb.create(db);
      return db.bulkDocs(docs);
    };

  });
