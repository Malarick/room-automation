angular.module('CWI').filter('roundNumber', function() {
    return function(input,arg) {
        return Math.round(input);
    };
});