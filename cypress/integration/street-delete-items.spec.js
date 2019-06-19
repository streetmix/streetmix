context('User Deleting Items on a Street', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })
  it('lets users delete an item', () => {
    cy.get('.welcome-panel', { timeout: 10000 }).contains('Welcome to Streetmix')
    cy.get('.welcome-panel>button.close').click()

    // let's delete a thing
    cy.get('.segment-canvas-container').first().trigger('mouseover')
    cy.get('button').contains('Remove').first().click()
    cy.contains('The segment has been removed')
  })
  it('lets users delete all items', () => {
    cy.get('.welcome-panel', { timeout: 10000 }).contains('Welcome to Streetmix')
    cy.get('.welcome-panel>button.close').click()

    // let's delete a thing
    cy.get('.segment-canvas-container').first().trigger('mouseover')
    cy.get('body').type('{shift}', { release: false })
    cy.get('button').contains('Remove').first().click()
    cy.contains('All segments have been removed.')
  })
})
