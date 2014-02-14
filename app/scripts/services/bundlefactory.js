'use strict';

angular.module('lmisChromeApp')
    .factory('bundleFactory', function (storageService) {

      /**
       * This functions returns a collection of bundle lines that belongs to the given bundleUUID
       * @param bundleUUID
       * @returns {Array}
       */
      function getBundleLines(bundleUUID){
        var bundleLines = [];
        storageService.find(storageService.BUNDLE, bundleUUID).then(function(data){
          console.log(data.parent);
          if(data !== undefined){
            console.log(data.bundle_lines);
            for(var index in data.bundle_lines){
              var bundleLineUUID = data.bundle_lines[index];
              console.log(bundleLineUUID);
              storageService.find(storageService.BUNDLE_LINES ,bundleLineUUID).then(function(data){
                if(data !== undefined){
                 bundleLines.push(data);
                }
              });
            }
          }

        });
        return bundleLines;
      }

      return {
        getBundleLines: getBundleLines
      }
    });