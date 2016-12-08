angular.module('CWI').controller('EntranceLightCtrl', function(
    $scope,
    $timeout,
    mainService,
    socketService,
    COUNTER_EVENT
){
    // Initialization
    mainService.setShowBackground(true);
    $scope.sliderSetting = {
        step: 1,
        min: 0,
        max: 255,
        tooltip: "hide"
    };
    $scope.brightness = 0;
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    $scope.refreshStatus = function() {
        mainService.sendCommand("C%3f01");
    };
    $scope.refreshStatus();

    // Socket IO Events
    var counterAddresses = ['01'];
    var counterEvent = function (address, state) {
        if (counterAddresses.indexOf(address) !== -1) {
            $timeout(function() {
                $scope.brightness = parseInt(state, 16);
            });
        }
    };
    socketService.on(COUNTER_EVENT, counterEvent);

    // Events
    $scope.switchLightOff = function() {
        mainService.sendCommand("C%210100");
        mainService.sendCommand("F%210500");
    };
    $scope.onSlideStop = function(value){
        value = value.toString(16);
        if(value.length < 2){
            value = '0' + value;
        }

        if(value === '00'){
            $scope.switchLightOff();
        } else {
            mainService.sendCommand("F%210501");
            mainService.sendCommand("C%2101" + value);
        }
    };

    // Destructor
    $scope.$on("$destroy", function(event){
        socketService.removeListener(COUNTER_EVENT, counterEvent);
    });
});