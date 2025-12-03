import { POST } from '../../app/api/integrations/collaterize/simulate/route'

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body: any, init?: any) => ({
            json: async () => body,
            status: init?.status || 200,
            ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
        })
    }
}))


describe('Collaterize Simulation Logic', () => {
    it('returns CORE tier for high scores', async () => {
        const req = {
            json: async () => ({
                wallet: 'WalletABC',
                tokenSymbol: 'TEST',
                totalSupply: 1000000,
                circulatingAtTGE: 100000,
                fundraisingGoalUSD: 50000,
                journeyScore: 90,
                riskScore: 0.1,
                communityScore: 85,
                docsScore: 90
            })
        } as any

        const res = await POST(req)
        const json = await (res as NextResponse).json()

        expect(res.status).toBe(200)
        expect(json.ok).toBe(true)
        expect(json.simulation.tier).toBe('CORE')
        expect(json.simulation.accepted).toBe(true)
    })

    it('returns REJECTED for low scores', async () => {
        const req = {
            json: async () => ({
                wallet: 'WalletABC',
                tokenSymbol: 'TEST',
                totalSupply: 1000000,
                circulatingAtTGE: 100000,
                fundraisingGoalUSD: 50000,
                journeyScore: 20,
                riskScore: 0.8,
                communityScore: 10,
                docsScore: 10
            })
        } as any

        const res = await POST(req)
        const json = await (res as NextResponse).json()

        expect(json.ok).toBe(true)
        expect(json.simulation.tier).toBe('REJECTED')
        expect(json.simulation.accepted).toBe(false)
    })

    it('validates input', async () => {
        const req = {
            json: async () => ({
                // Missing required fields
                wallet: 'WalletABC'
            })
        } as any

        const res = await POST(req)
        const json = await (res as NextResponse).json()

        expect(res.status).toBe(400)
        expect(json.error).toBe('bad_request')
    })
})
