angular.module('CWI').controller('RequestFeedbackModalCtrl',function($scope, mainService){
	$scope.clicked = function () {
		mainService.navigate('feedback');
	}

});