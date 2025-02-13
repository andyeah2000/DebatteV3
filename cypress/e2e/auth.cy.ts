describe('Authentication', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
  }

  beforeEach(() => {
    cy.visit('/login')
  })

  it('should successfully log in with valid credentials', () => {
    cy.login(testUser.email, testUser.password)
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-testid="user-menu"]').should('be.visible')
  })

  it('should show error with invalid credentials', () => {
    cy.login(testUser.email, 'wrongpassword')
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials')
  })

  it('should successfully log out', () => {
    cy.login(testUser.email, testUser.password)
    cy.logout()
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('should redirect to login when accessing protected route', () => {
    cy.visit('/debates/new')
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('should maintain session after page reload', () => {
    cy.login(testUser.email, testUser.password)
    cy.reload()
    cy.get('[data-testid="user-menu"]').should('be.visible')
  })

  it('should handle OAuth login flow', () => {
    cy.get('[data-testid="google-login"]').click()
    cy.origin('https://accounts.google.com', () => {
      cy.get('input[type="email"]').should('be.visible')
    })
  })
}) 