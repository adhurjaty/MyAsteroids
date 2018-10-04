import { Point, addAngles } from "./util";

export class GameObject {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.cp = new Point(0, 0);  // center default object at middle (draw will do the canvas coords correction)
        this.dp = new Point(0, 0);
        this.theta = 0;
        this.dTheta = 0;

        this.ticks = 0;
    }

    update() {
        this.cp = this.cp.add(this.dp);

        this.theta = addAngles(this.theta, this.dTheta);

        this.wrapSpace();
        this.ticks++;
    }

    wrapSpace() {
        if(this.cp.x > this.width / 2)
            this.cp.x = -this.width / 2;
        if(this.cp.x < -this.width / 2)
            this.cp.x = this.width / 2;
        if(this.cp.y > this.height / 2)
            this.cp.y = -this.height / 2;
        if(this.cp.y < -this.height / 2)
            this.cp.y = this.height / 2;
    }
}