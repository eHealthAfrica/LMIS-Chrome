'use strict';

angular.module('lmisChromeApp')
    .controller('MainCtrl', function ($scope, storageService) {
      storageService.get('products').then(function (d) {
        $scope.products = d;
      });
      //console.log($scope.products);
      //$scope.$watch('online', function(newStatus) {})
    })

/**
 * ProductListCtrl controller handles display of products pulled from storage.
 */
    .controller('ProductListCtrl', function ($scope, storageService, utility, $filter, ngTableParams) {

      storageService.get(storageService.PRODUCT).then(function (data) {
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
            var filtered, sorted = data;
            if (params.filter()) {
              filtered = $filter('filter')(data, params.filter());
            }
            if (params.sorting()) {
              sorted = $filter('orderBy')(filtered, params.orderBy());
            }
            params.total(sorted.length);
            $defer.resolve(sorted.slice(
                (params.page() - 1) * params.count(),
                params.page() * params.count()
            ));
          }
        }

        // jshint newcap: false
        $scope.productList = new ngTableParams(params, resolver);
      });

      utility.loadTableObject(storageService.PRODUCT_CATEGORY).then(function (data) {
        $scope.productCategories = data;
      });

      utility.loadTableObject(storageService.UOM).then(function (data) {
        $scope.uomList = data;
      });

    })


/**
 * AddProductCtrl - handles the addition of product to storage.
 *
 * It uses storage service to load product category and unit of measurement
 * list used to populate product form respective drop downs.
 */
    .controller('AddProductCtrl', function ($scope, storageService, $location) {

      //create a blank object tha will be used to hold product form info
      $scope.product = {};

      storageService.get(storageService.PRODUCT_CATEGORY).then(function (productCategories) {
        $scope.categories = productCategories;
      });

      storageService.get(storageService.UOM).then(function (uomList) {
        $scope.uomList = uomList;
      });

      $scope.saveProduct = function () {
        //TODO: implement save of product here
        if (Object.keys($scope.product).length > 0) {
          storageService.insert(storageService.PRODUCT, $scope.product).then(function (bool) {
            if (bool) {
              $scope.setMessage({
                message: 'Data saved ',
                type: 'success'
              });
              $location.path('/main/products');
            } else {

            }
          });
        } else {
          $scope.setMessage({
            message: 'can\'t save empty form',
            type: 'danger'
          });
        }

      };

    })
/**
 * AddProductItemCtrl - This handles the addition of product items
 */
    .controller('AddProductItemCtrl', function ($scope, storageService) {
      $scope.productItem = {};
      $scope.productItem.active = true; //default is true

      storageService.get(storageService.PRODUCT).then(function (productList) {
        $scope.products = productList;
      });

      storageService.get(storageService.PRODUCT_PRESENTATION).then(function (presentationList) {
        $scope.presentations = presentationList;
      });

      storageService.get(storageService.COMPANY).then(function (companyList) {
        $scope.companies = companyList;
      });

      storageService.get(storageService.CURRENCY).then(function (currencyList) {
        $scope.currencies = currencyList;
      });

      storageService.get(storageService.CURRENCY).then(function (currencyList) {
        $scope.currencies = currencyList;
      });

      storageService.get(storageService.MODE_OF_ADMINISTRATION).then(function (modeOfAdministrationList) {
        $scope.modes = modeOfAdministrationList;
      });

      storageService.get(storageService.PRODUCT_FORMULATION).then(function (formulationList) {
        //TODO: update formulations fixture
        $scope.formulations = formulationList;
      });

      storageService.get(storageService.UOM).then(function (uomList) {
        $scope.uomList = uomList;
      });

      /**
       * This function, 'save', when triggered saves the product item form data to
       * local storage.
       */
      $scope.save = function () {
        console.log($scope.productItem);
      };
    })


/**
 * ProductItemListCtrl - This handles the display of Product-Items pulled from
 * storage.
 */
    .controller('ProductItemListCtrl', function ($scope, storageService, visualMarkerService, utility, $filter, ngTableParams) {

      storageService.get(storageService.PRODUCT_ITEM).then(function (data) {
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

        $scope.productItemList = new ngTableParams(params, resolver);
      });

      utility.loadTableObject(storageService.PRODUCT).then(function (productList) {
        $scope.products = productList;
      });

      utility.loadTableObject(storageService.COMPANY).then(function (companyList) {
        $scope.companies = companyList;
      });

      utility.loadTableObject(storageService.PRODUCT_PRESENTATION).then(function (productPresentation) {
        $scope.presentations = productPresentation;
      });

      utility.loadTableObject(storageService.PRODUCT_FORMULATION).then(function (productFormulation) {
        $scope.productFormulation = productFormulation;
      });

      utility.loadTableObject(storageService.MODE_OF_ADMINISTRATION).then(function (modesOfAdmin) {
        $scope.modesOfAdmin = modesOfAdmin;
      });

      utility.loadTableObject(storageService.UOM).then(function (uomList) {
        $scope.uomList = uomList;
      });

      utility.loadTableObject(storageService.CURRENCY).then(function (currencyList) {
        $scope.currencies = currencyList;
        console.log(currencyList);
      });


      $scope.highlightExpiredProductItem = visualMarkerService.getExpiredCSS;

    })

/**
 * Program
 */
    .controller('ProgramsCtrl', function ($scope, storageService) {
      storageService.get(storageService.PROGRAM).then(function (programs) {
        $scope.programList = programs;
      });
    })

    .controller('programFormCtrl', function ($scope, storageService, $location, utility) {
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
      storageService.loadTableObject(storageService.PRODUCT).then(function (products) {
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

      storageService.get(storageService.PRODUCT).then(function (products) {
        $scope.productList = products;
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
          $scope.setMessage({type: "success", message: "about to save " + storageService.PROGRAM_PRODUCTS})
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
 *  ProductProfileListCtrl
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

      storageService.loadTableObject(storageService.PRODUCT_PRESENTATION).then(function (data) {
        $scope.presentations = data;
      });

      storageService.loadTableObject(storageService.UOM).then(function (data) {
        $scope.uomList = data;
      });

      storageService.loadTableObject(storageService.PRODUCT_FORMULATION).then(function (data) {
        $scope.formulations = data;
      });

       storageService.loadTableObject(storageService.MODE_OF_ADMINISTRATION).then(function (data) {
        $scope.modes = data;
      });
    });


