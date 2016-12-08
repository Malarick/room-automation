angular.module('CWI').controller('OutstandingIssueModalCtrl',function(
	$scope, 
	$http,
	$q,
	$uibModalInstance, 
	mainService, 
	SERVER_HOST,
	configuration
){
	$scope.configuration = configuration;
	$scope.outstandingIssue = configuration.outstandingIssue;
	$scope.runnersInCharge = configuration.outstandingIssue.RunnersInCharge;
	$scope.selectedRunner = {
		issue_runner_name: configuration.outstandingIssue.issue_runner,
		issue_runner_id: configuration.outstandingIssue.issue_runner_id
	};
	$scope.statusList = [
		{ status_label: "OPEN", status_id: 0 },
		{ status_label: "IN PROGRESS", status_id: 1 },
		{ status_label: "CLOSED", status_id: 2 }
	];
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	$scope.setSelectedRunner = function(runner) {
		$scope.selectedRunner = runner;
	};

	$scope.onSave = function(selectedRunner) {
		var deferred = $q.defer();

		var model = {
			issue_id: $scope.outstandingIssue.issue_id,
	        issue_runner_id: selectedRunner.issue_runner_id,
	        prev_issue_runner_id: $scope.outstandingIssue.issue_runner_id,
	        issue_status: $scope.outstandingIssue.status == "OPEN" ? 0 : 1,
	        isSelected: true
		};

		// Get outstanding list by username
		$http({
			method: "POST",
			url: SERVER_HOST + "/JTS/Issue/SaveOutstandingIssueAssignment",
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: model,
			transformRequest: function(obj) {
				return mainService.transformRequestObject(obj);
			}
		}).then(function onSuccess(response) {
			$uibModalInstance.close(response.data);
			deferred.resolve(response);
		}, function onError(response) {
			deferred.reject(response);
		});		
	};

	$scope.onCancel = function() {
		$uibModalInstance.dismiss("Cancel");
	};
});