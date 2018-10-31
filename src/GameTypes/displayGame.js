import { Game } from "./game";
import { Point } from "../util";
import { SHOT_DISTANCE, VectorCalculator } from "../vectorCalculator";
import { PADDING } from "./game";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../app";

const GAME_RATE_INTERVAL = 10;

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

        // for debugging
        // this.drawVision();
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
        this.ctx.font = '24px arial';
        this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2 - 60, this.canvas.height / 2 + 50);
    }

    // for debugging purposes
    drawVision() {
        var canvasStart = this.convertToDrawCoords(this.ship.cp);

        var vecCalc = new VectorCalculator(this.getState());
        var vector = vecCalc.getVector();
        var maxVel = .1;
        var maxDanger = -Infinity;

        for(var i = 0; i < 16; i++) {
            var angle = i * Math.PI / 8;
            var absAngle = (angle + this.ship.theta) % (2 * Math.PI);
            var endpoint = this.ship.cp.add(Point.fromPolar(SHOT_DISTANCE, absAngle));

            var canvasEnd = this.convertToDrawCoords(endpoint);

            if(vector[2*i] > 0) {
                var danger = vector[2*i] * vector[2*i+1] * 1000;
                if(danger > maxDanger) {
                    maxDanger = danger;
                }
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.lineWidth = 1;
            }

            this.drawVisionLine(canvasStart, canvasEnd);
        }
        this.drawDanger(maxDanger);
        this.ctx.lineWidth = 1;
    }

    drawVisionLine(start, end) {
        this.ctx.beginPath();
        this.ctx.moveTo(...start.toArray());
        this.ctx.lineTo(...end.toArray());

        while(true) {
            var newStart = new Point(...start.toArray());
            var newEnd = new Point(...end.toArray());
            if(end.x < -2 * PADDING) {
                newStart.x = CANVAS_WIDTH;
                newStart.y = start.interpolateY(end, -2 * PADDING);
                newEnd.x = CANVAS_WIDTH + end.x + 2 * PADDING
            }
            else if(end.x > CANVAS_WIDTH + 2 * PADDING) {
                newStart.x = 0;
                newStart.y = start.interpolateY(end, CANVAS_WIDTH + 2 * PADDING);
                newEnd.x = end.x - (CANVAS_WIDTH + 2 * PADDING);
            }
            else if(end.y < -2 * PADDING) {
                newStart.y = CANVAS_HEIGHT;
                newStart.x = start.interpolateX(end, -2 * PADDING);
                newEnd.y = CANVAS_HEIGHT + end.y + 2 * PADDING;
            }
            else if(end.y > CANVAS_HEIGHT + 2 * PADDING) {
                newStart.y = 0;
                newStart.x = start.interpolateX(end, CANVAS_HEIGHT + 2 * PADDING);
                newEnd.y = end.y - (CANVAS_HEIGHT + 2 * PADDING);
            }

            if(!start.equals(newStart)) {
                start = newStart;
                end = newEnd;
                this.ctx.moveTo(...newStart.toArray());
                this.ctx.lineTo(...newEnd.toArray());
            } else {
                break;
            }
        }
        this.ctx.stroke();
    }

    drawDanger(danger) {
        danger = Math.round(100 * danger) / 100;
        this.ctx.font = '18px arial';
        this.ctx.fillText(`Danger: ${danger}`, 100, 20);
    }
}