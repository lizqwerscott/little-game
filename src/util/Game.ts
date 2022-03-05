import { PhysicalWorld, PhysicalSprite } from "./Physical";
import Matter from "matter-js";
import { Application, Loader, Texture, AnimatedSprite, Text, TextStyle, Sprite } from "pixi.js";
import { SceneManager, Scene } from "./Scene";

class Game {
    world: PhysicalWorld;
    app: Application;
    gameWidth: number;
    gameHeight: number;
    gameRatio: number;
    runner: Matter.Runner;

    loaderList: Map<string, string>;

    sceneManager: SceneManager;

    constructor(width: number, height: number, scene: string) {
        this.world = new PhysicalWorld(width, height);
        this.app = new Application({
            width: width,
            height: height,
        });
        this.gameWidth = width;
        this.gameHeight = height;
        this.gameRatio = width / height;
        this.runner = Matter.Runner.create();

        this.sceneManager = new SceneManager(scene);

        this.loaderList = new Map<string, string>();
    }

    resizeCanvas(): void {
        const resize = () => {
            const canvas = document.querySelector("canvas");
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const windowRatio = windowWidth / windowHeight;

            if (canvas != null) {
                if (windowRatio < this.gameRatio) {
                    canvas.style.width = windowWidth + "px";
                    canvas.style.height = windowWidth / this.gameRatio + "px";
                } else {
                    canvas.style.width = windowHeight * this.gameRatio + "px";
                    canvas.style.height = windowHeight + "px";
                }
            }
        };

        resize();

        window.addEventListener("resize", resize);
    }

    run(): void {
        window.onload = async (): Promise<void> => {
            this.preload();
            await this.preloadAssets();
            console.log("load finish");
            this.resizeCanvas();
            document.body.appendChild(this.app.view);
            this.sceneManager.runNowScene();
            Matter.Runner.run(this.runner, this.world.engine);
        };
    }

    async preloadAssets(): Promise<void> {
        return new Promise((res, rej) => {
            const loader = Loader.shared;
            this.loaderList.forEach((value) => {
                loader.add(value);
            });

            loader.onComplete.once(() => {
                res();
            });

            loader.onComplete.once(() => {
                rej();
            });

            loader.load();
        });
    }

    loaderAdd(key: string, url: string): void {
        this.loaderList.set(key, url.substring(2));
    }

    preload(): void {
        console.log("preload");
    }
}

export default Game;
