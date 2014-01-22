'use strict';

angular.module('lmisChromeApp')
  .factory('utility', function ($http, storageService) {
    // Service logic
    // ...
    function loadFixture(){
        var products = null;
        var address = null;
        var uom = null;
        var uom_category = null;
        var facility = null;
        var programs = null;
        var facility_type = null;
        storageService.get('products').then(function(d){
            products = d;
        });
        storageService.get('address').then(function(d){
            address = d;
        });
        storageService.get('uom').then(function(d){
            uom = d;
        });
        storageService.get('uom_category').then(function(d){
            uom_category = d;
        });
        storageService.get('facility').then(function(d){
            facility = d;
        });
        storageService.get('programs').then(function(d){
            programs = d;
        });
        storageService.get('facility_type').then(function(d){
            facility_type = d;
        });
        if(!products){
            $http.get('scripts/fixtures/products.json').success(function(data){
                storageService.add('products', data);

            }).error(function(err){
                console.log(err);
            });
        }
        if(!address){
            $http.get('scripts/fixtures/address.json').success(function(data){
                storageService.add('address', data);

            }).error(function(err){
                console.log(err);
            });
        }

        if(!facility){
            $http.get('scripts/fixtures/facility.json').success(function(data){
                storageService.add('facility', data);

            }).error(function(err){
                console.log(err);
            });
        }

        if(!uom){
            $http.get('scripts/fixtures/uom.json').success(function(data){
                storageService.add('uom', data);

            }).error(function(err){
                console.log(err);
            });
        }

        if(!uom_category){
            $http.get('scripts/fixtures/uom-category.json').success(function(data){
                storageService.add('uom_category', data);

            }).error(function(err){
                console.log(err);
            });
        }

        if(!facility_type){
            $http.get('scripts/fixtures/facility-type.json').success(function(data){
                storageService.add('facility_type', data);

            }).error(function(err){
                console.log(err);
            });
        }
         if(!programs){
            $http.get('scripts/fixtures/programs.json').success(function(data){
                storageService.add('programs', data);

            }).error(function(err){
                console.log(err);
            });
        }
    }
    // Public API here
    return {
        loadFixture:loadFixture
    };
  });
