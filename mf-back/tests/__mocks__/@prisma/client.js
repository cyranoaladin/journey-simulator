/**
 * Manual mock for @prisma/client
 * Bypasses actual database connections during tests to avoid "role root does not exist" and other DB errors.
 */

const mockPrismaClient = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    // Add models as needed by tests
    agentRun: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'mock-run-id' }),
        update: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({}),
    },
    agentLog: {
        create: jest.fn().mockResolvedValue({ id: 'mock-log-id' }),
        findMany: jest.fn().mockResolvedValue([]),
    },
    user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'mock-user-id' }),
    },
    // Add other properties that might be accessed
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
};

module.exports = {
    PrismaClient: jest.fn(() => mockPrismaClient),
};
