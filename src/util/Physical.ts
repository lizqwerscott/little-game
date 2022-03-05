import Matter from "matter-js";
import { Sprite } from "pixi.js";
import { EventEmitter } from "events";

class PhysicalSprite extends EventEmitter {
    body: Matter.Body;
    sprite: Sprite;

    constructor(_body: Matter.Body, _sprite: Sprite, engine: Matter.Engine) {
        super();
        this.body = _body;
        this.sprite = _sprite;

        Matter.Events.on(engine, "collisionEnd", (e: Matter.IEventCollision<Matter.Engine>) => {
            const pairs = e.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                let anotherBody: Matter.Body | null = null;
                if (pair.bodyA == this.body) {
                    anotherBody = pair.bodyB;
                } else if (pair.bodyB == this.body) {
                    anotherBody = pair.bodyA;
                }
                if (anotherBody != null) {
                    this.emit("collisionEnd", anotherBody);
                }
            }
        });
    }

    getPosition(): Matter.Vector {
        return this.body.position;
    }
    getX(): number {
        return this.body.position.x;
    }

    getY(): number {
        return this.body.position.y;
    }

    destory(engine: Matter.Engine) {
        //console.log("destory");
        Matter.World.remove(engine.world, this.body);
        this.sprite.parent.removeChild(this.sprite);
    }

    applyCenterForce(x = 0, y = 0) {
        Matter.Body.applyForce(this.body, this.body.position, { x: x, y: y });
    }
}

class PhysicalWorld {
    engine: Matter.Engine;
    gameWidth: number;
    gameHeight: number;
    constructor(width: number, height: number) {
        this.engine = Matter.Engine.create({
            gravity: {
                x: 0,
                y: 1,
            },
        });
        this.gameWidth = width;
        this.gameHeight = height;
        //const sceneContainer = document.querySelector(".scene");
        //const canvasWidth = sceneContainer.offsetWidth;
    }

    clear(): void {
        Matter.World.clear(this.engine.world, false);
    }

    getPWorld(): Matter.World {
        return this.engine.world;
    }
}

export { PhysicalWorld, PhysicalSprite };
