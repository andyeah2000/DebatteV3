describe('Debates', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  }

  const testDebate = {
    title: 'Test Debate Title',
    description: 'This is a test debate description.',
  }

  beforeEach(() => {
    cy.login(testUser.email, testUser.password)
  })

  it('should create a new debate', () => {
    cy.createDebate(testDebate.title, testDebate.description)
    cy.get('[data-testid="debate-title"]').should('contain', testDebate.title)
    cy.get('[data-testid="debate-description"]').should('contain', testDebate.description)
  })

  it('should list debates on home page', () => {
    cy.visit('/')
    cy.get('[data-testid="debate-list"]').should('be.visible')
    cy.get('[data-testid="debate-card"]').should('have.length.at.least', 1)
  })

  it('should filter debates by category', () => {
    cy.visit('/')
    cy.get('[data-testid="category-filter"]').click()
    cy.get('[data-testid="category-option"]').first().click()
    cy.get('[data-testid="debate-card"]').should('have.length.at.least', 1)
  })

  it('should sort debates by different criteria', () => {
    cy.visit('/')
    cy.get('[data-testid="sort-select"]').click()
    cy.get('[data-testid="sort-option-recent"]').click()
    cy.get('[data-testid="debate-list"]').should('be.visible')
  })

  it('should vote on a debate', () => {
    cy.visit('/')
    cy.get('[data-testid="debate-card"]').first().click()
    cy.vote(Cypress.config().baseUrl + '/debates/1', true)
    cy.get('[data-testid="vote-count"]').should('not.equal', '0')
  })

  it('should add a comment to a debate', () => {
    const comment = 'This is a test comment.'
    cy.visit('/')
    cy.get('[data-testid="debate-card"]').first().click()
    cy.addComment(Cypress.config().baseUrl + '/debates/1', comment)
    cy.get('[data-testid="comment-list"]').should('contain', comment)
  })

  it('should search for debates', () => {
    cy.visit('/')
    cy.get('[data-testid="search-input"]').type('test{enter}')
    cy.get('[data-testid="debate-card"]').should('have.length.at.least', 1)
    cy.get('[data-testid="debate-title"]').should('contain', 'test')
  })
}) 