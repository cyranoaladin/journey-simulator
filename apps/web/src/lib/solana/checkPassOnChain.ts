/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// DAS API Response Types
interface DasAsset {
  id: string
  content: {
    json_uri: string
    metadata: {
      name: string
      symbol: string
      attributes?: Array<{ trait_type: string; value: string }>
    }
  }
  grouping: Array<{ group_key: string; group_value: string }>
  ownership: {
    owner: string
  }
}

interface DasResponse {
  result: {
    items: DasAsset[]
  }
}

/**
 * Check if a wallet holds a valid Pass NFT from the collection
 * Uses Helius DAS API (getAssetsByOwner)
 */
export async function checkPassOnChain(
  walletAddress: string,
  collectionMint: string
): Promise<Array<{ mint: string; tier: string }>> {
  const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL

  if (!rpcUrl) {
    console.error('Missing SOLANA_RPC_URL')
    return []
  }

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'mfai-pass-check',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 100,
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
    })

    const data = (await response.json()) as DasResponse

    if (!data.result || !data.result.items) {
      return []
    }

    // Filter by collection and extract tier
    const passes = data.result.items
      .filter((asset) =>
        asset.grouping.some((g) => g.group_key === 'collection' && g.group_value === collectionMint)
      )
      .map((asset) => {
        const tierAttr = asset.content.metadata.attributes?.find((a) => a.trait_type === 'Tier')
        return {
          mint: asset.id,
          tier: tierAttr ? tierAttr.value : 'DEFAULT', // Default tier if not specified
        }
      })

    return passes
  } catch (error) {
    console.error('Error checking pass on-chain:', error)
    return []
  }
}
