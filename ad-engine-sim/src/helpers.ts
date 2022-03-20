// Find the first element after `x` in the list of `vals`.
export function findInInterval(vals: any[], x: any): any {
    if (vals.length == 0) throw new Error("not found")

    let guess = 0

    while (true) {
        if (vals.length == guess) return vals[vals.length - 1]
        let val = vals[guess]
        if (x <= val) return val
        guess++
    }

    return vals[guess]
}

export class EVMEnvironment {
    time: number = 0

    constructor() {}
}

export class SmartContract {
    env: EVMEnvironment

    constructor(env: EVMEnvironment) {
        this.env = env
    }

    block() {
        return {
            timestamp: this.env.time
        }
    }
}
