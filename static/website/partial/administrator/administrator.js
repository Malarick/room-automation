angular.module('CWI').controller('AdministratorCtrl', function(
	$scope, 
	SERVER_HOST, 
	$state,
	$stateParams, 
	$http,
	$window,
	$q,
	$interval,
	$cookies,
	mainService, 
	authenticationService,
	locationService,
	jtsService
){
	// Initialization
	mainService.setShowBackground(true);
	$scope.SERVER_HOST = SERVER_HOST;
	$scope.showLoading = true;
	$scope.jtsMenuLabel = "JTS";
	$scope.outstandingTask = 0;
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	var signageInfo = $cookies.getObject("signageInfo");
	if(typeof signageInfo !== "undefined" && signageInfo.origin != null && signageInfo.timeout != null) {
		authenticationService.setSignageInfo(signageInfo.origin, signageInfo.timeout);
	}

	$scope.getSummary = function() {
		var deferred = $q.defer();

		// Get summary by username
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Issue/GetSummary",
			params: {
				username: $scope.user.user_name
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$scope.summary = response.data;
			$scope.outstandingTask = response.data.open + response.data.in_progress;
			mainService.setTaskNotification($scope.outstandingTask);
			deferred.resolve(response);
		}, function onError(response) {
			deferred.reject(response);
		});
	};

	authenticationService.getAuthenticationState().then(function onSuccess(response){
		$scope.user = typeof response.data.userInfo !== "undefined" ? response.data.userInfo : {};
		$scope.getSummary();
		$http({
			method: 'GET',
			url: SERVER_HOST + "/JTS/ByodMenu/GetByodMenu?byod_menu_id=" + $stateParams.menuId + "&user_id=" + $scope.user.user_id
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
			SUBMENUS: "SUBMENUS",
			FUNCTION: "FUNCTION"
		};
		$scope.onMenuClicked = function (menu) {
			if (menu.type === type.SUBMENUS){
				mainService.navigateWithParams("administrator", { menuId: menu.byod_menu_id});
			} else if (menu.type === type.CATEGORY){
				mainService.navigateWithParams("event", { id: menu.issue_category_id});
			} else if (menu.type === type.URL) {
				if (menu.external_url.indexOf('http') > -1) {
					if(menu.label == "HITS") {
						// $window.open(menu.external_url);
						window.external.notify("LAUNCH_HITS");
					} else {
						if(menu.label == 'MINIBAR') {
							var myParams = "institutionId=" + $scope.user.institution_id;
							menu.external_url = menu.external_url + myParams;
						}	
						mainService.navigateWithParams("external-url", { url: menu.external_url });
					}
				} else {		
					mainService.navigate(menu.external_url.replace("/", "administrator."));					
				} 
			} else if (menu.type === type.FUNCTION) {
				var parsedFn = menu.external_url.substr(0, menu.external_url.indexOf('('));
				var parsedParams = menu.external_url
					.substring(menu.external_url.indexOf('(') + 1, 
							menu.external_url.indexOf(')'));
				var params = [];
				params.push(parsedParams);
				var fn = jtsService[parsedFn];
				if(typeof fn === "function") {
					fn.apply($scope, params);
				}
			}
		}

		var _interval = $interval(function() {
	    	$state.reload();
	    }, 10 * 1000 * 60);

	    $scope.$on('$destroy', function() {
	      // Make sure that the interval is destroyed too
	      $interval.cancel(_interval);
	    });
	});

});