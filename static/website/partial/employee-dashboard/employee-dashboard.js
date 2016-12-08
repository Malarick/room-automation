angular.module('CWI').controller('EmployeeDashboardCtrl',function(
	$scope,
	$http,
	mainService,
	authenticationService,
	growl,
	SERVER_HOST
){	
	// Initialization
    mainService.setShowBackground(true);
    $scope.moduleTitle = "Employee Dashboard";
	$scope.showLoading = true;
	$scope.runnerGroups = [];
	$scope.runners = [];
	$scope.locations = [];
	$scope.assignments = [];

	// Populate Runner Groups
	$scope.populateRunnerGroups = function () {
		$http({
			method: "POST",
			url: SERVER_HOST + "/JTS/RunnerGroup/GetRunnerGroups",
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$scope.runnerGroups = response.data.list;
			$scope.showLoading = false;
		}, function onError(response) {
			growl.error("Could not load Runner Groups.");
			$scope.showLoading = false;
		});
	};

	// Populate Employee Dashboard
	$scope.populateDashboard = function(runnerGroup) {
		$scope.showLoading = true;
		$http({
			method: "POST",
			url: SERVER_HOST + "/JTS/RunnerGroup/GetRunnerGroupBySupervisor",
			data: {
				name: runnerGroup.name,
				supervisorId: $scope.userId
			},
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			transformRequest: function (obj) {
				var str = [];
				for (var p in obj)
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			console.log(response.data);
			$scope.runners = response.data.Runners;
			$scope.locations = response.data.Locations;
			$scope.assignments = response.data.Assignments;
			$scope.runnerAssignmentsMatching();
			$scope.showLoading = false;
		}, function onError(response) {
			growl.error("Could not load dashboard.");
			$scope.showLoading = false;
		});
	};

	$scope.runnerAssignmentsMatching = function() {
		angular.forEach($scope.runners, function(val, key) {
			var issue_runner_id = val.issue_runner_id;
			var runnerKey = key;
			$scope.runners[runnerKey].assignments = [];
			angular.forEach($scope.assignments, function(val, key) {
				if(val.issue_runner_id == issue_runner_id) {
					var assignment = {
						location_id: val.Location.location_id,
						location_alias: val.Location.alias,
						location_label: val.Location.label
					};
					$scope.runners[runnerKey].assignments.push(assignment);
				}
			});
		});
	};

	authenticationService.getAuthenticationState()
	.then(function onSuccess(response) {
		$scope.userId = response.data.userInfo.user_id;
		$scope.populateRunnerGroups();
	}, function onError(response) {
		growl.error("Could not load authentication status.");
	});
});