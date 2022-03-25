import _, { orderBy, sortBy } from "lodash"
import { Protocol } from "./protocol"
import { EthAddress, FeedId, Publication } from "./types"
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
    closesAt: number
    finalised: boolean
    numSlots: number
    bids: Bid[]
}

export interface FillEvent {
    feedId: string
    roundId: number
    bid: Bid
}


/**
 * The attention market maker runs fixed-length auctions for a dynamic
 * number of "ad slots" in a user's feed. 
 * 
 * Auctions are organised into rounds, which occur on a regular schedule.
 * There are a fixed number of "ad slots" for sale each round, which is
 * computed from the feed activity factor (see `getMaxAttentionSlotsForFeed()`).
 * 
 * There are two phases for a round:
 *  1. bidding
 *  2. finalisation
 * 
 * Bidding is open until block.timestamp == round.closesAt, at which point,
 * any user may call `fillAndUpdate` in order to finalise the auction and fill
 * all of the winning bids.
 */
export class AttentionMarketMaker extends SmartContract {
    protocol: Protocol
    attention: AttentionToken
    rateOfPostsPerSecond: Record<FeedId, FeedActivityFactorMessage> = {}
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

    private createRound(feedId: string) {
        const numSlots = this.getMaxAttentionSlotsForFeed(feedId)
        if (numSlots == 0) throw new Error("No slots in round");

        const sinceLastUpdate = this.env.time - this.roundLengthLastUpdated
        const roundsSinceLastUpdate = Math.floor(sinceLastUpdate / this.roundLength)

        const round = {
            closesAt: (roundsSinceLastUpdate + 1) * this.roundLength,
            bids: [],
            finalised: false,
            numSlots
        }

        return round
    }

    bid(bid: AttentionMarketMakerBidData): number {
        const roundId = this.getCurrentRound()
        let round = _.get(this.bids, [bid.feedId, roundId], null)
        if (!round) {
            round = this.createRound(bid.feedId)
            this.events.emit('RoundCreated', { feedId: bid.feedId, roundId: roundId, numSlots: round.numSlots })
        }

        if (!this._isRoundOpen(round)) throw new Error("Bidding is closed.");
        
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
        while(sortedBids.length > round.numSlots) {
            const kickedBid = sortedBids.pop() as Bid
            this.events.emit('BidCancelled', { feedId: bid.feedId, roundId, bid })

            // Refund bid amount.
            this.attention.transfer(bid.feedId, this.address, kickedBid.from, kickedBid.amount)
        }

        // Effect: save bids.
        round.bids = sortedBids
        _.set(this.bids, [bid.feedId, roundId], round)

        this.events.emit('Bid', { feedId: bid.feedId, roundId, bid })

        return roundId
    }

    bidAndUpdate(bid: Bid, update: FeedActivityFactorMessage) {
        this.updateFromOracle(bid.feedId, update)
        return this.bid(bid)
    }

    getCurrentRound(): number {
        const roundsSinceUpdate = Math.floor((this.env.time - this.roundLengthLastUpdated) / this.roundLength)
        return this.cumulativeRounds + roundsSinceUpdate
    }

    getCurrentRoundInfo(update: FeedActivityFactorMessage) {
        const roundId = this.getCurrentRound()
        const numSlots = this._getMaxAttentionSlots(update.feedActivityFactor, this.roundLength)
        return { roundId, numSlots }
    }

    setRoundLength(length: number) {
        this.cumulativeRounds = this.getCurrentRound()
        this.roundLengthLastUpdated = this.env.time
        this.roundLength = length
    }

    isRoundOpen(feedId: FeedId, roundId: number) {
        const round = _.get(this.bids, [feedId, roundId], null)
        if (!round) throw new Error(`No round ${roundId}`)
        return this._isRoundOpen(round)
    }

    _isRoundOpen(round: BidRound) {
        return (this.env.time < round.closesAt)
    }

    fillAndUpdate(feedActivityFactorMessage: FeedActivityFactorMessage, feedId: FeedId, roundId: number) {
        // Verify round has ended.
        const round = this.bids[feedId][roundId]
        if (this._isRoundOpen(round)) throw new Error("Round still open.");
        if (round.finalised) throw new Error("Round already finalised.");

        // Fill bids for most recent round.
        const bids = round.bids
        // console.log(bids)
        const maxAttentionSlots = round.numSlots
        
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
        round.finalised = true

        this.updateFromOracle(feedId, feedActivityFactorMessage)
    }

    updateFromOracle(feedId: string, feedActivityFactorMessage: FeedActivityFactorMessage) {
        // Update feed activity factor from oracle.
        this.rateOfPostsPerSecond[feedId] = feedActivityFactorMessage
    }

    // Compute the number of slots we are selling in a feed for its current auction round.
    // The slots is derived from the invariant mentioned in the Gliss whitepaper.
    //   num(ads) + num(posts) = num(posts) * [1 + r]
    // This ensures the feed is at most r% composed of ads.
    getMaxAttentionSlotsForFeed(feedId: string): number {
        return this._getMaxAttentionSlots(
            _.get(this.rateOfPostsPerSecond, [feedId, 'feedActivityFactor'], 0),
            this.roundLength
        )
    }

    _getMaxAttentionSlots(feedActivityFactor: number, roundLength: number) {
        const numPostsPerRound = roundLength * feedActivityFactor
        const maxAttentionSlots = numPostsPerRound * (1 + this.protocol.riskFactor) - numPostsPerRound
        return Math.floor(maxAttentionSlots)
    }
}
