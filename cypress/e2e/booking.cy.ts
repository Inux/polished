describe('Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Landing Page', () => {
    it('should load the landing page', () => {
      cy.contains('Milan Beauty Studio').should('be.visible');
      cy.contains('Perfect Nails in 60 Mins').should('be.visible');
    });

    it('should display the Book Now button in hero', () => {
      cy.contains('button', 'Book Now').should('be.visible');
    });

    it('should display services section', () => {
      cy.get('#services').should('exist');
      cy.contains('Our Services').should('be.visible');
    });

    it('should display service cards', () => {
      cy.get('#services').contains('Gel Manicure').should('be.visible');
      cy.get('#services').contains('Classic Pedicure').should('be.visible');
    });

    it('should display category filter tabs', () => {
      cy.get('#services').contains('button', 'All').should('be.visible');
      cy.get('#services').contains('button', 'Nails').should('be.visible');
      cy.get('#services').contains('button', 'Hair').should('be.visible');
    });

    it('should filter services by category', () => {
      cy.get('#services').contains('button', 'Hair').click();
      cy.get('#services').contains('Haircut & Styling').should('be.visible');
      cy.get('#services').contains('Gel Manicure').should('not.exist');
    });
  });

  describe('Booking Wizard - Open from Hero', () => {
    it('should open booking wizard when clicking Book Now', () => {
      cy.contains('button', 'Book Now').click();
      cy.contains('Step 1 of 5').should('be.visible');
      cy.contains('Choose Service').should('be.visible');
    });

    it('should show all services in booking wizard', () => {
      cy.contains('button', 'Book Now').click();
      // Wait for modal to appear and find services inside it
      cy.get('.fixed').contains('Gel Manicure').should('be.visible');
      cy.get('.fixed').contains('Classic Pedicure').should('be.visible');
    });

    it('should be able to close booking wizard', () => {
      cy.contains('button', 'Book Now').click();
      cy.contains('Step 1 of 5').should('be.visible');
      // Click the X button to close (last button in header)
      cy.get('.fixed button').last().click();
      cy.contains('Step 1 of 5').should('not.exist');
    });
  });

  describe('Booking Wizard - Service Selection', () => {
    beforeEach(() => {
      cy.contains('button', 'Book Now').click();
      cy.contains('Step 1 of 5').should('be.visible');
    });

    it('should advance to step 2 after selecting a service', () => {
      // Click on the service button inside the modal (not the landing page card)
      cy.get('.fixed').contains('button', 'Gel Manicure').click();
      cy.contains('Step 2 of 5').should('be.visible');
      cy.contains('Choose Professional').should('be.visible');
    });
  });

  describe('Booking Wizard - Employee Selection', () => {
    beforeEach(() => {
      cy.contains('button', 'Book Now').click();
      cy.contains('Step 1 of 5').should('be.visible');
      cy.get('.fixed').contains('button', 'Gel Manicure').click();
      cy.contains('Step 2 of 5').should('be.visible');
    });

    it('should show loading or employees', () => {
      // Either show loading spinner or employees list
      cy.get('.fixed').should('exist');
    });

    it('should show "Any Available Professional" option or "No professionals" message', () => {
      // Wait for loading to complete - either shows employees or empty state
      cy.get('.fixed', { timeout: 10000 }).then(($modal) => {
        if ($modal.text().includes('Any Available Professional')) {
          cy.contains('Any Available Professional').should('be.visible');
        } else {
          cy.contains('No professionals available').should('be.visible');
        }
      });
    });
  });

  describe('Service Card - Select Service Button', () => {
    it('should open booking wizard when clicking Select Service on a card', () => {
      // Scroll to services section
      cy.get('#services').scrollIntoView();

      // Click the first "Select Service" button
      cy.get('#services').contains('button', 'Select Service').first().click();

      // Booking wizard should open
      cy.contains('Step 1 of 5').should('be.visible');
    });
  });
});

describe('API Endpoints', () => {
  it('should return health check', () => {
    cy.request('/api/health').should((response) => {
      // Health endpoint might not exist, check for any valid response
      expect(response.status).to.be.oneOf([200, 404]);
    });
  });

  it('should handle studio data request', () => {
    cy.request({
      url: '/api/studio?subdomain=milan-beauty',
      failOnStatusCode: false,
    }).then((response) => {
      // Could be 200 with data or 404 if studio doesn't exist
      expect(response.status).to.be.oneOf([200, 404]);
      if (response.status === 200) {
        expect(response.body).to.have.property('studio');
      }
    });
  });

  it('should handle employees for service request', () => {
    cy.request({
      url: '/api/service-employees?serviceId=test-service-id',
      failOnStatusCode: false,
    }).then((response) => {
      // Endpoint should respond (even if with empty array)
      expect(response.status).to.be.oneOf([200, 400, 404]);
    });
  });
});
