import { Resolvers } from "../generated/resolvers-types";


interface a {
    
}

export class AttentionMarketMaker implements a {
    isRoundOpen(parent, args, context, info) {}
    getCurrentRoundInfo(parent, args, context, info) {}
    fillAndUpdate(parent, args, context, info) {}
    bidAndUpdate(parent, args, context, info) {}
}

export let attentionMarketMaker = (new AttentionMarketMaker()) as Resolvers['AttentionMarketMakerQuery'] & Resolvers['AttentionMarketMakerMutation']