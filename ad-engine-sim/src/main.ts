import { Protocol } from './protocol'
import { AdEngine } from './ad_engine';
import { Indexer } from './indexer';
import { sample } from 'lodash';
import { AttentionMarketMaker } from './attention_mm';

class Simulation {
    // One time step is a second in our model.
    // Length of simulation is 4hrs.

    // Total timesteps for simulation.
    totalTimesteps = 4 * 60 * 60;

    constructor() {}

    run() {
        // Setup bindings.
        protocol.events.on('PubCreated', (pub) => {
            const feedId = '' // TODO
            indexer.onPub(feedId, pub)
            adEngine.onPub(feedId, pub)
        })

        // 
        // Generate data.
        // 

        const PROB_CREATE_POST_PER_TIMESTEP = 0.4
        const CREATE_POST_COUNT = 5

        let mockUsers: string[] = []
        const NUM_MOCK_USERS = 25
        for(let i = 0; i < NUM_MOCK_USERS; i++) {
            mockUsers.push(`user_${i}`)
        }

        // Generate posts.
        // handlePostCreated({ ts: 0 })
        for (let i = 0; i < this.totalTimesteps; i++) {
            for (let j = 0; j < CREATE_POST_COUNT; j++) {
                if (Math.random() < PROB_CREATE_POST_PER_TIMESTEP) {
                    const pub = {
                        ts: i,
                        profileId: sample(mockUsers) as string
                    }
                    protocol.createPub(pub)
                }
            }
        }

        // attentionMarketMaker.bid(bid)


        /*
        
Create 25 profiles
For each profile, create some posts
Over a period of 24hrs.
Now post some ads
Render the feed
@username @time @isPromoted
Verify invariant holds

        */


        // console.log(posts)
        // console.log(avgRatePerInterval)

        // let allAvgs = {}
        // let keys = Object.keys(avgRatePerInterval)
        // for (let i = 0; i < this.totalTimesteps; i++) {
        //     allAvgs[i] = avgRatePerInterval[findInInterval(keys, i)]
        // }

        // console.log(allAvgs)


        // Now calculate the price to advertise for any period.

        // for (let i = 0; i < this.totalTimesteps; i++) {
        //     // Invariant:
        //     // num(ads) + num(posts) = num(posts) * [1 + r]
        //     const avgPostsPerInterval = allAvgs[i]
        //     const numPosts = avgPostsPerInterval
        //     let maxNumAds = numPosts * (1 + RISK_FACTOR) - numPosts

        //     console.log(numPosts, maxNumAds)
        // }

    }
}

let protocol = new Protocol()
let indexer = new Indexer()
let adEngine = new AdEngine(indexer)
let attentionMarketMaker = new AttentionMarketMaker(protocol)
let simulation = new Simulation()

function main() {
    simulation.run()
}

main()