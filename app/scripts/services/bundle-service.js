'use strict';

angular.module('lmisChromeApp')
  .service('bundleService', function(storageService) {

        this.states = [{_id : "2637837878383",name : "kano" }];
        this.lga    = [
            {_id : "3525", name : "Anjingi"},
             {_id : "3526", name : "Albasu"},
             {_id : "3527", name : "Bagwai"},
             {_id : "3528", name : "Bebeji"},
            {_id : "3529", name : "Bichi" },
            {_id : "3530", name : "Bunkure"  },
            {_id : "3531", name : "Dala"  },
            {_id : "3532", name : "Dambatta "},
            {_id : "3533", name : "Dawakin Kudu "},

        ]
        this.wards = [
            {_id : "3525-1", name : "Ward-5-1", lga_id : "3525"},
            {_id : "3525-2", name : "Ward-5-2", lga_id : "3525"},
            {_id : "3526-1", name : "Ward-6-1", lga_id : "3526"},
            {_id : "3526-2", name : "Ward-6-2", lga_id : "3526"}
        ]
        this.fac = [
            {_id : "3525-1-1",name : "facility 5-1-1", ward_id : "3525-1"},
            {_id : "3525-1-2",name : "facility 5-1-2", ward_id : "3525-1"},
            {_id : "3525-2-1",name : "facility 5-2-1", ward_id : "3525-2"},
            {_id : "3525-2-2",name : "facility 5-2-2", ward_id : "3525-2"},
            {_id : "3526-1-1",name : "facility 6-1-1", ward_id : "3526-1"},
            {_id : "3526-1-2",name : "facility 6-1-2", ward_id : "3526-1"},
            {_id : "3526-2-1",name : "facility 6-2-1", ward_id : "3526-2"},
            {_id : "3526-2-2",name : "facility 6-2-2", ward_id : "3526-2"}
        ]

    this.INCOMING = '0';
    this.OUTGOING = '1';

    this.get = function(uuid){
      return storageService.find(storageService.BUNDLE, uuid);
    };

    this.getAll = function(){
      return storageService.all(storageService.BUNDLE);
    };

    this.save = function(bundle){
      return storageService.save(storageService.BUNDLE, bundle);
    };

    this.loadWards = function(lga_id){

    };
    this.loadFac = function(ward_id){

    }
  });
