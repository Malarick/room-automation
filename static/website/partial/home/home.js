angular.module('CWI').controller('HomeCtrl', function(
    $scope,
    mainService,
    growl
){
    // Initialization
    mainService.setShowBackground(true);

	$scope.playSoundClick = function() {
		mainService.playSoundClick();
	};

    // Events
    $scope.navigate = function(state) {
        mainService.navigate(state);
    };
});