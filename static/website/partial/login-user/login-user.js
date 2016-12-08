angular.module('CWI').controller('LoginUserCtrl',function(
	$scope,
	mainService,
	authenticationService,
	growl,
	ADMIN_STATE
){
	// Initialization
	$scope.username = "";
	$scope.password = "";
	$scope.isLoggedIn = false;
	$scope.showLoading = false;
	mainService.setShowBackground(true);
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	// Events
	$scope.onEnter = function(event) {
		if (event.charCode === 13 || event.keyCode === 13) {
			$scope.onLogin();
		}
	};
	$scope.onLogin = function(){
		$scope.showLoading = true;
		if($scope.username == "" || $scope.password == "") {
			growl.error("Please enter your IC no. and password");
			$scope.showLoading = false;
			return;
		}
		authenticationService.loginByRegistration($scope.username, $scope.password)
			.then(function onSuccess(response) {
				console.log("LOGIN", response.data);
				if(response.data.patient_authenticated) {
					if(!response.data.location_password_used && response.data.location_password_expired) {
						$scope.showLoading = false;
						growl.error("This password has expired");
						return;
					}
					var locationInfo = response.data;					
					console.log("EMOS", locationInfo);
					authenticationService.setLocationPasswordStatus(response.data.registration_number, true)
						.then(function onSuccess(response) {
							console.log("PASSWORD", response);
							if(!response.data.success) {
								$scope.showLoading = false;
								growl.error("Could not update location password status.");
							}

							$scope.userStatus = {
								isLoggedIn: true,
								isAdmin: false,
								isWallSwitch: false
							};
							$scope.userInfo = {
								name: $scope.username,
								type: 'USER'
							};
							authenticationService.getLocationStatusJtsWithEmosLocation(locationInfo.location_id, false)
							.then(function onSuccess(response) {
								locationInfo = response.data;
								console.log("JTS", locationInfo);
								authenticationService.setLocationInfo(locationInfo)
									.then(function onSuccess(response) {
										authenticationService.setAuthenticationState($scope.userStatus, $scope.userInfo)
											.then(function onSuccess(response){
												$scope.showLoading = false;
												mainService.navigate("home");
											}, function onError(response){
												$scope.showLoading = false;
												growl.error("Set login state failed");
											});								
									}, function onError(response) {
										growl.error("Set location info failed");
									});
							}, function onError(response) {
								growl.error("Get location info failed (JTS)");
							});
						}, function onError(response) {
							$scope.showLoading = false;
							growl.error("Could not update location password status.");
						});
				} else{
					$scope.showLoading = false;
					growl.error("Username / Password is incorrect or haven't been generated.");
				}
			}, function onError(response) {
				growl.error("Could not load location status.");
			});
	};
});