angular.module('CWI').directive('ngMobileClick', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs, fn) {
        	element.bind("touchstart", function (e) {
	            scope.$apply(attrs["ngMobileClick"]);
	        });
        }
    };
});