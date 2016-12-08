angular.module('CWI').controller('FanCtrl', function(
    $scope,
    $timeout,
    mainService,
    socketService,
    FLAG_STATUS_EVENT
){
    // Initialization
    mainService.setShowBackground(true);
    $scope.fanStates = ['00', '00', '00'];
    $scope.fanSpeed = 0;
    $scope.current = "off";
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    $scope.refresh = function(){
        mainService.sendCommand('F%3f06');
        mainService.sendCommand('F%3f07');
        mainService.sendCommand('F%3f08');
    };
    $scope.refresh();

    // Socket IO Events
    var flagAddresses = ['06', '07', '08'];
    var flagStatusEvent = function(address, state){
        if (flagAddresses.indexOf(address) !== -1) {
            $timeout(function() {
                if (state === '01' && $scope.current !== address){
                    $scope.deactivateFan($scope.mapFan($scope.current));
                    $scope.fanSpeed = $scope.mapFan(address) + 1;
                    $scope.fanStates[$scope.mapFan(address)] = '01';
                    $scope.current = address;
                } else if (state === '00'){
                    $scope.deactivateFan($scope.mapFan(address));
                }

                if ($scope.fanStates.indexOf('01') === -1){
                    $scope.fanSpeed = 0;
                    $scope.current = "off";
                }
            });
        }
    };
    socketService.on(FLAG_STATUS_EVENT, flagStatusEvent);

    // Events
    $scope.mapFan = function(current){
        switch(current){
            case '06': return 0;
            case '07': return 1;
            case '08': return 2;
            default: return -1;
        }
    };
    $scope.mapFanReverse = function(value){
        switch(value){
            case 1: return '06';
            case 2: return '07';
            case 3: return '08';
            default: return -1;
        }
    };
    $scope.onFanSpeedChange = function(value){
        if($scope.current !== 'off'){
            mainService.sendCommand("F%21" + $scope.current + "00");
            $scope.deactivateFan($scope.mapFan($scope.current));
        }

        if (value < 1) {
            $scope.deactivateFan(-1);
        } else {
            $scope.fanStates[value - 1] = '01';
            $scope.fanSpeed = value;
            var fanSpeed = $scope.mapFanReverse(value);
            if(fanSpeed !== -1){
                mainService.sendCommand("F%21" + fanSpeed + "01");
            }
        }
    };
    $scope.deactivateFan = function(index){
        if (index === -1) {
            $scope.fanStates = ['00', '00', '00'];
        } else {
            $scope.fanStates[index] = '00';
        }
    };

    // Destructor
    $scope.$on("$destroy", function(event){
        socketService.removeListener(FLAG_STATUS_EVENT, flagStatusEvent);
    });
});