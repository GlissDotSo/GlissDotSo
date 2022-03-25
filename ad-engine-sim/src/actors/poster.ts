import _, { sample } from "lodash"
import { Simulation } from "../simulation/simulation"
import { BaseActor } from "../simulation/actor"
import { mockUsers, protocol } from "../simulation/setup"
import { readFileSync } from "fs";
import { join } from "path";

export class Poster extends BaseActor {
    state = 0
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
        // TODO: magic constant.
        const scale = 2.

        for (let i = 0; i < (this.data[t] / scale); i++) {
            const pub = {
                ts: t,
                profileId: sample(mockUsers) as string
            }
            protocol.createPub(pub)
        }
    }
}