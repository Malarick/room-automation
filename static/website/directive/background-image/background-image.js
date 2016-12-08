angular.module('CWI').directive('backgroundImage', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs, fn) {
            attrs.$observe('backgroundImage', function(value) {
                element.css({
                    'background-image': 'url(' + value + ')'
                });
            });
        }
    };
});