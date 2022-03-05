import Game from "./util/Game";
import { TextStyle, AnimatedSprite, Texture } from "pixi.js";
import Matter from "matter-js";
import { PhysicalSprite } from "./util/Physical";
import { Scene } from "./util/Scene";
import KeyboardManager from "./util/keyboard";

class MyGame extends Game {
    constructor() {
        super(900, 1600, scenes[0]);
    }

    preload(): void {
        this.loaderAdd("start", "../assets/start.png");
        this.loaderAdd("restart", "../assets/restart.png");
        this.loaderAdd("ground", "../assets/stonePlatform.png");
        this.loaderAdd("sky", "../assets/sky.png");
        this.loaderAdd("dude", "../assets/dude/dudu.json");
        this.loaderAdd("star", "../assets/star.png");
    }
}

class StartScene extends Scene {
    constructor(game: Game) {
        super("StartScene", game);
    }

    create(): void {
        const gameWidth = this.game.gameWidth;
        const gameHeight = this.game.gameHeight;
        //const start = this.addImageSprite("start", gameWidth / 2, gameHeight / 2);
        const sky1 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2);
        sky1.scale.set(1.5, 1.5);
        const sky2 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2 - 400);
        sky2.scale.set(1.5, 1.5);
        const sky3 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2 + 400);
        sky3.scale.set(1.5, 1.5);

        const textStyle = new TextStyle({
            fontSize: 100,
            fill: ["#ff0000"],
        });
        this.addText("Up", gameWidth / 2, gameHeight / 4, textStyle);

        const startButton = this.addButton("start", gameWidth / 2, gameHeight / 2);
        if (startButton != null) {
            startButton.on("pointerdown", () => {
                this.game.sceneManager.runNextScene("MainScene");
            });
        }
    }
}

class DudePlayer {
    dudeLeft: AnimatedSprite;
    dudeRight: AnimatedSprite;
    dudeDown: PhysicalSprite;
    dudeRun: Array<number>;

    constructor(scene: MainScene) {
        const gameWidth = scene.game.gameWidth;
        const gameHeight = scene.game.gameHeight;
        const dudeY = gameHeight - 100;

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
        scene.container.addChild(this.dudeLeft);

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
        scene.container.addChild(this.dudeRight);

        this.dudeDown = scene.addPhysicalSprite("down.png", gameWidth / 2, dudeY, {
            restitution: 1,
            density: 0.045,
            friction: 0.8,
            frictionAir: 0.05,
        });
        console.log("width: " + this.dudeDown.sprite.width + " height: " + this.dudeDown.sprite.height);

        this.dudeRun = new Array<number>();

        scene.game.app.ticker.add(() => {
            this.dudeLeft.position.x = this.dudeDown.body.position.x;
            this.dudeLeft.position.y = this.dudeDown.body.position.y;
            this.dudeRight.position.x = this.dudeDown.body.position.x;
            this.dudeRight.position.y = this.dudeDown.body.position.y;
        });

        const force = 2;

        const left = KeyboardManager.keyBoard("ArrowLeft");
        left.press = () => {
            this.dudeDown.applyCenterForce(-force);

            this.dudeDown.sprite.renderable = false;
            this.dudeLeft.renderable = true;
            this.dudeLeft.play();
        };
        left.release = () => {
            this.dudeLeft.renderable = false;
            this.dudeLeft.stop();
            this.dudeDown.sprite.renderable = true;
        };
        const right = KeyboardManager.keyBoard("ArrowRight");
        right.press = () => {
            this.dudeDown.applyCenterForce(force);

            this.dudeDown.sprite.renderable = false;
            this.dudeRight.renderable = true;
            this.dudeRight.play();
        };
        right.release = () => {
            this.dudeRight.renderable = false;
            this.dudeRight.stop();
            this.dudeDown.sprite.renderable = true;
        };

        scene.game.app.ticker.add((delta) => {
            Matter.Body.setAngle(this.dudeDown.body, 0);

            for (let i = this.dudeRun.length - 1; i >= 0; i--) {
                console.log("use: " + i);
                this.dudeDown.applyCenterForce(0, this.dudeRun[i]);
                this.dudeRun.pop();
            }
        });

        const up = KeyboardManager.keyBoard("ArrowUp");
        up.press = () => {
            this.dudeDown.applyCenterForce(0, -5);
            console.log("up");
            //Matter.Body.setVelocity(dudeDown.body, { x: 0, y: -10000 });
        };

        this.dudeDown.on("collisionEnd", (bodyB: Matter.Body) => {
            //console.log("connect: " + bodyB.id);
            if (scene.grounds.has(bodyB.id) && this.dudeDown.body.position.y < bodyB.position.y) {
                Matter.Body.setVelocity(this.dudeDown.body, { x: 0, y: 0 });
                this.dudeRun.push(-5);
                console.log("conectIsGround");
            }
        });
    }
}

class MainScene extends Scene {
    grounds: Map<number, PhysicalSprite>;
    generateTime: number;

    dude: DudePlayer | null;
    constructor(game: Game) {
        super("MainScene", game);
        this.grounds = new Map<number, PhysicalSprite>();
        this.generateTime = 0;
        this.dude = null;
    }

    randomNumber(count = 1, min = 1, max = 10, scope = 2) {
        const numArray = new Array<number>();
        let temp = 0;
        let rightp = true;
        let isrepeat = true;

        for (let i = 0; i < count; i++) {
            do {
                temp = Math.floor(Math.random() * (max - min + 1) + min);
                isrepeat = numArray.includes(temp);
                if (isrepeat) {
                    rightp = true;
                } else {
                    if (scope <= 0) {
                        rightp = false;
                    } else {
                        let iscan = false;
                        for (let j = 0; j < numArray.length; j++) {
                            if (Math.abs(numArray[j] - temp) < scope) {
                                iscan = true;
                                break;
                            }
                        }
                        rightp = iscan;
                    }
                }
            } while (rightp);
            numArray.push(temp);
        }
        return numArray;
    }

    autoGenerateGround(y: number, count = 0) {
        const lineNum = Math.floor(this.game.gameHeight / 90);
        if (count == 0) {
            count = Math.floor(Math.random() * 3 + 1);
        }

        if (Math.floor(Math.random() * 50 + 25) == 39) {
            count == 0;
        }

        if (count != 0) {
            const numArray = this.randomNumber(count, 1, lineNum, 3);
            for (let i = 0; i < count; i++) {
                const x = numArray[i] * 90 - 45 + Math.random() * 44 - 44;
                const ground = this.addPhysicalSprite("ground", x, y, {
                    isStatic: true,
                });
                this.grounds.set(ground.body.id, ground);
            }
        }
    }

    create(): void {
        const gameWidth = this.game.gameWidth;
        const gameHeight = this.game.gameHeight;

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
        //Matter.World.add(this.game.world.engine.world, wallBottom);

        const rect1 = this.addPhysicalRect(0xff0000, gameWidth / 2, gameHeight / 2, 40, 10);
        const rect2 = this.addPhysicalRect(0xde3249, gameWidth / 2, gameHeight / 2 + 50, 40, 10);
        const constraint = Matter.Constraint.create({
            bodyA: rect1.body,
            bodyB: rect2.body,
            stiffness: 0.1,
            damping: 0.9,
        });
        //Matter.World.add(this.game.world.engine.world, constraint);

        const ground = this.addPhysicalSprite("ground", gameWidth / 2, gameHeight - 30, {
            isStatic: true,
        });

        this.grounds.set(ground.body.id, ground);

        for (let i = 40; i < gameHeight - 200; i += 150) {
            this.autoGenerateGround(i);
        }

        this.dude = new DudePlayer(this);
    }

    update(delta: number): void {
        this.grounds.forEach((ground: PhysicalSprite) => {
            const nextY = ground.getY() + 0.2;
            const nextPos = { x: ground.getX(), y: nextY };
            if (nextY > this.game.gameHeight + 5) {
                console.log("destory: " + ground.body.id);
                this.grounds.delete(ground.body.id);
                ground.destory(this.game.world.engine);
            }
            Matter.Body.setPosition(ground.body, nextPos);
        });

        this.generateTime += 1;

        if (this.generateTime >= 160 / 0.2) {
            this.autoGenerateGround(-10);
            this.generateTime = 0;
        }
        if (this.dude != null) {
            if (this.dude.dudeDown.getY() > this.game.gameHeight + 5) {
                this.game.sceneManager.runNextScene("FinishScene");
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

class FinishScene extends Scene {
    constructor(game: Game) {
        super("FinishScene", game);
    }

    create(): void {
        const gameWidth = this.game.gameWidth;
        const gameHeight = this.game.gameHeight;

        const sky1 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2);
        sky1.scale.set(1.5, 1.5);
        const sky2 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2 - 400);
        sky2.scale.set(1.5, 1.5);
        const sky3 = this.addImageSprite("sky", gameWidth / 2, gameHeight / 2 + 400);
        sky3.scale.set(1.5, 1.5);

        const textStyle = new TextStyle({
            fontSize: 100,
            fill: ["#ff0000"],
        });
        this.addText("You are Wasted", gameWidth / 2, gameHeight / 4, textStyle);
        const restart = this.addButton("restart", gameWidth / 2, gameHeight / 2);
        restart.on("pointerdown", () => {
            this.game.sceneManager.runNextScene("MainScene");
        });
    }
}

const scenes = ["StartScene", "MainScene", "FinishScene"];

const game = new MyGame();
scenes.forEach((item) => {
    const scene = eval("new " + item + "(game)");
    game.sceneManager.addScene(scene);
});

game.run();
