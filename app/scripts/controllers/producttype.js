'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider
      .state('productTypeListView', {
        url: '/product-types-view',
        templateUrl: '/views/products/product-type-list.html',
        controller: 'ProductTypeListCtrl',
        data: {
          label: 'Product types'
        }
      }).state('addProductTypeView', {
        url: '/add-product-type',
        templateUrl: '/views/product-types/add-product-type.html',
        controller: 'AddProductTypeCtrl',
        data: {
          label: "Add Product Type"
        }
      });
})
/**
 * ProductListCtrl controller handles display of products pulled from storage.
 */
    .controller('ProductTypeListCtrl', function ($scope, storageService, productTypeFactory, $filter, ngTableParams) {



   productTypeFactory.getAll().then(function (data) {
       console.log(data);
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

    })
/**
 * AddProductCtrl - This is used to save Product Type to local storage.
 *
 */
    .controller('AddProductTypeCtrl', function ($scope, storageService, $location) {

      //create a blank object tha will be used to hold product form info
      $scope.product = {};
      //TODO: resolve category(no longer needed here) and uomList(Jideobi)
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
