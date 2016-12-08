angular.module('CWI').controller('TelevisionCtrl', function(
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
    $scope.onSwitchTelevisionOff = function() {
        mainService.sendCommand("C%210A0A");
    };
    $scope.onInput = function() {
        mainService.sendCommand("C%210A10");
    };
    $scope.onVolumeUp = function() {
        mainService.sendCommand("C%210A0C");
    };
    $scope.onVolumeDown = function() {
        mainService.sendCommand("C%210A0A");
    };
    $scope.onMute = function() {
        mainService.sendCommand("C%210A0D");
    };
    $scope.onChannelUp = function() {
        mainService.sendCommand("C%210A0E");
    };
    $scope.onChannelDown = function() {
        mainService.sendCommand("C%210A0F");
    };

    // Destructor
    $scope.$on("$destroy", function(event){
    });
});