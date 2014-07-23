'use strict';

// TODO: remove. See item:751
angular.module('lmisChromeApp')
  .service('pouchMigrationService', function($q, $log, growl, i18n, chromeStorageApi, storageService, utility) {
    var migrationFlag = '_hasMigrated';

    function setMigratedFlag() {
      var flag = {};
      flag[migrationFlag] = true;
      return chromeStorageApi.set(flag);
    }

    function getMigratedFlag() {
      return chromeStorageApi.get(migrationFlag, {
        collection: true
      });
    }

    function isMigrationRequired(doc) {
      return !utility.has(doc, migrationFlag);
    }

    function migrationRequired() {
      var msg = i18n('migrationRequired');
      $log.info(msg);
      growl.info(msg);
    }

    function getChromeStorage() {
      return chromeStorageApi.get(null, {
        collection: true
      });
    }

    function filterCollections(collections) {
      return utility.pick(collections, storageService._COLLECTIONS);
    }

    function uuidToID(doc) {
      if (!utility.has(doc, '_id')) {
        if (utility.has(doc, 'uuid')) {
          doc._id = doc.uuid;
        } else {
          doc._id = utility.uuidGenerator();
        }
      }
      return doc;
    }

    function batchUUIDToID(docs) {
      var _docs = [];
      docs.forEach(function(doc) {
        doc = uuidToID(doc);
        _docs.push(doc);
      });
      return _docs;
    }

    function flattenNestedDocs(docs) {
      var _docs = [];
      docs.forEach(function(doc) {
        for (var key in doc) {
          _docs.push(doc[key]);
        }
      });
      return _docs;
    }

    function chromeToPouch(collections) {
      var promises = [];
      for (var table in collections) {
        var docs = utility.values(collections[table]);

        if (table === 'rate') {
          docs = flattenNestedDocs(docs);
        }

        docs = batchUUIDToID(docs);
        promises.push(storageService.setDatabase(table, docs));
      }
      return $q.all(promises);
    }

    this.migrate = function() {
      return getMigratedFlag()
        .then(isMigrationRequired)
        .then(function(required) {
          if (required) {
            migrationRequired();
            return getChromeStorage()
              .then(filterCollections)
              .then(chromeToPouch)
              .then(setMigratedFlag);
          }
        });
    };
  });
