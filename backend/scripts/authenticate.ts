const wallet = ethers.Wallet.createRandom()

const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: await accountData.connector.getChainId(),
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
}

const msg = {
    wallet: accountData.address,
    sessionPubkey: wallet.publicKey
}

console.debug(msg)

const { data, error } = await signTypedData({
    domain,
    types,
    value: msg
})