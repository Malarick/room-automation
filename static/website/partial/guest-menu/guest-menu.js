angular.module('CWI').controller('GuestMenuCtrl',function(
	$scope, 
	SERVER_HOST, 
	$stateParams, 
	$http,
	$window,
	mainService, 
	authenticationService
){
	// Initialization
	mainService.setShowBackground(true);
	$scope.showLoading = true;
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	authenticationService.getAuthenticationState().then(function onSuccess(response){
		$scope.user = typeof response.data !== "undefined" ? response.data : {};
		console.log($scope.user);
		$scope.serverHost = SERVER_HOST;
		$http({
			method: 'GET',
			url: SERVER_HOST + "/JTS/ByodGuestMenu/GetByodGuestMenu?byod_guest_menu_id=" + $stateParams.menuId
		}).then(function successCallback(response) {
			$scope.showLoading = false;
			try {
				$scope.menus = response.data.data.SubMenuList;
			} catch (ex) {
				$scope.menus = [];
			}
		}, function errorCallback(response) {
			$scope.showLoading = false;
			$scope.menus = [];
		});

		var type = {
			URL: "URL",
			CATEGORY: "CATEGORY",
			SUBMENUS: "SUBMENUS"
		};
		$scope.onMenuClicked = function (menu) {
			if (menu.type === type.SUBMENUS){
				mainService.navigateWithParams("guest-menu", { menuId: menu.byod_guest_menu_id});
			} else if (menu.type === type.CATEGORY){
				mainService.navigateWithParams("event", { id: menu.issue_category_id});
			} else if (menu.type === type.URL) {
				if (menu.external_url.indexOf('http') > -1) {
					if(menu.label == "HITS") {
						$window.open(menu.external_url);
					}else {
						if(menu.label == "EMOS") {
							var myParams = "locationId=" + $scope.user.locationInfo.emos_location_id;
							menu.external_url = menu.external_url + myParams;
							console.log($scope.user.locationInfo.emos_location_id);
						}
						mainService.navigateWithParams("external-url", { url: menu.external_url});
					}
				} else {			
					mainService.navigate(menu.external_url.replace("/", ""));					
				} 
			}
		}
	});

});