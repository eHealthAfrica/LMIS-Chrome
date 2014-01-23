'use strict';

angular.module('lmisChromeApp')
  .factory('utility', function ($http, storageService) {
    // Service logic
    // ...
    function loadFixture(){
        //database=['products', 'address', 'uom', 'uom_category' ]
        var products = null;
        var address = null;
        var uom = null;
        var uom_category = null;
        var facility = null;
        var programs = null;
        var facility_type = null;
        storageService.get('products').then(function(data){
            products = data;
        });
        storageService.get('address').then(function(data){
            address = data;
        });
        storageService.get('uom').then(function(data){
            uom = data;
        });
        storageService.get('uom_category').then(function(data){
            uom_category = data;
        });
        storageService.get('facility').then(function(data){
            facility = data;
        });
        storageService.get('programs').then(function(data){
            programs = data;
        });
        storageService.get('facility_type').then(function(data){
            facility_type = data;
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
