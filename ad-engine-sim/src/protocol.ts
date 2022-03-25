
import { EventEmitter } from 'events'
import { SmartContract } from './helpers'
import { ProfileId, Publication } from './types'

export interface CreatePubArgs {
    ts: number
    profileId: ProfileId
}

export class Protocol {
    riskFactor = 0.55
    pubCount = 0
    events = new EventEmitter()

    createPub(args: CreatePubArgs): number {
        let pub = {
            ...args,
            id: this.pubCount++,
        }
        this.events.emit('PubCreated', pub)
        return pub.id
    }
}
