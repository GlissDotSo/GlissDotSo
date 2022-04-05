Technicality:

the streams won't scale on-chain
the ad marketplace will, but the ATTN tokens will need to be fungible somewhere
maybe a separate blockchain
maybe solana


Gliss Protocol
- Attention tokens
- Influence tokens
- Attention market maker

Cosmos chain.

How many transactions do we need? 
Well, fundamentally we need:
1. a higher gas limit

Polygon <> Gliss
    Token bridge.








Here's the plan

1. Port the ad engine into a backend
2. Write a backend that:
    Allows the user to query using their eth account
    Exposes the feed
    Exposes the AMM
    Exposes the token
    Allows the user to bridge the token onto polygon
3. Flesh out the attention token on the backend
4. Write a frontend
    User balance in top-right corner
    User creates post
    User views feed
        Get their individual feed
    User views profile
        Get feed of that user's posts
        Actions
            "Create shill" which buys their ATTN token from uniswap
            "Follow" which calls the Lens follow function, and then allocates an attention stream server-side.
    User portfolio page
        Actions:
            Deposit on Uniswap
        Your influence
            Streams and users ranked by value


We need an AMM that allows you to claim all of your influence tokens at once without reading from storage on polygon
e.g.
    AMM
        Pools
            ATTN(0)..ATTN(n)
        Virtual Pools
    
    Influence.mint
        mints the influence token for trading
    Influence.burn
        turns the influence token back into attention





5. The fun stuff:

    Social DAO
        stake your attention to join DAO
            requests mint from the backend
            tokens go into dao contract
            you can now post according to your stake

    
    

