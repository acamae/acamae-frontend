describe('Frontend Health Check', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should verify frontend is running in test environment', () => {
    // Verificar que el frontend responde correctamente
    cy.visit('/');

    // Verificar que la página se carga correctamente
    cy.get('body').should('be.visible');

    // Verificar que el título de la página es correcto
    cy.title().should('contain', 'Gestión eSports');

    // Verificar que el elemento root está presente
    cy.get('#root').should('exist');

    // Verificar que no hay errores de JavaScript en la consola
    cy.window().then(win => {
      // Verificar que la aplicación React se ha montado correctamente
      expect(win.document.querySelector('#root')).to.not.be.null;

      // Verificar que el entorno de desarrollo está configurado
      expect(win.location.hostname).to.equal('localhost');
      expect(win.location.port).to.equal('3000');
    });

    // Verificar que los assets principales se cargan
    cy.get('head').should('contain.html', 'main.js');
    cy.get('head').should('contain.html', 'vendors.js');
  });
});
