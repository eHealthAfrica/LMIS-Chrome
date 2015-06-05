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
    return (currentRecord.balance + currentRecord.received) - currentRecord.used;
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
    var filtered = [];
    var selectedRecord = {};
    var previousDate = getRecordPreviousDate();
    if (utilizationList.length) {
      for (var i=0; i<utilizationList.length; i++) {

        if (utility.getFullDate(utilizationList[i].date) === utility.getFullDate(previousDate)) {
          filtered.push(utilizationList[i]);
        }
      }
    }

    if (filtered.length) {
      selectedRecord = filtered[0];
    }

    return selectedRecord;
  }

  function getPreviousDate(date, subtract) {
    var currentDate = utility.isDate(date) ? new Date(date) : new Date();
    var previousDate = new Date(currentDate);
    subtract = subtract || 1;
    return new Date(previousDate.setDate(currentDate.getDate() - subtract));
  }

  function getRecordPreviousDate() {
    var weekends = [0, 6];
    var previousDate = getPreviousDate();

    if (weekends.indexOf(previousDate.getDate()) !== -1) {
      var subtract = previousDate.getDate() === 0 ? 2 : 1;
      return getPreviousDate(previousDate, subtract);
    }
    return previousDate;
  }


});
