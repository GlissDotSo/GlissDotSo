import _, { sample } from "lodash"
import { Simulation } from "../simulation/simulation"
import { BaseActor } from "../simulation/actor"
import { mockUsers, protocol } from "../simulation/setup"

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
    posts: Record<number, any[]> = {}

    targetRate = 175
    targetRatePer = 60 * 60 * 2

    constructor(sim: Simulation) {
        super(sim)
    }

    // Make posts.
    step(t: number): void {
        if (t % this.targetRatePer === 0) {
            // Generate a set of posts for the next hour.
            this.posts = {}

            // Generate `targetRatePerHour` of posts, with
            // post times sampled from within the hour.
            // const jitter = 0.8 * this.targetRate
            // const rate = this.targetRate + _.random(-jitter, jitter)

            // Generates a nice wave between (0,1)
            const rate = (1 + (Math.cos(t))) / 2
            // console.log('rate', rate)
            // const sample = x => (1 + (Math.cos(x))) / 2

            // Model posting as a probability distribution,
            // where we do n independent trials corresponding to n timepoints,
            // where the probability of making a post P, is 1/n
            const prob = this.targetRate / this.targetRatePer
            const samples = [...Array(this.targetRatePer).keys()].map(t => randn_bm())

            // console.log([...Array(this.targetRatePer).keys()].map(t => stdNormalDistribution(Math.random())).toString() )
            // const distribution = stats.binomialCumulativeDistribution(this.targetRate, 1 / this.targetRatePer)
            // console.log('dist', distribution.toString())
            const distribution = []

            // for (let i = 0; i < rate; i++) {
            for (let x of samples) {
                // for (let i = 0; i < this.targetRatePer; i++) {
                // const n1 = sample(t)
                // const n2 = sample(t+1)

                // const ts = t + _.random(0, this.targetRatePer)
                const ts = Math.floor(t + x * this.targetRatePer)

                const pub = {
                    ts: ts,
                    profileId: sample(mockUsers) as string
                }

                _.set(
                    this.posts,
                    ts,
                    [..._.get(this.posts, ts, []), pub]
                )
            }
        }

        // Generate posts.
        for (let pub of _.get(this.posts, [t], [])) {
            // const pub = {
            //     ts: t,
            //     profileId: sample(mockUsers) as string
            // }
            protocol.createPub(pub)
        }
    }
}