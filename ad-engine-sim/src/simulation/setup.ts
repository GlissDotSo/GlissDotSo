import { Simulation } from "./simulation"
import { AttentionMarketMaker } from "../attention_mm"
import { AttentionToken } from "../attention_token"
import { FeedEngine } from "../feed_engine"
import { EVMEnvironment } from "../helpers"
import { Indexer } from "../indexer"
import { Protocol } from "../protocol"

export let mockUsers: string[] = []
export const NUM_MOCK_USERS = 25
for (let i = 0; i < NUM_MOCK_USERS; i++) {
    mockUsers.push(`user_${i}`)
}

export let protocol = new Protocol()
export let evm = new EVMEnvironment()
export let attentionToken = new AttentionToken()
export let attentionMarketMaker = new AttentionMarketMaker(evm, protocol, attentionToken)
export let indexer = new Indexer(protocol, attentionMarketMaker)
export let feedEngine = new FeedEngine(protocol, indexer)
export let simulation = new Simulation(evm)

