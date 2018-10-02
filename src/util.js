export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(other) {
        return Math.sqrt((other.x - this.x)**2 + (other.y - this.y)**2);
    }

    add(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return this.add(other.mul(-1));
    }

    mul(mag) {
        return new Point(this.x * mag, this.y * mag);
    }

    magnitude() {
        return this.distance(new Point(0, 0));
    }

    normalize(factor) {
        if(factor == null) {
            factor = 1;
        }

        return this.mul(factor / this.magnitude());
    }

    toArray() {
        return [this.x, this.y];
    }

    static fromPolar(mag, theta) {
        return new Point(mag * Math.cos(theta), mag * Math.sin(theta));
    }
}