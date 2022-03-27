import { _TypedDataEncoder } from "ethers/lib/utils"
import { verifyTypedData } from "ethers/lib/utils"
import { MutationAuthenticateArgs, MutationResolvers, RequireFields, Resolver, ResolverFn, ResolverTypeWrapper } from "./generated/resolvers-types"


export const types = {
    DispatcherAuth: [
        { name: 'mainWallet', type: 'address' },
        { name: 'sessionWalletPubkey', type: 'bytes' }
    ],
}

export const domain = {
    // name: 'Gliss',
    // version: '1',
    // chainId: '0x',
    // verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
}


export const authenticate: MutationResolvers['authenticate'] = (parent, args, context, info) => {
    const { signature, message } = args.request
    const address = verifyTypedData(domain, types, message, signature)
    if (address !== message.mainWallet) throw new Error("Authentication message was not signed by main wallet: " + message.mainWallet)
    
    console.log(`authenticate address=${address} mainWallet=${message.mainWallet} sessionWalletPubkey=${message.sessionWalletPubkey}`)
    
    return true
}

// const wallet = ethers.Wallet.createRandom()

// const msg = {
//     wallet: accountData.address,
//     sessionPubkey: wallet.publicKey
// }

// console.debug(msg)

// const { data, error } = await signTypedData({
//     domain,
//     types,
//     value: msg
// })