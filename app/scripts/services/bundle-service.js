'use strict';

angular.module('lmisChromeApp')
  .service('bundleService', function(storageService, syncService) {

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
            {_id : "3540", name : "Fagge"},
            {_id : "3541", name : "Ungogo"},
            {_id : "3542", name : "Gezawa"},
            {_id : "3543", name : "warawa"},
            {_id : "3544", name : "Takai"},
            {_id : "3545", name : "Garko"},
            {_id : "3546", name : "Sumaila"}

        ]
        this.wards = [
            {_id : "3531-1", name : "Adakawa", lga_id : "3531"},
            {_id : "3531-2", name : "Gwammaja", lga_id : "3531"},
            {_id : "3531-3", name : "Kabuwaya (Makarfi-Dala)", lga_id : "3531"},
            {_id : "3531-4", name : "Fagge", lga_id : "3531"},
            {_id : "3531-5", name : "Goburawa", lga_id : "3531"},
            {_id : "3531-6", name : "Kantudu", lga_id : "3531"},
            {_id : "3540-1", name : "Rijiyar Lemo", lga_id : "3540"},
            {_id : "3540-2", name : "Kwachiri", lga_id : "3540"},
            {_id : "3541-1", name : "Yada Kunya", lga_id : "3541"},
            {_id : "3542-1", name : "Ketawa", lga_id : "3542"},
            {_id : "3542-2", name : "Gezawa", lga_id : "3542"},
            {_id : "3543-1", name : "Juma Galadima", lga_id : "3543"},
            {_id : "3543-2", name : "Tanagar", lga_id : "3543"},
            {_id : "3526-1", name : "Faragai", lga_id : "3526"},
            {_id : "3544-1", name : "Zuga", lga_id : "3544"},
            {_id : "3525-1", name : "Gafasa", lga_id : "3525"},
            {_id : "3545-1", name : "Gurjiya", lga_id : "3545"},
            {_id : "3546-1", name : "Sumaila", lga_id : "3546"},
            {_id : "3546-2", name : "Kanawa", lga_id : "3546"},
        ]
        this.fac = [
            {_id : "3531-1-1",name : "Adakawa", ward_id : "3531-1"},
            {_id : "3531-2-1",name : "Gwammaja MCH", ward_id : "3531-2"},
            {_id : "3531-3-1",name : "Dala", ward_id : "3531-3"},
            {_id : "3531-4-1",name : "Sabo Garba", ward_id : "3531-4"},
            {_id : "3531-5-1",name : "Kurna", ward_id : "3531-5"},
            {_id : "3526-6-1",name : "Kantudu", ward_id : "3531-6"},
            {_id : "3526-7-1",name : "Sheikh Abubakar Mijinyawa", ward_id : "3531-7"},
            {_id : "3540-1-1",name : "Rijiyar Lemo", ward_id : "3540-1"},
            {_id : "3540-1-2",name : "Kwachiri", ward_id : "3540-1"},
            {_id : "3541-1-1",name : "Inusawa", ward_id : "3541-1"},
            {_id : "3542-1-1",name : "Danja", ward_id : "3542-1"},
            {_id : "3542-1-2",name : "Gezawa HP", ward_id : "3542-1"},
            {_id : "3543-1-1",name : "Juma Galadima", ward_id : "3543-1"},
            {_id : "3543-2-1",name : "Tanagar", ward_id : "3543-2"},
            {_id : "3526-1-1",name : "Faragai", ward_id : "3526-1"},
            {_id : "3544-1-1",name : "Zuga", ward_id : "3544-1"},
            {_id : "3525-1-1",name : "Gafasa", ward_id : "3525-1"},
            {_id : "3545-1-1",name : "Gurjiya", ward_id : "3545-1"},
            {_id : "3546-1-1",name : "Karofi", ward_id : "3546-1"},
            {_id : "3546-2-1",name : "Kanawa", ward_id : "3546-2"},
        ]

    this.INCOMING = '0';
    this.OUTGOING = '1';
    this.BUNDLE_DB = storageService.BUNDLE;

    this.get = function(uuid){
      return storageService.find(storageService.BUNDLE, uuid);
    };

    this.getAll = function(){
      return storageService.all(storageService.BUNDLE)
          .then(function(bundles){
              return syncService.addSyncStatus(bundles);
          });
    };

    this.save = function(bundle){
      return storageService.save(storageService.BUNDLE, bundle);
    };

    this.loadWards = function(lga_id){

    };
    this.loadFac = function(ward_id){

    }
  });
