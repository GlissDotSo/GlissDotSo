import { Publication } from "./types"

export class Indexer {
    pubs: Publication[] = []

    constructor() { }

    onPub(feedId: string, newPub: Publication) {
        // Store post.
        this.pubs.push(newPub)
    }

    getPubs() {
        return this.pubs
    }

    getFollowFeedPubs(profileId: string) {
        return this.pubs
    }
}