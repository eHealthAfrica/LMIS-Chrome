angular.module('lmisChromeApp').directive('counter', function () {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'views/partials/counter-ui.html',
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