angular.module('CWI').filter('roundDownNumber', function() {
    return function(input,arg) {
        return Math.floor(input);
    };
});