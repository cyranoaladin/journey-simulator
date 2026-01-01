import { createSiwsChallenge, getSiwsChallenge, markSiwsChallengeUsed } from '../server/siwsStore'
import { redis } from '../server/redis'

jest.mock('../server/redis', () => ({
  redis: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}))

const mockRedis: { set: jest.Mock; get: jest.Mock; del: jest.Mock } = redis as unknown as {
  set: jest.Mock
  get: jest.Mock
  del: jest.Mock
}

describe('SIWS Redis Store', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    jest.clearAllMocks()

    mockRedis.set.mockImplementation(async (key: string, value: string) => {
      store.set(key, value)
      return 'OK'
    })
    mockRedis.get.mockImplementation(async (key: string) => {
      return store.get(key) || null
    })
    mockRedis.del.mockImplementation(async (key: string) => {
      store.delete(key)
      return 1
    })
  })

  it('creates a challenge and stores it in redis', async () => {
    const challenge = await createSiwsChallenge('WalletA')
    expect(challenge.id).toBeDefined()
    expect(challenge.addressHint).toBe('WalletA')

    expect(mockRedis.set).toHaveBeenCalledWith(
      `siws:${challenge.id}`,
      expect.any(String),
      'EX',
      300
    )
  })

  it('retrieves a valid challenge', async () => {
    const challenge = await createSiwsChallenge('WalletB')
    const retrieved = await getSiwsChallenge(challenge.id)
    expect(retrieved).toEqual(challenge)
  })

  it('returns null for non-existent challenge', async () => {
    const retrieved = await getSiwsChallenge('fake-id')
    expect(retrieved).toBeNull()
  })

  it('marks challenge as used', async () => {
    const challenge = await createSiwsChallenge('WalletC')
    await markSiwsChallengeUsed(challenge.id)

    // Should update the challenge in redis with used=true
    const stored = await mockRedis.get(`siws:${challenge.id}`)
    const parsed = JSON.parse(stored!)
    expect(parsed.used).toBe(true)

    // getSiwsChallenge should return null for used challenge
    const retrieved = await getSiwsChallenge(challenge.id)
    expect(retrieved).toBeNull()
  })
})
