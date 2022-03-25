import _, { orderBy } from "lodash"
import { IActor } from "./simulation/actor"
import { Bid, FeedActivityFactorMessage } from "./attention_mm"
import { findInInterval } from "./helpers"
import { Indexer, PromotedPublication } from "./indexer"
import { Protocol } from "./protocol"
import { Publication } from "./types"

interface MixedFeedPublication extends Publication {
    bid?: Bid
}

const toMixedFeedPub = (pub: PromotedPublication): MixedFeedPublication => {
    return {
        ...pub.pub,
        bid: pub.bid
    }
}

export class FeedEngine implements IActor {
    avgRatePerInterval: Record<number, number> = {}
    avgRateSeries: any[] = []

    recomputeFeedActivitySettings = {
        frequency: 60,
        // Size of interval to compute feed activity factor.
        period: 8*60*60
    }

    constructor(public protocol: Protocol, public indexer: Indexer) {
    }

    step(t: number): void {
        if (t % this.recomputeFeedActivitySettings.frequency == 0) {
            const feedId = ''
            this.recomputeFeedActivityFactor(feedId, t)
        }
    }

    recomputeFeedActivityFactor(feedId: string, currentTime: number) {
        // n(t) - total number of posts at t
        // 
        const intervalSize = this.recomputeFeedActivitySettings.period
        let startTime = currentTime - intervalSize
        // let t = 
        //     [...Array(intervalSize).keys()] // [0, 1, ..., intervalSize]
        //     .map(x => x + currentTime - intervalSize + 1) // [-5, -4, -3, -2, -1] for currentTime = 0
        let t = [currentTime - intervalSize + 1]
        let n = []

        // Find the index of first post in the interval of `t`.
        // TODO: binary search start of posts array
        // this is just dumb O(n) search

        // iterate array backwards.
        // worst case O(N)
        const pubs = this.indexer.getFollowerPubs()

        // Reverse chronological array of posts in this interval.
        let postsInInterval: Publication[] = []
        if (pubs.length) {
            for (let i = pubs.length - 1; i > -1; i--) {
                let post = pubs[i]
                if (post.ts >= t[0]) postsInInterval.push(post)
                else { break; }
            }
        }

        // Generate num posts for each timestep.
        let total = 0
        total = postsInInterval.length;

        // Now calculate the rate of posts per timestep.
        // console.log('Recomputing feed rate')
        // console.log(`${total} posts in ${intervalSize}`)
        const avg = total / intervalSize
        this.avgRatePerInterval[currentTime] = avg
    }

    getFeedActivityFactor(followingFeedId: string, time: number) {
        let timesteps = Object.keys(this.avgRatePerInterval)
        const rate = this.avgRatePerInterval[findInInterval(timesteps, time)]
        return rate
    }

    getSignedFeedActivityFactorMessage(feedId: string, time: number): FeedActivityFactorMessage {
        const data = {
            signature: "",
            computedAt: time,
            feedActivityFactor: this.getFeedActivityFactor(feedId, time)
        }
        // Compute signature in production.
        // data.signature = ...
        return data
    }

    getAttentionFeed(profileId: string, since: number): MixedFeedPublication[] {
        const pubs = this.indexer.getPromotedPubs()
        return _.filter(pubs, pub => pub.pub.ts >= since).map(toMixedFeedPub)
    }

    getFollowFeed(profileId: string, since: number): MixedFeedPublication[] {
        // Get the followers of a user.
        // For this simulation, there is only one feed.
        const pubs = this.indexer.getFollowerPubs()
        return _.filter(pubs, pub => pub.ts >= since)
    }

    getFeed(profileId: string, since: number): MixedFeedPublication[] {
        const attentionFeed = this.getAttentionFeed(profileId, since)
        const followFeed = this.getFollowFeed(profileId, since)
        const feed = orderBy(
            [...attentionFeed, ...followFeed],
            ['ts'],
            'desc'
        )
        return feed
    }
}