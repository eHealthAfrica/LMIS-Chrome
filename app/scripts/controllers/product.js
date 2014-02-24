'use strict';

angular.module('lmisChromeApp')
/**
 * ProductListCtrl controller handles display of products pulled from storage.
 */
    .controller('ProductListCtrl', function ($scope, storageService, utility, $filter, ngTableParams) {

      storageService.all(storageService.PRODUCT_TYPES).then(function (data) {
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

        $scope.productTypes = new ngTableParams(params, resolver);
      });

      storageService.get(storageService.UOM).then(function (data) {
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
          storageService.insert(storageService.PRODUCT_TYPES, $scope.product).then(function (bool) {
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
