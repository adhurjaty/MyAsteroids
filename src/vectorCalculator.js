import { Point, vectorCycle } from "./util";

export const SHOT_DISTANCE = 500,  // approximate distance a bullet can travel, so no point looking further
             INPUT_NEURONS = 33;

export class VectorCalculator {
    constructor(gameState) {
        this.gameState = gameState;
        this.fillVector();
    }

    fillVector() {
        this.vector = Array(INPUT_NEURONS).fill(0);
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
                        if(1/distance > this.vector[i]) {
                            this.vector[i] = 8/distance;
                            var asteroidSpeedToward = -modifiedPos.normalize().dot(asteroid.velocity.rotate(-rotation));
                            this.vector[i+1] = asteroidSpeedToward;
                        }
                    }
                }
            }
        }

        this.vector[this.vector.length - 1] = this.gameState.canShoot && this.vector[0] > 0 ? 1 : 0;
    }

    shiftWorld(asteroids) {
        var self = this;
        var shipPos = this.gameState.position;
        var shipTheta = this.gameState.orientation;
        var velocity = this.gameState.velocity;
        return asteroids.map((asteroid) => {
            var shipVel = velocity.rotate(shipTheta);
            var aPos = asteroid.position.sub(shipPos);
            var aVel = asteroid.velocity.sub(shipVel).rotate(-shipTheta);
            var output = [];
            // duplicate the worlds so the player can see across wrap-around
            for(var vec of vectorCycle()) {
                output.push({
                    position: aPos.add(new Point(self.gameState.width * vec[0],
                        self.gameState.height * vec[1])).rotate(-shipTheta),
                    velocity: aVel,
                    radius: asteroid.radius
                });
            }
            return output;
        }).flat();
    }

    getAsteroidsInRange(asteroids) {
        return asteroids.filter((asteroid) => {
            return (asteroid.position.magnitude() - asteroid.radius) < SHOT_DISTANCE;
        })
    }

    getVector() {
        return this.vector;
    }
}