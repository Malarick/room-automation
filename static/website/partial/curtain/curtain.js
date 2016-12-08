angular.module('CWI').controller('CurtainCtrl', function(
    $scope,
    mainService
){
    // Initialization
    mainService.setShowBackground(true);
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    // Socket IO Events

    // Events
    $scope.onDayCurtainOpen= function() {
    };
    $scope.onDayCurtainClose = function() {
    };
    $scope.onDayCurtainStop = function() {
    };
    $scope.onNightCurtainOpen= function() {
    };
    $scope.onNightCurtainClose = function() {
    };
    $scope.onNightCurtainStop = function() {
    };

    // Destructor
    $scope.$on("$destroy", function(event){
    });
});