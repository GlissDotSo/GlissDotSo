import chalk from 'chalk';
import { InfluenceBuyer } from '../actors/influence_buyer';
import { Poster } from '../actors/poster';
import { EVMEnvironment, formatPercent } from '../helpers';
import { IActor } from '../simulation/actor';
import { attentionMarketMaker, feedEngine, NUM_MOCK_USERS, protocol, simulation } from '../simulation/setup';
import { writeFileSync } from 'fs';
import { join } from 'path';
import _ from 'lodash';
import { Counter } from '../helpers'

const DEBUG = process.env.DEBUG
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

        // Data instrumentation.
        let postsAtTime = new Counter(0)
        protocol.events.on('PubCreated', () => {
            postsAtTime.inc([this.time], 1)
        })

        attentionMarketMaker.events.on('RoundCreated', args => {
            const { feedId, roundId, numSlots } = args
            if(DEBUG) console.log(`RoundCreated round=${roundId} numSlots=${numSlots}`)
        })

        // Run simulation.
        for (let i = 0; i < this.totalTimesteps; i++) {
            this.step()
        }

        // Render the feed for the past 60mins.
        // const feed = feedEngine.getFeed("", this.time - 60 * 60)
        const feed = feedEngine.getFeed("", 0)

        // Output feed.
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

        let feedActivityData: any[] = []
        let cumulativePostsData: any[] = []
        for(let i = 0; i < this.totalTimesteps; i += 15) {
            const feedId = ""
            const faf = feedEngine.getFeedActivityFactor(feedId, i)
            feedActivityData.push([i, faf])
        }

        let posts = 0
        let ads = 0
        for (let post of feed) {
            if(post.bid) ads++
            else posts++
        }
        const totalPosts = feed.length
        console.log(`follower posts: ${posts} (${formatPercent(posts / totalPosts)})`)
        console.log(`promoter posts: ${ads} (${formatPercent(ads / totalPosts)})`)
        console.log(`   total posts: ${totalPosts}`)
        console.log(``)
        console.log(`feed invariant results (% ads)`)
        console.log(`  target = ${formatPercent(protocol.riskFactor)}`)
        console.log(`observed = ${formatPercent(ads / posts)}`)



        for(let i = 0; i < this.totalTimesteps; i++) {
            let cumulativePosts = 0
            if (i === 0) {
                cumulativePosts += postsAtTime.get([i])
            } else {
                cumulativePosts += cumulativePostsData[i - 1][1] + postsAtTime.get([i])
            }
            cumulativePostsData.push([i, cumulativePosts])
        }
        
        const writeDataLog = (data: any[], file: string) => {
            const content: string = data.map(data => data.join(' ')).join('\n')
            const path = join(__dirname, `../../plotting/data/${file}`)
            writeFileSync(
                path,
                content,
                'utf-8'
            )
        }

        writeDataLog(feedActivityData, 'feedActivityData.txt')
        writeDataLog(postsAtTime.toEntries(), 'postsAtTime.txt')
        writeDataLog(cumulativePostsData, 'cumulativePosts.txt')
    }

    step() {
        if (DEBUG) console.log(this.time)

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