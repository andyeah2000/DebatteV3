/// <reference types="cypress" />
import './commands'

// Add custom command for session management
Cypress.Commands.add('persistSession', () => {
  cy.getCookies().then((cookies) => {
    cookies.forEach((cookie) => {
      const cookieOptions = {
        path: cookie.path || '/',
        domain: cookie.domain || undefined,
        secure: cookie.secure ?? false,
        httpOnly: cookie.httpOnly ?? false,
        expiry: cookie.expiry,
        sameSite: cookie.sameSite
      }
      cy.setCookie(cookie.name, cookie.value, cookieOptions)
    })
  })
})

// Add custom command for cleanup
Cypress.Commands.add('cleanup', () => {
  cy.window().then((win) => {
    // Clear localStorage
    win.localStorage.clear()
    
    // Clear IndexedDB if available
    const idb = win.indexedDB
    if (typeof idb.databases === 'function') {
      idb.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) {
            idb.deleteDatabase(db.name)
          }
        })
      }).catch(() => {
        // Ignore errors if databases() is not supported
      })
    }
  })
})

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', () => false)

// Run before each test
Cypress.Commands.add('setupTest', () => {
  cy.persistSession()
  cy.viewport(1280, 720)
})

// Run after each test
Cypress.Commands.add('cleanupTest', () => {
  cy.cleanup()
}) 