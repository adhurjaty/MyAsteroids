import { Ship } from "./ship";
import { Point, piecewiseRandom } from "./util";
import { Bullet } from "./bullet";
import { Asteroid } from "./asteroid";

const PADDING = 50,
      KEY_INTERVAL = 10,
      BULLET_COOLOFF = 500,    // milliseconds
      SPAWN_DISTANCE = 120

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.keyHandle = {};

        this.initShip();
        this.initAsteroids();
        this.bullets = [];
        this.bulletFiredTime = new Date();
    }

    start() {
        document.addEventListener("keydown", (e) => this.keyDownHandler(this, e), false);
        document.addEventListener("keyup", (e) => this.keyUpHandler(this, e), false);
        setInterval(() => { this.update(this); }, 10);
    }

    keyDownHandler(self, e) {
        var keyFnc = null;
        switch(e.keyCode) {
            case 32:    // space bar
                if(new Date() - this.bulletFiredTime > BULLET_COOLOFF) {
                    self.fireBullet(self);
                }
                break;

            case 37:    // left arrow
                keyFnc = () => self.ship.rotate(true);
                break;
            
            case 38:    // up arrow
                keyFnc = () => self.ship.thrust(true);
                break;
            
            case 39:    // right arrow
                keyFnc = () => self.ship.rotate(false);
                break;

            case 40:    // down arrow
                keyFnc = () => self.ship.thrust(false);
                break;
        }

        if(keyFnc != null)
        {
            if(e.keyCode in this.keyHandle) {
                clearInterval(this.keyHandle[e.keyCode]);
            }
            self.keyHandle[e.keyCode] = setInterval(keyFnc, KEY_INTERVAL);
        }
    }

    keyUpHandler(self, e) {
        if(e.keyCode in this.keyHandle) {
            clearInterval(this.keyHandle[e.keyCode]);
            delete(this.keyHandle[e.keyCode]);
        }
    }

    initShip() {
        this.ship = new Ship(this.canvas.width + 2 * PADDING, this.canvas.height + 2 * PADDING);
    }

    initAsteroids() {
        this.asteroids = [];
        for (let i = 0; i < 2; i++) {
            this.spawnAsteroid();
        }
    }

    spawnAsteroid() {
        var location = this.ship.cp;
        while(this.ship.cp.distance(location) < SPAWN_DISTANCE) {
            var x = piecewiseRandom([0, PADDING], [PADDING + this.canvas.width, 2 * PADDING + this.canvas.width]);
            var y = piecewiseRandom([0, PADDING], [PADDING + this.canvas.height, 2 * PADDING + this.canvas.height]);

            location = this.convertfromDrawCoords(new Point(x, y));
        }

        this.asteroids.push(new Asteroid(this.canvas.width + 2 * PADDING, this.canvas.height + 2 * PADDING, location, 2));
    }

    update(self) {
        self.checkGameOver();
        self.checkAsteroidHit();
        self.ship.update();
        self.bullets.forEach(bullet => {
            bullet.update();
        });
        self.asteroids.forEach(asteroid => {
            asteroid.update();
        })
        self.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShip();
        this.drawBullets();
        this.drawAsteroids();
    }

    drawShip() {
        this.drawVertexObject(this.ship);
    }

    drawBullets() {
        this.bullets = this.bullets.filter(bullet => bullet.isActive());
        this.bullets.forEach(bullet => {
            var bulletLocation = this.convertToDrawCoords(bullet.cp);

            this.ctx.beginPath();
            this.ctx.arc(bulletLocation.x, bulletLocation.y, bullet.radius, 0, Math.PI * 2, true);
            this.ctx.fill();
        }, this);
    }

    drawAsteroids() {
        for(var i = 0; i < this.asteroids.length; i++) {
            this.drawVertexObject(this.asteroids[i]);
        }
    }

    drawVertexObject(obj) {
        this.ctx.save();

        var globalLocation = this.convertToDrawCoords(obj.cp);
        this.ctx.translate(...globalLocation.toArray());
        this.ctx.rotate(-obj.theta);  // canvas rotation axis is negative object local one
        this.ctx.translate(...globalLocation.mul(-1).toArray());

        var vertices = obj.getVertices().map((p) => { return this.convertToDrawCoords(p); }, this);
        this.ctx.beginPath();
        this.ctx.moveTo(...vertices[0].toArray());
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(...vertices[i].toArray());
        }
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.restore();
    }

    checkGameOver() {
        return false;
    }

    checkAsteroidHit() {
        return false;
    }

    fireBullet(self) {
        self.bullets.push(new Bullet(self.canvas.width, self.canvas.height, self.ship.getFront(), self.ship.theta));
        self.bulletFiredTime = new Date();
    }

    convertToDrawCoords(p) {
        return new Point(p.x + this.canvas.width / 2, this.canvas.height / 2 - p.y);
    }

    convertfromDrawCoords(p) {
        return new Point(p.x - this.canvas.width / 2, this.canvas.height / 2 - p.y);
    }
}