angular.module('CWI').controller('InRoomServiceCtrl', function(
    $scope,
    mainService
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
    $scope.navigateUrl = function(state, url) {
        var params = {
            url: url
        };
        mainService.navigateWithParams(state, params);
    };
    $scope.navigateId = function(state, id) {
        var params = {
            id: id
        };
        mainService.navigateWithParams(state, params);
    };
    $scope.onCallNurse = function() {
        if (confirm("Do you want to call the nurse?")) {
            mainService.sendCommand("DA840D01840D01840D01840D01840D01840D01840D01840D01840D00FF");
        }
    };
    $scope.toggleDoNotDisturb = function() {
        if (confirm("Turn on 'Do Not Disturb' sign?")) {
        }
    };
    $scope.onRequestDrinkingWater = function() {
        if (confirm("Request drinking water?")) {
        }
    };
    $scope.onRequestToiletries = function() {
        if (confirm("Request toiletries?")) {
        }
    };
});