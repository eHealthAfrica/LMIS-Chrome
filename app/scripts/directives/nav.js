'use strict';

angular.module('lmisChromeApp')
  .directive('nav', function($location) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        scope.$watch(function() {
          return $location.path();
        }, function(newValue) {
          $('li[data-match-route]', element).each(function(k, li) {
            var $li = angular.element(li),
                pattern = $li.attr('data-match-route'),
                regexp = new RegExp('^' + pattern + '$', ['i']);

            var links = $location.path().replace(/^\//, '').split('/');

            if (links[0] === pattern.replace(/^\//, '')) {
              $li.addClass('active');
            } else {
              if (regexp.test(newValue)) {
                $li.addClass('active');
              } else {
                $li.removeClass('active');
              }
            }

          });
        });
      }
    };
  });
