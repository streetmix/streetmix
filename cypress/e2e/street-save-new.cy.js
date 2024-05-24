const PROMPT_MESSAGE = 'my custom message'

context('User saves a new street', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/streets*', {
      fixture: 'street-post-response'
    }).as('streetPost')
    cy.intercept('PUT', '/api/v1/streets/*', {
      statusCode: 204
    }).as('streetPut')
    cy.intercept(`https://${Cypress.env('PELIAS_HOST_NAME')}/v1/reverse*`, {
      fixture: 'reverse-location'
    }).as('locationService')

    cy.visit('', {
      onBeforeLoad (win) {
        cy.stub(win, 'prompt').returns(PROMPT_MESSAGE)
      }
    })
  })

  it('lets users create a new blank street', () => {
    cy.wait(['@streetPost', '@streetPut'])
    cy.get('.welcome-panel', { timeout: 10000 }).contains(
      'Welcome to Streetmix'
    )
    cy.get('.welcome-panel>button.close').click()
    cy.contains('Unnamed St').click()
    // prompt autofilled by stub above, thus changing the street name
    cy.wait('@streetPut')
  })

  // this ideally would be part of its own spec test once we can get that running without a database
  it('Opens the GeotagDialog & confirms or clears location via the popup button', () => {
    cy.get('.welcome-panel > .close').click()
    cy.get('.street-meta').contains('Add location').click()
    cy.get('.geotag-dialog').click()
    cy.get('.leaflet-container').click(625, 300)

    cy.wait('@locationService')

    cy.get('.geotag-location-label').should(
      'have.text',
      '12572 Fm 586 S, Brookesmith, TX, USA'
    )
    cy.get('.leaflet-popup-content .btn-primary').click({ force: true })
  })
})
