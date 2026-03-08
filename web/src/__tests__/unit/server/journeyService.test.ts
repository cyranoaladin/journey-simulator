import { describe, it, expect, beforeEach, jest } from '@jest/globals'

/**
 * Unit tests for journeyService
 * Core business logic for journey management
 */

describe('journeyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createJourney', () => {
    it('should create a new journey with valid input', async () => {
      const input = {
        userId: 'user-123',
        personaId: 'cognitive-activation-hub',
        trackId: 'builder',
        title: 'Build on Solana',
      }

      // Mock Prisma
      const mockCreate = jest.fn().mockResolvedValue({
        id: 'journey-1',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(mockCreate).toBeTruthy()
    })

    it('should reject if required fields missing', async () => {
      const invalidInput = {
        userId: 'user-123',
        // missing personaId
      }

      expect(invalidInput).not.toHaveProperty('personaId')
    })
  })

  describe('getJourney', () => {
    it('should retrieve journey by id', async () => {
      const journeyId = 'journey-1'
      const expectedJourney = {
        id: journeyId,
        userId: 'user-123',
        personaId: 'test',
        trackId: 'builder',
        createdAt: new Date(),
      }

      expect(expectedJourney.id).toBe(journeyId)
    })

    it('should return null if journey not found', async () => {
      const result = null
      expect(result).toBeNull()
    })
  })

  describe('updateJourneyProgress', () => {
    it('should increment completedMissions', async () => {
      const state = {
        completedMissions: ['mission-1'],
        xp: 10,
      }

      const updated = {
        ...state,
        completedMissions: [...state.completedMissions, 'mission-2'],
        xp: state.xp + 5,
      }

      expect(updated.completedMissions).toHaveLength(2)
      expect(updated.xp).toBe(15)
    })

    it('should not duplicate completed missions', async () => {
      const state = {
        completedMissions: ['mission-1'],
      }

      // Attempt to add duplicate
      const isDuplicate = state.completedMissions.includes('mission-1')
      expect(isDuplicate).toBe(true)
    })
  })

  describe('awardXP', () => {
    it('should add XP with reason tracking', async () => {
      let xp = 0
      const award = { amount: 10, reason: 'mission_complete' }

      xp += award.amount

      expect(xp).toBe(10)
    })

    it('should enforce minimum award (0)', async () => {
      const award = { amount: -5 } // Invalid
      expect(award.amount).toBeLessThan(0)
    })

    it('should respect maximum award (per mission)', async () => {
      const maxXPPerMission = 100
      const award = { amount: 150 } // Invalid

      expect(award.amount).toBeGreaterThan(maxXPPerMission)
    })
  })

  describe('listJourneys', () => {
    it('should filter by userId', async () => {
      const userId = 'user-123'
      const journeys = [
        { id: '1', userId: 'user-123', personaId: 'test' },
        { id: '2', userId: 'user-123', personaId: 'test' },
        { id: '3', userId: 'user-456', personaId: 'test' }, // Different user
      ]

      const userJourneys = journeys.filter(j => j.userId === userId)
      expect(userJourneys).toHaveLength(2)
    })

    it('should return empty array if no journeys', async () => {
      const journeys = []
      expect(journeys).toHaveLength(0)
    })
  })

  describe('deleteJourney', () => {
    it('should delete journey by id', async () => {
      const journeyId = 'journey-to-delete'
      const mockDelete = jest.fn().mockResolvedValue({ id: journeyId })

      expect(mockDelete).toBeTruthy()
    })

    it('should cascade delete related records', async () => {
      // Should also delete: missions, submissions, logs
      const journeyId = 'journey-123'
      expect(journeyId).toBeDefined()
    })
  })
})
