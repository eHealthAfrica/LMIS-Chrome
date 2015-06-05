'use strict';

angular.module('lmisChromeApp').service('utilizationService', function($q, storageService, syncService, utility) {
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

  this.getPreviousBalance = function(uuid, utilizationList) {
    var record = previousRecord(utilizationList).products || {};
    record[uuid] = record[uuid] || {};
    return record[uuid].endingBalance || 0;
  };

  this.getEndingBalance = function(currentRecord) {
    currentRecord = currentRecord || {};
    currentRecord.balance = currentRecord.balance || 0;
    currentRecord.used = currentRecord.used || 0;
    currentRecord.received = currentRecord.received || 0;
    currentRecord.returned = currentRecord.returned || 0;
    return (currentRecord.balance + currentRecord.received) - (currentRecord.used + currentRecord.returned);
  };

  this.validateEntry = function(productObject) {
    ['balance', 'received', 'used', 'endingBalance', 'returned']
      .forEach(function(key) {
        if (productObject[key] === undefined) {
          productObject[key] = 0;
        }
      });

    return productObject;
  };

  function previousRecord(utilizationList) {
    var selectedRecord = {};
    if (utilizationList.length) {
      selectedRecord = utilizationList.sort(function(a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })[0];
    }
    return selectedRecord;
  }

});
