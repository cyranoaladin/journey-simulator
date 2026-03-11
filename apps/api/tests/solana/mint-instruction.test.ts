import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createV1, CreateV1InstructionAccounts, CreateV1InstructionArgs } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, keypairIdentity, percentAmount, some } from '@metaplex-foundation/umi';

// Mock Solana Web3 context
describe('Solana Mint Instruction (Devnet)', () => {
    const umi = createUmi('https://api.devnet.solana.com');

    // Setup a dummy signer
    const myKeypair = generateSigner(umi);
    umi.use(keypairIdentity(myKeypair));

    it('should generate a valid CreateMetadataAccountV3 instruction payload', async () => {
        const mint = generateSigner(umi);

        // Define metadata
        const args: CreateV1InstructionArgs = {
            name: 'MFAI Founder Pass',
            symbol: 'MFAI',
            uri: 'https://arweave.net/placeholder',
            sellerFeeBasisPoints: percentAmount(0),
            isCollection: false,
        };

        // We don't send the transaction, we just build the builder to verify logic
        const builder = createV1(umi, {
            mint,
            name: args.name,
            symbol: args.symbol,
            uri: args.uri,
            sellerFeeBasisPoints: args.sellerFeeBasisPoints,
        });

        const ix = builder.getInstructions()[0];

        expect(ix).toBeDefined();
        expect(ix.programId).toBeDefined();

        // Verify we are targeting the Token Metadata Program
        // MPL Token Metadata Program ID: metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
        expect(ix.programId.toString()).toBe('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

        console.log('✅ Instruction Program ID valid:', ix.programId.toString());
    });
});
