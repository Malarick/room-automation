angular.module('CWI').filter('roundUpNumber', function() {
    return function(input,arg) {
        return Math.ceil(input);
    };
});