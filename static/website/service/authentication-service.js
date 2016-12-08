angular.module('CWI').factory('authenticationService',function($q, $http, $cookies, SERVER_HOST, SERVER_HOST_2, mainService) {
	var authenticationStateCallback;
	var locationStatusCallbackJts;
	var locationStatusCallbackEmos;
	var signageMessageCallback;
	var locationIdParam;
	var signageInfo;

    var authenticationService = {
		setAuthenticationStateCallback: function(callback){
			authenticationStateCallback = callback;
		},
		setLocationStatusCallbackJts: function(callback){
			locationStatusCallbackJts = callback;
		},
		setLocationStatusCallbackEmos: function(callback){
			locationStatusCallbackEmos = callback;
		},
		setLocationIdParam: function(locationId) {
			locationIdParam = locationId;
		},
		getLocationIdParam: function() {
			return locationIdParam;
		},
		setSignageMessageCallback: function(callback) {
			signageMessageCallback = callback;
		},
		getSessionInfo: function() {
			var deferred = $q.defer();
            return $http({
                method: "GET",
				url: "/auth/getSessionInfo"
            }).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
            }, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
            });
		},
        getAuthenticationState: function() {
			var deferred = $q.defer();
            return $http({
                method: "GET",
				url: "/auth/login"
            }).then(function onSuccess(response) {
				if (typeof authenticationStateCallback === "function"){
					authenticationStateCallback(response.data.userStatus);						
				}
				deferred.resolve(response);
				return deferred.promise;
            }, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
            });
        },
		setAuthenticationState: function(userStatus, userInfo){
			var deferred = $q.defer();
			var data = {
				userStatus: userStatus,
				userInfo: userInfo
			};

			return $http({
				method: "POST",
				url: "/auth/login",
				data: data
			}).then(function onSuccess(response){
				if (typeof authenticationStateCallback === "function"){
					authenticationStateCallback(response.data.userStatus);						
				}
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response){
				deferred.reject(false);
				return deferred.promise;
			});
		},
        login: function(username, password) {
			var deferred = $q.defer();
            return $http({
                method: 'POST',
                url: SERVER_HOST + "/System/Auth/Login",
                data: {
                    user_name: username,
                    password: password
                },
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				transformRequest: function (obj) {
					var str = [];
					for (var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				}
            }).then(function onSuccess(response) {
				deferred.resolve(response.data);
				return deferred.promise;
            }, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
            });
        },
		getUserInfo: function(username){
			var deferred = $q.defer();
			return $http({
                method: 'POST',
                url: SERVER_HOST + "/System/Auth/UserInfo",
                data: {
                    username: username
                },
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				transformRequest: function (obj) {
					var str = [];
					for (var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				}
            }).then(function onSuccess(response) {
				deferred.resolve(response.data);
				return deferred.promise;
            }, function onError(response){
				deferred.reject(false);
				return deferred.promise;
            });
        },
		logout: function(){
			var deferred = $q.defer();
			return $http({
				method: "GET",
				url: "/auth/logout"
			}).then(function onSuccess(response){
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response){
				deferred.reject(false);
				return deferred.promise;
			});
		},
		// Being used to also set password on the location
		getLocationStatusJts: function(locationId, generatePassword) {
			var deferred = $q.defer();
			return $http({
				method: "GET",
				url: SERVER_HOST + "/VMS/Location/GetLocationStatusForByod",
				params: {
					location_id: locationId,
					generatePassword: generatePassword
				},
				transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				if(typeof locationStatusCallbackJts === "function") {
					locationStatusCallbackJts(response.data);
				}
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		// Being used to also set password on the location
		getLocationStatusEmos: function(locationId, generatePassword) {
			var deferred = $q.defer();
			return $http({
				method: "GET",
				url: SERVER_HOST_2 + "/VMS/Location/GetLocationStatusForByod",
				params: {
					location_id: locationId,
					generatePassword: generatePassword
				},
				transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				if(typeof locationStatusCallbackEmos === "function") {
					locationStatusCallbackEmos(response.data);
				}
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		// Being used to also set password on the location
		getLocationStatusJtsWithEmosLocation: function(locationId, generatePassword) {
			var deferred = $q.defer();
			return $http({
				method: "GET",
				url: SERVER_HOST + "/VMS/Location/GetLocationStatusForByodWithEmosLocation",
				params: {
					emos_location_id: locationId,
					generatePassword: generatePassword
				},
				transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				if(typeof locationStatusCallbackJts === "function") {
					locationStatusCallbackJts(response.data);
				}
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		getDeviceLocationByDeviceId: function(deviceId) {
			var deferred = $q.defer();
			return $http({
				method: "GET",
				url: SERVER_HOST + "/JTS/DeviceLocation/GetDeviceLocationByDeviceId",
				params: {
					device_id: deviceId
				},
				transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		loginByRegistration: function(registrationNumber, locationPassword) {
			var deferred = $q.defer();
			return $http({
				method: "POST",
				url: SERVER_HOST_2 + "/VMS/Location/LoginByRegistration",
				data: {
					registration_number: registrationNumber,
					location_password: locationPassword
				},
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				transformRequest: function(obj) {
					var str = [];
					for (var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		setLocationInfo: function(locationInfo) {
			var deferred = $q.defer();
			return $http({
				method: "POST",
				url: "/auth/setLocationInfo",
				data: {
					locationInfo: locationInfo
				}
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		getLocationInfo: function() {
			var deferred = $q.defer();
			return $http({
				method: "GET",
				url: "/auth/getLocationInfo"
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		setLocationPasswordStatus: function(registrationNumber, state) {
			var deferred = $q.defer();
			return $http({
				method: "POST",
				url: SERVER_HOST_2 + "/VMS/Location/SetLocationPasswordStatus",
				data: {
					registration_number: registrationNumber,
					state: state
				},
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				transformRequest: function(obj) {
					var str = [];
					for (var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
					return value.data;
				})
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		setUserSettings: function(userSettings) {
			var deferred = $q.defer();
			return $http({
				method: "POST",
				url: "/auth/setUserSettings",
				data: {
					userSettings: userSettings
				}
			}).then(function onSuccess(response) {
				deferred.resolve(response);
				return deferred.promise;
			}, function onError(response) {
				deferred.reject(false);
				return deferred.promise;
			});
		},
		setSignageInfo: function(origin, timeout) {
			signageInfo = {
				origin: origin,
				timeout: timeout
			};
			$cookies.putObject("signageInfo", signageInfo);			
			if(typeof signageMessageCallback === "function") {
				signageMessageCallback();
			}
		}
    };

    return authenticationService;
});