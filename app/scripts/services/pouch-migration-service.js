'use strict';

// TODO: remove. See item:751
angular.module('lmisChromeApp')
  .service('pouchMigrationService', function($q, $log, $window, growl, i18n, chromeStorageApi, storageService, utility) {
    var versionNeedingMigration = '0.10.4';
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

    function isMigratable() {
      var manifest = $window.chrome.runtime.getManifest();
      return manifest.version === versionNeedingMigration;
    }

    function isMigrationRequired(doc) {
      if (!utility.has(doc, migrationFlag)) {
        return isMigratable();
      }
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

    function chromeToPouch(collections) {
      var promises = [];
      for (var table in collections) {
        var docs = utility.values(collections[table]);
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
