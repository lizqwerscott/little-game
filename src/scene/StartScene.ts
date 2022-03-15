import { Scene, SceneManager } from "../util/Scene";
import Game from "../util/Game";
import { TextStyle } from "pixi.js";
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
                SceneManager.getInstance().runNextScene("MainScene");
            });
        }
    }
}

export default StartScene;
