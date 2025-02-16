# Node Configuration Guide

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
