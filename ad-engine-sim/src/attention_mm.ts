import _, { orderBy, sortBy } from "lodash"
import { Protocol } from "./protocol"
import { Publication } from "./types"
import { EventEmitter } from 'events'
import { EVMEnvironment, SmartContract } from "./helpers"
import { AttentionToken } from "./attention_token"

export interface FeedActivityFactorMessage {
    signature?: string
    computedAt: number
    feedActivityFactor: number
}

export interface AttentionMarketMakerBidData {
    feedId: FeedId
    pubId: number
    amount: number
    from: EthAddress
    expiry: number
}

export interface Bid {
    feedId: FeedId
    pubId: number
    amount: number
    from: EthAddress
    expiry: number
}

interface BidRound {
    expires: number
    bids: Bid[]
}

export interface FillEvent {
    feedId: string
    roundId: number
    bid: Bid
}

type FeedId = string
type EthAddress = string

export class AttentionMarketMaker extends SmartContract {
    protocol: Protocol
    attention: AttentionToken
    feedActivityFactor: Record<FeedId, FeedActivityFactorMessage> = {}
    bids: Record<FeedId, Record<number, BidRound>> = {}
    events = new EventEmitter()
    roundLength = 15
    roundLengthLastUpdated = 0
    cumulativeRounds = 0

    constructor(env: EVMEnvironment, protocol: Protocol, attention: AttentionToken) {
        super(env, "AttentionMarketMaker")
        this.protocol = protocol
        this.attention = attention
    }

    bid(bid: AttentionMarketMakerBidData): number {
        const currentRound = this.getCurrentRound()
        let round = _.get(this.bids, [bid.feedId, currentRound], null)
        if(!round) {
            round = {
                expires: this.env.time + this.roundLength,
                bids: []
            }
            this.events.emit('RoundCreated', { feedId: bid.feedId, roundId: currentRound })
        }

        if (this.env.time > round.expires) throw new Error("Round is closed.");
        
        // Effect: transfer funds from msg.sender.
        this.attention.transfer(bid.feedId, bid.from, this.address, bid.amount)

        // 1. Insert bid into bids array.
        // 2. Sort bids by amount desc.
        let sortedBids = orderBy(
            [...round.bids, bid],
            ['amount'],
            'desc'
        )
        // 3. If the array now exceeds `maxSlots`, cancel the last bid.
        const numSlots = this.getMaxAttentionSlotsForFeed(bid.feedId)
        // console.log(numSlots)

        while(sortedBids.length > numSlots) {
            const kickedBid = sortedBids.pop() as Bid
            this.events.emit('BidCancelled', { feedId: bid.feedId, roundId: currentRound, bid })

            // Refund bid amount.
            this.attention.transfer(bid.feedId, this.address, kickedBid.from, kickedBid.amount)
        }

        // Effect: save bids.
        round.bids = sortedBids
        _.set(this.bids, [bid.feedId, currentRound], round)

        this.events.emit('Bid', { feedId: bid.feedId, roundId: currentRound, bid })

        return currentRound
    }

    bidAndUpdate(bid: Bid, update: FeedActivityFactorMessage) {
        this.updateFromOracle(bid.feedId, update)
        return this.bid(bid)
    }

    getCurrentRound(): number {
        const roundsSinceUpdate = (this.env.time - this.roundLengthLastUpdated) / this.roundLength
        return this.cumulativeRounds + roundsSinceUpdate
    }

    setRoundLength(length: number) {
        this.cumulativeRounds = this.getCurrentRound()
        this.roundLengthLastUpdated = Date.now()
        this.roundLength = length
    }

    isRoundOpen(feedId: FeedId, roundId: number) {
        const round = _.get(this.bids, [feedId, roundId], null)
        if (!round) throw new Error(`No round ${roundId}`)
        return round.expires < this.env.time
    }

    fillAndUpdate(feedActivityFactorMessage: FeedActivityFactorMessage, feedId: FeedId, roundId: number) {
        // Verify round has ended.
        const round = this.bids[feedId][roundId]
        if (round.expires < this.env.time) throw new Error("Round still open.");

        // Fill bids for most recent round.
        const bids = round.bids
        // console.log(bids)
        const maxAttentionSlots = this.getMaxAttentionSlotsForFeed(feedId)
        
        if (maxAttentionSlots > 0 && bids.length) {
            // Get highest priced bids first.
            const sortedBids = orderBy(bids, ['amount'], 'desc')
            for(let i = 0; i < bids.length && i < maxAttentionSlots; i++) {
                const bid = sortedBids[i]
                // Effect: transfer bid funds, fill bid.
                const fillEvent: FillEvent = { feedId, roundId, bid }
                this.events.emit('Fill', fillEvent)
            }
        }

        // Begin next round.
        this.events.emit('RoundClosed', { feedId, roundId })

        this.updateFromOracle(feedId, feedActivityFactorMessage)
    }

    updateFromOracle(feedId: string, feedActivityFactorMessage: FeedActivityFactorMessage) {
        // Update feed activity factor from oracle.
        this.feedActivityFactor[feedId] = feedActivityFactorMessage
    }

    // Compute the number of slots we are selling in a feed for its current auction round.
    // The slots is derived from the invariant mentioned in the Gliss whitepaper.
    //   num(ads) + num(posts) = num(posts) * [1 + r]
    // This ensures the feed is at most r% composed of ads.
    getMaxAttentionSlotsForFeed(feedId: string): number {
        const numPosts = this.roundLength * _.get(this.feedActivityFactor, [feedId, 'feedActivityFactor'], 0)
        let maxAttentionSlots = numPosts * (1 + this.protocol.riskFactor) - numPosts
        return maxAttentionSlots
    }
}
