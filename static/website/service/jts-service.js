angular.module('CWI').factory('jtsService',function() {

    var jtsService = {
    	roomAlert: function() {
    		if(arguments.length > 0){
    			alert(arguments[0]);
    		}
    	}
    };

    return jtsService;
});