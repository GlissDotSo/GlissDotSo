// Every user has their own feed.
// Though each user's attention token inflation is the same.
// So we can treat this problem as if there's only one feed.

const ratePostsPerMin = 3.4
let ads = []
let posts = []
let avgRatePerInterval = {}

function main() {
    // One time step is a second in our model.
    // Length of simulation is 4hrs.

    // Total timesteps for simulation.
    let t = 4 * 60 * 60;

    // Size of the interval for an average.
    const intervalSize = 60 * 60

    const PROB_CREATE_POST_PER_TIMESTEP = 0.4
    const CREATE_POST_COUNT = 5


    function handlePostCreated(newPost) {
        // Store post.
        posts.push(newPost)

        // n(t) - total number of posts at t
        // 
        let currentTime = newPost.ts
        let startTime = currentTime - intervalSize
        // let t = 
        //     [...Array(intervalSize).keys()] // [0, 1, ..., intervalSize]
        //     .map(x => x + currentTime - intervalSize + 1) // [-5, -4, -3, -2, -1] for currentTime = 0
        let t = [currentTime - intervalSize + 1]
        let n = []

        // Find the index of first post in the interval of `t`.
        // TODO: binary search start of posts array
        // this is just dumb O(n) search
        
        // iterate array backwards.
        // worst case O(N)
        let postsInInterval = []
        if(posts.length) {
            for (let i = posts.length - 1; i > -1; i--) {
                let post = posts[i]
                if (post.ts >= t[0]) postsInInterval.push(post)
                else { break; }
            }
            postsInInterval.reverse() // chrono order    
        }

        // Generate num posts for each timestep.
        let total = 0
        let idx = 0
        // for(let tx of t) {
        //     // sum all posts in period.
        //     while(idx < postsInInterval.length) {
        //         let post = postsInInterval[idx]
        //         if (post.ts <= tx) {
        //             total++
        //             idx++
        //         } else {
        //             break
        //         }
        //     }
        //     n.push(total)
        // }
        total = postsInInterval.length;
        
        // Now calculate the average.
        const avg = total / intervalSize
        avgRatePerInterval[currentTime] = avg
    }

    // Generate posts.
    // handlePostCreated({ ts: 0 })
    for(let i = 0; i < t; i++) {
        for(let j = 0; j < CREATE_POST_COUNT; j++) {
            if(Math.random() < PROB_CREATE_POST_PER_TIMESTEP) {
                const post = {
                    ts: i
                }
                handlePostCreated(post)
            }
        }
    }
    
    
    console.log(posts)
    console.log(avgRatePerInterval)

    let allAvgs = {}
    let keys = Object.keys(avgRatePerInterval)
    for (let i = 0; i < t; i++) {
        allAvgs[i] = avgRatePerInterval[findInInterval(keys, i)]
    }

    console.log(allAvgs)


    // Now calculate the price to advertise for any period.
    const RISK_FACTOR = 0.1

    for (let i = 0; i < t; i++) {
        // Invariant:
        // num(ads) + num(posts) = num(posts) * [1 + r]
        const avgPostsPerInterval = allAvgs[i]
        const numPosts = avgPostsPerInterval
        let maxNumAds = numPosts * (1 + RISK_FACTOR) - numPosts
        
        // 
        // The feed algorithm aims to achieve these purposes:
        // 1. A % of the feed can consist of ads.
        // 2. The feed is ALWAYS listed chronologically.
        //
        // This differs to other feeds. Usually ads are interspersed, and can repeat.
        // We don't want this to happen. We want posts from followers and posts from non-followers
        // to have the same attention given to them - no sticky ads allowed!
        //
        // We implement the feed algorithm quite simply:
        //   items = [ ...posts_from_followers, ...ads ]
        //   feed = items.sort(chronologically)
        //
        // So how do we implement the attention market to effectively
        // allocate ads within the requirements of the feed?
        //
        // A naive design for this attention market is quite simple:
        // - say the feed is divided into fixed size intervals, like 1h chunks.
        // - the constraint is that only X% of a chunk can contain ads.
        // - and for pricing, we'll set it to a fixed fee in $ATTN.
        //
        // Let's design an example of a market where there can only be 5 ads per 1h interval:
        //
        // contract AdMarketplace:
        //   post_ad(ad_content, bid):
        //     max_ads_per_interval = 5
        //     ads_in_current_interval = len(ads.filter(past hour))
        //     if (ads_in_current_interval + 1 < max_ads_per_interval) {
        //         allow posting the ad
        //     }
        //
        // This is great, but it has a flaw. What happens when no-one has posted that hour?
        // Our feed could become full of ads! We explicitly (see #2) don't want this.
        //
        // How can we solve this? Well what if we factored in the rate of posts for that interval?
        // We could determine a maximum rate of ads - if there aren't enough posts, then
        // there would be no ad slots allowed. Setting the ads to 10% of the feed, then
        // for every 9 posts, 1 ad slot would be allocated.
        //
        // So we've solved the problem of determining how many ad slots there are.
        // We should now figure out how to efficiently price those ad slots.
        // Thankfully, this is simpler. We hold an auction!
        //
        // The Attention Market Maker holds fixed-length auctions, whereby advertisers submit bids
        // for a user's attention. Every 10mins, the highest bidder's order is filled. Users can submit
        // bids with an expiry, avoiding the complexity of continually adjusting their price.
        //
        // Advertisers permissionlessly post bids to the AMM, sending (attention_market, bid, adPub, expiry).
        // There is only one attention market per $ATTN token, so attention_market is set to the $ATTN address.
        // Once the round has elapsed, anyone may now fill the top bid - we imagine that through the dapp,
        // the fill would automatically be sent in the background through a meta-transaction service. However if this
        // does not happen, keepers are incentivised to perform this functionality, for a fee.
        //
        // The rate of posts for a feed (feed activity factor) is computed continuously by an offchain service,
        // and provided on-chain by callers during the bid fulfillment process every 10mins.
        // The design follows MakerDAO's design for price feeds - if the latest value becomes stale, the entire attn
        // market for that user freezes functionality. 
        // 
        
        console.log(numPosts, maxNumAds)
    }


}

function AdEngine() {
    let maxAdsPerHour = 5
    
}

function findInInterval(vals, x) {
    if(vals.length == 0) throw new Error("not found")

    let guess = 0

    while(true) {
        if (vals.length == guess) return vals[vals.length - 1]
        let val = vals[guess]
        if (x <= val) return val
        guess++
    }
    
    return vals[guess]
}


main()