
import { EventEmitter } from 'events'
import { SmartContract } from './helpers'
import { Publication } from './types'

export class Protocol {
    riskFactor = 0.1
    posts = []

    events = new EventEmitter()

    createPub(pub: Publication) {
        this.events.emit('PubCreated', pub)
    }
}
