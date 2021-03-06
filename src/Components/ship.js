import { Point, addAngles } from "./../util";
import { GameObject } from "./gameObject";

const SHIP_WIDTH = 30,
      SHIP_LENGTH = 50,
      TURN_SPEED = .05,
      ACCEL = .05,
      MAX_SPEED = 5,
      COLLISION_POINTS = 10;

export class Ship extends GameObject {
    constructor() {
        super()

        this.theta = Math.PI / 2; // pointing up (radians)
    }

    getVertices() {

        return [new Point(this.cp.x + SHIP_LENGTH / 2, this.cp.y),
                new Point(this.cp.x - SHIP_LENGTH / 2, this.cp.y - SHIP_WIDTH / 2),
                new Point(this.cp.x - SHIP_LENGTH / 2 + 4, this.cp.y - SHIP_WIDTH / 2 + 4),
                new Point(this.cp.x - SHIP_LENGTH / 2 + 4, this.cp.y + SHIP_WIDTH / 2 - 4),
                new Point(this.cp.x - SHIP_LENGTH / 2, this.cp.y + SHIP_WIDTH / 2)];
    }

    getCollisionVertices() {
        var vertices = this.getVertices();
        var front = vertices[0];
        var top = vertices[1];
        var bottom = vertices[vertices.length - 1];

        return front.linspace(top, COLLISION_POINTS)
                    .concat(top.linspace(bottom, COLLISION_POINTS))
                    .concat(bottom.linspace(front, COLLISION_POINTS));
    }

    getFront() {
        return this.cp.add(Point.fromPolar(SHIP_LENGTH / 2 - 10, this.theta));
    }

    rotate(dir) {
        if(dir) {
            this.theta = addAngles(this.theta, TURN_SPEED);
        } else {
            this.theta = addAngles(this.theta, -TURN_SPEED);
        }
    }

    thrust(dir) {
        if(dir) {
            this.dp = this.dp.add(Point.fromPolar(ACCEL, this.theta));
        } else {
            this.dp = this.dp.sub(Point.fromPolar(ACCEL, this.theta));
        }
        if(this.dp.magnitude() > MAX_SPEED) {
            this.dp = this.dp.normalize(MAX_SPEED);
        }
    }
}