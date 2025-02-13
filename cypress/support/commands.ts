Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('createDebate', (title: string, description: string) => {
  cy.visit('/debates/new')
  cy.get('[data-testid="debate-title"]').type(title)
  cy.get('[data-testid="debate-description"]').type(description)
  cy.get('[data-testid="create-debate-button"]').click()
  cy.url().should('include', '/debates/')
})

Cypress.Commands.add('vote', (debateId: string, isProVote: boolean) => {
  cy.visit(`/debates/${debateId}`)
  const voteButton = isProVote ? '[data-testid="pro-vote"]' : '[data-testid="con-vote"]'
  cy.get(voteButton).click()
  cy.get(voteButton).should('have.class', 'voted')
})

Cypress.Commands.add('addComment', (debateId: string, content: string) => {
  cy.visit(`/debates/${debateId}`)
  cy.get('[data-testid="comment-input"]').type(content)
  cy.get('[data-testid="submit-comment"]').click()
  cy.contains(content).should('be.visible')
}) 