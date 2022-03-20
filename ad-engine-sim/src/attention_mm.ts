import _, { orderBy, sortBy } from "lodash"
import { Protocol } from "./protocol"
import { Publication } from "./types"
import { EventEmitter } from 'events'
import { EVMEnvironment, SmartContract } from "./helpers"

interface FeedActivityFactorMessage {
    signature?: string
    computedAt: number
    feedActivityFactor: number
}

interface AttentionMarketMakerBidData {
    feedId: FeedId
    publication: Publication
    bid: number
    from: EthAddress
    expiry: number
}

interface BidRound {
    expires: number
    bids: AttentionMarketMakerBidData[]
}

type FeedId = string
type EthAddress = string

export class AttentionMarketMaker extends SmartContract {
    protocol: Protocol
    feedActivityFactor: Record<FeedId, FeedActivityFactorMessage> = {}
    bids: Record<FeedId, Record<number, BidRound>> = {}
    events = new EventEmitter()
    roundLength = 10
    roundLengthLastUpdated = 0

    constructor(env: EVMEnvironment, protocol: Protocol) {
        super(env)
        this.protocol = protocol
    }

    bid(bid: AttentionMarketMakerBidData) {
        const currentRound = this.getCurrentRound()
        let round = _.get(this.bids, [bid.feedId, currentRound], null)
        if(!round) {
            round = {
                expires: this.env.time + this.roundLength,
                bids: []
            }
            this.events.emit('RoundCreated', { feedId: bid.feedId, round })
        }

        if (this.env.time < round.expires) throw new Error("Round is closed.");
        
        // Effect: transfer funds from msg.sender.

        // 1. Insert bid into bids array.
        // 2. Sort bids by amount desc.
        // 3. Ensure bid array in memory doesn't exceed `numSlots`.
        let sortedBids = orderBy(
            [...round.bids, bid],
            ['amount'],
            'desc'
        )
        const numSlots = this.getMaxAttentionSlotsForFeed(bid.feedId)
        sortedBids = sortedBids.slice(0, numSlots)

        round.bids = sortedBids

        this.events.emit('Bid', { feedId: bid.feedId, roundId: currentRound, bid })
    }

    getCurrentRound(): number {
        return (this.env.time - this.roundLengthLastUpdated) / this.roundLength
    }

    fillAndUpdate(feedActivityFactorMessage: FeedActivityFactorMessage, feedId: FeedId, roundId: number) {
        // Verify round has ended.
        const round = this.bids[feedId][roundId]
        if(round.expires < this.env.time) throw new Error("Round still open.");

        // Fill bids for most recent round.
        const bids = round.bids
        const maxAttentionSlots = this.getMaxAttentionSlotsForFeed(feedId)
        
        if (maxAttentionSlots > 0 && bids.length) {
            // Get highest priced bids first.
            const sortedBids = orderBy(bids, ['amount'], 'desc')
            for(let i = 0; i < bids.length && i < maxAttentionSlots; i++) {
                const bid = sortedBids[i]
                // Effect: transfer bid funds, fill bid.
                this.events.emit('Fill', { feedId, roundId, bid })
            }
        }

        // Begin next round.
        this.events.emit('RoundClosed', { feedId, roundId })
        this.feedActivityFactor[feedId] = feedActivityFactorMessage
    }

    // Compute the number of slots we are selling in a feed for its current auction round.
    // The slots is derived from the invariant mentioned in the Gliss whitepaper.
    //   num(ads) + num(posts) = num(posts) * [1 + r]
    // This ensures the feed is at most r% composed of ads.
    getMaxAttentionSlotsForFeed(feedId: string): number {
        const numPosts = this.feedActivityFactor[feedId].feedActivityFactor
        let maxAttentionSlots = numPosts * (1 + this.protocol.riskFactor) - numPosts
        return maxAttentionSlots
    }
}
