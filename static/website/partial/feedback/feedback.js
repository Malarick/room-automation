angular.module('CWI').controller('FeedbackCtrl', function (
	$scope,
	$http,
	$q,
	$log,
	$timeout,
	$uibModal,
	mainService,
	authenticationService,
	SERVER_HOST,
	growl,
	DEFAULT_STATE
) {
    var onRefresh = function () {
        authenticationService.getAuthenticationState()
        .then(function (response) {
            if (typeof response.data.locationInfo === "undefined") {
                mainService.navigate(DEFAULT_STATE);
            }

            $scope.locationId = response.data.locationInfo.location_id;

            $http({
                method: 'GET',
                url: SERVER_HOST + "/JTS/Issue/GetFeedbackIssues" + "?locationId=" + $scope.locationId
            }).success(function (response) {
                $scope.showLoading = false;
                $scope.issues = response.data.list;
            }).error(function (response) {
                $scope.showLoading = false;
                growl.error("Unable to connect to the server.");
                mainService.navigate(DEFAULT_STATE);
            });

        }, function (error) {
            mainService.navigate(DEFAULT_STATE);
        });
    }

    onRefresh();


    $scope.playSoundClick = function () {
        mainService.playSoundClick();
    };

    $scope.onFeedback = function (issue_id, rating, feedback) {
        var deferred = $q.defer();
        // Save/Update the status of outstanding task
        $http({
            method: "POST",
            url: SERVER_HOST + "/JTS/Issue/SaveFeedback",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                issue_id: issue_id,
                rating: rating,
                feedback: feedback
            },
            transformRequest: function (obj) {
                return mainService.transformRequestObject(obj);
            },
            transformResponse: mainService.appendTransform($http.defaults.transformResponse, function (val) {
                return val.data;
            })
        }).then(function onSuccess(response) {
            if (response.data.success) {
                growl.success("Save successful, status is updated");
                onRefresh();
            } else {
                $log.error("SAVE FAILED", response.data);
                growl.error("Save failed");
            }
            deferred.resolve(response);
        }, function onError(response) {
            deferred.reject(response);
        });
    };

});