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
