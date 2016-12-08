angular.module('CWI').controller('EventModalCtrl', function(
    $scope,
    $http,
    mainService,
    configuration,
    SERVER_HOST
){
    $scope.configuration = configuration;
    $scope.generalError = "There's something wrong with the server. Do you want to try again?\n(If still not working, please contact the administrator.)";
    $scope.description = configuration.description;
    $scope.clicked = false;
    $scope.success = false;
	
	if(!configuration.event.cancel) configuration.event.cancel = false;
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    $scope.onSent = function() {
        $scope.description = "Please wait...";
        $scope.clicked = true;
        $http({
            method: 'GET',
            url: SERVER_HOST + "/JTS/SiteEventCode/TriggerIssue" 
                + "?issue_category_id=" + configuration.categoryId 
                + "&site_event_code_id=" + configuration.event.site_event_code_id
                + "&location_id=" + configuration.locationId
				+ "&cancel=" + configuration.event.cancel
        }).then(function successCallback(response) {
            try {
                if(response.data.data.success) {
                    $scope.description = "Request is sent successfully.";
                    $scope.success = true;
                } else {
                    var exist = false;
                    angular.forEach(response.data.data.validations, function (validation, validationKey) {
                        if(validation.message === "Issue already exists") {
                            exist = true;
                        }
                    });

                    if(exist) {
                        $scope.description = "Job request has been sent to the respective department.";
                        $scope.success = true;
                    } else {
                        $scope.description = $scope.generalError;
                        $scope.clicked = false;
                    }
                }
            } catch (ex) {
                $scope.description = $scope.generalError;
                $scope.clicked = false;
            }
        }, function errorCallback(response) {
            $scope.description = $scope.generalError;
            $scope.clicked = false;
        });
    }
});