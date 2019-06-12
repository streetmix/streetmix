const PROMPT_MESSAGE = 'my custom message'

context('User Saving a New Street', () => {
  let polyfill
  before(() => {
    const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js'
    cy.request(polyfillUrl)
      .then((response) => {
        polyfill = response.body
      })
  })

  beforeEach(() => {
    cy.server()
    cy.route('POST', '/api/v1/streets*').as('streetPost')
    cy.route('PUT', '/api/v1/streets/**').as('streetPut')
    cy.visit('http://localhost:8000/', {
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
    cy.get('.welcome-panel', { timeout: 10000 }).contains('Welcome to Streetmix')
    cy.get('.welcome-panel>button.close').click()
    cy.contains('Unnamed St').click()
    // prompt autofilled by stub above, thus changing the street name
    cy.wait('@streetPut')
  })
})
