import { Point } from "./util";
import { POINT_CONVERSION_COMPRESSED } from "constants";
import { GameObject } from "./gameObject";

const SHOT_DISTANCE = 300;  // approximate distance a bullet can travel, so no point looking further

export class InputVector {
    constructor(gameState) {
        this.gameState = gameState;
        this.vector = Array(33).fill(0);
        this.initVector();
    }

    initVector() {
        var asteroids = this.shiftWorld(this.gameState.asteroids);
        var inRangeAsteroids = this.getAsteroidsInRange(asteroids);
        if(inRangeAsteroids.length > 0) {
            for(var i = 0; i < this.vector.length - 1; i += 2) {
                var rotation = i * Math.PI / 16;
                for(var j = 0; j < inRangeAsteroids.length; j++) {
                    var asteroid = inRangeAsteroids[j];
                    var modifiedPos = asteroid.position.rotate(-rotation);
                    if(Math.abs(modifiedPos.y) <= asteroid.radius) {
                        var distance = modifiedPos.x - Math.sqrt(asteroid.radius ** 2 - modifiedPos.y ** 2);
                        if(distance < this.vector[i]) {
                            this.vector[i] = distance;
                            this.vector[i+1] = -asteroid.velocity.rotate(-rotation).x;
                        }
                    }
                }
            }
        }
    }

    

    shiftWorld(asteroids) {
        var shipPos = this.gameState.position;
        var shipTheta = this.gameState.orientation;
        return asteroids.map((asteroid) => {
            return {
                position: GameObject.wrapSpace(asteroid.position.sub(shipPos)).rotate(-shipTheta),
                velocity: asteroid.velocity.rotate(-shipTheta),
                radius: asteroid.radius
            };
        });
    }

    getAsteroidsInRange(asteroids) {
        return asteroids.filter((asteroid) => {
            return (asteroid.position.magnitude() - asteroid.radus) < SHOT_DISTANCE;
        })
    }

    getVector() {
        return this.vector;
    }
}