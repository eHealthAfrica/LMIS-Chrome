'use strict';

describe('Controller: OrdersctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('lmisChromeApp'));

  var OrdersctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OrdersctrlCtrl = $controller('OrdersctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
