'use strict';

angular.module('lmisChromeApp')
  .factory('ccuProfileFactory', function ($q, storageService, memoryStorageService, utility) {

    var getByUuid = function (uuid) {
      var ccuProfile = memoryStorageService.get(storageService.CCU_PROFILE, uuid);
      return ccuProfile;
    };

    var getCcuProfiles = function () {
      var ccuProfileDb = memoryStorageService.getDatabase(storageService.CCU_PROFILE);
      var ccuProfiles = utility.convertObjectToArray(ccuProfileDb);
      return ccuProfiles;
    };

    var getAllGroupedByCategory = function () {
      var ccuProfiles = getCcuProfiles();
      var groupedList = {};
      var NOT_FOUND = -1;
      for (var index in ccuProfiles) {
        var ccuProfile = ccuProfiles[index];
        var existingGroups = Object.keys(groupedList);
        if (existingGroups.indexOf(ccuProfile.RefType) === NOT_FOUND) {
          groupedList[ccuProfile.RefType] = [];
        }
        groupedList[ccuProfile.RefType].push(ccuProfile);
      }
      return groupedList;
    };

    return {
      getAllGroupedByCategory: getAllGroupedByCategory,
      getAll: getCcuProfiles,
      get: getByUuid
    };
  });
