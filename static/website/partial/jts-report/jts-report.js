angular.module('CWI').controller('JtsReportCtrl',function(
	$scope, 
	$http, 
	$q, 
	$log,
	$timeout,
	$uibModal,
	mainService,
	authenticationService,
	SERVER_HOST,
	growl
){
	$scope.showLoading = true;
	$scope.periodTypes = [
		{ label: 'Daily', value: 'daily' }, 
		{ label: 'Weekly', value: 'weekly' }, 
		{ label: 'Monthly', value: 'monthly' }, 
		{ label: 'Yearly', value: 'yearly' }
	];
	$scope.periodType = {
		selection: $scope.periodTypes[2]
	};
	$scope.dateFormat = "dd-MM-yyyy";
	$scope.startDate1 = {
		opened: false
	};
	$scope.endDate1 = {
		opened: false
	};
	$scope.startDate2 = {
		opened: false
	};
	$scope.endDate2 = {
		opened: false
	};

	$scope.report1 = {
		opened: true
	};
	$scope.report2 = {
		opened: false
	};
	$scope.report3 = {
		opened: false
	};
	
	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

	$scope.openStartDate1 = function() {
		$scope.startDate1.opened = true;
	};
	$scope.openEndDate1 = function() {
		$scope.endDate1.opened = true;
	};
	$scope.openStartDate2 = function() {
		$scope.startDate2.opened = true;
	};
	$scope.openEndDate2 = function() {
		$scope.endDate2.opened = true;
	};

	$scope.openReport1 = function() {
		$scope.report1.opened = true;
	};
	$scope.openReport2 = function() {
		$scope.report2.opened = true;
	};
	$scope.openReport3 = function() {
		$scope.report3.opened = true;
	};

	$scope.getAllReport = function() {
		$scope.getOutstandingIssueReport();
		$scope.getTrendIssueReport();
		$scope.getEmployeeProductivityIssueSummary().then(function onSuccess(response) {
			$scope.showLoading = false;
		}, function onError(response) {
			growl.error("Couldn't load reports");
			$scope.showLoading = false;
		});
	};

	$scope.getOutstandingIssueReport = function(showAll) {
		var deferred = $q.defer();
		var userName = showAll ? null : $scope.userName;

		// Get outstanding category chart data by username
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Report/GetOutstandingIssueChartData",
			params: {
				issue_site_id: 4,		// Harcoded
				site_system_id: 5,		// Harcoded
				username: userName
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$scope.outstandingIssueReportLabels = response.data.Labels;
			$scope.outstandingIssueReportSeries = response.data.Series;
			$scope.outstandingIssueReportData = response.data.Series[0].Values;	// Pie Chart only 1 series			
			$scope.outstandingIssueReportOptions = { legend: { display: true, position: 'bottom' } };

			deferred.resolve(response);
		}, function onError(response) {
			deferred.reject(response);
		});
	};

	$scope.getTrendIssueReport = function() {
		var deferred = $q.defer();		
		$scope.trendIssueReportSeries = [];
		$scope.trendIssueReportData = [];

		// Get Trend Issue Report in specified period
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Report/GetEventTrend",
			params: {
				issue_site_id: '4',			// Hardcoded
				site_system_id: '5',		// Hardcoded
				start_date: $scope.startDate1.value,		    
				end_date: $scope.endDate1.value,			    
				period_type: $scope.periodType.selection.value	// daily, weekly, monthly, yearly
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			// $scope.trendIssueReportLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
			// $scope.trendIssueReportSeries = ['Toilet', 'Room', 'AC', 'Laundry'];
			// $scope.trendIssueReportData = [
			// 	[65, 59, 80, 81, 56, 55],
			// 	[28, 48, 40, 19, 86, 27],
			// 	[38, 28, 30, 33, 68, 56],
			// 	[88, 58, 50, 60, 34, 72]
			// ];

			$scope.trendIssueReportLabels = response.data.Labels;
			angular.forEach(response.data.Series, function(v, i) {
				$scope.trendIssueReportSeries.push(v.SeriesName);
				$scope.trendIssueReportData.push(v.Values);
			});
			$scope.trendIssueReportOptions = {};

			deferred.resolve(response);
		}, function onError(response) {
			deferred.reject(response);
		});
	};

	$scope.getEmployeeProductivityIssueSummary = function(showAll) {
		var deferred = $q.defer();
		var userName = showAll ? null : $scope.userName;		
		$scope.employeeProductivyIssueSummarySeries = [];
		$scope.employeeProductivyIssueSummaryData = [];

		// Get Employee Productivity Issue Summary in specified period
		return $http({
			method: "GET",
			url: SERVER_HOST + "/JTS/Report/GetEmployeeProductivyIssueSummary",
			params: {
				issue_site_id: 4,		// Harcoded
				site_system_id: 5,		// Harcoded
				start_date: $scope.startDate2.value,			    
				end_date: $scope.endDate2.value,	
				username: userName
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSuccess(response) {
			$scope.employeeProductivyIssueSummaryLabels = response.data.Labels;
			angular.forEach(response.data.Series, function(v, i) {
				$scope.employeeProductivyIssueSummarySeries.push(v.SeriesName);
				$scope.employeeProductivyIssueSummaryData.push(v.Values);
			});
			$scope.employeeProductivyIssueSummaryOptions = { legend: { display: true, position: 'bottom' } };

			deferred.resolve(response);
			return deferred.promise;
		}, function onError(response) {
			deferred.reject(response);
		});
	};

	$scope.getAllReport();
});