'use strict';

angular.module('lmisChromeApp')
    .factory('bundleFactory', function ($q, storageService) {

      var BUNDLE_STATUS = ["Pending", "In Transit", "Done"];//TODO: move this to a table in local storage(JIDEOBI)

      function saveBundleReceipt(bundleReceipt) {
        //TODO: add proper and necessary checks later like validations when the complete flow and data integrity check
        //has been finalized etc.
        //TODO: Also add transaction so that it is either all succeeds or none.
        storageService.insert(storageService.BUNDLE_RECEIPT, bundleReceipt).then(function (bundleReceiptUUID) {
          var bundleReceiptLines = bundleReceipt.bundle_receipt_lines;

          /* delete bundleReceipt.bundle_receipt_lines before saving so it is not saved along with bundleReceipt
           since bundle_receipt_lines are saved on different table.
           */
          delete bundleReceipt.bundle_receipt_lines;

          if (bundleReceiptUUID !== undefined) {
            for (var index in bundleReceiptLines) {
              var bundleReceiptLine = bundleReceiptLines[index];
              bundleReceiptLine['bundle_receipt'] = bundleReceiptUUID;
              storageService.insert(storageService.BUNDLE_RECEIPT_LINES, bundleReceiptLine).then(function (bundleReceiptLineUUID) {

              });
            }
            return bundleReceiptUUID;
          }
          return bundleReceiptUUID;
        });
      }

      /**
       * function used get JSON response for a bundle.
       *
       * @param bundleUUID
       * @returns {promise|*}
       */
      function get(bundleUUID) {
        var deferred = $q.defer();
        var facilities = {};
        var users = {};

        //TODO: consider refactoring these into their respective factory(JIDEOBI).
        storageService.get(storageService.FACILITY).then(function (data) {
          facilities = data;
        });

        storageService.get(storageService.USER).then(function (data) {
          users = data;
        });

        try {
          storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
            //compose bundle response
            if (data !== undefined) {
              var bundle = {
                "uuid": data.uuid,
                "receiving_facility": facilities[data.receiving_facility],
                "parent": facilities[data.parent],
                "order": "12345-90882", //TODO: replace with order object when complete
                "bundle_lines": getBundleLines(bundleUUID)
              };
              deferred.resolve(bundle);
            } else {
              deferred.reject();
            }
          });

        } catch (e) {
          deferred.reject(e);
        } finally {
          return deferred.promise;
        }
      }

      /**
       * This functions returns a collection of bundle lines that belongs to the given bundleUUID
       * @param bundleUUID
       * @returns {Array}
       */
      function getBundleLines(bundleUUID) {
        var batches = {};
        var programs = {};
        var productTypes = {};
        var uomList = {};

        storageService.get(storageService.BATCH).then(function (data) {
          batches = data;
        });

        storageService.get(storageService.PROGRAM).then(function (data) {
          programs = data;
        });

        storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
          productTypes = data;
        });

        storageService.get(storageService.UOM).then(function (data) {
          uomList = data;
        });

        var bundleLines = [];
        storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
          if (data !== undefined) {

            for (var index in data.bundle_lines) {
              var bundleLineUUID = data.bundle_lines[index];
              storageService.find(storageService.BUNDLE_LINES, bundleLineUUID).then(function (data) {
                if (data !== undefined) {
                  var batch = batches[data.batch];
                  batch.product = productTypes[batch.product];
                  console.log(data);
                  var bundleLine = {
                    "uuid": data.uuid,
                    "program": programs[data.program],
                    "batch": batch,
                    "quantity": data.quantity,
                    "quantity_uom": uomList[data.quantity_uom],
                    "verify": 0,
                    "storage_units": ""
                  };
                  bundleLines.push(bundleLine);
                }
              });
            }

          }
        });
        return bundleLines;
      }

      function getBundleReceiptLine(bundleUUID) {
        var batches = {};
        var programs = {};
        var productTypes = {};
        var uomList = {};
        var bundleLines = [];

        storageService.get(storageService.BATCH).then(function (data) {
          batches = data;
        });

        storageService.get(storageService.PROGRAM).then(function (data) {
          programs = data;
        });

        storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
          productTypes = data;
        });

        storageService.get(storageService.UOM).then(function (data) {
          uomList = data;
        });

        storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
          if (data !== undefined) {
            for (var index in data.bundle_lines) {
              var bundleLineUUID = data.bundle_lines[index];
              storageService.find(storageService.BUNDLE_LINES, bundleLineUUID).then(function (data) {
                if (data !== undefined) {
                  var batch = batches[data.batch];
                  batch.product = productTypes[batch.product];
                  console.log(data);
                  var bundleLine = {
                    "bundle": data.uuid,
                    "program": programs[data.program].name,
                    "batch": batch,
                    "quantity": data.quantity,
                    "quantity_uom": uomList[data.quantity_uom],
                    "verify": 0
                  };
                  bundleLines.push(bundleLine);
                }
              });
            }
          }
        });
        return bundleLines;
      }

      return {
        getBundleLines: getBundleLines,
        getBundle: get,
        saveBundleReceipt: saveBundleReceipt,
        getBundleReceiptLines: getBundleReceiptLine
      }
    });
