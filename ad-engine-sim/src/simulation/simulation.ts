import chalk from 'chalk';
import { InfluenceBuyer } from '../actors/influence_buyer';
import { Poster } from '../actors/poster';
import { EVMEnvironment } from '../helpers';
import { IActor } from '../simulation/actor';
import { feedEngine, NUM_MOCK_USERS, simulation } from '../simulation/setup';

export class Simulation {
    // One time step is a second in our model.
    // Length of simulation is 4hrs.

    // Total timesteps for simulation.
    totalTimesteps = 36 * 60 * 60;
    time: number;

    // EVM environment which we keep in sync with Simulation time.
    evm: EVMEnvironment

    // Actor processes to run during simulation.
    actors: IActor[];

    constructor(evm: EVMEnvironment) {
        this.evm = evm
        this.time = 0
        this.actors = []
    }

    run() {
        // Setup actors.
        const poster = new Poster(this)
        this.actors = [
            poster,
            feedEngine,
            new InfluenceBuyer(this)
        ]

        // Run simulation.
        for (let i = 0; i < this.totalTimesteps; i++) {
            this.step()
        }

        // Render the feed for the past 60mins.
        const feed = feedEngine.getFeed("", this.time - 60 * 60)
        const PROMOTED = '[promoted]'
        feed.map(item => {
            let str = [
                chalk.gray(item.ts),
                chalk.yellow(
                    // Pad profile string for alignment.
                    item.profileId.padStart(Math.log10(NUM_MOCK_USERS))
                )
            ]
            if (item.bid) str.push(PROMOTED)
            console.log(str.join(' '))
        })

        /**
         * Create 25 profiles
         * For each profile, create some posts
         * Over a period of 24hrs.
         * Now post some ads
         * Render the feed
         * @username @time @isPromoted
         * Verify invariant holds
         */
    }

    step() {
        if (process.env.DEBUG) console.log(this.time)

        // Sync EVM with clock time with delay (to mimic the chain).
        if (this.time % 5 === 0) {
            this.evm.time = this.time;
        }

        // Run actors.
        for (const actor of this.actors) {
            actor.step(this.time)
        }

        // Pass time.
        this.time++
    }
}