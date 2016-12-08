angular.module('CWI').controller('EventCtrl', function(
    $scope,
    $stateParams,
    $http,
    $uibModal,
    SERVER_HOST,
    DEFAULT_STATE,
    mainService,
    authenticationService
){
    // Initialization
    $scope.showLoading = true;
    $scope.serverHost = SERVER_HOST;
    $scope.events = [];
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };
    
	var refresh = function () {
		authenticationService.getAuthenticationState()
		.then(function(response) {
			if(typeof response.data.locationInfo === "undefined") {
				mainService.navigate(DEFAULT_STATE);
			}
			$scope.locationId = response.data.locationInfo.location_id;

			$http({
				method: 'GET',
				url: SERVER_HOST + "/JTS/SiteEventCode/GetSiteEventCodesByCategory" + "?issue_category_id=" + $stateParams.id + "&location_id=" + $scope.locationId
			}).success(function(response) {
				$scope.showLoading = false;
				$scope.events = response.data.list;
			}).error(function(response) {
				$scope.showLoading = false;
				growl.error("Unable to connect to the server.");
				mainService.navigate(DEFAULT_STATE);
			});        
		}, function(error) {
			mainService.navigate(DEFAULT_STATE);
		});
	}
	
	refresh();

    // Events
    $scope.onEventClicked = function(event) {
        var title = event.event_code;
        var description = "Are you sure to " + (event.cancel ? "cancel " : "") + event.event_description.toLowerCase() + "?";
        var isValid = false;
		
        if ($stateParams.id === "8") {
            title = "Feedback"
            description = "Send " + event.event_description.toLowerCase() + " feedback?";
            isValid = true;
        } else if ($stateParams.id === "14") {
            title = "Cleaning Service"
            description = "Are you sure to " + (event.cancel ? "cancel " : "") + event.event_description.toLowerCase() + "?";
            isValid = true;
        }

		$scope.modalConfiguration = {
			title: title,
			description: description,
			categoryId: $stateParams.id,
			event: event,
            locationId: $scope.locationId
		};
		var modalInstance = $uibModal.open({
			templateUrl: "partial/event-modal/event-modal.html",
			controller: "EventModalCtrl",
			keyboard: false,
			backdrop: "static",
			size: "sm",
			resolve: {
				configuration: function() {
					return $scope.modalConfiguration;
				}
			}
		});
		
		modalInstance.result.then(function () {
				refresh();
            }
		);
    };
});