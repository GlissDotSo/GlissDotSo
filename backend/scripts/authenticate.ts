import { types, domain } from '../src/authenticate'
import * as ethers from 'ethers'

const mainWallet = ethers.Wallet.createRandom()
const sessionWallet = ethers.Wallet.createRandom()

async function run() {
    const msg = {
        mainWallet: await mainWallet.getAddress(),
        sessionWalletPubkey: sessionWallet.publicKey
    }

    const data = await mainWallet._signTypedData(
        domain,
        types,
        msg
    )
    
    console.log(`Metamask wallet: ${mainWallet.address}`)
    console.log(`Session wallet: ${sessionWallet.address}`)

    // Send this query to the backend to test.
    const gql = `
    message: {
        mainWallet: "${msg.mainWallet}",
        sessionWalletPubkey: "${msg.sessionWalletPubkey}"
    },
    signature: "${data}"
    `
    console.log(gql)
}

run()