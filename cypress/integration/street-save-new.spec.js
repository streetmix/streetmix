const PROMPT_MESSAGE = 'my custom message'

context('User Saving a New Street', () => {
  let polyfill
  before(() => {
    const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js'
    cy.request(polyfillUrl).then((response) => {
      polyfill = response.body
    })
  })

  beforeEach(() => {
    cy.server()
    cy.route('POST', '/api/v1/streets*', 'fixture:street-post-response').as(
      'streetPost'
    )
    cy.route(
      'POST',
      '/api/v1/streets/images/*',
      'fixture:street-image-post-response'
    ).as('streetImagePut')
    cy.route('PUT', '/api/v1/streets/*', 204).as('streetPut')
    cy.route(
      ' https://api.geocode.earth/v1/reverse*',
      'fixture:reverse-location'
    ).as('locationService')
    cy.visit('', {
      onBeforeLoad (win) {
        cy.stub(win, 'prompt').returns(PROMPT_MESSAGE)
        delete win.fetch
        // since the application code does not ship with a polyfill
        // load a polyfilled "fetch" from the test
        win.eval(polyfill)
        win.fetch = win.unfetch
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

    cy.get('.street-metadata-map').click()
    cy.get('.geotag-dialog').click()
    cy.get('.leaflet-container').click(625, 300)
    cy.wait('@locationService')
    cy.get('.geotag-location-label').should(
      'have.text',
      '12572 Fm 586 S, Brookesmith, TX, USA'
    )
    cy.get('.button-primary').click({ force: true })
  })
})
