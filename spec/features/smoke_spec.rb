feature "Smoke" do
  scenario "Visit the app anonymously" do
    visit "/"

    expect(page).to have_title('Unnamed St – Streetmix')
    expect(page).to have_text('Welcome to Streetmix.')

    expect(Street.count).to eq 1 # a street has been saved the the database
  end
end
