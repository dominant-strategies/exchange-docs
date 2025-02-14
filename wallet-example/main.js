import * as quais from 'quais';

async function main() {
    // Initialize connection to Quai Network, Quais will route to shards automatically
    const provider = new quais.JsonRpcProvider("https://orchard.rpc.quai.network");

    // Generate random mnemonic with 32 bytes of entropy
    const mnemonic = quais.Mnemonic.fromEntropy(quais.randomBytes(32));

    // OR use an existing mnemonic
    // const phrase = "stumble steel jeans emotion remind current remind viable what hood ladder lunch slush stable rough crew merge lyrics cabin bid between enough fault virtual"
    // const mnemonic = quais.Mnemonic.fromPhrase(phrase);
    
    console.log("Mnemonic: ", mnemonic.phrase)

    // Create HD wallet from mnemonic
    const wallet = quais.QuaiHDWallet.fromMnemonic(mnemonic);

    // Get first address in Cyprus1 zone for account index 0
    const addressInfo1 = await wallet.getNextAddress(0, quais.Zone.Cyprus1);
    console.log('Address info #1: ', addressInfo1);

    // Extract private key for the generated address
    const privateKey = wallet.getPrivateKey(addressInfo1.address);
    console.log('Private key: ', privateKey);

    // Fetch latest block information from Cyprus1 shard
    const block = await provider.getBlock(quais.Shard.Cyprus1, 'latest', false);
    console.log('Block: ', block);

    // Get current network expansion state
    const protocolExpansionNumber = await provider.getProtocolExpansionNumber();
    console.log('Protocol Expansion Number: ', protocolExpansionNumber);

    // Construct a basic transaction
    const from = addressInfo1.address;
    var txObj = {};
    
    txObj = {
        to: "0x002F4783248e2D6FF1aa6482A8C0D7a76de3C329",  // Recipient address
        value: "1",  // Amount to send (in smallest unit)
        from: from,  // Sender address
    };
    
    // Create signed transaction
    const signedTxSerialized = await wallet.signTransaction(txObj);

    // Deserialize the signed transaction
    const signedTx = quais.QuaiTransaction.from(signedTxSerialized);

    // Extract signature
    const signature = signedTx.signature;

    // Verify transaction signature by recovering signer
    const txHash = signedTx.digest;
    const signerAddress = quais.recoverAddress(txHash, signature);

    // Validate recovered signer matches sender
    if (signerAddress === from) {
        console.log('\nSignature is valid');
    } else {
        console.log('\nSignature is invalid');
    }


    // Recover wallet from private key, send transaction
    const walletFromPrivateKey = new quais.Wallet(privateKey, provider);
    const txResponse = await walletFromPrivateKey.sendTransaction(txObj);
    console.log(txResponse)
}

// Execute main function with error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });