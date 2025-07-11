import { setupUmiClient } from "./utils/setupClient";
import {
  percentAmount,
  transactionBuilder,
  generateSigner,
  some,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  fetchCandyGuard,
  fetchCandyMachine,
  mintV2,
  MPL_CANDY_GUARD_PROGRAM_ID,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  createMintWithAssociatedToken,
  setComputeUnitLimit,
} from "@metaplex-foundation/mpl-toolbox";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import base58 from "bs58";

const umi = setupUmiClient().umi;

const myCustomAuthority = generateSigner(umi);
const candyMachineSettings = {
  authority: myCustomAuthority,
};

const candyMachineId = "257jMqqgKBHfaVAUWh4RNYYyN4dPkQ25JoNTxoWDsjXw";
const candyGuardId = "CS3YZu9LaY9Yi3hUSgTWRTcigQoTRn1b2hLG7mpZHcBq";

const main = async () => {
  umi.use(mplCandyMachine());
  const candyMachine = await fetchCandyMachine(umi, publicKey(candyMachineId));
  const candyGuard = await fetchCandyGuard(umi, publicKey(candyGuardId));
  // Get collection mint from candy machine
  const collectionMint = candyMachine.collectionMint;

  // Fetch the collection NFT/Digital Asset
  const collectionNft = await fetchDigitalAsset(umi, collectionMint);
  const nftMint = generateSigner(umi);
  const nftOwner = generateSigner(umi).publicKey;
  const tx = await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    // .add(createMintWithAssociatedToken(umi, { mint: nftMint, owner: nftOwner }))
    .add(
      mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        candyGuard: candyGuard.publicKey,
        nftMint,
        collectionMint: collectionNft.publicKey,
        collectionUpdateAuthority: collectionNft.metadata.updateAuthority,
        tokenStandard: candyMachine.tokenStandard,
        mintArgs: {
          solPayment: some({
            destination: publicKey(
              "DmUvVRb52eh9vGhkbAkNNaFju5RWHZAJZuxg6sUqVdkZ"
            ),
          }),
        },
      })
    )
    .sendAndConfirm(umi);
  const signature = base58.encode(Buffer.from(tx.signature));
  console.log(signature);
};

main();
