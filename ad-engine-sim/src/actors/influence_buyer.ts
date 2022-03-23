import _ from "lodash"
import { AttentionMarketMakerBidData } from "../attention_mm"
import { BaseActor } from "../simulation/actor"
import { attentionMarketMaker, feedEngine, protocol } from "../simulation/setup"

export class InfluenceBuyer extends BaseActor {
    openBiddingRounds: number[] = []

    step(t: number): void {
        const feedId = ""

        // Try fill existing bids.
        let filled: number[] = []
        for (const roundId of this.openBiddingRounds) {
            if (attentionMarketMaker.isRoundOpen(feedId, roundId)) continue

            let feedOracleMsg = feedEngine.getSignedFeedActivityFactorMessage(feedId, t)
            attentionMarketMaker.fillAndUpdate(
                feedOracleMsg,
                feedId,
                roundId
            )
            filled.push(roundId)
        }
        this.openBiddingRounds = _.without(this.openBiddingRounds, ...filled)

        // Make a bid.
        const amount = _.random(1, 15)
        const bidderAddress = "Bidder001"

        const pubId = protocol.createPub({
            ts: t,
            profileId: bidderAddress
        });

        let feedOracleMsg = feedEngine.getSignedFeedActivityFactorMessage(feedId, t)
        // console.log(feedOracleMsg.feedActivityFactor)
        const bid: AttentionMarketMakerBidData = {
            feedId,
            pubId,
            amount,
            from: bidderAddress,
            expiry: t + 60
        }

        // const roundId = attentionMarketMaker.bid(bid)
        const roundId = attentionMarketMaker.bidAndUpdate(bid, feedOracleMsg)
        this.openBiddingRounds.push(roundId)
    }
}