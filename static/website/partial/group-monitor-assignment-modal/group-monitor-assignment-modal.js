angular.module('CWI').controller('GroupMonitorAssignmentModalCtrl',function(
	$scope, 
	$http,
	$uibModalInstance,
	mainService, 
	configuration,
	SERVER_HOST
){
	$scope.title = configuration.title;
	$scope.runner = configuration.runner;
	$scope.assignments = configuration.runner.assignments;
	$scope.currentTasks = configuration.runner.currentTasks;
	$scope.oneAtATime = false;
	$scope.statusList = [
		{ status_label: "OPEN", status_id: 0 },
		{ status_label: "IN PROGRESS", status_id: 1 },
		{ status_label: "CLOSED", status_id: 2 }
	];

	$scope.mapTaskAssignment = function() {
		angular.forEach($scope.currentTasks, function(val, key) {
			var taskLocationId = val.Location.location_id;
			angular.forEach($scope.assignments, function(val, key) {
				if(val.Location.location_id == taskLocationId) {
					val.isCurrentTask = true;
				}
			});
		});
	};

	angular.forEach($scope.assignments, function(assignment, assignmentKey) {
		angular.forEach(assignment.LocationOutstandingIssues, function(outstandingIssue, outstandingIssueKey) {
			outstandingIssue.isSelected = outstandingIssue.Runner != null && outstandingIssue.Runner.issue_runner_id == $scope.runner.issue_runner_id;
		});
	});

	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	$scope.onCancel = function() {
		$uibModalInstance.dismiss("Cancel");
	};

	$scope.onSaveTaskAssignment = function(assignments) {
		var models = [];
		angular.forEach(assignments, function(assignment, assignmentKey) {
			angular.forEach(assignment.LocationOutstandingIssues, function(outstandingIssue, outstandingIssueKey) {
				var model = {};
				model.issue_id = outstandingIssue.issue_id;
				model.issue_runner_id = $scope.runner.issue_runner_id;
				model.prev_issue_runner_id = outstandingIssue.Runner == null ? 0 : outstandingIssue.Runner.issue_runner_id;
				model.issue_status = outstandingIssue.status;
				model.isSelected = outstandingIssue.isSelected;
				
				models.push(model);
			});
		});

		$http({
			method: "POST",
			url: "/node-proxy/saveOutstandingIssueAssignments",
			data: angular.toJson({
				models: models
			}),
			transformRequest: function(obj) {
				return obj;
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$uibModalInstance.close(response.data);
		}, function onError(response) {
			// Do something on error
		});
	};

	$scope.mapTaskAssignment();
});