/// <reference types="cypress" />
// ***********************************************
// Este archivo puede ser usado para definir comandos
// personalizados para Cypress y sobreescribir comandos existentes.
//
// Para más información sobre los comandos personalizados, visita:
// https://on.cypress.io/custom-commands
// ***********************************************

// Este es un ejemplo de un comando personalizado:
// Cypress.Commands.add('login', (email, password) => { ... })

// Declara los tipos globales para Typescript (cuando sea necesario)
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Hace que este archivo sea un módulo para permitir declaraciones globales
export {};
