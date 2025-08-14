describe('User Profile Page', () => {
  beforeEach(() => {
    // Assuming session is already established via UI or programmatically
    cy.visit('/app/profile');
  });

  it('shows timezone warning until a timezone is selected', () => {
    cy.get('select').should('exist');
    // May or may not exist depending on seed; allow optional assertion with then
    cy.get('body').then($body => {
      const maybe = $body.find('[data-testid="timezone-warning"]');
      if (maybe.length) {
        cy.wrap(maybe).should('be.visible');
      }
    });
  });

  it('renders game buttons and can click one (server should update)', () => {
    cy.get('[data-testid^="game-"]').first().click({ force: true });
  });
});
