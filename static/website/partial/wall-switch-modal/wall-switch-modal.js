angular.module('CWI').controller('WallSwitchModalCtrl',function($scope, $uibModalInstance, configuration, mainService){
	$scope.configuration = configuration;
	$scope.locationId = $scope.configuration.locationId;

	// if(!configuration.isLocationExist) {
	// 	$scope.prefixLabel = "Location ID: "
	// 	$scope.statusLabel = "This location is not configured in the system, please contact the system administrator.";
	// } else {		
	if(configuration.noDeviceMatched) {
		$scope.statusLabel = "No device in range, please move closer to the device and try again.";	
	} else {
		$scope.prefixLabel = "Device ID: "
		$scope.statusLabel = "This device is not configured to a location in the system, please contact the system administrator.";
	}
	// }
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	$scope.onCancel = function() {
		$uibModalInstance.dismiss("Cancel");
	};
});