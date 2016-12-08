angular.module('CWI').controller('WallSwitchCtrl', function (
	$scope,
	$stateParams,
	$uibModal,
	$window,
	$state,
	$interval,
	mainService,
	authenticationService,
	growl,
	SERVER_HOST,
    SERVER_HOST_2
) {

    // Initialization
    mainService.setShowBackground(true);
    $scope.showLoading = true;
    $scope.isLocationExist = false;
    $scope.isPatientExist = false;
    $scope.modalInstance = null;

    $scope.playSoundClick = function () {
        mainService.playSoundClick();
    };

    // Events
    $scope.navigate = function (state) {
        mainService.navigate(state);
    };

    $scope.openModal = function (locationId) {
        var modalConfiguration = {
            title: "Warning",
            statusList: $scope.statusList,
            locationId: locationId,
            isWallSwitch: true,
            noDeviceMatched: false
        };

        var modalOptions = {
            size: "lg",
            templateUrl: "partial/wall-switch-modal/wall-switch-modal.html",
            controller: "WallSwitchModalCtrl",
            backdrop: false,
            resolve: {
                configuration: function () {
                    return modalConfiguration;
                }
            }
        };

        $scope.modalInstance = $uibModal.open(modalOptions);
        $scope.modalInstance.result.then(function onSuccess(result) {
            // Do something
        }, function onError(reason) {
            // Do something
        });
    };

    authenticationService.getLocationStatusJts($stateParams.locationId, false)
    	.then(function onSuccess(response) {
    	    $scope.isLocationExist = response.data.location_exist;
    	    var locationInfo = response.data;
    	    if ($scope.isLocationExist) {
                $scope.locationIdEmos = response.data.emos_location_id;
    	        authenticationService.getLocationStatusEmos(response.data.emos_location_id, false)
	    		.then(function onSuccess(response) {
	    		    $scope.isPatientExist = response.data.patient_exist;
	    		    authenticationService.setLocationInfo(locationInfo);
    	            $scope.showLoading = false;
                }, function onError(response) {
                    growl.error("Failed to load location status. (EMOS)");
                });
    	    } else {
    	        $scope.openModal($stateParams.locationId);
    	    }
    	}, function onError(response) {
    	    growl.error("Failed to load location status. (JTS)");
    	});

    var _interval = $interval(function () {
        $state.reload();
    }, 15 * 1000 * 60);

    var openRequestFeedbackModal = function () {
        var modalOptions = {
            size: "lg",
            templateUrl: "partial/request-feedback-modal/request-feedback-modal.html",
            controller: "RequestFeedbackModalCtrl",
            backdrop: false
        };

        $scope.modalInstance = $uibModal.open(modalOptions);
        $scope.modalInstance.result.then(function onSuccess(result) {
            // Do something
        });
    }

	// SignalR start

    // EMOS SignalR
	var alive = true;
    var connection = $.hubConnection(SERVER_HOST + '/signalr');
	var hubProxy = null; // holds the reference to hub
	hubProxy = connection.createHubProxy('feedbackRequestHub'); // initializes hub
	hubProxy.on("requestFeedback", function (locationId) {
	    if ($stateParams.locationId == locationId) openRequestFeedbackModal();
	});

    var hubProxyEmosWatcher = null;
    hubProxyEmosWatcher = connection.createHubProxy("emosLocationWatcherHub");
    hubProxyEmosWatcher.on("emosLocationChanged", function(locationInfoModel) {
        if((locationInfoModel.emos_location_id != $scope.locationIdEmos && locationInfoModel.prior_emos_location_id == $scope.locationIdEmos)
            || (locationInfoModel.emos_location_id == $scope.locationIdEmos && locationInfoModel.location_exist != $scope.isLocationExist)) {
            $state.reload();
        }
    });

    connection.disconnected(function () {
		console.log("Signalr", "Disconnected");	
        if (connection.lastError) {
            console.log("Signalr", "Disconnected. Reason: " + connection.lastError.message);
            $scope.connected = "Disconnected. Reason: " + connection.lastError.message;
        }

		if(alive) {
			setTimeout(function () {
				connection.start().done(function () {
					$scope.connected = connection.id;					
					console.log("Signalr", "Reconnected");
				});
			}, 5000); // Restart connection after 5 seconds.
		} else {
			console.log("Signalr", "Stop");
		}
    });

    $scope.connected = "Connecting";
    connection.start().done(function () {
        $scope.connected = connection.id;		
		console.log("Signalr", "Connected");
    }); // starts hub

    // EMOS SignalR
    var connEmos = $.hubConnection(SERVER_HOST_2 + '/signalr');
    var hubProxyEmos = null;                            // holds the reference to hub
    hubProxyEmos = connEmos.createHubProxy('adtHub');   // initializes hub
    hubProxyEmos.on("adtStateChanged", function(adtStateModel) {
        if((adtStateModel.location_id != $scope.locationIdEmos && adtStateModel.prior_location_id == $scope.locationIdEmos)
            || (adtStateModel.location_id == $scope.locationIdEmos && adtStateModel.active_registration != $scope.isPatientExist)) {
            $state.reload();
        }
    });

    connEmos.disconnected(function () {
        console.log("SignalR EMOS", "Disconnected");    
        if (connEmos.lastError) {
            console.log("SignalR EMOS", "Disconnected. Reason: " + connEmos.lastError.message);
            $scope.connected = "Disconnected. Reason: " + connEmos.lastError.message;
        }

        if(alive) {
            setTimeout(function () {
                connEmos.start().done(function () {
                    $scope.connected = connEmos.id;                 
                    console.log("SignalR EMOS", "Reconnected");
                });
            }, 5000); // Restart connection after 5 seconds.
        } else {
            console.log("SignalR EMOS", "Stop");
        }
    });

    $scope.connected = "Connecting";
    connEmos.start().done(function () {
        $scope.connected = connEmos.id;     
        console.log("SignalR EMOS", "Connected");
    }); // starts hub

    // SignalR end
	
	$scope.$on('$destroy', function () {
        if ($scope.modalInstance != null) $scope.modalInstance.dismiss();
        // Make sure that the interval is destroyed too
        $interval.cancel(_interval);
		
		alive = false;
		connection.stop();
        connEmos.stop();
    });
});