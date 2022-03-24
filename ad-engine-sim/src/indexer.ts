import _ from "lodash"
import { BIDDER_PROFILE_PREFIX } from "./actors/influence_buyer"
import { AttentionMarketMaker, Bid, FillEvent } from "./attention_mm"
import { Protocol } from "./protocol"
import { Publication } from "./types"

export interface PromotedPublication {
    pub: Publication
    bid: Bid
}

export class Indexer {
    pubs: Record<number, Publication> = {}
    promotedPubs: Record<number, PromotedPublication> = {}

    constructor(public protocol: Protocol, public attentionMarketMaker: AttentionMarketMaker) {
        protocol.events.on('PubCreated', (pub) => {
            this.onPub(pub)
        })

        attentionMarketMaker.events.on('Fill', (fillEvent) => {
            this.onAMMFill(fillEvent)
        })
    }

    onPub(newPub: Publication) {
        // Store post.
        this.pubs[newPub.id] = newPub
    }

    onAMMFill(fillEvent: FillEvent) {
        const bid = fillEvent.bid
        const pub = this.pubs[bid.pubId]
        let promotedPub: PromotedPublication = {
            pub,
            bid
        }
        this.promotedPubs[pub.id] = promotedPub
    }

    getPubs(): Publication[] {
        return Object.values(this.pubs)
    }

    getPromotedPubs(): PromotedPublication[] {
        return Object.values(this.promotedPubs)
    }

    // Get pubs EXCLUSIVE of promoted pubs.
    getFollowerPubs(): Publication[] {
        return _.filter(
            this.getPubs(),
            pub => {
                // In prod, this would filter by posts only from a user's following.
                return pub.profileId.startsWith(BIDDER_PROFILE_PREFIX)
            }
        ) as Publication[]
    }
}