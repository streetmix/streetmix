feature "First Time Visitor" do
  before do
    # Make sure we've cleared everything. TODO: replace this with a better solution.
    visit "/"
    # It's necessary to have visited a page in order to clear browser LocalStorage.
    page.execute_script("localStorage.clear();")
    page.execute_script("sessionStorage.clear();")

    DatabaseCleaner.clean
  end

  scenario "Visit the app anonymously" do
    visit "/"

    expect(page).to have_title('Unnamed St – Streetmix')
    expect(page).to have_text('Welcome to Streetmix.')

    expect(Street.count).to eq 1 # a street has been saved the the database
  end
end
