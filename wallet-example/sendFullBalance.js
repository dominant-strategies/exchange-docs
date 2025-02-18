import * as quais from "quais";

/**
 * Send Full Quai Balance in one transaction
 *
 * This script demonstrates how to send the full balance of a Quai wallet in one transaction.
 * Generally, quais.js will populate several of the transaction parameters for you, but in this case
 * we must manually set the gas fields (gasLimit, gasPrice) and use the gas values to determine the
 * amount of Quai to send.
 *
 * Usage:
 * First, set up your .env file with:
 * PRIVATE_KEY="your private key here"
 * RECIPIENT_ADDRESS="recipient address here"
 *
 * Run Command:
 * ```
 * node sendFullBalance.js
 * ```
 *
 * The script will output:
 * - The signer total address balance
 * - The signer sendable address balance
 * - Transaction hash
 *
 */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;

async function sendFullBalance() {
  // Initialize connection to Quai Network, Quais will route to shards automatically
  const provider = new quais.JsonRpcProvider(
    "https://orchard.rpc.quai.network"
  );

  // Create wallet from private key
  const wallet = new quais.Wallet(PRIVATE_KEY, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log("Balance: ", balance);

  // Construct a basic transaction
  const from = wallet.address;
  const txForEstimateGas = {
    to: RECIPIENT_ADDRESS, // Recipient address
    value: balance / 10n, // Use a small test balance for gas estimation
    from: from, // Sender address
  };

  // Estimate the gas for the transaction
  const gasLimit = await wallet.estimateGas(txForEstimateGas);

  // Get gas price for the zone
  const txLocation = quais.getZoneForAddress(from);
  const { gasPrice } = await provider.getFeeData(txLocation);

  // Calculate the sendable balance
  const sendableBalance = balance - gasLimit * gasPrice;

  // Check if the sendable balance is more than cost of the transaction
  if (sendableBalance <= 0) {
    console.log("Not enough balance to send");
    return;
  } else {
    console.log("Sendable balance: ", sendableBalance);
  }

  const txObj = {
    to: RECIPIENT_ADDRESS, // Recipient address
    value: sendableBalance, // Send the sendable balance
    from: from, // Sender address
    gasLimit: gasLimit,
    gasPrice: gasPrice,
  };

  // Send the transaction
  const txResponse = await wallet.sendTransaction(txObj);
  console.log("Transaction broadcasted. Waiting for inclusion...");

  // Wait for the transaction to be included in a block
  const txReceipt = await txResponse.wait();
  console.log("Transaction included in block ", txReceipt.blockNumber);
  console.log("Transaction hash: ", txResponse.hash);
}

// Execute main function with error handling
sendFullBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
