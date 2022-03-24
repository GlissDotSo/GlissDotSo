import _, { sample } from "lodash"
import { Simulation } from "../simulation/simulation"
import { BaseActor } from "../simulation/actor"
import { mockUsers, protocol } from "../simulation/setup"
import { readFileSync } from "fs";
import { join } from "path";

function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
}

export class Poster extends BaseActor {
    state = 0
    // posts: Record<number, any[]> = {}
    data: any

    targetRate = 175
    targetRatePer = 60 * 60 * 2

    constructor(sim: Simulation) {
        super(sim)

        const brownianProcessData = readFileSync(join(__dirname, `../../plotting/out/brownian.txt`)).toString().split(' ').map(parseFloat)
        if (brownianProcessData.length != sim.totalTimesteps) {
            throw new Error(`Brownian process needs to have same number of data points as there are timesteps (${brownianProcessData.length} != ${sim.totalTimesteps}). Regenerate it in the Jupyter notebook, in plotting/Main.ipynb.`)
        }
        this.data = brownianProcessData
    }

    // Make posts.
    step(t: number): void {
        // if (t % this.targetRatePer === 0) {
        //     // Generate a set of posts for the next hour.
        //     this.posts = {}

        //     // Generate `targetRatePerHour` of posts, with
        //     // post times sampled from within the hour.
        //     // const jitter = 0.8 * this.targetRate
        //     // const rate = this.targetRate + _.random(-jitter, jitter)

        //     // Generates a nice wave between (0,1)
        //     const rate = (1 + (Math.cos(t))) / 2

        //     const nSamples = Math.floor(rate * this.targetRate / this.targetRatePer)
        //     const samples = [...Array(nSamples).keys()].map(t => randn_bm())

        //     for (let x of samples) {
        //         const ts = Math.floor(t + x * this.targetRatePer)

        //         const pub = {
        //             ts: ts,
        //             profileId: sample(mockUsers) as string
        //         }

        //         _.set(
        //             this.posts,
        //             ts,
        //             [..._.get(this.posts, ts, []), pub]
        //         )
        //     }
        // }

        // // Generate posts.
        // for (let pub of _.get(this.posts, [t], [])) {
        //     protocol.createPub(pub)
        // }
        const scale = 10

        for (let i = 0; i < this.data[t]; i++) {
            const pub = {
                ts: t,
                profileId: sample(mockUsers) as string
            }
            protocol.createPub(pub)
        }
    }
}