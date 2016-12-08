angular.module('CWI').controller('MainCtrl', function(
    $scope,
    $state,
    $window,
    $document,
    $timeout,
    $interval,
    $cookies,
    $http,
	growl,
    mainService,
    socketService,
    authenticationService,
    SERVER_HOST,
    DEFAULT_STATE,
    WALL_STATE,
    WALL_STATE_2,
    CONNECTION_STATE_EVENT,
    FLAG_EVENT_REPORT_EVENT,
    CIRCUIT_NOTIFIER_EVENT,
    SOUND_CLICK
){
    // Navigation
    $scope.navigate = function(state) {
        if(state == "home" && ($scope.isWallSwitch || $scope.isWallSwitchByDevice)) {
            authenticationService.getLocationInfo()
            .then(function onSuccess(response) {
                var locationInfo = response.data.locationInfo;
                if($scope.isWallSwitch) {
                    $scope.navigateWithParams(WALL_STATE, {locationId: locationInfo.location_id});
                }else if($scope.isWallSwitchByDevice) {
                    $scope.navigateWithParams(WALL_STATE_2, {deviceId: locationInfo.deviceId});
                }
            }, function onError(response) {
                growl.error("Could not load location Info.");
            });
        } else {
            $state.go(state);
        }
    };
    mainService.setNavigationCallback($scope.navigate);
    $scope.navigateWithParams = function(state, params) {
        $state.go(state, params);
    };
    mainService.setNavigationWithParamsCallback($scope.navigateWithParams);

    // Connection
    $scope.connectionState = true;
    $scope.connectionStateCallback = function(state) {
        $scope.connectionState = state;
    };
    mainService.setConnectionStateCallback($scope.connectionStateCallback);
    socketService.on(CONNECTION_STATE_EVENT, function(state){
        mainService.setConnectionState(state);
    });

    // COMFORT Event Notifier
    $scope.comfortEventNotifierCallback = function(data) {
        var circuit = data
        var circuitLocation = 428;

        // Validate with mapping table
        $http({
            method: 'GET',
            url: SERVER_HOST + "/JTS/SiteEventCodeDeviceLocationDtl/GetSiteEventCodeDeviceLocationByNotificationDevice",
            params: {
                notification_device: circuit,
                notification_device_location: circuitLocation
            },
            transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
                return value.data;
            })
        }).then(function successCallback(response) {
            var siteEventCodeDeviceLocation = response.data;
            if(siteEventCodeDeviceLocation != null) {
                // Generate / Resolve Issue
                $http({
                    method: 'GET',
                    url: SERVER_HOST + "/JTS/SiteEventCode/TriggerIssue", 
                    params: {
                        issue_category_id: null,
                        site_event_code_id: siteEventCodeDeviceLocation.site_event_code_id,
                        location_id: siteEventCodeDeviceLocation.location_id,
                        cancel: !siteEventCodeDeviceLocation.trigger_issue
                    }
                }).then(function successCallback(response) {
                    if(siteEventCodeDeviceLocation.trigger_issue) {
                        growl.warning("Circuit " + siteEventCodeDeviceLocation.SiteEventCodeDeviceLocation.notification_device_label + " failure, this issue has been reported.");
                    } else{
                        growl.success("Circuit " + siteEventCodeDeviceLocation.SiteEventCodeDeviceLocation.notification_device_label + " has recovered, this issue has been resolved.");
                    }
                }, function errorCallback(response) {
                    growl.error("Could not trigger issue regarding this notifier circuit.");
                });
            }
        }, function errorCallback(response) {
            growl.error("Could not load notifier device info.");
        });
    };

    mainService.setComfortEventNotifierCallback($scope.comfortEventNotifierCallback);
    socketService.on(FLAG_EVENT_REPORT_EVENT, mainService.notifyComfortEvent);

    // EUREKA Notifier Connection
    $scope.notifierConnectionCallback = function(data) {
        data = data.split(";");
        var circuit = data[data.length - 1];
        var circuitLocation = data[data.length - 2];

        // Validate with mapping table
        $http({
            method: 'GET',
            url: SERVER_HOST + "/JTS/SiteEventCodeDeviceLocationDtl/GetSiteEventCodeDeviceLocationByNotificationDevice",
            params: {
                notification_device: circuit,
                notification_device_location: circuitLocation
            },
            transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
                return value.data;
            })
        }).then(function successCallback(response) {
            var siteEventCodeDeviceLocation = response.data;
            if(siteEventCodeDeviceLocation != null) {
                // Generate / Resolve Issue
                $http({
                    method: 'GET',
                    url: SERVER_HOST + "/JTS/SiteEventCode/TriggerIssue", 
                    params: {
                        issue_category_id: null,
                        site_event_code_id: siteEventCodeDeviceLocation.site_event_code_id,
                        location_id: siteEventCodeDeviceLocation.location_id,
                        cancel: !siteEventCodeDeviceLocation.trigger_issue
                    }
                }).then(function successCallback(response) {
                    if(siteEventCodeDeviceLocation.trigger_issue) {
                        growl.warning("Circuit " + siteEventCodeDeviceLocation.SiteEventCodeDeviceLocation.notification_device_label + " failure, this issue has been reported.");
                    } else{
                        growl.success("Circuit " + siteEventCodeDeviceLocation.SiteEventCodeDeviceLocation.notification_device_label + " has recovered, this issue has been resolved.");
                    }
                }, function errorCallback(response) {
                    growl.error("Could not trigger issue regarding this notifier circuit.");
                });
            }
        }, function errorCallback(response) {
            growl.error("Could not load notifier device info.");
        });
        
    };

    mainService.setNotifierConnectionCallback($scope.notifierConnectionCallback);
    socketService.on(CIRCUIT_NOTIFIER_EVENT, mainService.notifyIssue);

    // Administrator Authentication
    $scope.authenticationState = false;
    $scope.authenticationStateCallback = function(userStatus) {
        if(typeof userStatus !== "undefined") {
            $scope.authenticationState = userStatus.isLoggedIn;
            $scope.authenticationPrivilege = userStatus.isAdmin;
            $scope.isWallSwitch = userStatus.isWallSwitch;   
            $scope.isWallSwitchByDevice = userStatus.isWallSwitchByDevice;
        } else {
            $scope.authenticationState = false;
            $scope.authenticationPrivilege = false;
            $scope.isWallSwitch = false;
            $scope.isWallSwitchByDevice = false;
        }
    };
    authenticationService.setAuthenticationStateCallback($scope.authenticationStateCallback);

    // Location JTS
    $scope.locationStatusCallbackJts = function(locationStatus) {
        $scope.locationIdJts = locationStatus.location_id;
        $scope.locationLabel = locationStatus.location_label;
    }
    authenticationService.setLocationStatusCallbackJts($scope.locationStatusCallbackJts);

    // Location EMOS
    $scope.locationStatusCallbackEmos = function(locationStatus) {
        $scope.locationIdEmos = locationStatus.location_id;
        $scope.patientName = locationStatus.patient_name;
        $scope.password = locationStatus.location_password;
        $scope.isPatientExist = locationStatus.patient_exist;
    }
    authenticationService.setLocationStatusCallbackEmos($scope.locationStatusCallbackEmos);

    // Sound
    $scope.soundClickCallback = function() {
        var audio = new Audio(SOUND_CLICK);
        audio.load();
        audio.play();
        audio.currentTime = 0;
    };
    mainService.setSoundClickCallback($scope.soundClickCallback);

    // Outstanding Tasks Notifications
    $scope.taskNotificationCallback = function(outstandingTask) {
        $scope.outstandingTask = outstandingTask;
    };
    mainService.setTaskNotificationCallback($scope.taskNotificationCallback);

    $scope.onLogout = function() {
        var userStatus = {
            isLoggedIn: false,
            isAdmin: false,
            isWallSwitch: false,
            isWallSwitchByDevice: false
        };
        $scope.outstandingTask = 0;
		authenticationService.setAuthenticationState(userStatus, null).then(function onSuccess(){
			authenticationService.logout().then(function onSuccess(response){
				growl.success("You've logged out");
                if($scope.signageOrigin == null) {
                    $scope.navigate(DEFAULT_STATE);
                    $window.location.reload();
                } else {
                    $window.location.href = $scope.signageOrigin;
                    $cookies.remove("signageInfo");
                }
			}, function onError(response){
				growl.error("Cannot destroy session");
			});
		}, function onError(response){
			growl.error("Cannot set authentication state");
		});
    };

    $scope.onReqPassword = function(state, locationIdJts, locationIdEmos) {
        var locationsInfo = { locationIdJts: locationIdJts, locationIdEmos: locationIdEmos };
        $scope.navigateWithParams(state, locationsInfo);
    }

	// Footer
    $scope.showFooter = true;
    $scope.onToggleFooter = function() {
        $scope.showFooter = !$scope.showFooter;
    };

    // Background
    $scope.showBackground = true;
    $scope.showBackgroundCallback = function(state) {
        $scope.showBackground = state;
    };
    mainService.setShowBackgroundCallback($scope.showBackgroundCallback);

    // Innactivity
    $scope.signageOrigin = null;
    $scope.innactivityTime = 30000;  // Default
    $scope.innactivityTimer = null;

    $scope.onInnactivityTimeout = function() {
        if($scope.signageOrigin != null) {
            if($scope.authenticationState) {
                $scope.onLogout();
            } else {
                $window.location.href = $scope.signageOrigin;
                $cookies.remove("signageInfo");
            }
        }
    };

    $scope.resetInnactivityTimer = function() {
        var signageInfo = $cookies.getObject("signageInfo");
        if(typeof signageInfo !== "undefined") {
            $scope.signageOrigin = signageInfo.origin;
            $scope.innactivityTime = signageInfo.timeout;
            $timeout.cancel($scope.innactivityTimer);
            $scope.innactivityTimer = $timeout($scope.onInnactivityTimeout, $scope.innactivityTime);
        } else {
            $scope.signageOrigin = null;
        }
    };

    // Innactivity for signage
    $scope.getMessageFromSignage = function() {
        $scope.resetInnactivityTimer();
    };

    authenticationService.setSignageMessageCallback($scope.getMessageFromSignage);

    // Innactivity from iFrame
    $scope.getMessageFromIFrame = function(event) {
        var origin = event.origin || event.originalEvent.origin;
        if(event.data == "IFRAME_CLICKED" && origin == SERVER_HOST) {
            $scope.resetInnactivityTimer();
        }
    };

    $window.addEventListener("message", $scope.getMessageFromIFrame, false);
});