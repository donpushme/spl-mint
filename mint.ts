import { percentAmount, generateSigner, createSignerFromKeypair, keypairIdentity } from '@metaplex-foundation/umi'
import { TokenStandard, createAndMint, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import "@solana/web3.js";
import { setupUmiClient } from "./utils/setupClient";
import { Keypair } from '@solana/web3.js';

const umi = setupUmiClient().umi;
const userWallet = setupUmiClient().userWallet;

const metadata = {
  name: "Paupe",
  symbol: "PAUP",
  uri: "https://gateway.pinata.cloud/ipfs/QmQLJLJSBdqA5MFLMVUk4v48WQU4zMrqqQirezzZHTkkVE"
};

//Create a new Mint PDA
// Create a mint signer from the existing keypair
const mintKeypair = Keypair.fromSecretKey(Uint8Array.from([52, 98, 13, 184, 253, 13, 168, 179, 146, 12, 54, 108, 91, 28, 49, 201, 16, 90, 56, 210, 206, 87, 132, 170, 117, 73, 184, 174, 124, 218, 6, 230, 2, 74, 41, 197, 44, 230, 98, 111, 127, 173, 199, 174, 33, 158, 229, 125, 178, 211, 33, 178, 23, 83, 198, 138, 54, 156, 109, 101, 191, 149, 59, 178]));

// Convert Solana Keypair to Umi keypair format
const secretKey = mintKeypair.secretKey;
const umiKeypair = {
  publicKey: mintKeypair.publicKey.toBase58(),
  secretKey: secretKey
};

// Create a signer from the keypair for Umi
const mint = createSignerFromKeypair(umi, umiKeypair as any);
umi.use(mplCandyMachine());
umi.use(mplTokenMetadata());
// umi.use(mplToolbox());

//Send a transaction to deploy the Mint PDA and mint 1 million of our tokens
createAndMint(umi, {
  mint,
  authority: umi.identity,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadata.uri,
  sellerFeeBasisPoints: percentAmount(0),
  decimals: 9,
  amount: 1000000_000000000,
  tokenOwner: userWallet.publicKey,
  tokenStandard: TokenStandard.Fungible,
}).sendAndConfirm(umi).then(() => {
  console.log("Successfully minted 1 million tokens (", mint.publicKey, ")");
});

