/// <reference types="Cypress" />

/*
here we open the dialog, click in the center, click somewhere else, confirm that second location
then click back in and clear location
this is meant to be a rough approximation of map usage
the test is kinda brittle and ideally these would be split up, but seems like the best way to split the difference
between doing a whole bunch of setup code in cypress vs something quicker that gets us decent coverage
dragging the marker is NOT covered yet, esp given the weirdness with map coordinate clicking
and the fact that we are technically already govering reverse geocode coverage,
but it might be good to revisit, say, if we start using cypress to test other drag n drop functionality in the app
*/
context(
  'Location can be confirmed by clicking on the map and confirming location',
  () => {
    before(() => {
      cy.server()
      cy.route(
        ' https://api.geocode.earth/v1/reverse*',
        'fixture:reverse-location'
      ).as('locationService')
    })

    it('Opens the GeotagDialog & confirms or clears location via the popup button', () => {
      cy.clearLocalStorage()
      cy.visit('/', { timeout: 20000 })
      // need to dismiss the welcome message first, and it might not show up depending on
      // LOCAL_STORAGE_RETURNING_USER

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
  }
)
