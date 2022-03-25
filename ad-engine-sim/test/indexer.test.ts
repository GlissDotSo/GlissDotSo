import _ from "lodash";
import { AttentionMarketMaker } from "../src/attention_mm";
import { Indexer } from "../src/indexer";
import { Protocol } from "../src/protocol";

let protocol = new Protocol()
let amm: AttentionMarketMaker = {} as AttentionMarketMaker

describe('Indexer', () => {
    let indexer = new Indexer(protocol, amm)
    const feedId = ""
    let pubIds
    let promotedPubIds
    
    beforeAll(async () => {
        // Generate pubs.
        pubIds = [...Array(50).keys()]
        for(let i = 0; i < 50; i++) {
            indexer.onPub({
                profileId: "test",
                ts: i,
                id: pubIds[i]
            })
        }

        // Generate AMM fills.
        promotedPubIds = _.sampleSize(pubIds, 10)
        for (let promotedPubId of promotedPubIds) {
            indexer.onAMMFill({
                feedId,
                roundId: 0,
                bid: {
                    feedId,
                    pubId: promotedPubId,
                    amount: 20,
                    from: "Bidder",
                    expiry: 15,
                }
            })
        }
    })

    describe('getPubs', () => {
        it('returns all pubs', () => {
            const pubs = indexer.getPubs()
            const actualPubIds = pubs.map(pub => pub.id).sort()

            expect(actualPubIds).toEqual(pubIds)
        })
    })

    describe('getPromotedPubs', () => {
        it('returns only promoted pubs that were filled by the AMM', () => {
            const pubs = indexer.getPromotedPubs()
            const actualPubIds = pubs.map(pub => pub.pub.id).sort()

            expect(actualPubIds).toEqual(promotedPubIds)
        })
    })

    describe('getFollowerPubs', () => {
        it('returns only follower pubs', () => {
            const pubs = indexer.getFollowerPubs()
            const actualPubIds = pubs.map(pub => pub.id).sort()

            expect(actualPubIds).toEqual(_.without(pubIds, ...promotedPubIds))
        })
    })
})