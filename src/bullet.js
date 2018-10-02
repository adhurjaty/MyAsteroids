import { GameObject } from "./gameObject";
import { Point } from "./util";

const LIFETIME = 35,
      RADIUS = 3,
      SPEED = 20

export class Bullet extends GameObject {
    constructor(width, height, point, theta) {
        super(width, height);

        this.theta = theta;
        this.cp = point;

        this.radius = RADIUS;

        this.dp = Point.fromPolar(SPEED, theta);
    }

    isActive() {
        return this.ticks < LIFETIME;
    }
}