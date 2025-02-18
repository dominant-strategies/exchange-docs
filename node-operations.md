# Node Operations Guide

This document outlines how to run a Quai node and connect it to the transaction relay network.

## Example Command for Main (Mainnet)

```bash
./build/bin/go-quai start \
    --rpc.http-addr 0.0.0.0 \
    --node.slices "[0 0]" \
    --node.genesis-nonce 23621466532946281564673705261963422 \
    --txpool.sharing-clients http://ip:9200 \
    --rpc.http-api "eth,quai,txpool,net" \
    --node.quai-coinbases "0x0000000000000000000000000000000000000001" \
    --node.qi-coinbases "0x0080000000000000000000000000000000000001"
```

## Example Command for Testnet (Orchard)

```bash
./build/bin/go-quai start \
    --node.environment orchard \
    --node.slices "[0 0]" \
    --node.genesis-nonce 62242624366553750196964614682162313 \
    --rpc.http-addr 0.0.0.0 \
    --txpool.sharing-clients http://34.136.242.207:9200 \
    --rpc.http-api "eth,quai,txpool,net" \
    --node.quai-coinbases "0x0000000000000000000000000000000000000001" \
    --node.qi-coinbases "0x0080000000000000000000000000000000000001"
```

## Flag Descriptions

### Node Configuration
- `--node.slices "[0 0]"`: Specifies the slice coordinates for the node in the network topology
- `--node.genesis-nonce`: Sets the genesis nonce value for block generation
- `--node.environment`: Specifies the network environment (e.g., orchard)

### Global Settings
- `--global.data-dir`: Sets the directory path for node data storage

### RPC Configuration
- `--rpc.http-addr`: Defines the HTTP RPC binding address
- `--rpc.http`: Enables HTTP RPC server
- `--rpc.http-port`: Sets the HTTP RPC server port, 12711 is an example Prime port that would set the Cyprus-1 http port to 12911
- `--rpc.http-api`: Specifies enabled API modules (comma-separated list)

### Transaction Pool
- `--txpool.sharing-clients`: Sets the WebSocket endpoint for transaction relay network

## Important Notes

1. Replace `<your_dir>` with your preferred data directory path. If you wish to use the default (`~/.local/share/go-quai`) then you can omit this flag.
2. The transaction relay endpoint (http://34.136.242.207:9200) connects your node to the network's transaction sharing system on orchard testnet only, please contact the team for the correct ips for the mainnet
3. The HTTP RPC configuration allows external connections with the specified APIs enabled

## Security Considerations

- Setting `--rpc.http-addr` to 0.0.0.0 allows connections from any IP address
- Ensure proper firewall rules are in place if exposing RPC endpoints


## Check Log Output
Monitor your node's operation by viewing log files in the `nodelogs` directory. Logs provide essential information about your node's status and performance.

- View global logs (recommended):
  ```bash
  tail -f nodelogs/global.log
  ```
- View specific chain logs:
  ```bash
  tail -f nodelogs/region-0.log
  # or
  tail -f nodelogs/zone-0-0.log
  ```

A correctly started node will show initialization messages, including config loading, node creation, and P2P connection establishment.

## Download and Sync from Snapshot
For faster setup or node restoration, you can sync from an official snapshot. This is useful for:
- Reducing initial sync time
- Setting up a node on new hardware
- Restoring node data

Note: Syncing from a snapshot requires trusting the snapshot content. For full network verification, sync from genesis.

Download snapshots using:
```bash
# For Mainnet
wget https://storage.googleapis.com/colosseum-db/mainnet-snapshot.tar.zst

# For Orchard Testnet
wget https://storage.googleapis.com/colosseum-db/orchard-snapshot.tar.zst
```

Platform-specific restoration commands are provided for both Linux and MacOS systems.

## Check Sync Progress
Monitor your node's synchronization progress using log commands:

```bash
# View all appended blocks
cat nodelogs/location-to-print-here.log | grep Appended

# Watch new blocks in real-time
tail -f nodelogs/location-to-print-here.log | grep Appended

# Monitor all chains simultaneously
tail -f nodelogs/* | grep Appended
```

Compare your node's block height with the current chain height on the Quai node stats page to track sync progress.

## Update Node Software
Proper update procedure:
1. Stop all running node processes
2. Fetch latest updates: `git fetch --all`
3. Checkout latest release
4. Rebuild: `make go-quai`
5. Restart node

## Reset and Clear Node Data
For troubleshooting or fresh starts, you can reset your node by clearing all synced state:

Linux:
```bash
rm -rf nodelogs ~/.local/share/go-quai
```

MacOS:
```bash
rm -rf nodelogs ~/Library/Application\ Support/go-quai
```

Warning: This is irreversible and will remove all synced blockchain data.