import { GameObject } from "./gameObject";
import { Point } from "./util";

const SIZE_LOOKUP = [15, 25, 40],
      MAX_SPEEDS = [3.2, 2, 1],
      MIN_SPEED = .3;

export class Asteroid extends GameObject {
    constructor(width, height, location, size) {
        super(width, height);

        this.cp = location;

        this.radius = SIZE_LOOKUP[size];
        this.sides = Math.floor(7 + 5 * Math.random());
        var speed = Math.random() * (MAX_SPEEDS[size] - MIN_SPEED) + MIN_SPEED;
        var orientation = Math.random() * 2 * Math.PI;
        this.dp = Point.fromPolar(speed, orientation);
        this.dTheta = Math.random() * .01;
    }

    getVertices() {
        var self = this;
        return [...Array(this.sides).keys()].map((i) => {
            return Point.fromPolar(self.radius, 2 * Math.PI / self.sides * i).add(self.cp);
        });
    }
}