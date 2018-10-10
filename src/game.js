import { Ship } from "./ship";
import { Point, piecewiseRandom } from "./util";
import { Bullet } from "./bullet";
import { Asteroid } from "./asteroid";

const PADDING = 50,
      GAME_RATE_INTERVAL = 10,
      BULLET_COOLOFF = 150,    // milliseconds
      SPAWN_DISTANCE = 120,
      ASTEROID_SPAWN_TIME = 5000,
      ASTEROID_HIT_SCORE = [5, 3, 1],
      MOVE_ENUM = Object.freeze({'UP': 0, 'DOWN': 1, 'LEFT': 2, 'RIGHT': 3, 'FIRE': 4}),
      KEY_TO_MOVE_MAP = Object.freeze({32: MOVE_ENUM.FIRE, 37: MOVE_ENUM.LEFT, 38: MOVE_ENUM.UP, 39: MOVE_ENUM.RIGHT, 40: MOVE_ENUM.DOWN});

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.initGame();
    }

    initGame() {
        this.actionHandle = {};

        this.initShip();
        this.initAsteroids();
        this.bullets = [];
        this.bulletFiredTime = 0;
        this.lastAsteroidSpawnTime = 0;
        this.gameOver = false;
        this.score = 0;
        this.counter = 0;
    }

    start() {
        document.addEventListener("keydown", (e) => this.keyDownHandler(this, e), false);
        document.addEventListener("keyup", (e) => this.keyUpHandler(this, e), false);
        this.updateHandle = setInterval(() => { this.update(this); }, GAME_RATE_INTERVAL);
    }

    keyDownHandler(self, e) {
        if(self.gameOver && KEY_TO_MOVE_MAP[e.keyCode] == MOVE_ENUM.FIRE) {
            self.initGame();
            self.updateHandle = setInterval(() => { self.update(self); }, GAME_RATE_INTERVAL);
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

    inputAction(action) {
        var actionFnc = null;
        var self = this;
        switch(action) {
            case MOVE_ENUM.FIRE:
                if(this.counter > this.bulletFiredTime + (BULLET_COOLOFF / GAME_RATE_INTERVAL)) {
                    self.fireBullet(self);
                }
                break;

            case MOVE_ENUM.LEFT:
                actionFnc = () => self.ship.rotate(true);
                break;
            
            case MOVE_ENUM.UP:
                actionFnc = () => self.ship.thrust(true);
                break;
            
            case MOVE_ENUM.RIGHT:
                actionFnc = () => self.ship.rotate(false);
                break;

            case MOVE_ENUM.DOWN:
                actionFnc = () => self.ship.thrust(false);
                break;
        }

        if(actionFnc != null)
        {
            this.actionHandle[action] = actionFnc;
        }
    }

    stopAction(action) {
        if(action in this.actionHandle) {
            delete(this.actionHandle[action]);
        }
    }

    initShip() {
        this.ship = new Ship(this.canvas.width + 2 * PADDING, this.canvas.height + 2 * PADDING);
    }

    initAsteroids() {
        this.asteroids = [];
        for (let i = 0; i < 2; i++) {
            this.spawnAsteroid(this);
        }
    }

    spawnAsteroid(self) {
        var location = self.ship.cp;
        while(self.ship.cp.distance(location) < SPAWN_DISTANCE) {
            var x = piecewiseRandom([0, PADDING], [PADDING + self.canvas.width, 2 * PADDING + self.canvas.width]);
            var y = piecewiseRandom([0, PADDING], [PADDING + self.canvas.height, 2 * PADDING + self.canvas.height]);

            location = self.convertfromDrawCoords(new Point(x, y));
        }

        self.asteroids.push(new Asteroid(self.canvas.width + 2 * PADDING, self.canvas.height + 2 * PADDING, location, 2));
    }

    getState() {
        return {
            asteroids: this.asteroids.map((asteroid => {
                return {
                    position: asteroid.cp,
                    velocity: asteroid.dp,
                    size: asteroid.size
                }
            })),
            position: this.ship.cp,
            velocity: this.ship.dp,
            orientation: this.ship.theta
        };
    }

    update(self) {
        self.counter++;
        if(self.counter >= self.lastAsteroidSpawnTime + ASTEROID_SPAWN_TIME / GAME_RATE_INTERVAL) {
            self.spawnAsteroid(self);
            self.lastAsteroidSpawnTime = self.counter;
        }

        self.continueActions();

        self.ship.update();
        self.bullets.forEach(bullet => {
            bullet.update();
        });
        self.asteroids.forEach(asteroid => {
            asteroid.update();
        });

        self.handleBulletCollisions();
        
        self.draw();
        
        if(self.checkGameOver()) {
            self.endGame();
        }
    }

    continueActions() {
        for(var action in this.actionHandle) {
            this.actionHandle[action]();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShip();
        this.drawBullets();
        this.drawAsteroids();
        this.drawScore();
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

        var vertices = this.getObjVertices(obj);
        this.ctx.beginPath();
        this.ctx.moveTo(...vertices[0].toArray());
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(...vertices[i].toArray());
        }
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawScore() {
        this.ctx.font = '18px arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 100, 20);
    }

    getObjVertices(obj) {
        return obj.getVertices().map((p) => { return this.convertToDrawCoords(p); }, this);
    }

    checkGameOver() {
        var shipVertices = this.ship.getVertices();
        for(var i = 0; i < this.asteroids.length; i++) {
            for(var j = 0; j < shipVertices.length; j++) {
                if(shipVertices[j].distance(this.asteroids[i].cp) < this.asteroids[i].radius) {
                    return true;
                }
            }
        }

        return false;
    }

    endGame() {
        var self = this;
        this.gameOver = true;
        clearInterval(this.updateHandle);
        setTimeout(() => self.showGameOver(), 50);
    }

    showGameOver() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = '48px arial';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2 - 150, this.canvas.height / 2 - 10);
    }

    handleBulletCollisions() {
        var bulletAsteroidIdx = this.checkAsteroidHit();
        if(bulletAsteroidIdx != null) {
            var bulletIdx = bulletAsteroidIdx[0];
            var asteroidIdx = bulletAsteroidIdx[1];
            this.splitAsteroid(asteroidIdx);
            this.removeBullet(bulletIdx);
        }
    }

    checkAsteroidHit() {
        for(var i = 0; i < this.bullets.length; i++) {
            for(var j = 0; j < this.asteroids.length; j++) {
                if(this.bullets[i].cp.distance(this.asteroids[j].cp) < this.bullets[i].radius + this.asteroids[j].radius) {
                    return [i, j];
                }
            }
        }

        return null;
    }

    splitAsteroid(idx) {
        var asteroid = this.asteroids[idx];
        this.score += ASTEROID_HIT_SCORE[asteroid.size];
        this.asteroids.splice(idx, 1);
        var newSize = asteroid.size - 1;
        if(newSize >= 0) {
            for(var i = 0; i < 2; i++) {
                this.asteroids.push(new Asteroid(this.canvas.width + 2 * PADDING, this.canvas.height + 2 * PADDING, asteroid.cp, newSize));
            }
        }
    }

    removeBullet(idx) {
        this.bullets.splice(idx, 1);
    }

    fireBullet(self) {
        self.bullets.push(new Bullet(self.canvas.width, self.canvas.height, self.ship.getFront(), self.ship.theta));
        self.bulletFiredTime = this.counter;
    }

    convertToDrawCoords(p) {
        return new Point(p.x + this.canvas.width / 2, this.canvas.height / 2 - p.y);
    }

    convertfromDrawCoords(p) {
        return new Point(p.x - this.canvas.width / 2, this.canvas.height / 2 - p.y);
    }
}