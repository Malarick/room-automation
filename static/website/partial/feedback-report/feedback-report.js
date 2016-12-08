angular.module('CWI').controller('FeedbackReportCtrl', function(
	$scope,
	$http,
	$q,
	mainService,
	SERVER_HOST,
	growl
){
	$scope.dateFormat = "dd-MM-yyyy";
	$scope.report = {
		opened: true
	};
	$scope.startDate = {
		value: null
	};
	$scope.endDate = {
		value: null
	};

	$scope.feedbackReportOptions = {
		legend: { 
			display: true, 
			position: 'bottom' 
		}
	};

	$scope.getFeedbackReport = function() {
		$http({
			method: "GET",
			url: SERVER_HOST + "/JTS/SiteEventLog/GetSiteEventLogsForReport",
			params: {
				start_date: $scope.startDate.value,
				end_date: $scope.endDate.value
			},
			transformResponse: mainService.appendTransform($http.defaults.transformResponse, function(value) {
				return value.data;
			})
		}).then(function onSucccess(response) {
			var list = response.data.list;
			$scope.summary = list;
			$scope.OverallSatisfactionSeries = list.OverallSatisfactionCategories;
			$scope.OverallSatisfactionLabels = [];
			$scope.OverallSatisfactionData = [];
			angular.forEach($scope.OverallSatisfactionSeries, function(val, key) {
				$scope.OverallSatisfactionLabels.push(val.label);
				$scope.OverallSatisfactionData.push(val.count);		
			});

			$scope.RecommendationSeries = list.RecommendationCategories;
			$scope.RecommendationLabels = [];
			$scope.RecommendationData = [];
			angular.forEach($scope.RecommendationSeries, function(val, key) {
				$scope.RecommendationLabels.push(val.label);
				$scope.RecommendationData.push(val.count);		
			});

			$scope.ComplimentSeries = list.ComplimentCategories;
			$scope.ComplimentLabels = [];
			$scope.ComplimentData = [];
			angular.forEach($scope.ComplimentSeries, function(val, key) {
				$scope.ComplimentLabels.push(val.label);
				$scope.ComplimentData.push(val.count);		
			});

			$scope.mixedChartColors = ['#45b7cd', '#33ff33', '#ff6384','#ffae72'];
			$scope.OverallSatisfactionSeries2 = [];
			$scope.OverallSatisfactionData2 = [];
			$scope.OverallSatisfactionLabels2 = list.OverallSatisfactionCategory.Labels;
			angular.forEach(list.OverallSatisfactionCategory.Series, function(val, key) {
				$scope.OverallSatisfactionSeries2.push(val.SeriesName);
				$scope.OverallSatisfactionData2.push(val.ValuesDouble);
			});
			$scope.OverallSatisfactionDatasetOverride2 = [
				{
					label: "ACTUAL",
					borderWidth: 1,
					type: 'bar'
				},
				{
					label: "AVERAGE",
					borderWidth: 3,
					hoverBackgroundColor: "rgba(255,99,132,0.4)",
					hoverBorderColor: "rgba(255,99,132,1)",
					type: 'line'
				}
			];

			$scope.OverallSatisfactionSeries3 = [];
			$scope.OverallSatisfactionData3 = [];
			$scope.OverallSatisfactionLabels3 = list.OverallSatisfactionCategoryDetail.Labels;
			angular.forEach(list.OverallSatisfactionCategoryDetail.Series, function(val, key) {
				$scope.OverallSatisfactionSeries3.push(val.SeriesName);
				$scope.OverallSatisfactionData3.push(val.ValuesDouble);
			});
			$scope.OverallSatisfactionDatasetOverride3 = [
				{
					label: "ACTUAL POSITIVE",
					borderWidth: 1,
					type: 'bar'
				},
				{
					label: "AVERAGE POSITIVE",
					borderWidth: 3,
					hoverBackgroundColor: "rgba(255,99,132,0.4)",
					hoverBorderColor: "rgba(255,99,132,1)",
					type: 'line'
				},
				{
					label: "ACTUAL NEGATIVE",
					borderWidth: 1,
					type: 'bar'
				},
				{
					label: "AVERAGE NEGATIVE",
					borderWidth: 3,
					hoverBackgroundColor: "rgba(255,99,132,0.4)",
					hoverBorderColor: "rgba(255,99,132,1)",
					type: 'line'
				}
			];

		}, function onError(response) {
			growl.alert("Failed to load feedback report.");
		});
	};
});