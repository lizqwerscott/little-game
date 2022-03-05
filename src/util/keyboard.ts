class Key {
    value: string;
    isDown: boolean;
    isUp: boolean;
    downHandler: any;
    upHandler: any;
    press: any;
    release: any;
    unsubscribe: any;
    constructor(_value: string) {
        this.value = _value;
        this.isDown = false;
        this.isUp = true;
    }
}

class KeyboardManager {
    keyBoard(value: string) {
        const key = new Key(value);
        key.downHandler = (ev: KeyboardEvent) => {
            if (ev.key === key.value) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
                ev.preventDefault();
            }
        };

        key.upHandler = (ev: KeyboardEvent) => {
            if (ev.key === key.value) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
                ev.preventDefault();
            }
        };

        const downListener = key.downHandler.bind(key);
        const upListener = key.upHandler.bind(key);

        window.addEventListener("keydown", downListener, false);
        window.addEventListener("keyup", upListener, false);

        key.unsubscribe = () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        };
        return key;
    }
}

const keyboardManager = new KeyboardManager();

export default keyboardManager;
