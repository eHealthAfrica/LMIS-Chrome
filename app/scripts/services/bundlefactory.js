'use strict';

angular.module('lmisChromeApp')
    .factory('bundleFactory', function ($q, storageService) {

      /**
       * function used get JSON response for a bundle.
       * 
       * @param bundleUUID
       * @returns {promise|*}
       */
      function get(bundleUUID) {
        var defered = $q.defer();
        var facilities = {};
        var users = {};
        var bundle = null;

        //TODO: consider refactoring these into their respective factory.
        storageService.get(storageService.FACILITY).then(function (data) {
             facilities = data;
        });

        storageService.get(storageService.USER).then(function (data) {
             users = data;
        });


        try {
          storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
            //compose bundle response
            bundle = {
              "uuid": data.uuid,
              "receiving_facility": facilities[data.receiving_facility],
              "parent": facilities[data.parent],
              "order": "12345-90882", //TODO: replace with order object when complete
              "bundleLines": []
            };
            defered.resolve(bundle);
          });
        } catch (e) {
          defered.resolve(null);
        }finally{
          return defered.promise;
        }
      }

      /**
       * This functions returns a collection of bundle lines that belongs to the given bundleUUID
       * @param bundleUUID
       * @returns {Array}
       */
      function getBundleLines(bundleUUID) {
        var bundleLines = [];
        storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
          if (data !== undefined) {
            for (var index in data.bundle_lines) {
              var bundleLineUUID = data.bundle_lines[index];
              storageService.find(storageService.BUNDLE_LINES, bundleLineUUID).then(function (data) {
                if (data !== undefined) {
                  bundleLines.push(data);
                }
              });
            }
          }
        });
        return bundleLines;
      }

      return {
        getBundleLines: getBundleLines,
        getBundle: get
      }
    });