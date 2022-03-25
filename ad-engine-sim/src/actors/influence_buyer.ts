import _ from "lodash"
import { AttentionMarketMakerBidData } from "../attention_mm"
import { BaseActor } from "../simulation/actor"
import { attentionMarketMaker, feedEngine, protocol } from "../simulation/setup"

export const BIDDER_PROFILE_PREFIX = "Bidder"
export class InfluenceBuyer extends BaseActor {
    openBiddingRounds: Set<number> = new Set()

    step(t: number): void {
        const feedId = ""

        // Try fill existing bids.
        for (const roundId of this.openBiddingRounds.values()) {
            if (attentionMarketMaker.isRoundOpen(feedId, roundId)) continue

            let feedOracleMsg = feedEngine.getSignedFeedActivityFactorMessage(feedId, t)
            attentionMarketMaker.fillAndUpdate(
                feedOracleMsg,
                feedId,
                roundId
            )
            this.openBiddingRounds.delete(roundId)
        }

        // Make a bid.
        const amount = _.random(1, 15)
        const bidderAddress = BIDDER_PROFILE_PREFIX + "001"

        const feedOracleMsg = feedEngine.getSignedFeedActivityFactorMessage(feedId, t)
        const roundInfo = attentionMarketMaker.getCurrentRoundInfo(feedOracleMsg)
        if(roundInfo.numSlots < 1) return

        for (let i = 0; i < roundInfo.numSlots; i++) {
            const pubId = protocol.createPub({
                ts: t,
                profileId: bidderAddress
            });

            const bid: AttentionMarketMakerBidData = {
                feedId,
                pubId,
                amount,
                from: bidderAddress,
                expiry: t + 60
            }

            const roundId = attentionMarketMaker.bidAndUpdate(bid, feedOracleMsg)
            this.openBiddingRounds.add(roundId)
        }
        
    }
}