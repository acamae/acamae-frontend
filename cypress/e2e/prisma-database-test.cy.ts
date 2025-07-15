/**
 * Test de ejemplo para demostrar el uso de Prisma en Cypress
 * - Setup automático de base de datos
 * - Creación de usuarios de prueba
 * - Limpieza automática después de los tests
 */

interface TestUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'manager' | 'admin';
  createdAt: string;
  updatedAt: string;
}

describe('Prisma Database Management', () => {
  before(() => {
    // Setup de la base de datos antes de todos los tests
    cy.setupDb();
  });

  after(() => {
    // Limpieza de la base de datos después de todos los tests
    cy.cleanDb();
  });

  beforeEach(() => {
    // Limpieza antes de cada test
    cy.cleanDb();
  });

  it('should create and verify test user', () => {
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123!',
      role: 'user' as const,
    };

    // Crear usuario de prueba usando Prisma
    cy.createTestUser(testUser).then(user => {
      const dbUser = user as TestUser;
      expect(dbUser).to.have.property('id');
      expect(dbUser.email).to.equal(testUser.email);
      expect(dbUser.username).to.equal(testUser.username);
      expect(dbUser.role).to.equal(testUser.role);
      expect(dbUser.createdAt).to.be.a('string');
      expect(dbUser.updatedAt).to.be.a('string');
    });

    // Verificar que el usuario existe en la base de datos
    cy.getTestUser(testUser.email).then(user => {
      const dbUser = user as TestUser;
      expect(dbUser).to.not.be.null;
      expect(dbUser.email).to.equal(testUser.email);
    });
  });

  it('should delete test user', () => {
    const testUser = {
      email: 'delete@example.com',
      username: 'deleteuser',
      password: 'DeletePassword123!',
      role: 'user' as const,
    };

    // Crear usuario
    cy.createTestUser(testUser);

    // Verificar que existe
    cy.getTestUser(testUser.email).then(user => {
      const dbUser = user as TestUser;
      expect(dbUser).to.not.be.null;
    });

    // Eliminar usuario
    cy.deleteTestUser(testUser.email);

    // Verificar que ya no existe
    cy.getTestUser(testUser.email).then(user => {
      expect(user).to.be.null;
    });
  });

  it('should handle multiple test users with different roles', () => {
    const users = [
      {
        email: 'user1@example.com',
        username: 'user1',
        password: 'Password123!',
        role: 'user' as const,
      },
      {
        email: 'manager1@example.com',
        username: 'manager1',
        password: 'Password456!',
        role: 'manager' as const,
      },
      {
        email: 'admin1@example.com',
        username: 'admin1',
        password: 'Password789!',
        role: 'admin' as const,
      },
    ];

    // Crear múltiples usuarios con diferentes roles
    users.forEach(user => {
      cy.createTestUser(user);
    });

    // Verificar que todos existen con sus roles correctos
    users.forEach(user => {
      cy.getTestUser(user.email).then(dbUser => {
        const testUser = dbUser as TestUser;
        expect(testUser).to.not.be.null;
        expect(testUser.email).to.equal(user.email);
        expect(testUser.role).to.equal(user.role);
      });
    });

    // Limpiar todos los usuarios
    users.forEach(user => {
      cy.deleteTestUser(user.email);
    });
  });

  it('should create manager user specifically', () => {
    const managerUser = {
      email: 'manager@example.com',
      username: 'manager',
      password: 'ManagerPassword123!',
      role: 'manager' as const,
    };

    // Crear usuario manager
    cy.createTestUser(managerUser).then(user => {
      const dbUser = user as TestUser;
      expect(dbUser).to.have.property('id');
      expect(dbUser.email).to.equal(managerUser.email);
      expect(dbUser.username).to.equal(managerUser.username);
      expect(dbUser.role).to.equal('manager');
      expect(dbUser.createdAt).to.be.a('string');
      expect(dbUser.updatedAt).to.be.a('string');
    });

    // Verificar que el manager existe
    cy.getTestUser(managerUser.email).then(user => {
      const dbUser = user as TestUser;
      expect(dbUser).to.not.be.null;
      expect(dbUser.role).to.equal('manager');
    });

    // Limpiar
    cy.deleteTestUser(managerUser.email);
  });

  it('should reset database completely', () => {
    // Crear algunos datos de prueba
    cy.createTestUser({
      email: 'reset@example.com',
      username: 'resetuser',
      password: 'ResetPassword123!',
      role: 'user' as const,
    });

    // Reset completo de la base de datos
    cy.resetDb();

    // Verificar que los datos fueron eliminados
    cy.getTestUser('reset@example.com').then(user => {
      expect(user).to.be.null;
    });
  });
});
