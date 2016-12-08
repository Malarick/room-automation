angular.module('CWI').directive('loadingOverlay', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            active: '='
        },
        templateUrl: 'directive/loading-overlay/loading-overlay.html',
        link: function(scope, element, attrs, fn) {
        }
    };
});
