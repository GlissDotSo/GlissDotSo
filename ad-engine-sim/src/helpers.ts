import _ from "lodash"

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
    address: string

    constructor(env: EVMEnvironment, address: string) {
        this.env = env
        // Allow smart contract to set its own address.
        // This is useful for human labels.
        this.address = address
    }

    block() {
        return {
            timestamp: this.env.time
        }
    }
}

export class Counter {
    store: any = {}

    constructor(public defaultValue: any) {
    }

    get(path) {
        return _.get(this.store, path, this.defaultValue)
    }

    set(path, value) {
        return _.set(this.store, path, value)
    }

    inc(path, value) {
        const counter = _.get(this.store, path, this.defaultValue)
        _.set(this.store, path, counter + value)
    }

    toEntries(): [string, any][] {
        return Object.entries(this.store)
    }
}

export const formatPercent = (x: number) => `${Math.floor(x * 100)}%`