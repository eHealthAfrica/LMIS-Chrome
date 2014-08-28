'use strict';

angular.module('lmisChromeApp')
  .service('bundleService', function(storageService, syncService) {

    this.INCOMING = '0';
    this.OUTGOING = '1';
    this.BUNDLE_DB = storageService.BUNDLE;

    this.get = function(uuid){
      return storageService.find(storageService.BUNDLE, uuid);
    };

    this.getAll = function(){
      return storageService.all(storageService.BUNDLE)
          .then(function(bundles){
              return syncService.addSyncStatus(bundles);
          });
    };

    this.save = function(bundle){
      return storageService.save(storageService.BUNDLE, bundle);
    };

  });
