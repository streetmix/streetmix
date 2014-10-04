feature "Feedback" do
  scenario "Submit feedback with e-mail address" do
    visit "/"

    page.execute_script("$('#welcome button.close').click()")

    page.execute_script("$('#feedback-menu-button').click()")
    expect(page).to have_content 'Send us a message'
    fill_in 'What do you think of Streetmix?', with: "I like Streetmix a lot.\nIt's great."
    fill_in 'Your email (optional)', with: 'streetmix+test@codeforamerica.org'
    click_on 'Send message'
    
    expect(page).to have_content 'We got it. Thanks!'
    expect(ActionMailer::Base.deliveries.count).to eq 1
  end
end
