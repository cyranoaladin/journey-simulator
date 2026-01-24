/**
 * Mock pour le modèle Journeys
 */
module.exports = {
  findById: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  create: jest.fn().mockResolvedValue({ id: 'mock-journey-id', status: 'active' }),
  save: jest.fn().mockResolvedValue(true),
  updateOne: jest.fn().mockResolvedValue({ nModified: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null),
  lean: jest.fn().mockReturnThis()
};
