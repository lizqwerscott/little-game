import { Application, Loader, Texture, AnimatedSprite, Text, TextStyle } from "pixi.js";
import KeyboardManager from "./util/keyboard";
//import "./style.css";

const gameWidth = 900;
const gameHeight = 1600;
const gameRatio = gameWidth / gameHeight;

const nowWindow = new Text(
    "1",
    new TextStyle({
        fontSize: 20,
        fill: ["#ffffff"],
    }),
);

const app = new Application({
    width: gameWidth,
    height: gameHeight,
});

window.onload = async (): Promise<void> => {
    await loadGameAssets();
    document.body.appendChild(app.view);

    updateWindowWH();

    resizeCanvas();

    const birdFromSprite = getBird();
    birdFromSprite.anchor.set(0.5, 0.5);
    birdFromSprite.position.set(0, 0);
    //birdFromSprite.position.set(gameWidth / 2, gameHeight / 2);
    //
    //
    const dudeFromSprite = getDude();
    //dudeFromSprite.anchor.set(dudeFromSprite.width / 2, dudeFromSprite.height / 2);
    dudeFromSprite.position.set(gameWidth / 2, gameHeight / 2);
    //dudeFromSprite.loop = true;
    dudeFromSprite.animationSpeed = 0.1;
    //dudeFromSprite.play();

    nowWindow.x = 100;
    nowWindow.y = 100;

    const left = KeyboardManager.keyBoard("ArrowLeft");
    const right = KeyboardManager.keyBoard("ArrowRight");

    left.press = () => {
        dudeFromSprite.x += -5;
    };
    right.press = () => {
        dudeFromSprite.x += 5;
    };

    app.stage.addChild(birdFromSprite);
    app.stage.addChild(dudeFromSprite);
    app.stage.addChild(nowWindow);
    app.stage.interactive = true;

    app.ticker.add((delta) => gameLoop(delta));
};

function gameLoop(delta: number) {
    console.log("delta" + delta);
}

async function loadGameAssets(): Promise<void> {
    return new Promise((res, rej) => {
        const loader = Loader.shared;
        loader.add("start", "./assets/start.png");
        loader.add("restart", "./assets/restart.png");
        loader.add("sky", "./assets/sky.png");
        loader.add("rabbit", "./assets/simpleSpriteSheet.json");
        loader.add("dude", "./assets/dude/dudu.json");

        loader.onComplete.once(() => {
            res();
        });

        loader.onError.once(() => {
            rej();
        });

        loader.load();
    });
}

function updateWindowWH(str = "") {
    nowWindow.text = "width:" + window.innerWidth + " height: " + window.innerHeight + " use: " + str;
}

function isPC() {
    const userAgentInfo = navigator.userAgent;
    const Agents = ["Android", "iPhone", "SymbianOS", "Window Phone", "iPod", "iPad"];

    let flag = true;
    for (let i = 0; i < Agents.length; i++) {
        if (userAgentInfo.indexOf(Agents[i]) != -1) {
            flag = false;
            break;
        }
    }
    return flag;
}

function resizeCanvas(): void {
    const resize = () => {
        const canvas = document.querySelector("canvas");
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowRatio = windowWidth / windowHeight;

        if (canvas != null) {
            if (windowRatio < gameRatio) {
                canvas.style.width = windowWidth + "px";
                canvas.style.height = windowWidth / gameRatio + "px";
            } else {
                canvas.style.width = windowHeight * gameRatio + "px";
                canvas.style.height = windowHeight + "px";
            }
        }
        updateWindowWH();
    };

    resize();

    window.addEventListener("resize", resize);
}

function getBird(): AnimatedSprite {
    const bird = new AnimatedSprite([
        Texture.from("birdUp.png"),
        Texture.from("birdMiddle.png"),
        Texture.from("birdDown.png"),
    ]);

    bird.loop = true;
    bird.animationSpeed = 0.1;
    bird.play();
    bird.scale.set(3);

    return bird;
}

function getDude(): AnimatedSprite {
    const dude = new AnimatedSprite([
        Texture.from("down.png"),
        Texture.from("left_1.png"),
        Texture.from("left_2.png"),
        Texture.from("left_3.png"),
        Texture.from("left_4.png"),
        Texture.from("right_1.png"),
        Texture.from("right_2png"),
        Texture.from("right_3.png"),
        Texture.from("right_4.png"),
    ]);

    return dude;
}
