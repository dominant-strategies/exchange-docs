# Exchange Integration Guide

As transactions are not open on the mainnet till the 19th Feb 2025, any integrations before this date should use the orchard testnet.

### Docs URL
https://docs.qu.ai/

### Json RPC documentation
https://docs.qu.ai/build/playground/overview

### Quais SDK section
https://docs.qu.ai/sdk/introduction

### General Guides to operate the node
https://docs.qu.ai/guides/client/node

### Go-quai client code
https://github.com/dominant-strategies/go-quai.git

### Go-quai-stratum code
https://github.com/dominant-strategies/go-quai-stratum.git	

### Mainnet URLs

1. [Mainnet Stats](https://stats.quai.network)
2. [Mainnet Explorer](https://quaiscan.io)
3. [Mainnet Rpc Endpoint](https://rpc.quai.network/cyprus1)

### Orchard Testnet URLs

1. [Orchard Stats](https://orchard.stats.quai.network)
2. [Orchard Explorer](https://orchard.quaiscan.io)
3. [Orchard Rpc Endpoint](https://orchard.rpc.quai.network/cyprus1)


## HD Wallet Derivation (Per-Zone Support)

Wallets integrating with QUAI can deterministically generate valid addresses from a BIP-39 seed phrase. This version allows targeting a specific shard by passing in the **region** and **zone**. Currently, only the Cyprus1 shard is active (0x00).

### Inputs

- `seedPhrase` (string) — the BIP-39 mnemonic
- `region` (number) — the high 4 bits of the shard byte (e.g. `0` for Cyprus, `1` for Paxos)
- `zone` (number) — the low 4 bits of the shard byte (e.g. `0`, `1`, or `2`)
- `startIndex` (optional, default = 0) — where to start scanning for valid addresses

---

### Example

```bash
node derive.js "ripple tuna scrub orbit ..." 0 0 12
```

This example searches for the next valid **Cyprus One** address (shard prefix `0x00`), starting from index 13.

---

### Full Script

```js
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const { keccak_256 } = require('js-sha3');
const { mnemonicToSeedSync } = require('bip39');
const HDKey = require('hdkey');

// 1. Generate uncompressed public key (hex string with '0x04' prefix)
function getPublicKeyHex(privateKey) {
  const pubKey = secp256k1.publicKeyCreate(privateKey, false);
  return '0x' + Buffer.from(pubKey).toString('hex');
}

// 2. Remove '0x04' prefix and hash it
function hashPublicKey(pubKeyHex) {
  const pubkeyStripped = pubKeyHex.slice(4);
  const pubkeyBytes = Buffer.from(pubkeyStripped, 'hex');
  return Buffer.from(keccak_256.arrayBuffer(pubkeyBytes));
}

// 3. Take last 20 bytes of hash
function extractAddressBytes(hashBuffer) {
  return hashBuffer.slice(12);
}

// 4. Apply EIP-55 checksum logic
function toChecksumAddress(addressBytes) {
  const addrHex = addressBytes.toString('hex');
  const lower = addrHex.toLowerCase();
  const hash = Buffer.from(keccak_256.arrayBuffer(Buffer.from(lower, 'ascii')));
  const chars = lower.split('');
  for (let i = 0; i < 40; i += 2) {
    if ((hash[i >> 1] >> 4) >= 8) chars[i] = chars[i].toUpperCase();
    if ((hash[i >> 1] & 0xf) >= 8) chars[i + 1] = chars[i + 1].toUpperCase();
  }
  return '0x' + chars.join('');
}

// Derive QUAI address from private key
function computeQuaiAddress(privateKey) {
  const pubKeyHex = getPublicKeyHex(privateKey);
  const hash = hashPublicKey(pubKeyHex);
  const addressBytes = extractAddressBytes(hash);
  return toChecksumAddress(addressBytes);
}

// Derive private key from seed phrase and index using standard derivation path
function derivePrivateKey(seedPhrase, index) {
  const seed = mnemonicToSeedSync(seedPhrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const path = `m/44'/994'/0'/0/${index}`;
  return hdkey.derive(path).privateKey;
}

// Check address starts with correct shard prefix and is not a Qi address
function isValidShardAddress(address, region, zone) {
  const firstByte = parseInt(address.slice(2, 4), 16);
  const secondByte = parseInt(address.slice(4, 6), 16);
  const expectedShardByte = (region << 4) | zone;
  return firstByte === expectedShardByte && secondByte < 0x80;
}

// Main function to find next valid address for specified shard
function findNextAddressForZone(seedPhrase, region, zone, startIndex) {
  console.log(`🔍 Searching for valid address for region ${region}, zone ${zone}...`);

  for (let i = startIndex + 1; i < startIndex + 10000; i++) {
    const privateKey = derivePrivateKey(seedPhrase, i);
    if (!secp256k1.privateKeyVerify(privateKey)) continue;

    const address = computeQuaiAddress(privateKey);
    if (isValidShardAddress(address, region, zone)) {
      console.log('✅ Valid QUAI address found!');
      console.log('🔑 Private Key:', privateKey.toString('hex'));
      console.log('📬 Address:', address);
      console.log('📝 Index:', i);
      return;
    }
  }

  console.error('❌ Could not find a valid address after 10,000 attempts');
}

// CLI Usage
const seedPhrase = process.argv[2];
const region = parseInt(process.argv[3]);
const zone = parseInt(process.argv[4]);
const startIndex = parseInt(process.argv[5] || '0');

if (!seedPhrase || isNaN(region) || isNaN(zone)) {
  console.error('❌ Usage: node derive.js "<seed phrase>" <region> <zone> [startIndex]');
  process.exit(1);
}

findNextAddressForZone(seedPhrase, region, zone, startIndex);
```

---

## Wallet Integration Tip

Wallets using this approach should:
- Keep track of the last used index per shard
- Use this derivation flow to deterministically find the next valid address
- Confirm the shard prefix matches the desired zone (e.g., `0x00`, `0x01`, `0x10`, etc.)

This logic ensures the wallet remains compatible with QUAI’s sharded architecture, even as new zones become active.

---

## Setting Up Protobuf Compilation (JavaScript)

To work with QUAI protobufs in JavaScript, you’ll need to compile the `.proto` files into `.js` files using `protoc`.

### File Structure

Your project should look like this after setup:

```
test-protobuf/
├── index.js / send.js
├── node_modules/
├── package.json
├── package-lock.json
└── protoc/
    ├── proto_block.proto
    ├── proto_common.proto
    ├── proto_block_pb.js
    └── proto_common_pb.js
```

### Step-by-Step Setup

#### 1. Install `protoc`

If you don’t have `protoc` installed yet:

**macOS (Homebrew):**
```bash
brew install protobuf
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y protobuf-compiler
```

**Windows:**
- Download from: https://github.com/protocolbuffers/protobuf/releases
- Extract and add `protoc.exe` to your system `PATH`.

#### 2. Install npm dependencies

Install the required packages:

```bash
npm install google-protobuf secp256k1 js-sha3
```

#### 3. Add `.proto` files

Download the following files from the [go-quai GitHub repo](https://github.com/dominant-strategies/go-quai):

- [`proto_block.proto`](https://github.com/dominant-strategies/go-quai/blob/main/core/types/proto_block.proto)
- [`proto_common.proto`](https://github.com/dominant-strategies/go-quai/blob/main/common/proto_common.proto)

Save them to a `protoc/` directory at the root of your project.

#### 4. Compile the `.proto` files

Use this command to generate JS bindings:

```bash
protoc \
  --proto_path=protoc \
  --js_out=import_style=commonjs,binary:protoc \
  protoc/proto_block.proto protoc/proto_common.proto
```

This generates `proto_block_pb.js` and `proto_common_pb.js` in the `protoc/` directory.

#### 5. Use the generated files

Example usage in your script:

```js
const protoBlock = require('./protoc/proto_block_pb');
const protoCommon = require('./protoc/proto_common_pb');

// Example: decode a message
const block = protoBlock.ProtoBlock.deserializeBinary(someBinaryBuffer);
console.log(block.toObject());
```

---

## Encoding & Sending Transactions

Wallets can construct, sign, and broadcast QUAI transactions using the `ProtoTransaction` format. This example shows how to build and send a Type 0 (EIP-155-style) transaction using a private key.

### Inputs

This script accepts the following arguments:

- `privateKeyHex` — hex-encoded private key (no `0x` prefix)
- `toAddress` — recipient address (QUAI format)
- `valueWei` — amount to send in wei (e.g., `1000000000000000000` for 1 QUAI)
- `nonce` — sender's transaction nonce

### ▶️ Example

```bash
node send.js <your_private_key> 0xRecipientAddress 1000000000000000000 1
```

This sends 1 QUAI to the recipient with nonce 1.

---

### Full Script

```js
const https = require('https');
const secp256k1 = require('secp256k1');
const { keccak_256 } = require('js-sha3');
require('./protoc/proto_block_pb');
require('./protoc/proto_common_pb');

const rpcUrl = 'https://orchard.rpc.quai.network/cyprus1';
const protoBlock = global.proto.block;

/** Utility: Convert hex string to Uint8Array */
function getBytes(hexString) {
  if (hexString.startsWith('0x')) hexString = hexString.slice(2);
  if (hexString.length % 2 !== 0) hexString = '0' + hexString;
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Utility: Convert Uint8Array to hex string */
function hexlify(bytes) {
  return '0x' + Buffer.from(bytes).toString('hex');
}

/** Derive a checksummed QUAI address from a private key */
function computeQuaiAddress(privateKey) {
  const pubKey = secp256k1.publicKeyCreate(privateKey, false); // uncompressed
  const pubKeyBytes = Buffer.from(pubKey.slice(1));
  const hash = Buffer.from(keccak_256.arrayBuffer(pubKeyBytes));
  const addressBytes = hash.slice(12);

  const lower = addressBytes.toString('hex').toLowerCase();
  const hashHex = keccak_256(lower);
  const checksummed = [...lower].map((char, i) =>
    parseInt(hashHex[i], 16) >= 8 ? char.toUpperCase() : char
  ).join('');

  return '0x' + checksummed;
}

/** Construct and populate a ProtoTransaction */
function createProtoTransaction(tx) {
  const protoTx = new protoBlock.ProtoTransaction();
  protoTx.setType(0);
  protoTx.setTo(getBytes(tx.to));
  protoTx.setNonce(tx.nonce);
  protoTx.setValue(getBytes(tx.value.toString(16)));
  protoTx.setGas(tx.gasLimit);
  protoTx.setGasPrice(getBytes(tx.gasPrice.toString(16)));
  protoTx.setData(getBytes(tx.data));
  protoTx.setChainId(getBytes(tx.chainId.toString(16)));

  const accessList = new protoBlock.ProtoAccessList();
  accessList.setAccessTuplesList([]);
  protoTx.setAccessList(accessList);

  return protoTx;
}

/** Sign a ProtoTransaction using secp256k1 */
function signTransaction(privateKey, protoTx) {
  const txData = protoTx.serializeBinary();
  const hash = Buffer.from(keccak_256.arrayBuffer(txData));
  const { signature, recid } = secp256k1.ecdsaSign(hash, privateKey);

  protoTx.setR(signature.slice(0, 32));
  protoTx.setS(signature.slice(32, 64));

  const v = new Uint8Array(32);
  v[31] = recid;
  protoTx.setV(v);

  return protoTx.serializeBinary();
}

/** Log transaction for debugging */
function logTransactionEncoding(label, protoTx) {
  console.log(`\n🔍 ${label}`);
  const binary = protoTx.serializeBinary();
  console.log('🔢 Raw Bytes:', hexlify(binary));
  console.log('🧾 Fields:');
  console.log('  - Type:', protoTx.getType());
  console.log('  - To:', hexlify(protoTx.getTo()));
  console.log('  - Nonce:', protoTx.getNonce());
  console.log('  - Value:', hexlify(protoTx.getValue()));
  console.log('  - Gas:', protoTx.getGas());
  console.log('  - GasPrice:', hexlify(protoTx.getGasPrice()));
  console.log('  - Data:', hexlify(protoTx.getData()));
  console.log('  - ChainId:', hexlify(protoTx.getChainId()));
  console.log('  - AccessList count:', protoTx.getAccessList()?.getAccessTuplesList()?.length ?? 'N/A');
  if (protoTx.getR && protoTx.getR().length) {
    console.log('  - r:', hexlify(protoTx.getR()));
    console.log('  - s:', hexlify(protoTx.getS()));
    console.log('  - v:', hexlify(protoTx.getV()));
  }
}

/** Send a signed ProtoTransaction to the network */
function sendRawTransaction(serializedTx) {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    method: 'quai_sendRawTransaction',
    params: [hexlify(serializedTx)],
    id: 1,
  });

  const req = https.request(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  }, res => {
    let result = '';
    res.on('data', chunk => result += chunk);
    res.on('end', () => console.log('🚀 RPC Response:', result));
  });

  req.on('error', e => console.error('❌ RPC Error:', e));
  req.write(data);
  req.end();
}

/** ---- Main ---- */

const [privKeyHex, toAddress, valueStr, nonceStr] = process.argv.slice(2);

if (!privKeyHex || !toAddress || !valueStr || !nonceStr) {
  console.error('❌ Usage: node send.js <hex_private_key> <to_address> <value_wei> <nonce>');
  process.exit(1);
}

const privateKey = getBytes(privKeyHex);
const fromAddress = computeQuaiAddress(privateKey);
console.log('📬 From Address:', fromAddress);

const tx = {
  type: 0,
  chainId: 15000n, // Cyprus1
  nonce: parseInt(nonceStr),
  gasPrice: 1200000000n,
  gasLimit: 46200,
  to: toAddress,
  value: BigInt(valueStr),
  data: '0x',
};

const protoTx = createProtoTransaction(tx);
logTransactionEncoding('Unsigned ProtoTransaction', protoTx);

const signedTx = signTransaction(privateKey, protoTx);
logTransactionEncoding('Signed ProtoTransaction', protoTx);

sendRawTransaction(signedTx);
```

---

## Tips for Wallet Integration

- Always fetch the sender's current nonce using `quai_getTransactionCount` to avoid collisions.
- This script targets the **Cyprus1** zone: `https://rpc.quai.network/cyprus1`. For other zones, swap out the RPC URL accordingly.
- Double-check the protobuf structure and signature encoding if transactions are rejected by the node.

## How to start the node? 

https://docs.qu.ai/guides/client/node has complete information on how to set up the node. To run the node on the orchard testnet, make sure to be on the latest orchard branch (https://github.com/dominant-strategies/go-quai/tree/orchard) on go-quai. 

https://docs.qu.ai/guides/client/node#mainnet-testnet-orchard section of the doc has the starting command to start the node.

In order to quickly sync the node to the tip of the chain, a snapshot can be used. Here is the https://docs.qu.ai/guides/client/node#download-and-sync-from-snapshot guide to use the snapshot.

## How to check the height of the node?

https://docs.qu.ai/guides/client/node#checking-sync-progress has the commands to check the height of the node. If API is preferred, https://docs.qu.ai/build/playground/blocks/blockNumber api can be used. 

Once the node is started and syncing, check the nodes height against the bootnode height displayed in the https://orchard.stats.quai.network. 

## How to use a custom http port? 

Use `--rpc.http-addr 0.0.0.0` on the startup if the node needs to be accessed from outside the local network. Additional firewall rules can be applied on top for security purposes.

### Default Ports Overview:

	Prime Chain: Uses HTTP port 9001.
	Region-0 (cyprus): Uses HTTP port 9002.
	Zone-0-0 (cyprus1): Uses HTTP port 9200 (this is the chain with the state and where most interactions occur).

### Why Change the Port?

	If you need to expose only one HTTP port on the node (instead of multiple), you must change the default settings both in the go-quai startup command and in the Quais SDK when creating the provider.

### Changing the Default Port:

	The go-quai client uses a startup flag --rpc.http-port to define the HTTP port for the prime chain.
	Important: The ports for the other chains (including cyprus1) are derived from this prime port.
    	For the cyprus1 chain, its HTTP port is calculated as:
    	(prime port) + 199

### Example: Setting a Custom Port for cyprus1

	Goal: You want cyprus1’s HTTP server to run on port 11000.
	Calculation:
	Since cyprus1 port = (prime port) + 199, you need to set:
	prime port=11000−199=10801
	Startup Command:
	When starting go-quai, use:

	go-quai --rpc.http-port 10801

	This means:
    	Prime chain gets port 10801.
    	Region-0 and other chains get their ports based on this value.
    	Specifically, cyprus1 will run on 10801 + 199 = 11000.

### Updating the SDK Provider:

https://docs.qu.ai/sdk/content/classes/JsonRpcProvider is the section of the docs that explains the provider connections. 


	Make sure the Quais SDK is configured to connect to the new custom port (i.e., the derived cyprus1 port of 11000). Make sure to also use the quais sdk version 1.0.0-alpha.39 or above.

Default SDK provider connection should be done as

```{js}
const provider = new quais.JsonRpcProvider(“http://127.0.0.1”,undefined, { usePathing: false });
```

If a custom port needs to be used, change the connection to the below snippet and use the external IP of the node if this script is used from outside the machine. 

```{js}
const provider = new quais.JsonRpcProvider(“http://127.0.0.1”,
  	undefined,
  	{
    	shards: [quais.Shard.Cyprus1], 
    	shardPorts: { cyprus1: 11000 }, 
    	usePathing: false
  	}
	);
```


## Where to send the transaction?


Transactions in quai are propagated to the network using workshares, so it is not possible to propagate the transaction to the network if the node is not mining or it's not connected to the tx sharing pool. 

There are two options to send the transactions and get it included in the network:
1. Use the public rpc (https://rpc.quai.network/cyprus1) as its connected to pools of miners that help tx propagation
2. Use the local node but add a flag to the go-quai on startup that sends the transactions to the rpcs. `--txpool.sharing-clients ws://ip:8200`, contact the team for the ip to be put on startup.

## How to use apis from different namespaces?

By default only quai,net namespaces are enabled in the node. But the node supports wide ranges of the namespaces. Majority of the apis come under “eth”, “quai”, and “txpool” namespaces. So add --rpc.http-api "eth,quai,txpool" to the go-quai startup. 
