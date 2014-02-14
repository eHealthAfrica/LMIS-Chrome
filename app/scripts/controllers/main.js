'use strict';

angular.module('lmisChromeApp')
    .controller('MainCtrl', function ($scope, storageService) {
      //TODO: uncomment this to clear local storage and load new fixture any time you update fixture then comment back
      //storageService.clear();

    })
/**
 * Program
 */
    .controller('ProgramsCtrl', function ($scope, storageService) {
      storageService.get(storageService.PROGRAM).then(function (programs) {
        $scope.programList = programs;
      });
    })

    .controller('programFormCtrl', function ($scope, storageService, $location) {
      $scope.program = {};
      $scope.uuid = ($location.search()).uuid;

      if ($scope.uuid) {
        storageService.loadTableObject(storageService.PROGRAM).then(function (programs) {
          $scope.program = programs[$scope.uuid];
        });

      }

      $scope.saveProgram = function () {
        if (Object.keys($scope.program).length > 0) {
          storageService.insert(storageService.PROGRAM, $scope.program).then(function () {
            var msg = ($scope.uuid) ? {
              type: 'success',
              message: 'Program update was successful'
            } : {
              type: 'success',
              message: 'Program entry was successful'
            };
            $scope.setMessage(msg);
            $location.path('/main/programs');
          });
        } else {
          $scope.setMessage({
            type: 'danger',
            message: 'Can\'t save a blank form'
          });
        }
      };

      storageService.get(storageService.PROGRAM).then(function (programs) {
        $scope.programList = programs;
      });

      $scope.removeProgram = function (uuid) {
        console.log(uuid);
        utility.loadTableObject(storageService.PROGRAM).then(function (programs) {
          $scope.program = programs[uuid];
          // jshint camelcase: false
          var index = $scope.program.array_index;
          $scope.programList.splice(index, 1);
          storageService.add(storageService.PROGRAM, $scope.programList);
        });
      };
    })

    .controller('ProgramsProductsCtrl', function ($scope, storageService, $location) {
      storageService.get(storageService.PROGRAM_PRODUCTS).then(function (programProducts) {
        $scope.programProductList = programProducts;
      });
      storageService.loadTableObject(storageService.PROGRAM).then(function (programs) {
        $scope.programs_object = programs;
      });
      storageService.loadTableObject(storageService.PRODUCT_TYPES).then(function (products) {
        $scope.products_object = products;
      });
      storageService.loadTableObject(storageService.CURRENCY).then(function (currency) {
        $scope.currency_object = currency;
      });
      storageService.loadTableObject(storageService.COMPANY).then(function (company) {
        $scope.company_object = company;
      });
    })


/**
 *  programProductFormCtrl - This handles the addition of program products
 *
 *
 */

    .controller('programProductFormCtrl', function ($scope, storageService, $location) {

      storageService.get(storageService.PROGRAM).then(function (programs) {
        $scope.programList = programs;
      });

      storageService.get(storageService.PRODUCT_TYPES).then(function (products) {
        $scope.product_types = products;
      });

      storageService.get(storageService.CURRENCY).then(function (currency) {
        $scope.priceCurrencyList = currency;
      });
      storageService.get(storageService.COMPANY).then(function (company) {
        $scope.companyList = company;
      });

      $scope.program_product = {};
      $scope.uuid = ($location.search()).uuid;

      if ($scope.uuid) {
        storageService.loadTableObject(storageService.PROGRAM_PRODUCTS).then(function (programProducts) {
          $scope.program_product = programProducts[$scope.uuid];
        });

      }

      $scope.saveProgramProduct = function () {
        if (Object.keys($scope.program_product).length > 0) {
          storageService.insert(storageService.PROGRAM_PRODUCTS, $scope.program_product).then(function (bool) {
            var msg = ($scope.uuid) ? {type: "success", message: "Program update was successful"} : {type: "success", message: "Program entry was successful"}
            $scope.setMessage(msg);
            $location.path("/main/program_products");
          });

        }
        else {
          $scope.setMessage({type: "danger", message: "Can't save a blank form"})
        }
      }
      storageService.get(storageService.PROGRAM_PRODUCTS).then(function (programProducts) {
        $scope.programProductList = programProducts;
      });
      $scope.removeProgramProduct = function (uuid) {
        console.log(uuid);
        storageService.loadTableObject(storageService.PROGRAM_PRODUCTS).then(function (programProducts) {
          $scope.program_product = programProducts[uuid];
          var index = $scope.program_product.array_index;
          $scope.programProductList.splice(index, 1);
          storageService.add(storageService.PROGRAM_PRODUCTS, $scope.programProductList);
        });

      }
    })

/**
 *  ProductProfileListCtrl -  displays list of product profile
 */
    .controller('ProductProfileListCtrl', function ($scope, storageService, $filter, ngTableParams) {
      storageService.get(storageService.PRODUCT_PROFILE).then(function (data) {
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
          getData: function ($defer, params) {
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            $defer.resolve(orderedData.slice(
                (params.page() - 1) * params.count(),
                params.page() * params.count()
            ));
          }
        }

        $scope.productProfiles = new ngTableParams(params, resolver);

      });

      storageService.get(storageService.PRODUCT_PRESENTATION).then(function (data) {
        $scope.presentations = data;
      });

      storageService.get(storageService.UOM).then(function (data) {
        $scope.uomList = data;
      });

      storageService.get(storageService.PRODUCT_FORMULATION).then(function (data) {
        $scope.formulations = data;
      });

      storageService.get(storageService.MODE_OF_ADMINISTRATION).then(function (data) {
        $scope.modes = data;
      });

      storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
        $scope.products = data;
      });

    })

/**
 * AddProductProfileCtrl - handles the addition of new product profile
 */
    .controller('AddProductProfileCtrl', function ($scope, storageService) {

      $scope.productProfile = {};//default controller for holding form data

      storageService.loadTableObject(storageService.PRODUCT_PRESENTATION).then(function (data) {
        $scope.presentations = data;
      });

      storageService.loadTableObject(storageService.PRODUCT_FORMULATION).then(function (data) {
        $scope.formulations = data;
      });

      storageService.loadTableObject(storageService.MODE_OF_ADMINISTRATION).then(function (data) {
        $scope.modes = data;
      });

      storageService.loadTableObject(storageService.UOM).then(function (data) {
        $scope.uomList = data;
      });

      storageService.loadTableObject(storageService.PRODUCT_TYPES).then(function (data) {
        $scope.products = data;
      });

      $scope.save = function () {
        console.log($scope.productProfile);
      }

    });


