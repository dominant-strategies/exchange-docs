# Node Configuration Guide

This document outlines how to run a Quai node and connect it to the transaction relay network.

## Example Command

```bash
./build/bin/go-quai start \
    --node.slices "[0 0]" \
    --node.genesis-nonce 62242624366553750196964614682162313 \
    --node.quai-coinbases 0x0000000000000000000000000000000000000001 \
    --node.qi-coinbases 0x0080000000000000000000000000000000000000 \
    --node.miner-preference 0.5 \
    --node.coinbase-lockup 0 \
    --node.environment orchard \
    --global.data-dir <your_dir> \
    --rpc.http-addr 0.0.0.0 \
    --rpc.http true \
    --rpc.http-port 12711 \
    --txpool.sharing-clients ws://34.136.242.207:8200 \
    --rpc.http-api "eth,quai,txpool"
```

## Flag Descriptions

### Node Configuration
- `--node.slices "[0 0]"`: Specifies the slice coordinates for the node in the network topology
- `--node.genesis-nonce`: Sets the genesis nonce value for block generation
- `--node.quai-coinbases`: Defines the Quai coinbase address for mining rewards
- `--node.qi-coinbases`: Specifies the Qi coinbase address for mining rewards
- `--node.miner-preference`: Sets the mining preference ratio (between 0 and 1)
- `--node.coinbase-lockup`: Configures the lockup period for coinbase transactions (in blocks)
- `--node.environment`: Specifies the network environment (e.g., orchard)

### Global Settings
- `--global.data-dir`: Sets the directory path for node data storage

### RPC Configuration
- `--rpc.http-addr`: Defines the HTTP RPC binding address
- `--rpc.http`: Enables HTTP RPC server
- `--rpc.http-port`: Sets the HTTP RPC server port
- `--rpc.http-api`: Specifies enabled API modules (comma-separated list)

### Transaction Pool
- `--txpool.sharing-clients`: Sets the WebSocket endpoint for transaction relay network

## Important Notes

1. Replace `<your_dir>` with your preferred data directory path
2. The transaction relay endpoint (ws://34.136.242.207:8200) connects your node to the network's transaction sharing system
3. The HTTP RPC configuration allows external connections with the specified APIs enabled

## Security Considerations

- Setting `--rpc.http-addr` to 0.0.0.0 allows connections from any IP address
- Ensure proper firewall rules are in place if exposing RPC endpoints
- Consider network security implications when configuring coinbase addresses