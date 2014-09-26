'use strict';

angular.module('lmisChromeApp')
  .service('locationService', function(storageService, $http) {
    this.KANO_UUID = 'f87ed3e017cf4f8db26836fd910e4cc8';

    this.getLgas = function(stateId) {
      //TODO: refactor later run query in view.
      return storageService.all(storageService.LOCATIONS)
        .then(function(locs) {
          return locs
            .filter(function(l) {
              return l.doc_type === 'lga' && l.parent === stateId;
            })
            .sort(sort);
        });
    };

    this.getWards = function(lgaId) {
      return storageService.all(storageService.LOCATIONS)
        .then(function(locs) {

          return locs
            .filter(function(l) {
              return l.doc_type === 'ward' && l.parent === lgaId;
            })
            .sort(sort);
        });
    };
    /*$http.get('http://dev.lomis.ehealth.org.ng:5984/locations/_all_docs/?include_docs=true')
      .then(function(result){
        result.data.rows.forEach(function(row){
           storageService.save(storageService.LOCATIONS, row.doc);
        })
      });*/
   // storageService.remove('locations');
    this.getZones = function(stateId){
      return storageService.all(storageService.LOCATIONS)
        .then(function(locs) {
          return locs
            .filter(function(l) {

              return l.doc_type === 'zone' && l.parent === stateId;
            })
            .sort(sort);
        });
    };
    this.saveBatch = function(locations) {
      return storageService.setDatabase(storageService.LOCATIONS, locations);
    };

    var sort = function(a, b) {
      var aName = a.name.toLowerCase();
      var bName = b.name.toLowerCase();
      if (aName < bName) {
        return -1;
      } else if (aName > bName) {
        return  1;
      } else {
        return 0;
      }
    };

  });
