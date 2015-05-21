'use strict';

angular.module('lmisChromeApp').service('immunizationSummaryService', function($q, storageService, syncService, $http, utility) {
  var DB = storageService.IMMUNIZATION_SUMMARY;
  var SETTINGS_DB = storageService.IMMUNIZATION_SUMMARY_SETTINGS;
  var PRODUCTS_DB = storageService.IMMUNIZATION_PRODUCTS;

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

  this.remove = function(uuid) {
    return storageService.remove(uuid);
  };

  this.saveSetting = function(setting) {
    return storageService.save(SETTINGS_DB, setting);
  };

  this.getSetting = function() {
    var deferred = $q.defer();
    $q.all([storageService.all(SETTINGS_DB), getProductList()])
      .then(function(response) {
        var settings = {};
        var records = response[0];
        var products = response[1];

        if (records.length) {
          settings = records[0];
        }
        if (!settings.products) {
          settings.products = products;
        }
        deferred.resolve(settings);
      })
      .catch(function(reason) {
        deferred.resolve(reason);
      });

    return deferred.promise;
  };

  this.removeSetting = function(uuid) {
    return storageService.remove(uuid);
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

  function getProductList() {
    var deferred = $q.defer();
    $http.get('scripts/fixtures/immunization-products.json')
      .success(function(response) {
        deferred.resolve(response);
      })
      .catch(function(reason) {
        deferred.reject(reason);
      });

    return deferred.promise;
  }

  this.productList = getProductList;

  this.getCurrentSummarySessionTypes = function() {
    var deferred = $q.defer();
    storageService.all(DB)
      .then(function(response) {
        var sessionTypeList = [];
        var today = utility.getFullDate(new Date());
        var filtered = response.filter(function(row) {
          return utility.getFullDate(row.date) === today;
        });
        if (filtered.length > 0) {
          sessionTypeList = filtered.map(function(row) {
            return row.sessionType;
          });
        }
        deferred.resolve(sessionTypeList);
      })
      .catch(function(reason) {
        deferred.reject(reason);
      });

    return deferred.promise;
  };

});
