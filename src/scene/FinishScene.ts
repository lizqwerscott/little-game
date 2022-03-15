import { isMobile, TextStyle } from "pixi.js";

import { Scene, SceneManager } from "../util/Scene";
import Game from "../util/Game";
import GameConfig from "../GameConfig";
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
        this.addText("Score: " + GameConfig.score, gameWidth / 2, gameHeight / 4 + 100, textStyle);
        const restart = this.addButton("restart", gameWidth / 2, gameHeight / 2);
        restart.on("pointerdown", () => {
            SceneManager.getInstance().runNextScene("MainScene");
        });
    }
}

export default FinishScene;
