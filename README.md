# Quai Network Documentation

## Documentation Files

| File Name | Description | Primary Contents |
|-----------|-------------|------------------|
| integration-guide.md | Exchange Setup Guide | Network Info, Node Setup, API Usage |
| node-operations.md | Node Operation Guide | Logging, Syncing, Updates, Maintenance |
| wallet-example | Wallet Implementation | Provider Setup, Transactions, HD Wallet |

## Network Information

### Chain IDs
- Mainnet: 9
- Orchard Testnet: 15000

## Quick Reference

### Important URLs

#### Mainnet (Chain ID: 9)
- Network Stats: https://stats.quai.network
- Block Explorer: https://quaiscan.io
- RPC Endpoint: https://rpc.quai.network/cyprus1

#### Orchard Testnet (Chain ID: 15000)
- Network Stats: https://orchard.stats.quai.network
- Block Explorer: https://orchard.quaiscan.io
- RPC Endpoint: https://orchard.rpc.quai.network/cyprus1

#### wallet-example.js
Example implementation showing:
```javascript
import * as quais from 'quais';

async function main() {
    // Initialize connection to Quai Network
    const provider = new quais.JsonRpcProvider("https://orchard.rpc.quai.network");

    // Generate random mnemonic
    const mnemonic = quais.Mnemonic.fromEntropy(quais.randomBytes(32));
    console.log("Mnemonic: ", mnemonic.phrase)

    // Create HD wallet
    const wallet = quais.QuaiHDWallet.fromMnemonic(mnemonic);

    // Get Cyprus1 zone address
    const addressInfo1 = await wallet.getNextAddress(0, quais.Zone.Cyprus1);
    console.log('Address info #1: ', addressInfo1);

    // Get private key
    const privateKey = wallet.getPrivateKey(addressInfo1.address);
    console.log('Private key: ', privateKey);

    // Example transaction
    const txObj = {
        to: "0x002F4783248e2D6FF1aa6482A8C0D7a76de3C329",
        value: "1",
        from: addressInfo1.address,
    };
    
    // Sign and send transaction
    const walletFromPrivateKey = new quais.Wallet(privateKey, provider);
    const txResponse = await walletFromPrivateKey.sendTransaction(txObj);
    console.log(txResponse)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

## Additional Resources

For detailed information and updates, refer to:
- Documentation: https://docs.qu.ai/
- GitHub Repositories:
  - Go-quai Client: https://github.com/dominant-strategies/go-quai.git
  - Go-quai-stratum: https://github.com/dominant-strategies/go-quai-stratum.git