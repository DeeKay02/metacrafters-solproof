// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");


// Making a keypair and getting the private key
const newPair = Keypair.generate();
console.log(newPair);

// paste your secret that is logged here
const DEMO_FROM_SECRET_KEY = new Uint8Array(
  // paste your secret key array here
    [
        108, 119, 154, 105,  16, 237, 148,  98, 153, 200, 201,
      122,  18, 214,  11, 218,  42, 225, 191,  26, 160,  69,
       65, 211,  56, 212,  93,  17,  41,  33, 154,  73,  50,
       93, 195,  37,   6,  99, 142, 197,  19,  52, 204, 253,
      174, 213, 155,  16,   4, 204,  70, 184,  39,   3, 234,
      146, 164,  36, 237, 230, 208,  42, 130, 221
      ]            
);

// Get the wallet balance from a given public key
const getWalletBalance = async (name, pubKey) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const walletBalance = await connection.getBalance(
            new PublicKey(pubKey)
        );
        console.log(`${name} Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    await getWalletBalance("from", from.publicKey)
    await getWalletBalance("to", to.publicKey)

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    await getWalletBalance("from", from.publicKey)
    await getWalletBalance("to", to.publicKey)

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL / 100
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is', signature);

    await getWalletBalance("from", from.publicKey)
    await getWalletBalance("to", to.publicKey)
}

transferSol();