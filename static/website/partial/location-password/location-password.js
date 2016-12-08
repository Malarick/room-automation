angular.module('CWI').controller('LocationPasswordCtrl',function(
	$scope, 
	$interval,
	$state,
    $window,
	growl, 
	$stateParams,
	mainService,
	authenticationService,
    WALL_STATE,
    WALL_STATE_2
){
	// Initialization
    mainService.setShowBackground(true);
    $scope.showLoading = true;
    // $scope.currentDateTime = new Date().getTime() + 3 * 1000 * 60;
    $scope.currentDateTime = 180;
    $scope.notificationMsg = "Please connect to \"VENUE-360-DEMO\" and open http://my.portal.app to key in your credential.";
    $scope.headerMsg = "Your Login Information";
    $scope.footerMsg = "This password will be expired in: ";
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    if($stateParams.locationIdJts == null || $stateParams.locationIdJts == null){
        $window.history.back();
        return;
    }
    authenticationService.getLocationStatusJts($stateParams.locationIdJts, false)
    	.then(function onSuccess(response) {
    		$scope.isLocationExist = response.data.location_exist;
            if($scope.isLocationExist) {
                authenticationService.getLocationStatusEmos($stateParams.locationIdEmos, true)
                .then(function onSuccess(response) {
                    $scope.isPatientExist = response.data.patient_exist;
	    			$scope.contentMsg1 = "Username: " + response.data.registration_number;
	    			$scope.contentMsg2 = "Password: " + response.data.location_password;
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

    var _interval = $interval(function() {
        authenticationService.getSessionInfo()
        .then(function onSuccess(response) {
            var locationInfo = response.data.locationInfo;
            var userStatus = response.data.userStatus;
            if(userStatus.isWallSwitch) {
                $scope.navigateWithParams(WALL_STATE, {locationId: locationInfo.location_id});
            }else if(userStatus.isWallSwitchByDevice) {
                $scope.navigateWithParams(WALL_STATE_2, {deviceId: locationInfo.deviceId});
            }
        }, function onError(response) {
            growl.error("Failed to load session info. (Interval)");
        });
    }, 3 * 1000 * 60 );

    var _interval2 = $interval(function() {
        if($scope.currentDateTime > 0) {
    	   $scope.currentDateTime--;
        }
    }, 1 * 1000);

    $scope.$on('$destroy', function() {
        if ($scope.modalInstance != null) $scope.modalInstance.dismiss();
        // Make sure that the interval is destroyed too
        $interval.cancel(_interval);
        $interval.cancel(_interval2);
    });
});