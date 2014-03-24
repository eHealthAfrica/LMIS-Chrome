angular.module('lmisChromeApp').directive('counter', function () {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="input-group">' +
        '<span class="input-group-btn">' +
        '<button class="btn btn-warning btn-lg" type="button" ng-click="count = _tapInputSub(count)">' +
        '<i class="fa fa-minus"></i>' +
        '</button>' +
        '</span>' +
        '<input type="text" class="form-control input-lg" size="20" ng-model="count" required>' +
        '<span class="input-group-btn">' +
        '<button class="btn btn-info btn-lg" type="button" ng-click="count = _tapInputAdd(count)">' +
        '<i class="fa fa-plus"></i>' +
        '</button>' +
        '</span>' +
        '</div>',
    scope: {
      count: '=bind'
    },
    link: function (scope, element, attr) {
      scope._tapInputAdd = function (param) {
        param = isNaN(param) ? 1 : (parseInt(param) + 1);
        console.log(param);
        return param;
      };
      scope._tapInputSub = function (param) {
        param = (isNaN(param) || (param <= 0)) ? 0 : (parseInt(param) - 1);
        return param;
      };
    }
  };
});