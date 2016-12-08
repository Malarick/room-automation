angular.module('CWI').controller('AirConditionerCtrl', function(
    $scope,
    $timeout,
    mainService,
    socketService,
    FLAG_STATUS_EVENT,
    COUNTER_EVENT,
    SENSOR_EVENT
){
    // Initialization
    mainService.setShowBackground(true);
    $scope.roomTemperature = 30;
    $scope.fanStates = ['00', '00', '00'];
    $scope.fanSpeed = 0;
    $scope.airConditionerState = '00';
    $scope.airConditionerTemperature = 16;
    $scope.current = "off";
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };

    $scope.refresh = function(){
        mainService.sendCommand("s%3f01");
        mainService.sendCommand("C%3f02");
        mainService.sendCommand("F%3f09");
        mainService.sendCommand("F%3f10");
        mainService.sendCommand("F%3f11");
        mainService.sendCommand("F%3f12");
    };
    $scope.refresh();

    // Socket IO Events
    var flagAddresses = ['09', '10', '11', '12'];
    var flagStatusEvent = function(address, state){
        if (flagAddresses.indexOf(address) !== -1) {
            $timeout(function() {
                if (address === '09'){
                    $scope.airConditionerState = state;
                } else {
                    if (state === '01' && $scope.current !== address){
                        $scope.deactivateFan($scope.mapFan($scope.current));
                        $scope.fanSpeed = $scope.mapFan(address) + 1;
                        $scope.fanStates[$scope.mapFan(address)] = '01';
                        $scope.activateAirConditionerState();
                        $scope.current = address;
                    } else if (state === '00'){
                        $scope.deactivateFan($scope.mapFan(address));
                    }

                    if ($scope.fanStates.indexOf('01') === -1){
                        $scope.fanSpeed = 0;
                        $scope.airConditionerState = '00';
                        $scope.current = "off";
                    }
                }
            });
        }
    };
    socketService.on(FLAG_STATUS_EVENT, flagStatusEvent);

    var counterAddresses = ['02'];
    var counterEvent = function(address, state){
        if (counterAddresses.indexOf(address) !== -1) {
            $timeout(function() {
                $scope.airConditionerTemperature = parseInt(state, 16);
            });
        }
    };
    socketService.on(COUNTER_EVENT, counterEvent);

    var sensorAddresses = ['01'];
    var sensorEvent = function(address, state){
        if (sensorAddresses.indexOf(address) !== -1) {
            $timeout(function() {
                $scope.roomTemperature = parseInt(state, 16);
            });
        }
    };
    socketService.on(SENSOR_EVENT, sensorEvent);

    // Events of Fan
    $scope.mapFan = function(current){
        switch(current){
            case '10': return 0;
            case '11': return 1;
            case '12': return 2;
            default: return -1;
        }
    };
    $scope.mapFanReverse = function(value){
        switch(value){
            case 1: return '10';
            case 2: return '11';
            case 3: return '12';
            default: return -1;
        }
    };
    $scope.onFanSpeedChange = function(value){
        if($scope.current !== 'off'){
            mainService.sendCommand("F%21" + $scope.current + "00");
            $scope.deactivateFan($scope.mapFan($scope.current));
        }

        $scope.fanStates[value - 1] = '01';
        $scope.fanSpeed = value;
        var fanSpeed = $scope.mapFanReverse(value);
        if(fanSpeed !== -1){
            $scope.activateAirConditioner();
            mainService.sendCommand("F%21" + fanSpeed + "01");
        }
    };
    $scope.deactivateFan = function(index){
        if (index === -1) {
            $scope.fanStates = ['00', '00', '00'];
            $scope.airConditionerState = '00';
        } else {
            $scope.fanStates[index] = '00';
        }
    };

    // Events of Air Conditioner
    $scope.activateAirConditionerState = function(){
        if ($scope.airConditionerState === '00'){
            $scope.airConditionerState = '01';
        }
    };
    $scope.activateAirConditioner = function(){
        if ($scope.airConditionerState === '00'){
            mainService.sendCommand("F%210901");
            $scope.airConditionerState = '01';
        }
    };
    $scope.incrementTemperature = function(){
        if ($scope.airConditionerTemperature < 30 && $scope.airConditionerState !== '00') {
            $scope.airConditionerTemperature++;
            var hexTemperature = $scope.airConditionerTemperature.toString(16);
            if($scope.airConditionerTemperature < 16){
                hexTemperature = '0' + hexTemperature;
            }
            mainService.sendCommand("C%2102" + hexTemperature);
        }
    };
    $scope.decrementTemperature = function(){
        if($scope.airConditionerTemperature > 16 && $scope.airConditionerState !== '00') {
            $scope.airConditionerTemperature--;
            var hexTemperature = $scope.airConditionerTemperature.toString(16);
            if($scope.airConditionerTemperature < 16){
                hexTemperature = '0' + hexTemperature;
            }
            mainService.sendCommand("C%2102" + hexTemperature);
        }
    };
    $scope.deactivateAirConditioner = function(){
        if ($scope.current !== 'off'){
            mainService.sendCommand("F%21" + $scope.current + "00");
            mainService.sendCommand("F%210900");
            $scope.deactivateFan(-1);
        }
    };

    // Destructor
    $scope.$on("$destroy", function(event){
        socketService.removeListener(FLAG_STATUS_EVENT, flagStatusEvent);
        socketService.removeListener(COUNTER_EVENT, counterEvent);
        socketService.removeListener(SENSOR_EVENT, sensorEvent);
    });
});