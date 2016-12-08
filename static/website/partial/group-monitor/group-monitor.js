angular.module('CWI').controller('GroupMonitorCtrl',function(
	$scope,
	$http,
	$uibModal,
	mainService,
	authenticationService,
	jtsService,
	growl,
	SERVER_HOST
){	
	// Initialization
    mainService.setShowBackground(true);
    $scope.SERVER_HOST = SERVER_HOST;
    $scope.moduleTitle = "Group Monitoring";
    $scope.borderColorGreen = {
    	"border-left": "4px solid green"
    };
    $scope.borderColorOrange = {
    	"border-left": "4px solid orange"
    };
    $scope.borderColorRed = {
    	"border-left": "4px solid red"
    };

    $scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	$scope.loadModule = function() {
		$scope.showLoading = true;
		$scope.monitoringGroup = {};
		$scope.monitoringGroups = [];
		$scope.allRunners = [];
		$scope.runners = [];
		$scope.locations = [];
		$scope.assignments = [];
		$scope.isShowAll = true;
		$scope.availabilityFilter = null;
		$scope.monitoringGroupIdFilter = 0;
		$scope.availableValue = true;
	
		authenticationService.getAuthenticationState()
		.then(function onSuccess(response) {
			$scope.userId = response.data.userInfo.user_id;
			$scope.populateMonitoringGroups();
		}, function onError(response) {
			growl.error("Could not load authentication status.");
		});
	};

	// Populate Monitoring Groups
	$scope.populateMonitoringGroups = function () {
		$http({
			method: "POST",
			url: SERVER_HOST + "/JTS/Monitoring/GetMonitoringGroupsBySupervisor",
			data: {
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
			$scope.monitoringGroups = response.data;
			$scope.getDistinctRunners();
			$scope.showLoading = false;
		}, function onError(response) {
			growl.error("Could not load Monitoring Groups.");
			$scope.showLoading = false;
		});
	};

	// Populate Dashboard
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

	$scope.openModal = function (configuration) {
        var modalOptions = {
            size: configuration.size,
            templateUrl: configuration.templateUrl,
            controller: configuration.controller,
            backdrop: configuration.backdrop,
            resolve: {
            	configuration: function() {
            		return configuration;
            	}
            }
        };

        $scope.modalInstance = $uibModal.open(modalOptions);
        $scope.modalInstance.result.then(function onSuccess(result) {
			growl.success("Task assignment success.");
            $scope.loadModule();
        }, function onError(reason) {
            // Do something
        });
    };

	$scope.showAssignments = function(runner) {
		var configuration = {
			// Params
			title: "Assignments",
			runner: runner,
			// Modal Config
			size: "lg",
			templateUrl: "partial/group-monitor-assignment-modal/group-monitor-assignment-modal.html",
			controller: "GroupMonitorAssignmentModalCtrl",
			backdrop: true
		};

		$scope.openModal(configuration);
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

	$scope.getDistinctRunners = function() {
		angular.forEach($scope.monitoringGroups, function(val, key) {
			var monitoring_group_id = val.monitoring_group_id;
			angular.forEach(val.Runners, function(val, key) {
				val.monitoring_group_id = monitoring_group_id;
				$scope.allRunners.push(val);
				if(mainService.findIndexByKeyValue($scope.runners, "issue_runner_id", val.issue_runner_id) == -1) {
					$scope.runners.push(val);
				}
			});
		});
	};

	$scope.showAll = function() {
		$scope.isShowAll = true;
		$scope.availabilityFilter = null;
		$scope.monitoringGroup.selected = null;
		$scope.loadModule();
	};

	$scope.showActive = function(state) {
		$scope.availabilityFilter = state;
	};

	$scope.onFiltered = function() {
		$scope.isShowAll = false;
		$scope.monitoringGroupIdFilter = $scope.monitoringGroup.selected.monitoring_group_id;
	};

	$scope.dashboardFilter = function(item) {
		if($scope.isShowAll || item.monitoring_group_id == $scope.monitoringGroupIdFilter) {
			if($scope.availabilityFilter == null || item.available == $scope.availabilityFilter) {
				return item;
			}		
		}

		return;
	};

	$scope.TEST = function() {
		var address = "10";
		var status = "00";
		mainService.sendCommand("F%21" + address + status);

		// var userSettings = {
		// 	displayOpt: "L",
		// 	iconSize: "S",
		// 	mobileView: true
		// };

		// var menuInfo = {
		// 	functionName: "roomAlert",
		// 	fnArgs: ["Please clean up your room!", "Go AWAY!", "1", "2"]
		// };

		// var fnTest01 = jtsService[menuInfo.functionName];
		// if(typeof fnTest01 === "function") {
		// 	fnTest01.apply($scope, menuInfo.fnArgs);
		// }else{
		// 	alert(menuInfo.functionName + " : is not a registered function");
		// }

		/*
		// SET userSettings to session
		authenticationService.setUserSettings(userSettings)
		.then(function(response) {
			console.log("POSTED", response);
			// GET userSettings from session
			authenticationService.getSessionInfo()
			.then(function onSuccess(response) {
				console.log("GET", response);
			}, function onError(response) {
				// Do something on error
			});
		}, function onError(response) {
			// Do something on error
		});
		*/
	};

	$scope.loadModule();
});