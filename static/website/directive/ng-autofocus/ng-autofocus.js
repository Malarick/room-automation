angular.module('CWI').directive('ngAutofocus', function($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngAutofocus, function (val) {
                if (angular.isDefined(val) && val) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            }, true);

            element.bind('blur', function () {
                if (angular.isDefined(attrs.ngFocusLost)) {
                    scope.$apply(attrs.ngFocusLost);
                }
            });
        }
    };
});