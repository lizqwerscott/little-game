import Game from "./util/Game";
import KeyboardManager from "./util/keyboard";
import { SceneManager } from "./util/Scene";

import StartScene from "./scene/StartScene";
import MainScene from "./scene/MainScene";
import FinishScene from "./scene/FinishScene";

import "./style.css";

const scenes = ["StartScene", "MainScene", "FinishScene"];

class MyGame extends Game {
    constructor() {
        super(900, 1600, scenes);
    }

    preload(): void {
        this.loaderAdd("ground", "../assets/stonePlatform.png");
        this.loaderAdd("sky", "../assets/sky.png");
        this.loaderAdd("dude", "../assets/dude/dudu.json");
        this.loaderAdd("star", "../assets/star.png");

        //UI
        this.loaderAdd("start", "../assets/start.png");
        this.loaderAdd("restart", "../assets/restart.png");
        this.loaderAdd("left", "../assets/left.png");
        this.loaderAdd("right", "../assets/right.png");
        this.loaderAdd("up", "../assets/up.png");

        this.loaderAdd("lighting", "../assets/lighting.png");
    }
}

const game = new MyGame();
SceneManager.getInstance().addScene(new StartScene(game));
SceneManager.getInstance().addScene(new MainScene(game));
SceneManager.getInstance().addScene(new FinishScene(game));

game.run();
