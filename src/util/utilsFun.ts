function isPC() {
    const userAgentInfo = navigator.userAgent;
    const Agents = ["Android", "iPhone", "SymbianOS", "Window Phone", "iPad", "iPod"];

    let flag = true;
    for (let i = 0; i < Agents.length; i++) {
        if (userAgentInfo.indexOf(Agents[i]) != -1) {
            flag = false;
            break;
        }
    }
    return flag;
}

function randomNumber(count = 1, min = 1, max = 10, scope = 2) {
    const numArray: number[] = new Array<number>();
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
export { isPC, randomNumber };
