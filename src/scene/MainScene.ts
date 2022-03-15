import { AnimatedSprite, Texture, Text, TextStyle, Sprite } from "pixi.js";
import Matter from "matter-js";

import { PhysicalSprite } from "../util/Physical";
import { Scene, SceneManager } from "../util/Scene";
import Game from "../util/Game";
import { randomNumber, isPC } from "../util/utilsFun";
import KeyboardManager from "../util/keyboard";
import GameConfig from "../GameConfig";

class DudePlayer {
    dudeLeft: AnimatedSprite;
    dudeRight: AnimatedSprite;
    dudeDown: PhysicalSprite;
    dudeRun: Array<number>;
    dead: boolean;
    direction: string;

    upTimes: number;
    retreatTime: number;

    constructor(scene: MainScene) {
        const gameWidth = scene.game.gameWidth;
        const gameHeight = scene.game.gameHeight;
        const dudeY = gameHeight - 100;
        this.dead = false;
        this.direction = "down";
        this.upTimes = 3;
        this.retreatTime = 0;

        this.dudeLeft = new AnimatedSprite([
            Texture.from("left_1.png"),
            Texture.from("left_2.png"),
            Texture.from("left_3.png"),
            Texture.from("left_4.png"),
        ]);
        this.dudeLeft.loop = true;
        this.dudeLeft.anchor.set(0.5, 0.5);
        this.dudeLeft.position.set(gameWidth / 2, dudeY);
        this.dudeLeft.renderable = false;
        this.dudeLeft.animationSpeed = 0.1;
        scene.container?.addChild(this.dudeLeft);

        this.dudeRight = new AnimatedSprite([
            Texture.from("right_1.png"),
            Texture.from("right_2.png"),
            Texture.from("right_3.png"),
            Texture.from("right_4.png"),
        ]);
        this.dudeRight.loop = true;
        this.dudeRight.anchor.set(0.5, 0.5);
        this.dudeRight.renderable = false;
        this.dudeRight.position.set(gameWidth / 2, dudeY);
        this.dudeRight.animationSpeed = 0.1;
        scene.container?.addChild(this.dudeRight);

        this.dudeDown = scene.addPhysicalSprite("down.png", gameWidth / 2, dudeY, {
            restitution: 1,
            density: 0.045,
            friction: 0.8,
            frictionAir: 0.05,
        });
        console.log("width: " + this.dudeDown.sprite.width + " height: " + this.dudeDown.sprite.height);

        this.dudeRun = new Array<number>();

        scene.game.app.ticker.add(() => {
            if (!this.dead) {
                this.dudeLeft.position.x = this.dudeDown.body.position.x;
                this.dudeLeft.position.y = this.dudeDown.body.position.y;
                this.dudeRight.position.x = this.dudeDown.body.position.x;
                this.dudeRight.position.y = this.dudeDown.body.position.y;
            }
        });

        const left = KeyboardManager.keyBoard("ArrowLeft");
        left.press = () => {
            this.moveLeftStart();
        };
        left.release = () => {
            this.moveLeftEnd();
        };
        const right = KeyboardManager.keyBoard("ArrowRight");
        right.press = () => {
            this.moveRightStart();
        };
        right.release = () => {
            this.moveRightEnd();
        };

        const up = KeyboardManager.keyBoard("ArrowUp");
        up.press = () => {
            this.moveUp();
        };

        this.dudeDown.on("collisionEnd", (bodyB: Matter.Body) => {
            const stonep = scene.grounds.has(bodyB.id) && this.dudeDown.body.position.y < bodyB.position.y;
            if (stonep) {
                Matter.Body.setVelocity(this.dudeDown.body, { x: 0, y: 0 });
                this.dudeRun.push(-6);
                console.log("conectIsGround");
            }
        });
    }

    update(delta: number) {
        const force = 5;
        Matter.Body.setAngle(this.dudeDown.body, 0);
        const pos = this.dudeDown.body.position;
        if (this.direction == "left") {
            const nextPos = { x: pos.x - force, y: pos.y };
            Matter.Body.setPosition(this.dudeDown.body, nextPos);
        }
        if (this.direction == "right") {
            const nextPos = { x: pos.x + force, y: pos.y };
            Matter.Body.setPosition(this.dudeDown.body, nextPos);
        }

        for (let i = this.dudeRun.length - 1; i >= 0; i--) {
            console.log("use: " + i);
            this.dudeDown.applyCenterForce(0, this.dudeRun[i]);
            this.dudeRun.pop();
        }
        //console.log("retreatTime: " + (this.retreatTime / 1000) * 100 + "%");
        if (this.upTimes < 3) {
            this.retreatTime += delta;
            if (this.retreatTime >= 1000) {
                this.upTimes++;
                this.retreatTime = 0;
            }
        }
    }

    moveLeftStart() {
        this.direction = "left";
        this.dudeDown.sprite.renderable = false;
        this.dudeLeft.renderable = true;
        this.dudeLeft.play();
    }

    moveLeftEnd() {
        this.direction = "down";
        this.dudeLeft.renderable = false;
        this.dudeLeft.stop();
        this.dudeDown.sprite.renderable = true;
    }

    moveRightStart() {
        this.direction = "right";
        this.dudeDown.sprite.renderable = false;
        this.dudeRight.renderable = true;
        this.dudeRight.play();
    }

    moveRightEnd() {
        this.direction = "down";
        this.dudeRight.renderable = false;
        this.dudeRight.stop();
        this.dudeDown.sprite.renderable = true;
    }

    moveUp() {
        if (this.upTimes > 0) {
            this.dudeDown.applyCenterForce(0, -5);
            console.log("up");
            this.upTimes--;
        }
    }
}

class MainScene extends Scene {
    grounds: Map<number, PhysicalSprite>;
    generateLastSprite: PhysicalSprite | null;
    groundDownSpeed: number;

    dude: DudePlayer | null;
    wallBottomId: number;

    showScore: Text | null;
    showRet: Text | null;

    lightings: Array<Sprite>;
    constructor(game: Game) {
        super("MainScene", game);
        this.grounds = new Map<number, PhysicalSprite>();
        this.generateLastSprite = null;
        this.dude = null;
        this.wallBottomId = -1;
        this.groundDownSpeed = 0.4;
        this.showScore = null;
        this.showRet = null;
        this.lightings = new Array<Sprite>();
    }

    autoGenerateGround(y: number, count = 0) {
        const lineNum = Math.floor(this.game.gameHeight / 90);
        if (count == 0) {
            count = Math.floor(Math.random() * 2 + 1);
        }

        if (Math.floor(Math.random() * 100 + 25) == 39) {
            count == 0;
        }

        if (count != 0) {
            const numArray = randomNumber(count, 1, lineNum, 3);
            for (let i = 0; i < count; i++) {
                const x = numArray[i] * 90 - 45 + Math.random() * 22 - 22;
                const ground = this.addPhysicalSprite("ground", x, y, {
                    isStatic: true,
                });
                this.grounds.set(ground.body.id, ground);
                this.generateLastSprite = ground;
            }
        }
    }

    create(): void {
        const gameWidth = this.game.gameWidth;
        const gameHeight = this.game.gameHeight;
        GameConfig.score = 0;

        const sky1 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2);
        sky1.scale.set(1.5, 1.5);
        const sky2 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2 - 400);
        sky2.scale.set(1.5, 1.5);
        const sky3 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2 + 400);
        sky3.scale.set(1.5, 1.5);

        const wallBottom = Matter.Bodies.rectangle(
            this.game.gameWidth / 2,
            this.game.gameHeight - 10,
            this.game.gameWidth,
            10,
            {
                isStatic: true,
                restitution: 1,
            },
        );
        //Matter.Composite.add(this.game.world.engine.world, wallBottom);
        //this.wallBottomId = wallBottom.id;

        const ground = this.addPhysicalSprite("ground", gameWidth / 2, gameHeight - 30, {
            isStatic: true,
        });
        console.log("ground: ", ground.sprite.height + ", " + ground.sprite.width);

        this.grounds.set(ground.body.id, ground);

        for (let i = gameHeight - 200; i >= 40; i -= 100) {
            this.autoGenerateGround(i, 2);
        }

        this.dude = new DudePlayer(this);

        sky3.interactive = true;
        sky3.on("pointerdown", () => {
            this.dude?.moveUp();
        });

        const textStyle = new TextStyle({
            fill: ["#ff0000"],
        });

        this.showScore = this.addText("Score: " + GameConfig.score, 45, 10, textStyle);

        if (!isPC()) {
            const left = this.addButton("left", gameWidth / 4, gameHeight - 100);
            left.scale.set(3);
            left.alpha = 0.3;
            left.on("pointerdown", () => {
                this.dude?.moveLeftStart();
            });
            left.on("pointerup", () => {
                this.dude?.moveLeftEnd();
            });
            const right = this.addButton("right", (gameWidth * 3) / 4, gameHeight - 100);
            right.scale.set(3);
            right.alpha = 0.3;
            right.on("pointerdown", () => {
                this.dude?.moveRightStart();
            });
            right.on("pointerup", () => {
                this.dude?.moveRightEnd();
            });
            const up = this.addButton("up", gameWidth / 2, gameHeight - 100);
            up.scale.set(3);
            up.alpha = 0.3;
            up.on("pointerdown", () => {
                this.dude?.moveUp();
            });
        }

        this.showRet = this.addText("", gameWidth - 50, 20, textStyle);
        this.lightings = new Array<Sprite>();

        for (let index = 0; index < this.dude.upTimes; index++) {
            const light = this.addImageSprite("lighting", gameWidth - 20, 40 * (index + 1));
            this.lightings.push(light);
        }
    }

    update(delta: number): void {
        this.grounds.forEach((ground: PhysicalSprite) => {
            const nextY = ground.getY() + this.groundDownSpeed;
            const nextPos = { x: ground.getX(), y: nextY };
            if (nextY > this.game.gameHeight + 10) {
                console.log("destory: " + ground.body.id);
                this.grounds.delete(ground.body.id);
                //ground.destory(this.game.world.engine);
                this.removePhysicalSprite(ground);
            }
            Matter.Body.setPosition(ground.body, nextPos);
        });

        if (this.showScore != null) {
            this.showScore.text = "Score: " + GameConfig.score;
        }

        //this.generateLastSprite += Math.ceil(this.groundDownSpeed - 0.2) + 1;

        /*
        if (this.generateLastSprite >= 100 / this.groundDownSpeed) {
            this.autoGenerateGround(-10, 2);
            this.generateLastSprite = 0;
            GameConfig.score += 10;
            this.groundDownSpeed += 0.01;
        }
        */
        if (this.generateLastSprite != null) {
            if (this.generateLastSprite.getPosition().y > 90) {
                this.autoGenerateGround(-10, 2);
                GameConfig.score += 10;
                this.groundDownSpeed += 0.01;
            }
        }
        if (this.dude != null) {
            if (this.dude.dudeDown.getY() > this.game.gameHeight + 5) {
                this.dude.dead = true;
                this.dude = null;
                SceneManager.getInstance().runNextScene("FinishScene");

                this.grounds = new Map<number, PhysicalSprite>();
                this.generateLastSprite = null;
                this.dude = null;
                this.wallBottomId = -1;
                this.groundDownSpeed = 0.2;
            }
        }

        if (this.dude != null) {
            this.dude.update(delta);
            for (let index = 0; index < this.dude.upTimes; index++) {
                this.lightings[index].renderable = true;
            }
            for (let index = 0; index < this.lightings.length - this.dude.upTimes; index++) {
                this.lightings[this.lightings.length - index - 1].renderable = false;
            }
            if (this.lightings.length > this.dude.upTimes) {
                if (this.showRet != null) {
                    this.showRet.text = Math.ceil((this.dude.retreatTime / 1000) * 100) + "%";
                }
            }
        }
    }

    setBodyVelocity(body: Matter.Body, x = 0, y = 0) {
        Matter.Body.setVelocity(body, {
            x: x,
            y: y,
        });
    }
}

export default MainScene;
