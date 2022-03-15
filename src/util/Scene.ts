import { PhysicalWorld, PhysicalSprite } from "./Physical";
import Matter from "matter-js";
import { Container, Application, Texture, Sprite, Text, TextStyle, Graphics, Rectangle } from "pixi.js";
import Game from "./Game";

class Scene {
    name: string;
    sceneObject: Array<PhysicalSprite>;
    container: Container | null;
    game: Game;

    constructor(_name: string, _game: Game) {
        this.name = _name;
        this.sceneObject = new Array<PhysicalSprite>();
        this.container = null;
        //this.container.x = _game.gameWidth / 2;
        //this.container.y = _game.gameHeight / 2;
        this.game = _game;
    }

    create(): void {
        //console.log("create");
    }

    updatePhysicalScene() {
        this.sceneObject.forEach((object: PhysicalSprite) => {
            if (!object.dead) {
                object.sprite.position.set(object.body.position.x, object.body.position.y);
                //object.sprite.position.x = object.body.position.x;
                //object.sprite.position.y = object.body.position.y;
                object.sprite.rotation = object.body.angle;
            }
        });
    }

    removePhysicalSprite(sprite: PhysicalSprite) {
        this.sceneObject.filter((item) => item !== sprite);
        sprite.destory(this.game.world.engine);
    }

    update(delta: number): void {
        //console.log("update");
    }

    start(): void {
        this.container = new Container();
        this.game.app.stage.addChild(this.container);
        this.game.app.ticker.add(this.update, this); //this.container.renderable = false;
        this.game.app.ticker.add(this.updatePhysicalScene, this);
        this.game.world.clear();
        this.create();
    }

    stop(): void {
        console.log("stop Scene: " + this.name);
        this.game.app.ticker.remove(this.updatePhysicalScene, this);
        this.game.app.ticker.remove(this.update, this);
        //this.game.app.stage.removeChild(this.container);
        this.sceneObject = new Array<PhysicalSprite>();
        this.container?.destroy({
            children: true,
            texture: false,
            baseTexture: false,
        });
        //this.container.renderable = false;
        this.game.world.clear();
    }

    imageKeyValue(imageKey: string): string {
        let imageValue = "";
        if (imageKey.includes(".png")) {
            imageValue = imageKey;
        } else {
            const temp = this.game.loaderList.get(imageKey);
            if (temp == undefined) {
                throw new Error("can't find image");
            } else {
                imageValue = temp;
            }
        }
        return imageValue;
    }

    addPhysicalSprite(
        imageKey: string,
        x = 0,
        y = 0,
        bodyConfig: Matter.IChamferableBodyDefinition = {
            restitution: 0.8,
        },
    ): PhysicalSprite {
        const image = Texture.from(this.imageKeyValue(imageKey));

        const imageBody = Matter.Bodies.rectangle(x, y, image.width, image.height, bodyConfig);
        Matter.Composite.add(this.game.world.engine.world, imageBody);

        const imageSprite = new Sprite(image);
        imageSprite.anchor.set(0.5, 0.5);
        if (this.container != null) {
            this.container?.addChild(imageSprite);
        } else {
            console.log("container is null");
        }

        const physicsSprite = new PhysicalSprite(imageBody, imageSprite, this.game.world.engine);

        this.sceneObject.push(physicsSprite);

        return physicsSprite;
    }

    addPhysicalRect(
        color: number,
        x: number,
        y: number,
        width: number,
        height: number,
        bodyConfig: Matter.IChamferableBodyDefinition = {
            restitution: 0.8,
        },
    ): PhysicalSprite {
        const rectangle = Sprite.from(Texture.WHITE);
        rectangle.width = width;
        rectangle.height = height;
        rectangle.tint = color;
        if (this.container != null) {
            this.container?.addChild(rectangle);
        } else {
            console.log("container is null");
        }

        const body = Matter.Bodies.rectangle(x, y, width, height, bodyConfig);
        Matter.Composite.add(this.game.world.engine.world, body);

        const physicsRect = new PhysicalSprite(body, rectangle, this.game.world.engine);

        this.sceneObject.push(physicsRect);

        return physicsRect;
    }

    addImageSprite(imageKey: string, x = 0, y = 0): Sprite {
        const image = Texture.from(this.imageKeyValue(imageKey));

        const imageSprite = new Sprite(image);
        imageSprite.anchor.set(0.5, 0.5);
        imageSprite.x = x;
        imageSprite.y = y;

        this.container?.addChild(imageSprite);

        return imageSprite;
    }

    addButton(imageKey: string, x = 0, y = 0): Sprite {
        const imageSprite = this.addImageSprite(imageKey, x, y);
        imageSprite.interactive = true;
        imageSprite.buttonMode = true;
        return imageSprite;
    }

    addText(text: string, x = 0, y = 0, textStyle: TextStyle = new TextStyle({})): Text {
        const baseText = new Text(text, textStyle);
        baseText.anchor.set(0.5, 0.5);
        baseText.x = x;
        baseText.y = y;

        this.container?.addChild(baseText);
        return baseText;
    }
}

class SceneManager {
    private static _instance: SceneManager;
    scenes: Map<string, Scene>;
    nowScene: string;
    constructor() {
        this.scenes = new Map<string, Scene>();
        this.nowScene = "";
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new SceneManager();
        } else {
            console.log("scene manager has created");
        }
        return this._instance;
    }

    getNowScene(): Scene | undefined {
        return this.scenes.get(this.nowScene);
    }

    runNowScene(): void {
        const nfScene = this.getNowScene();
        if (nfScene != undefined) {
            nfScene.start();
        }
    }

    addScene(scene: Scene) {
        this.scenes.set(scene.name, scene);
    }

    removeScene(name: string) {
        const findScene = this.scenes.get(name);
        if (findScene != undefined) {
            findScene.stop();
            this.scenes.delete(name);
        }
    }

    runScene(name: string) {
        const findScene = this.scenes.get(name);
        if (findScene != undefined) {
            this.nowScene = findScene.name;
            const nfScene = this.getNowScene();
            if (nfScene != undefined) {
                nfScene.start();
            }
        }
    }

    runNextScene(name: string) {
        const nextScene = this.scenes.get(name);
        const nfScene = this.getNowScene();
        if (nextScene != undefined && nfScene != undefined) {
            nfScene.stop();
            this.nowScene = nextScene.name;
            nextScene.start();
        }
    }
}

export { Scene, SceneManager };
