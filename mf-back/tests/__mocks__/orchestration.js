/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour modules d'orchestration - utilisé dans tous les tests
 */

module.exports = {
  zynoVerticalSlice: {
    orchestrateVerticalSlice: jest.fn().mockResolvedValue({
      success: true,
      agent_actions: [],
      ui_blocks: [],
      resources: []
    })
  },
  web3Pipeline: {
    executeWeb3Pipeline: jest.fn().mockResolvedValue({
      success: true,
      transactionHash: 'mock-tx-hash'
    })
  },
  agentsRegistry: {
    getAgent: jest.fn(),
    getAllAgents: jest.fn().mockReturnValue([])
  },
  intentRouter: {
    routeIntent: jest.fn().mockReturnValue('default')
  },
  toolsRegistry: {
    getTool: jest.fn(),
    getAllTools: jest.fn().mockReturnValue([])
  },
  actionToolMapper: {
    mapActionToTool: jest.fn()
  },
  specializedValidators: {
    validateInput: jest.fn().mockReturnValue({ valid: true })
  },
  workflowMap: {
    getWorkflow: jest.fn().mockReturnValue({
      id: 'mock-workflow',
      phases: []
    }),
    getAllWorkflows: jest.fn().mockReturnValue([])
  }
};
