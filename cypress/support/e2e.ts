// Cypress E2E support file

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands if needed
    }
  }
}

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the error from failing the test
  return false;
});

export {};
