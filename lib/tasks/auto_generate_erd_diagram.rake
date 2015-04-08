if Rails.env.development?
  task :erd_diagrams do
    puts 'Generating ERD diagrams...'
    system 'bundle exec erd'
  end

  # Run erd_diagrams task after db:migrate and db:rollback tasks
  Rake::Task['db:migrate'].enhance do
    Rake::Task['erd_diagrams'].invoke
  end

  Rake::Task['db:rollback'].enhance do
    Rake::Task['erd_diagrams'].invoke
  end
end
