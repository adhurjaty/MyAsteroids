import { Point, addAngles } from "./util";

export class GameObject {
    static setDimensions(width, height) {
        GameObject.width = width;
        GameObject.height = height;
    }

    static wrapSpace(cp) {
        if(cp.x > GameObject.width / 2)
            cp.x = -GameObject.width / 2;
        if(cp.x < -GameObject.width / 2)
            cp.x = GameObject.width / 2;
        if(cp.y > GameObject.height / 2)
            cp.y = -GameObject.height / 2;
        if(cp.y < -GameObject.height / 2)
            cp.y = GameObject.height / 2;

        return cp;
    }

    constructor() {
        this.cp = new Point(0, 0);  // center default object at middle (draw will do the canvas coords correction)
        this.dp = new Point(0, 0);
        this.theta = 0;
        this.dTheta = 0;

        this.ticks = 0;
    }

    update() {
        this.cp = this.cp.add(this.dp);

        this.theta = addAngles(this.theta, this.dTheta);

        this.cp = GameObject.wrapSpace(this.cp);
        this.ticks++;
    }

}