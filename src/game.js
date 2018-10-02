import { Ship } from "./ship";
import { Point } from "./util";
import { Bullet } from "./bullet";

const PADDING = 50,
      KEY_INTERVAL = 10,
      BULLET_COOLOFF = 500    // milliseconds

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

    }

    update(self) {
        self.checkGameOver();
        self.checkAsteroidHit();
        self.ship.update();
        self.bullets.forEach(bullet => {
            bullet.update();
        });
        self.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShip();
        this.drawBullets();
        this.drawAsteroids();
    }

    drawShip() {
        this.ctx.save();

        var shipLocation = this.convertToDrawCoords([this.ship.cp])[0];
        this.ctx.translate(...shipLocation.toArray());
        this.ctx.rotate(-this.ship.theta);  // canvas rotation axis is negative object local one
        this.ctx.translate(...shipLocation.mul(-1).toArray());

        var vertices = this.convertToDrawCoords(this.ship.getVertices());
        // debugger;
        this.ctx.beginPath();
        this.ctx.moveTo(...vertices[0].toArray());
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(...vertices[i].toArray());
        }
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawBullets() {
        var self = this;

        this.bullets = this.bullets.filter(bullet => bullet.isActive());
        this.bullets.forEach(bullet => {
            var bulletLocation = self.convertToDrawCoords([bullet.cp])[0];

            self.ctx.beginPath();
            self.ctx.arc(bulletLocation.x, bulletLocation.y, bullet.radius, 0, Math.PI * 2, true);
            self.ctx.fill();
        });
    }

    drawAsteroids() {

    }

    checkGameOver() {
        return false;
    }

    checkAsteroidHit() {
        return false;
    }

    fireBullet(self) {
        self.bullets.push(new Bullet(self.canvas.width, self.canvas.height, self.ship.getFront(), self.ship.theta));
        this.bulletFiredTime = new Date();
    }

    convertToDrawCoords(points) {
        var self = this;

        return points.map((point) => {
            return new Point(point.x + self.canvas.width / 2, self.canvas.height / 2 - point.y);
        });
    }
}