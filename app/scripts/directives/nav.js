'use strict';

angular.module('lmisChromeApp')
  .directive('nav', function ($location) {
        return {
        /* template: '<div></div>', */
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                scope.$watch(function() {
                    return $location.path();
                }, function(newValue, oldValue) {
                    $('li[data-match-route]', element).each(function(k, li) {
                        var $li = angular.element(li),
                            pattern = $li.attr('data-match-route'),
                            regexp = new RegExp('^' + pattern + '$', ['i']);

                        if(regexp.test(newValue)) {
                            $li.addClass('active');
                        } else {
                            $li.removeClass('active');
                        }
                    });
                });
            }
        };
    });
