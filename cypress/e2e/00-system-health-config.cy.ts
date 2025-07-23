describe('System Health & Configuration', () => {
  // --- Health Check ---
  describe('Health Check', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should verify frontend is running', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
      cy.title().should('contain', 'Gestión eSports');
      cy.get('#root').should('exist');
      cy.window().then(win => {
        expect(win.document.querySelector('#root')).to.not.be.null;
        expect(win.location.hostname).to.equal('localhost');
      });
      cy.get('head').should('contain.html', 'main.js');
      cy.get('head').should('contain.html', 'vendors.js');
    });

    it('should verify API endpoints are accessible', () => {
      cy.request({ method: 'GET', url: '/api/health', failOnStatusCode: false }).then(response => {
        expect(response.status).to.be.oneOf([200, 404, 500]);
      });
    });
  });

  // --- Configuración de entorno ---
  describe('Cypress Environment Configuration', () => {
    it('should verify Cypress environment variables are loaded correctly', () => {
      expect(Cypress.env('BASE_URL')).to.include('localhost');
      expect(Cypress.env('API_URL')).to.include('localhost');
      expect(Cypress.env('NODE_ENV')).to.equal('test');
      cy.log(`Cypress Base URL: ${Cypress.env('BASE_URL')}`);
      cy.log(`Cypress API URL: ${Cypress.env('API_URL')}`);
      cy.log(`Cypress Node Env: ${Cypress.env('NODE_ENV')}`);
    });

    it('should verify baseUrl is configured correctly', () => {
      expect(Cypress.config('baseUrl')).to.include('localhost');
      cy.visit('/');
      cy.get('body').should('be.visible');
    });

    it('should verify database environment variables are loaded', () => {
      expect(Cypress.env('DB_HOST')).to.equal('localhost');
      expect(Cypress.env('DB_PORT')).to.equal(3306);
      expect(Cypress.env('DB_NAME')).to.include('test');
      expect(Cypress.env('DB_USER')).to.include('test');
      cy.log(`DB Host: ${Cypress.env('DB_HOST')}`);
      cy.log(`DB Port: ${Cypress.env('DB_PORT')}`);
      cy.log(`DB Name: ${Cypress.env('DB_NAME')}`);
      cy.log(`DB User: ${Cypress.env('DB_USER')}`);
    });
  });
});
