import { findInInterval } from "./helpers"
import { Indexer } from "./indexer"
import { Publication } from "./types"

export class AdEngine {
    // Size of interval to compute feed activity factor.
    intervalSize = 60 * 60
    avgRatePerInterval: Record<number, number> = {}
    avgRateSeries: any[] = []
    indexer: Indexer

    constructor(indexer: Indexer) {
        this.indexer = indexer
    }

    onPub(feedId: string, newPub: Publication) {
        this.recomputeFeedActivityFactor(feedId, newPub)
    }

    recomputeFeedActivityFactor(feedId: string, newPub: Publication) {
        // n(t) - total number of posts at t
        // 
        let currentTime = newPub.ts
        let startTime = currentTime - this.intervalSize
        // let t = 
        //     [...Array(intervalSize).keys()] // [0, 1, ..., intervalSize]
        //     .map(x => x + currentTime - intervalSize + 1) // [-5, -4, -3, -2, -1] for currentTime = 0
        let t = [currentTime - this.intervalSize + 1]
        let n = []

        // Find the index of first post in the interval of `t`.
        // TODO: binary search start of posts array
        // this is just dumb O(n) search

        // iterate array backwards.
        // worst case O(N)
        const pubs = this.indexer.getPubs()

        let postsInInterval: Publication[] = []
        if (pubs.length) {
            for (let i = pubs.length - 1; i > -1; i--) {
                let post = pubs[i]
                if (post.ts >= t[0]) postsInInterval.push(post)
                else { break; }
            }
            postsInInterval.reverse() // chrono order    
        }

        // Generate num posts for each timestep.
        let total = 0
        total = postsInInterval.length;

        // Now calculate the average.
        const avg = total / this.intervalSize
        this.avgRatePerInterval[currentTime] = avg
        // this.avgRateSeries.push([ currentTime, avg ])

        // Cache the times between for the simulation.
        // let allAvgs = {}
        // let keys = Object.keys(avgRatePerInterval)
        // for (let i = 0; i < this.totalTimesteps; i++) {
        //     allAvgs[i] = avgRatePerInterval[findInInterval(keys, i)]
        // }

        // allAvgs[i] = avgRatePerInterval[findInInterval(keys, i)]
    }

    getFeedActivityFactor(followingFeedId: string, time: number) {
        let timesteps = Object.keys(this.avgRatePerInterval)
        const rate = this.avgRatePerInterval[findInInterval(timesteps, time)]
        return rate
    }
}