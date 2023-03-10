var index;
const connected = document.getElementById("connected");
const debug = document.getElementById("debug");
const info = document.getElementById("info");

const deadzone = 0.15;
const modifier = 0.10;

var interval;

var halfspeed = false;
var upfast = false;

$(document).ready(function () {
    $.post("/init", {'modifier': modifier});
 });
 
window.addEventListener('gamepadconnected', (e) => {
    index = e.gamepad.index;
    connected.classList = "green";
    debug.textContent = `Index: ${e.gamepad.index}\nId: ${e.gamepad.id}\nButtons: ${e.gamepad.buttons.length}\nAxes: ${e.gamepad.axes.length}`;
    interval = setInterval(() => {
    var motors = motorCalculation(round(navigator.getGamepads()[index].axes[0]), round(navigator.getGamepads()[index].axes[1]), round(navigator.getGamepads()[index].axes[2]));
        
        /**
         *  MOTOR INDEX (CHANGE IF NEEDED):
         *  1 \ / 2
         *  3 - - 4
         *  5 / \ 6
         */

        $.post("/motor", {motor1: motors[0], motor2: motors[1], motor3: motors[2], motor4: motors[3], motor5: motors[4], motor6: motors[5]});
        info.textContent = `Motors:
        [${motors[0]}, ${motors[1]}]
        [${motors[2]}, ${motors[3]}]
        [${motors[4]}, ${motors[5]}]

        Left Stick: (${round(navigator.getGamepads()[index].axes[0])}, ${round(navigator.getGamepads()[index].axes[1])})
        Right Stick: (${round(navigator.getGamepads()[index].axes[2])}, ${round(navigator.getGamepads()[index].axes[3])})
        Left Stick Pressed: ${navigator.getGamepads()[index].buttons[10].pressed}
        Right Stick Pressed: ${navigator.getGamepads()[index].buttons[11].pressed}
        Back Button: ${navigator.getGamepads()[index].buttons[8].pressed}
        Start Button: ${navigator.getGamepads()[index].buttons[9].pressed}

        A Button: ${navigator.getGamepads()[index].buttons[0].pressed}
        B Button: ${navigator.getGamepads()[index].buttons[1].pressed}
        X Button: ${navigator.getGamepads()[index].buttons[2].pressed}
        Y Button: ${navigator.getGamepads()[index].buttons[3].pressed}
        
        Up D-Pad: ${navigator.getGamepads()[index].buttons[12].pressed}
        Down D-Pad: ${navigator.getGamepads()[index].buttons[13].pressed}
        Left D-Pad: ${navigator.getGamepads()[index].buttons[14].pressed}
        Right D-Pad: ${navigator.getGamepads()[index].buttons[15].pressed}

        Left Bumper: ${navigator.getGamepads()[index].buttons[4].pressed}
        Right Bumper: ${navigator.getGamepads()[index].buttons[5].pressed}
        Right Trigger: ${navigator.getGamepads()[index].buttons[6].pressed}
        Right Trigger: ${navigator.getGamepads()[index].buttons[7].pressed}`;
        if (navigator.getGamepads()[index].buttons[10].pressed && !halfspeed) {
            halfspeed = true;
            document.getElementById("halfspeed").hidden = false;
        } else if (!navigator.getGamepads()[index].buttons[10].pressed && halfspeed) {
            halfspeed = false;
            document.getElementById("halfspeed").hidden = true;
        }
        if (navigator.getGamepads()[index].buttons[8].pressed && !upfast) {
            upfast = true;
            document.getElementById("upfast").hidden = false;
        } else if (!navigator.getGamepads()[index].buttons[8].pressed && upfast) {
            upfast = false;
            document.getElementById("upfast").hidden = true;
        }
    }, 100);
});

window.addEventListener('gamepaddisconnected', (e) => {
    controller = null;
    connected.classList = "red";
    debug.textContent = "";
    clearInterval(interval);
    info.textContent = "";
});

function round(int) {
    if (deadzone > int && -deadzone < int) return 0;
    else return Math.floor(int*100)/100;
}

function motorCalculation(lx, ly, rx) {
    if (upfast) return [0, 0, 0 ,0]; //disable the horizontal motors if going up fast
    ly = -ly; //CHANGE THIS IF THE MOTORS ARE BACKWARDS!!!
    var frontleft = ly;
    var frontright = ly;
    var backleft = ly;
    var backright = ly;
    //strafing
    if (lx > 0) {
        frontleft -= lx;
        frontright += lx;
        backleft += lx;
        backright -= lx;
    } else if (lx < 0) {
        frontleft += lx;
        frontright -= lx;
        backleft -= lx;
        backright += lx;
    }
    //turning
    if (rx > 0) {
        frontleft -= rx;
        frontright -= rx;
        backleft += rx;
        backright += rx;
    } else if (rx < 0) {
        frontleft += rx;
        frontright += rx;
        backleft -= rx;
        backright -= rx;
    }
    if (halfspeed) {
        frontleft /= 2;
        frontright /= 2;
        backleft /= 2;
        backright /= 2;
    }
    return[Math.floor(frontleft*100)/100, Math.floor(frontright*100)/100, (upfast) ? 1 : -round(navigator.getGamepads()[index].axes[3]), (upfast) ? 1 : -round(navigator.getGamepads()[index].axes[3]), Math.floor(backleft*100)/100, Math.floor(backright*100)/100];
}