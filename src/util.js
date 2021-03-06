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

    negative() {
        return new Point(0, 0).sub(this);
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

    rotate(theta) {
        return new Point(Math.cos(theta) * this.x - Math.sin(theta) * this.y,
                         Math.sin(theta) * this.x + Math.cos(theta) * this.y);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    linspace(other, num) {
        var dist = (other.x - this.x) / num;
        var pnts = [];

        for(var i = 0; i <= num; i++) {
            var x = this.x + dist * i;
            var y = this.interpolateY(other, x);
            pnts.push(new Point(x, y));
        }

        return pnts;
    }

    interpolateX(other, y) {
        return this._interpolate(other, (a) => a.x, (b) => b.y, y);
    }

    interpolateY(other, x) {
        return this._interpolate(other, (a) => a.y, (b) => b.x, x);
    }

    _interpolate(other, afn, bfn, val) {
        return (afn(other) - afn(this)) * (val - bfn(this)) / (bfn(other) - bfn(this)) + afn(this);
    }

    toArray() {
        return [this.x, this.y];
    }

    toPolar() {
        var r = Math.sqrt(this.x ** 2 + this.y ** 2);
        var theta = Math.atan2(this.y, this.x);
        return [r, theta];
    }

    static fromPolar(mag, theta) {
        return new Point(mag * Math.cos(theta), mag * Math.sin(theta));
    }
}

export function addAngles(theta, phi) {
    theta += phi;
    theta %= 2 * Math.PI;
    if(theta < 0) {
        theta += 2 * Math.PI;
    }

    return theta;
}

export function piecewiseRandom() {
    var idx = Math.floor(Math.random() * arguments.length);
    var range = arguments[idx];
    return Math.random() * (range[1] - range[0]) + range[0];
}

export function randomGaussian()
{
	var val, u, v, s, mul;

    do {
        u = Math.random()*2-1;
        v = Math.random()*2-1;

        s = u*u+v*v;
    } while(s === 0 || s >= 1);

    mul = Math.sqrt(-2 * Math.log(s) / s);

    val = u * mul;

	return val / 14;	// 7 standard deviations on either side
}

export function boundValue(val, upperLimit, lowerLimit) {
    return Math.max(lowerLimit, Math.min(upperLimit, val));
}

// end is not inclusive
export function randomInt(start, end) {
    return Math.floor((end - start) * Math.random() + start);
}

export function arrayMax(arr, fn) {
    var max = -Infinity;
    var maxEl = null
    for(var i = 0; i < arr.length; i++) {
        var val = fn(arr[i]);
        if(val > max) {
            max = val;
            maxEl = arr[i];
        }
    }

    return maxEl;
}

export function shuffle(arr) {
    var fromArr = arr.slice(0);
    var shuffled = [];
    for(var i = 0; i < arr.length; i++) {
        var idx = randomInt(0, fromArr.length);
        shuffled.push(fromArr[idx]);
        fromArr.splice(idx, 1);
    }

    return shuffled;
}

export function cloneObject(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

export function addEmptyChartItems(data) {
    var keys = [];
    data.forEach(d => {
        keys = keys.concat(Object.keys(d).filter(x => keys.indexOf(x) == -1));
    });

    return data.map(d => {
        keys.filter(key => Object.keys(d).indexOf(key) == -1).forEach(key => {
            d[key] = 0;
        });
        return d;
    })
}

export function* vectorCycle() {
    for (var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
            yield [i, j];
        }   
    }
}