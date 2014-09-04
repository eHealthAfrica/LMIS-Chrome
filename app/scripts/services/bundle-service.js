'use strict';

angular.module('lmisChromeApp')
  .service('bundleService', function(storageService, syncService, utility) {

    this.INCOMING = '0';
    this.OUTGOING = '1';
    this.BUNDLE_DB = storageService.BUNDLE;

    this.get = function(uuid) {
      return storageService.find(storageService.BUNDLE, uuid);
    };

    this.getAll = function() {
      return storageService.all(storageService.BUNDLE)
        .then(function(bundles) {
          return syncService.addSyncStatus(bundles);
        });
    };

    this.save = function(bundle) {
      return storageService.save(storageService.BUNDLE, bundle);
    };

    this.getBundlesByDate = function(date) {
      date = new Date(date);
      return this.getAll(storageService.BUNDLE)
        .then(function(res) {
          return res.filter(function(b) {
            return (new Date(b.receivedOn)).getTime() >= date.getTime();
          });
        });
    };

    this.getSummary = function(bundle, prodProfiles) {
      var bundleTypeSummary = {};
      var ppKV = utility.castArrayToObject(prodProfiles, 'uuid');
      var pp;
      var product;
      bundle.bundleLines
        .forEach(function(bl) {
          pp = ppKV[bl.productProfile];
          if (angular.isObject(pp)) {
            product = pp.product;
            if (angular.isObject(product)) {
              if (isNaN(bundleTypeSummary[product.uuid])) {
                bundleTypeSummary[product.uuid] = bl.quantity;
              } else {
                bundleTypeSummary[product.uuid] += bl.quantity;
              }
            } else {
              console.warn('product profile ' + pp.uuid + ' does not have product type.');
            }
          } else {
            console.warn('product profile is not an object ' + pp);
          }
        });
      return bundleTypeSummary;
    };

    this.getBundleSummaries = function(bundles, prodProfiles) {
      var totalSummary = {};
      var b;
      var bundleSummary;
      for (var i in bundles) {
        b = bundles[i];
        bundleSummary = this.getSummary(b, prodProfiles);
        var qty;
        for (var pType in bundleSummary) {
          qty = bundleSummary[pType];
          if (this.OUTGOING === b.type) {
            qty = (-qty);
          }
          if (isNaN(totalSummary[pType])) {
            totalSummary[pType] = qty;
          } else {
            totalSummary[pType] += qty;
          }
        }
      }
      return totalSummary;
    };

    this.getRecentFacilityIds = function(type) {
      var incoming = this.INCOMING;
      var outgoing = this.OUTGOING;
      return this.getAll()
        .then(function(bundles) {
          var recentFacilities = [];
          bundles
            .filter(function(b) {
              return b.type === type;
            })
            .sort(function(a, b) {
              return (new Date(b.created) - new Date(a.created));
            })
            .forEach(function(bundle) {
              var facilityId;
              if (bundle.type === incoming) {
                facilityId = bundle.sendingFacility;
              } else if (bundle.type === outgoing) {
                facilityId = bundle.receivingFacility;
              }
              if(recentFacilities.indexOf(facilityId) === -1){
                recentFacilities.push(facilityId);
              }
            });
          return recentFacilities;
        });
    };

  });
