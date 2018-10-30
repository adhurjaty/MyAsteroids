import { DisplayGame } from "./displayGame";
import { MOVE_ENUM } from "./game";

const KEY_TO_MOVE_MAP = Object.freeze({32: MOVE_ENUM.FIRE, 37: MOVE_ENUM.LEFT, 38: MOVE_ENUM.UP, 39: MOVE_ENUM.RIGHT, 40: MOVE_ENUM.DOWN});

export class HumanGame extends DisplayGame {
    constructor(canvas) {
        super(canvas);
    }

    start() {
        document.addEventListener("keydown", (e) => this.keyDownHandler(this, e), false);
        document.addEventListener("keyup", (e) => this.keyUpHandler(this, e), false);
        super.start();
    }

    keyDownHandler(self, e) {
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
        if(self.gameOver && KEY_TO_MOVE_MAP[e.keyCode] == MOVE_ENUM.FIRE) {
            self.initGame();
            super.start();
        } else if(e.keyCode in KEY_TO_MOVE_MAP) {
            self.inputAction(KEY_TO_MOVE_MAP[e.keyCode]);
        }
    }

    keyUpHandler(self, e) {
        var action = KEY_TO_MOVE_MAP[e.keyCode];
        if(action != null) {
            self.stopAction(action);
        }
    }
}