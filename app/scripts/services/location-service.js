'use strict';

/*

 */
angular.module("lmisChromeApp").service("locationService", function(storageService){

        var DBNAME = "locations"

        this.get = function(location_id){
            return storageService.get(DBNAME,location_id);
        }
        this.getLgas = function(state_id){
            return storageService.query(DBNAME,'parent', state_id);
        }
        this.getWards = function(lga_id){
            return storageService.query(DBNAME, 'parent', lga_id);
        }
        this.getFacilities = function(ward_id){
            return storageService.query(DBNAME, 'parent', ward_id);
        }

})


