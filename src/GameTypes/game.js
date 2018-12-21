import { Ship } from "../Components/ship";
import { Point, piecewiseRandom } from "../util";
import { Bullet } from "../Components/bullet";
import { Asteroid } from "../Components/asteroid";
import { GameObject } from "../Components/gameObject";

export const PADDING = 50;
const BULLET_COOLOFF = 15,    // game tick intervals
      SPAWN_DISTANCE = 120,
      ASTEROID_SPAWN_TIME = 500,    // game tick intervals
      ASTEROID_HIT_SCORE = [5, 3, 1];

export const MOVE_ENUM = Object.freeze({'UP': 0, 'DOWN': 1, 'LEFT': 2, 'RIGHT': 3, 'FIRE': 4});

export class Game {
    constructor(width, height) {
        this.totalWidth = width + 2 * PADDING;
        this.totalHeight = height + 2 * PADDING;
        GameObject.setDimensions(this.totalWidth, this.totalHeight);

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

    inputAction(action) {
        var actionFnc = null;
        var self = this;
        switch(action) {
            case MOVE_ENUM.FIRE:
                if(this.canShoot()) {
                    this.fireBullet();
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

    canShoot() {
        return this.counter > this.bulletFiredTime + BULLET_COOLOFF;
    }

    initShip() {
        this.ship = new Ship();
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
            var x = piecewiseRandom([-this.totalWidth / 2, -this.totalWidth / 2 + PADDING], [this.totalWidth / 2 - PADDING, this.totalWidth / 2]);
            var y = piecewiseRandom([-this.totalHeight / 2, -this.totalHeight / 2 + PADDING], [this.totalHeight / 2 - PADDING, this.totalHeight / 2]);

            location = new Point(x, y);
        }

        this.asteroids.push(new Asteroid(location, 2));
    }

    getState() {
        return {
            asteroids: this.asteroids.map((asteroid => {
                return {
                    position: asteroid.cp,
                    velocity: asteroid.dp,
                    radius: asteroid.radius
                }
            })),
            position: this.ship.cp,
            velocity: this.ship.dp,
            orientation: this.ship.theta,
            width: this.totalWidth,
            height: this.totalHeight,
            score: this.score,
            canShoot: this.canShoot()
        };
    }

    update() {
        this.counter++;
        if(this.counter >= this.lastAsteroidSpawnTime + ASTEROID_SPAWN_TIME) {
            this.spawnAsteroid();
            this.lastAsteroidSpawnTime = this.counter;
        }

        this.continueActions();

        this.ship.update();

        this.bullets = this.bullets.filter(bullet => bullet.isActive());
        this.bullets.forEach(bullet => {
            bullet.update();
        });
        this.asteroids.forEach(asteroid => {
            asteroid.update();
        });
        
        this.handleBulletCollisions();

        this.checkAndSetGameOver();
    }

    continueActions() {
        for(var action in this.actionHandle) {
            this.actionHandle[action]();
        }
    }

    checkAndSetGameOver() {
        var shipVertices = this.ship.getCollisionVertices();
        for(var i = 0; i < this.asteroids.length; i++) {
            for(var j = 0; j < shipVertices.length; j++) {
                if(shipVertices[j].distance(this.asteroids[i].cp) < this.asteroids[i].radius) {
                    this.gameOver = true;
                    return;
                }
            }
        }
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
                this.asteroids.push(new Asteroid(asteroid.cp, newSize));
            }
        }
    }

    removeBullet(idx) {
        this.bullets.splice(idx, 1);
    }

    fireBullet() {
        this.bullets.push(new Bullet(this.ship.getFront(), this.ship.theta));
        this.bulletFiredTime = this.counter;
    }
}