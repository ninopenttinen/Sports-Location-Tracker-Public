/// <reference types="cypress" />

describe('Basic UI tests', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('http://localhost:3000/');
  });

  it('Navigation bar tabs', () => {
    cy.get('header').find('p').contains('Sports Location Tracker');

    cy.get('header').find('button').contains('Results').click();

    cy.get('#results-display');

    cy.get('header').find('button').contains('Search').click();
    cy.get('#search-menu');

    cy.get('header').find('button').contains('Add location').click();
    cy.get('#add-menu');
  });

  it('Click center map and get correct coordinates', () => {
    const correctLat = '61.49';
    const correctLon = '23.78';

    cy.get('#search-coordinates-left').click();
    cy.get('#map-container').click('center');

    cy.get('#lat').should('contain.text', correctLat);
    cy.get('#lon').should('contain.text', correctLon);
  });
});
