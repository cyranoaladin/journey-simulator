describe('Navigation & Workflow', () => {
  it('should allow login and navigate to dashboard', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('testuser@example.com');
    cy.get('input[name=password]').type('testpassword');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should complete a journey phase', () => {
    cy.login('testuser@example.com', 'testpassword');
    cy.visit('/journeys');
    cy.get('.phase-card').first().click();
    cy.get('button.complete-phase').click();
    cy.get('.toast-success').should('exist');
  });

  it('should mint NFT proof', () => {
    cy.login('testuser@example.com', 'testpassword');
    cy.visit('/journeys');
    cy.get('button.mint-nft').first().click();
    cy.get('.modal-nft').should('be.visible');
    cy.get('button.confirm-mint').click();
    cy.get('.toast-success').should('exist');
  });

  it('should stake tokens', () => {
    cy.login('testuser@example.com', 'testpassword');
    cy.visit('/staking');
    cy.get('button.stake').click();
    cy.get('.toast-success').should('exist');
  });

  it('should vote in DAO', () => {
    cy.login('testuser@example.com', 'testpassword');
    cy.visit('/dao');
    cy.get('button.vote').first().click();
    cy.get('.toast-success').should('exist');
  });
});