'use strict';

angular.module('lmisChromeApp').service('utilizationService', function($q, storageService, syncService) {
  var DB = storageService.UTILIZATION;

  this.save = function(record) {
    if (record.countDate instanceof Date) {
      record.countDate = record.date.toJSON();
    }
    return storageService.save(DB, record);
  };

  this.all = function() {
    return storageService.all(DB)
      .then(function(record) {
        return syncService.addSyncStatus(record);
      });
  };

  this.get = function(uuid) {
    return storageService.find(DB, uuid);
  };

  this.filterAntigens = function(selectedProducts) {
    var vaccines = {};
    (Object.keys(selectedProducts))
      .forEach(function(key) {
        var category = selectedProducts[key].category.name;
        if (category === 'Cold Store Vaccines') {
          vaccines[key] = selectedProducts[key];
        }
      });

    return vaccines;
  };

});
