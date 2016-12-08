angular.module('CWI').controller('LightCtrl', function(
    $scope,
    $timeout,
    mainService,
    socketService,
    FLAG_STATUS_EVENT
){
    // Initialization
    mainService.setShowBackground(true);
    $scope.light_01 = false;
    $scope.light_02 = false;
    $scope.light_03 = false;
    $scope.light_04 = false;
    $scope.initialize = function() {
        mainService.sendCommand("F%3f01");
        mainService.sendCommand("F%3f02");
        mainService.sendCommand("F%3f03");
        mainService.sendCommand("F%3f04");
    };
    $scope.initialize();
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    // Socket IO Events
    var flagAddresses = ['01', '02', '03', '04'];
    var flagStatusEvent = function(address, state) {
        if (flagAddresses.indexOf(address) !== -1) {
            $timeout(function() {
                $scope.toggleLight(address, !(state === '00'));
            });
        }
    };
    socketService.on(FLAG_STATUS_EVENT, flagStatusEvent);

    // Events
    $scope.switchAllLightsOff = function() {
        mainService.sendCommand("F%210100");
        mainService.sendCommand("F%210200");
        mainService.sendCommand("F%210300");
        mainService.sendCommand("F%210400");
    };

    $scope.toggleLight = function(address, state){
        switch(address){
            case "01":
                $scope.light_01 = state;
                break;
            case "02":
                $scope.light_02 = state;
                break;
            case "03":
                $scope.light_03 = state;
                break;
            case "04":
                $scope.light_04 = state;
                break;
            default:
                return;
        }
    };

    $scope.toggleLightCommand = function(address){
        var status = "00";
        switch(address){
            case "01":
                status = $scope.light_01 ? "01" : "00";
                break;
            case "02":
                status = $scope.light_02 ? "01" : "00";
                break;
            case "03":
                status = $scope.light_03 ? "01" : "00";
                break;
            case "04":
                status = $scope.light_04 ? "01" : "00";
                break;
            default:
                return;
        }

        mainService.sendCommand("F%21" + address + status);
    };

    // Destructor
    $scope.$on("$destroy", function(event){
        socketService.removeListener(FLAG_STATUS_EVENT, flagStatusEvent);
    });
});