import { Game } from "./game";
import { Point } from "../util";

const GAME_RATE_INTERVAL = 15;

export class DisplayGame extends Game {
    constructor(canvas) {
        super(canvas.width, canvas.height);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    start() {
        this.updateHandle = setInterval(() => { this.update(); }, GAME_RATE_INTERVAL);
    }

    update() {
        super.update();
        this.draw();

        if(this.gameOver) {
            this.endGame();
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

    convertToDrawCoords(p) {
        return new Point(p.x + this.canvas.width / 2, this.canvas.height / 2 - p.y);
    }

    convertfromDrawCoords(p) {
        return new Point(p.x - this.canvas.width / 2, this.canvas.height / 2 - p.y);
    }

    endGame() {
        var self = this;
        clearInterval(this.updateHandle);
        setTimeout(() => self.showGameOver(), 50);
    }

    showGameOver() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = '48px arial';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2 - 150, this.canvas.height / 2 - 10);
    }

}