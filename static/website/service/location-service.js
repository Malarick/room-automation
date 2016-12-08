angular.module('CWI').factory('locationService',function($q, $http, mainService, SERVER_HOST) {
	var sendDeviceInfoCallback = null;
	var scanCompletedCallback = null;

    var locationService = {
    	setSendDeviceInfoCallback: function(callback) {
    		sendDeviceInfoCallback = callback;
    	},
    	setScanCompletedCallback: function(callback) {
    		scanCompletedCallback = callback
    	},
    	startBeaconScanner: function() {
    		window.external.notify("BEACON");
    	},
    	stopBeaconScanner: function() {
    		window.external.notify("BEACON_OFF");
    	},
    	// Called from wrapper to send detected devices
    	sendDeviceInfo: function(deviceId, signalStrength) {
    		if(typeof sendDeviceInfoCallback === "function") {
    			sendDeviceInfoCallback(deviceId, signalStrength);
    		}
    	},
    	// To notify us that the scan has completed
    	scanCompleted: function() {
    		if(typeof scanCompletedCallback === "function") {
    			scanCompletedCallback();
    		}
    	},
    	getDeviceLocationByDeviceIdentifier: function(deviceId) {
    		var deferred = $q.defer();

    		return $http({
    			method: "GET",
    			url: SERVER_HOST + "/JTS/DeviceAssignment/GetDeviceLocationByDeviceIdentifier",
    			params: {
    				identifier: deviceId
    			},
    			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
    		}).then(function onSuccess(response) {
    			deferred.resolve(response);
	    		return deferred.promise;
    		}, function onError(response) {
    			deferred.reject(response);
    			return deferred.promise;
    		});
    	}
    };

    return locationService;
});