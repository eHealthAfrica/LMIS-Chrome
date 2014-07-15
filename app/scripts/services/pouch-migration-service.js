'use strict';

// TODO: remove. See item:751
angular.module('lmisChromeApp')
  .service('pouchMigrationService', function($q, $window, growl, i18n, chromeStorageApi, storageService, utility) {
    function isMigrationRequired() {
      var manifest = $window.chrome.runtime.getManifest();
      return manifest.version === '0.10.4';
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

    function migrate() {
      if (!isMigrationRequired()) { return; }
      var msg = i18n('migrationRequired');
      growl.info(msg);
      return getChromeStorage()
        .then(filterCollections)
        .then(chromeToPouch);
    }

    this.migrate = function() {
      return $q.when(migrate());
    };
  });
