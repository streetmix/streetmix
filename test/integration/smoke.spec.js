describe('Streetmix smoke test', function () {
  beforeEach(function () {
    return browser.ignoreSynchronization = true
  })

  it('should have a title', function () {
    browser.get('/')

    browser.wait(function () {
      return browser.isElementPresent(by.css('.first-time-new-street'))
    }, 20000)

    expect(browser.getTitle()).toEqual('Unnamed St – Streetmix')

    expect(element.all(by.css('.first-time-new-street')).first().getText()).toContain('Welcome to Streetmix.')
  })
})
