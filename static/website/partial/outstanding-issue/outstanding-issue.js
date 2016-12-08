angular.module('CWI').controller('OutstandingIssueCtrl',function(
	$scope, 
	$http, 
	$q, 
	$log,
	$timeout,
	$uibModal,
	mainService,
	authenticationService,
	locationService,
	SERVER_HOST,
	growl
){
	// Initialization
	mainService.setShowBackground(true);
	$scope.moduleTitle = "My Task List";
	$scope.search = {
		Location: {}
	};
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	$scope.showAll = false;
	$scope.showAssign = false;
	$scope.scannerActive = false;
	$scope.statusList = [
		{ status_label: "OPEN", status_id: 0 },
		{ status_label: "IN PROGRESS", status_id: 1 },
		{ status_label: "CLOSED", status_id: 2 }
	];

	authenticationService.getAuthenticationState()
	.then(function onSuccess(response){
		$scope.userInfo = response.data.userInfo;
		$scope.userName = $scope.userInfo.user_name;
		
		$scope.showAssign = $scope.userInfo.acls.findIndex(function(element, index, array) {
			return element.acl_identifier == "ASSIGN_TASK";
		}) >= 0 ? true : false;

		$scope.populateList($scope.showAll);
	}, function onError(response){		
		$scope.showLoading = false;
		growl.error("Cannot get authentication state");
	});

	$scope.openModal = function(outstandingIssue) {
		var modalConfiguration = {
			title: "Assign Task",
			outstandingIssue: outstandingIssue
		};

		var modalOptions = {
			size: "lg",
			templateUrl: "partial/outstanding-issue-modal/outstanding-issue-modal.html",
			controller: "OutstandingIssueModalCtrl",
			resolve: {
				configuration: function() {
					return modalConfiguration;
				}
			}
		};

		var modalInstance = $uibModal.open(modalOptions);
		modalInstance.result.then(function onSuccess(result) {
			if(!result.data.success) {
				$log.error("SAVE FAILED", result.data);
				growl.error("Save failed");
			} else {
				growl.success("Save successful, task is updated");
			}
			$scope.populateList($scope.showAll);
		}, function onError(reason) {
			// Do something
		});
	};

	$scope.openNotificationModal = function(deviceId, noDeviceMatched) {
		var modalConfiguration = {
			title: "Warning",
			deviceId: deviceId,
			isWallSwitch: false,
			noDeviceMatched: noDeviceMatched
		};

		var modalOptions = {
			size: "lg",
			templateUrl: "partial/wall-switch-modal/wall-switch-modal.html",
			controller: "WallSwitchModalCtrl",
			backdrop: true,
			windowClass: "wall-switch-modal",
			resolve: {
				configuration: function() {
					return modalConfiguration;
				}
			}
		};

		var modalInstance = $uibModal.open(modalOptions);
		modalInstance.result.then(function onSuccess(result) {
			// Do something
		}, function onError(reason) {
			// Do something
		});
	};

	$scope.populateList = function(showAll) {
		$scope.showLoading = true;
		var deferred = $q.defer();

		var userName = showAll ? null : $scope.userName;
		// Get outstanding list by username
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Issue/GetIssueByUsername",
			params: {
				username: userName
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$scope.outstandingIssues = response.data.list;
			$scope.getSummary();
			$scope.getOutstandingIssueChartData(showAll);
			$scope.showLoading = false;
			deferred.resolve(response);
		}, function onError(response) {
			$scope.showLoading = false;
			deferred.reject(response);
		});
	};

	$scope.getSummary = function() {
		var deferred = $q.defer();

		// Get summary by username
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Issue/GetSummary",
			params: {
				username: $scope.userName
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

	$scope.getOutstandingIssueChartData = function(showAll) {
		var deferred = $q.defer();
		var userName = showAll ? null : $scope.userName;

		// Get outstanding category chart data by username
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Report/GetOutstandingIssueChartData",
			params: {
				issue_site_id: 4,    
				site_system_id: 5,
				username: userName
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$scope.chartLabels = response.data.Labels;
			$scope.chartSeries = response.data.series;
			$scope.chartData = response.data.Series[0].Values;	// Pie Chart only 1 series			
			$scope.chartOptions = { legend: { display: true, position: 'bottom' } };

			deferred.resolve(response);
		}, function onError(response) {
			deferred.reject(response);
		});
	};

	$scope.onUpdate = function(issue_id, selectedStatus, currentStatus) {
		var deferred = $q.defer();
		$scope.showLoading = true;

		if(selectedStatus == currentStatus) {
			growl.success("Current status already up to date");
			return;
		}
		// Save/Update the status of outstanding task
		$http({
			method: "POST",
			url: SERVER_HOST + "/JTS/Issue/SaveIssue",
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: {
				issue_id: issue_id,
				issue_status: selectedStatus,
				username: $scope.userName
			},
			transformRequest: function(obj) {
				return mainService.transformRequestObject(obj);
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(val) {
				return val.data;
			})
		}).then(function onSuccess(response) {
			$scope.showLoading = false;
			if(response.data.success) {
				growl.success("Save successful, status is updated");
				$scope.populateList($scope.showAll);
			} else {
				$log.error("SAVE FAILED", response.data);
				growl.error("Save failed");
			}
			deferred.resolve(response);
		}, function onError(response) {
			deferred.reject(response);
		});
	};

	$scope.detectBeaconLocation = function() {
		$scope.scannerActive = true;
		$http({
			method: "POST",
			url: SERVER_HOST + "/JTS/DeviceAssignment/GetDeviceAssignments",
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			var deviceAssignments = response.data.list;
			var scannedDevices = [];
			// var deviceId = "D53B62BE-B8E2-4047-AE23-3C862ED297F4";	// Mock value
			var startBeaconScannerCallback = function(deviceId, signalStrength) {
				var deviceIndex = mainService.findIndexByKeyValue(scannedDevices, "deviceId", deviceId);
				if(deviceIndex > -1) {	// Device already exist in the collections
					scannedDevices[deviceIndex].signalStrengths.push(parseInt(signalStrength, 10));
				} else {	// New Device
					scannedDevices.push({
						deviceId: deviceId,
						signalStrengths: [signalStrength],
						normalizedSignalStrength: -120,
						isMatched: false
					});									
				}
			};

			var scanCompletedCallback = function() {
				angular.forEach(scannedDevices, function(scannedDevice, key) {
					var isMatched = mainService.findIndexByKeyValue(deviceAssignments, "device_identifier", scannedDevice.deviceId);
					if(isMatched > -1) {
						scannedDevice.isMatched = true;
					}
				});
				var matchedDevices = scannedDevices.length == 0 ? [] : scannedDevices.filter(function(scannedDevice) {
					return scannedDevice.isMatched;
				});

				// No matched device found, return
				if(matchedDevices.length == 0) {
					$scope.openNotificationModal(null, true);
					$scope.scannerActive = false;
					return;
				}

				// If only 1 matched device detected, apply the device info
				if(matchedDevices.length == 1) {
					locationService.getDeviceLocationByDeviceIdentifier(matchedDevices[0].deviceId)
					.then(function onSuccess(response) {
						if(response.data.location_label == null) {
							$scope.openNotificationModal(matchedDevices[0].deviceId, false);
							$scope.search.Location.label = "";
						} else {
							$scope.search.Location.label = response.data.location_label;
							// $scope.search.Location.label = "WARD A82 BED 01";	// Mock value
							$scope.populateList($scope.showAll);
						}						
					}, function onError(response) {
						growl.error("Could not retrieve location from device assignments");
					});
				} else {
					//Apply kalman filter
					var nearestDevice = null;

					mainService.kalmanFilter(matchedDevices)
					.then(function onSuccess(response) {
						nearestDevice = response.data;
						locationService.getDeviceLocationByDeviceIdentifier(nearestDevice.deviceId)
						.then(function onSuccess(response) {
							if(response.data.location_label == null) {
								$scope.openNotificationModal(nearestDevice.deviceId, false);
								$scope.search.Location.label = "";
							} else {
								$scope.search.Location.label = response.data.location_label;
								// $scope.search.Location.label = "WARD A82 BED 01";	// Mock value
								$scope.populateList($scope.showAll);
							}						
						}, function onError(response) {
							growl.error("Could not retrieve location from device assignments");
						});
					}, function onError(response) {
						growl.error("Failed to determined nearest device");
					});
				}

				$scope.scannerActive = false;
			};

			locationService.setSendDeviceInfoCallback(startBeaconScannerCallback);
			locationService.setScanCompletedCallback(scanCompletedCallback);
			locationService.startBeaconScanner();				// Start scanner
		}, function onError(response) {
			growl.error("Failed to retrieve Device Assignments, scan aborted");
		});
	};

	$scope.onAssignTask = function(outstandingIssue) {
		$scope.openModal(outstandingIssue);
	};
});