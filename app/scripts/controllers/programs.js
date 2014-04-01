'use strict';

angular.module('lmisChromeApp')
  .controller('ProgramsCtrl', function($scope, storageService) {
    storageService.get(storageService.PROGRAM).then(function(programs) {
      $scope.programList = programs;
    });
  })

  .controller('programFormCtrl', function($scope, storageService, $location, alertsFactory) {
    $scope.program = {};
    $scope.uuid = ($location.search()).uuid;

    if ($scope.uuid) {
      storageService.loadTableObject(storageService.PROGRAM).then(function(
        programs) {
        $scope.program = programs[$scope.uuid];
      });

    }

    $scope.saveProgram = function() {
      if (Object.keys($scope.program).length > 0) {
        storageService.save(storageService.PROGRAM, $scope.program).then(
          function() {
            var msg = ($scope.uuid) ? {
              message: 'Program update was successful'
            } : {
              message: 'Program entry was successful'
            };
            alertsFactory.success(msg);
            $location.path('/main/programs');
          });
      } else {
        alertsFactory.danger('Can\'t save a blank form');
      }
    };

    storageService.get(storageService.PROGRAM).then(function(programs) {
      $scope.programList = programs;
    });

    $scope.removeProgram = function(uuid) {
      console.log(uuid);
      utility.loadTableObject(storageService.PROGRAM).then(function(programs) {
        $scope.program = programs[uuid];
        // jshint camelcase: false
        var index = $scope.program.array_index;
        $scope.programList.splice(index, 1);
        storageService.add(storageService.PROGRAM, $scope.programList);
      });
    };
  })

  // jshint camelcase: false
  .controller('ProgramsProductsCtrl', function($scope, storageService) {
    storageService.get(storageService.PROGRAM_PRODUCTS).then(function(
      programProducts) {
      $scope.programProductList = programProducts;
    });
    storageService.loadTableObject(storageService.PROGRAM).then(function(
      programs) {
      $scope.programs_object = programs;
    });
    storageService.loadTableObject(storageService.PRODUCT_TYPES).then(function(
      products) {
      $scope.products_object = products;
    });
    storageService.loadTableObject(storageService.CURRENCY).then(function(
      currency) {
      $scope.currency_object = currency;
    });
    storageService.loadTableObject(storageService.COMPANY).then(function(
      company) {
      $scope.company_object = company;
    });
  })

  .controller('programProductFormCtrl', function($scope, storageService, $location, alertsFactory) {

    storageService.get(storageService.PROGRAM).then(function(programs) {
      $scope.programList = programs;
    });

    storageService.get(storageService.PRODUCT_TYPES).then(function(products) {
      $scope.product_types = products;
    });

    storageService.get(storageService.CURRENCY).then(function(currency) {
      $scope.priceCurrencyList = currency;
    });
    storageService.get(storageService.COMPANY).then(function(company) {
      $scope.companyList = company;
    });

    $scope.program_product = {};
    $scope.uuid = ($location.search()).uuid;

    if ($scope.uuid) {
      storageService.loadTableObject(storageService.PROGRAM_PRODUCTS).then(
        function(programProducts) {
          $scope.program_product = programProducts[$scope.uuid];
        });

    }

    $scope.saveProgramProduct = function() {
      if (Object.keys($scope.program_product).length > 0) {
        storageService.save(storageService.PROGRAM_PRODUCTS, $scope.program_product)
          .then(function() {
            var msg = ($scope.uuid) ? {
              message: 'Program update was successful'
            } : {
              message: 'Program entry was successful'
            };
            alertsFactory.success(msg);
            $location.path('/main/program_products');
          });

      } else {
        alertsFactory.danger('Can\'t save a blank form');
      }
    };
    storageService.get(storageService.PROGRAM_PRODUCTS).then(function(
      programProducts) {
      $scope.programProductList = programProducts;
    });
    $scope.removeProgramProduct = function(uuid) {
      console.log(uuid);
      storageService.loadTableObject(storageService.PROGRAM_PRODUCTS).then(
        function(programProducts) {
          $scope.program_product = programProducts[uuid];
          var index = $scope.program_product.array_index;
          $scope.programProductList.splice(index, 1);
          storageService.add(storageService.PROGRAM_PRODUCTS, $scope.programProductList);
        });

    };
  })

  .controller('ProductProfileListCtrl', function($scope, storageService, $filter,
    ngTableParams) {
    storageService.get(storageService.PRODUCT_PROFILE).then(function(data) {
      // Table defaults
      var params = {
        page: 1,
        count: 10,
        sorting: {
          name: 'asc'
        }
      };

      // Pagination
      var resolver = {
        total: data.length,
        getData: function($defer, params) {
          var orderedData = params.sorting() ? $filter('orderBy')(data,
            params.orderBy()) : data;
          $defer.resolve(orderedData.slice(
            (params.page() - 1) * params.count(),
            params.page() * params.count()
          ));
        }
      };

      // jshint newcap: false
      $scope.productProfiles = new ngTableParams(params, resolver);

    });

    storageService.get(storageService.PRODUCT_PRESENTATION).then(function(data) {
      $scope.presentations = data;
    });

    storageService.get(storageService.UOM).then(function(data) {
      $scope.uomList = data;
    });

    storageService.get(storageService.PRODUCT_FORMULATION).then(function(data) {
      $scope.formulations = data;
    });

    storageService.get(storageService.MODE_OF_ADMINISTRATION).then(function(
      data) {
      $scope.modes = data;
    });

    storageService.get(storageService.PRODUCT_TYPES).then(function(data) {
      $scope.products = data;
    });

  })

  .controller('AddProductProfileCtrl', function($scope, storageService) {

    $scope.productProfile = {}; //default controller for holding form data

    storageService.loadTableObject(storageService.PRODUCT_PRESENTATION).then(
      function(data) {
        $scope.presentations = data;
      });

    storageService.loadTableObject(storageService.PRODUCT_FORMULATION).then(
      function(data) {
        $scope.formulations = data;
      });

    storageService.loadTableObject(storageService.MODE_OF_ADMINISTRATION).then(
      function(data) {
        $scope.modes = data;
      });

    storageService.loadTableObject(storageService.UOM).then(function(data) {
      $scope.uomList = data;
    });

    storageService.loadTableObject(storageService.PRODUCT_TYPES).then(function(
      data) {
      $scope.products = data;
    });

    $scope.save = function() {
      console.log($scope.productProfile);
    };

  });
