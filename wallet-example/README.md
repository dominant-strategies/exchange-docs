# Quai Network Wallet Integration Example

This example demonstrates how to integrate with the Quai Network using the `quais` library, including wallet creation, transaction signing, and blockchain interaction.

## Features

- Generate HD wallets from mnemonics
- Create and manage addresses across different Quai Network zones
- Sign and verify transactions
- Interact with the Quai Network RPC
- Handle cross-shard transactions
- Recover wallets from private keys

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager
- `quais` library installed

## Installation

```bash
npm install quais
# or
yarn add quais
```

## Usage

The example code demonstrates several key functionalities:

### 1. Initialize Provider Connection

```javascript
const provider = new quais.JsonRpcProvider("https://rpc.quai.network");
```

### 2. Create HD Wallet

```javascript
const mnemonic = quais.Mnemonic.fromEntropy(quais.randomBytes(32));
const wallet = quais.QuaiHDWallet.fromMnemonic(mnemonic);
```

### 3. Generate Zone-Specific Addresses

```javascript
const addressInfo = await wallet.getNextAddress(0, quais.Zone.Cyprus1);
```

### 4. Sign and Verify Transactions

```javascript
const signedTxSerialized = await wallet.signTransaction(txObj);
const signedTx = quais.QuaiTransaction.from(signedTxSerialized);
const signerAddress = quais.recoverAddress(txHash, signature);
```

### 5. Send Transactions

```javascript
const walletFromPrivateKey = new quais.Wallet(privateKey, provider);
const txResponse = await walletFromPrivateKey.sendTransaction(txObj);
```

## Network Features

The example demonstrates interaction with several Quai Network-specific features:

- Zone-based addressing (e.g., Cyprus1)
- Protocol expansion tracking
- Cross-shard transaction handling
- HD wallet derivation paths

## Security Considerations

- Always secure private keys and mnemonics
- Validate transaction signatures before broadcasting
- Handle errors appropriately in production environments
- Never expose sensitive information in logs

## Error Handling

The example includes basic error handling:

```javascript
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

## Network Configuration

The example connects to the Quai Network mainnet. For testnet development:

1. Replace the RPC endpoint with the testnet URL
2. Adjust gas prices and limits accordingly
3. Use testnet faucets for initial funding

## Contributing

Feel free to submit issues and enhancement requests.

## License

[MIT License](LICENSE)

## Additional Resources

- [Quai Network Documentation](https://qu.ai/docs)
- [Quais Library Reference](https://github.com/dominant-strategies/quais)
- [Network Explorer](https://quaiscan.io)