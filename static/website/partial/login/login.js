angular.module('CWI').controller('LoginCtrl', function(
	$scope,
	$location,
	$cookies,
	mainService,
	authenticationService,
	growl,
	ADMIN_STATE,
    $window
){
	// Initialization
	$scope.username = "";
	$scope.password = "";
	$scope.showLoading = false;
	mainService.setShowBackground(true);
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	var signageInfo = $location.search();
	if(signageInfo.origin != null && signageInfo.timeout != null) {
		authenticationService.setSignageInfo(signageInfo.origin, signageInfo.timeout);
	}

	// Events
	$scope.onEnter = function(event) {
		if (event.charCode === 13 || event.keyCode === 13) {
			$scope.onLogin();
		}
	};
	$scope.onLogin = function(){
		$scope.showLoading = true;
		authenticationService.login($scope.username, $scope.password)
			.then(function onSuccess(response){
				if (typeof response !== "undefined" && typeof response.data !== "undefined" && typeof response.data.logged_in !== "undefined")  {
					$scope.userStatus = {
						isLoggedIn: response.data.logged_in,
						isAdmin: true,
						isWallSwitch: false
					};
					if($scope.userStatus.isLoggedIn) {
						authenticationService.getUserInfo($scope.username)
							.then(function onSuccess(response){
								if (typeof response !== "undefined" && typeof response.data !== "undefined") {
									authenticationService.setAuthenticationState($scope.userStatus, response.data)
										.then(function onSuccess(response){
											$scope.showLoading = false;
											mainService.navigate(ADMIN_STATE);
                                            $window.location.reload();
										}, function onError(response){
											$scope.showLoading = false;
											growl.error("Set login state failed");
										});
								}
							}, function onError(response){
								$scope.showLoading = false;
								growl.error("Get user info failed");
							});
					} else{
						$scope.showLoading = false;
						growl.error("Username or password is incorrect");
					}
				}
			}, function onError(response){
				$scope.showLoading = false;
				growl.error("Username or password is incorrect");
			});
	};
});