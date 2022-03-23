import { ProfileId } from './types'
import { EventEmitter } from 'events'

export class AttentionToken {
    balances: Record<string, number>;
    events = new EventEmitter()

    constructor() {
        this.balances = {}
    }

    transfer(tokenId: ProfileId, from: string, to: string, amount: number) {
        this.events.emit('Transfer', { token: tokenId, from, to, amount })
    }
}