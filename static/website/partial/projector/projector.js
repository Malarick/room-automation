angular.module('CWI').controller('ProjectorCtrl', function(
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
    $scope.onSwitchProjectorOff = function() {
        mainService.sendCommand("C%210A00");
    };
    $scope.onScreenUp = function() {
        mainService.sendCommand("C%210A01");
    };
    $scope.onScreenDown = function() {
        mainService.sendCommand("C%210A03");
    };
    $scope.onScreenStop = function() {
        mainService.sendCommand("C%210A02");
    };

    // Destructor
    $scope.$on("$destroy", function(event){
    });
});